/**
 * Collect 5 types of POI from Kakao Places API → data/poi/facility_points.csv
 *
 * Types: subway_station (SW8), hospital (HP8), pharmacy (PM9),
 *        police (keyword), fire_station (keyword)
 *
 * Uses BBOX grid division (~0.05 deg cells) over TARGET_REGIONS.
 * Deduplicates by Kakao place `id`.
 *
 * Usage: pnpm exec tsx scripts/collect-poi-kakao.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { KAKAO_LIMITER } from "../src/etl/utils/rate-limiter";
import { TARGET_REGIONS } from "../src/etl/config/regions";

// ─── Config ───────────────────────────────────────────────────

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
if (!KAKAO_REST_API_KEY) {
  console.error("KAKAO_REST_API_KEY is not set");
  process.exit(1);
}

const GRID_STEP = 0.05; // ~5 km
const MARGIN_DEG = 0.2;
const MAX_PAGE = 45; // Kakao max
const PAGE_SIZE = 15; // Kakao default

const OUTPUT_DIR = path.resolve(process.cwd(), "data", "poi");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "facility_points.csv");

// ─── Types ────────────────────────────────────────────────────

interface KakaoPlace {
  id: string;
  place_name: string;
  address_name: string;
  x: string; // longitude
  y: string; // latitude
  category_group_code?: string;
}

interface KakaoSearchResponse {
  meta: { total_count: number; pageable_count: number; is_end: boolean };
  documents: KakaoPlace[];
}

interface PoiRecord {
  type: string;
  name: string;
  lat: string;
  lng: string;
  address: string;
  source: string;
  data_date: string;
  external_id: string;
}

type SearchSpec =
  | { mode: "category"; code: string; facilityType: string }
  | { mode: "keyword"; query: string; facilityType: string };

const SEARCH_SPECS: SearchSpec[] = [
  { mode: "category", code: "SW8", facilityType: "subway_station" },
  { mode: "category", code: "HP8", facilityType: "hospital" },
  { mode: "category", code: "PM9", facilityType: "pharmacy" },
  { mode: "keyword", query: "경찰서", facilityType: "police" },
  { mode: "keyword", query: "소방서", facilityType: "fire_station" },
];

// ─── BBOX & Grid ──────────────────────────────────────────────

function deriveBbox(margin: number) {
  const lats = TARGET_REGIONS.map((r) => r.lat);
  const lngs = TARGET_REGIONS.map((r) => r.lng);
  return {
    minLat: Math.min(...lats) - margin,
    maxLat: Math.max(...lats) + margin,
    minLng: Math.min(...lngs) - margin,
    maxLng: Math.max(...lngs) + margin,
  };
}

interface Rect {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

function generateGridCells(step: number): Rect[] {
  const bbox = deriveBbox(MARGIN_DEG);
  const cells: Rect[] = [];

  for (let lat = bbox.minLat; lat < bbox.maxLat; lat += step) {
    for (let lng = bbox.minLng; lng < bbox.maxLng; lng += step) {
      cells.push({
        minLat: lat,
        maxLat: Math.min(lat + step, bbox.maxLat),
        minLng: lng,
        maxLng: Math.min(lng + step, bbox.maxLng),
      });
    }
  }

  return cells;
}

// ─── Kakao API Calls ──────────────────────────────────────────

function rectToKakaoParam(r: Rect): string {
  // Kakao rect format: "minLng,minLat,maxLng,maxLat"
  return `${r.minLng},${r.minLat},${r.maxLng},${r.maxLat}`;
}

async function fetchCategoryPage(
  code: string,
  rect: Rect,
  page: number,
): Promise<KakaoSearchResponse> {
  await KAKAO_LIMITER.acquire();
  const url = new URL("https://dapi.kakao.com/v2/local/search/category.json");
  url.searchParams.set("category_group_code", code);
  url.searchParams.set("rect", rectToKakaoParam(rect));
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(PAGE_SIZE));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
  });

  if (!res.ok) {
    throw new Error(`Kakao category API ${res.status}: ${await res.text()}`);
  }

  return (await res.json()) as KakaoSearchResponse;
}

async function fetchKeywordPage(
  query: string,
  rect: Rect,
  page: number,
): Promise<KakaoSearchResponse> {
  await KAKAO_LIMITER.acquire();
  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", query);
  url.searchParams.set("rect", rectToKakaoParam(rect));
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(PAGE_SIZE));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` },
  });

  if (!res.ok) {
    throw new Error(`Kakao keyword API ${res.status}: ${await res.text()}`);
  }

  return (await res.json()) as KakaoSearchResponse;
}

// ─── Collection Logic ─────────────────────────────────────────

async function collectAllPagesForCell(
  spec: SearchSpec,
  cell: Rect,
): Promise<KakaoPlace[]> {
  const places: KakaoPlace[] = [];

  for (let page = 1; page <= MAX_PAGE; page++) {
    const response =
      spec.mode === "category"
        ? await fetchCategoryPage(spec.code, cell, page)
        : await fetchKeywordPage(spec.query, cell, page);

    places.push(...response.documents);

    if (response.meta.is_end || response.documents.length === 0) {
      break;
    }
  }

  return places;
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const cells = generateGridCells(GRID_STEP);
  console.log(`Grid cells: ${cells.length}`);

  // Deduplicate by Kakao ID
  const seenIds = new Set<string>();
  const records: PoiRecord[] = [];

  let totalApiCalls = 0;

  for (const spec of SEARCH_SPECS) {
    let specCount = 0;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const places = await collectAllPagesForCell(spec, cell);
      totalApiCalls += Math.max(1, Math.ceil(places.length / PAGE_SIZE));

      for (const p of places) {
        if (seenIds.has(p.id)) continue;
        seenIds.add(p.id);

        const lat = parseFloat(p.y);
        const lng = parseFloat(p.x);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

        records.push({
          type: spec.facilityType,
          name: p.place_name,
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
          address: p.address_name,
          source: "kakao_places",
          data_date: today,
          external_id: p.id,
        });
        specCount++;
      }

      // Progress log every 20 cells
      if ((i + 1) % 20 === 0) {
        console.log(`  [${spec.facilityType}] ${i + 1}/${cells.length} cells processed`);
      }
    }

    console.log(`${spec.facilityType}: ${specCount} unique POIs`);
  }

  console.log(`\nTotal unique POIs: ${records.length}`);
  console.log(`Total API calls: ${totalApiCalls}`);

  // Write CSV
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const header = "type,name,lat,lng,address,source,data_date,external_id";
  const lines = records.map(
    (r) =>
      [
        r.type,
        csvEscape(r.name),
        r.lat,
        r.lng,
        csvEscape(r.address),
        r.source,
        r.data_date,
        r.external_id,
      ].join(","),
  );

  fs.writeFileSync(OUTPUT_FILE, [header, ...lines].join("\n"), "utf-8");
  console.log(`\nWritten to: ${OUTPUT_FILE}`);
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

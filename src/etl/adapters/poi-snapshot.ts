import * as fs from "node:fs";
import * as path from "node:path";
import { parse } from "csv-parse/sync";
import { db } from "@/db/connection";
import { facilityPoints } from "@/db/schema/facility-points";
import { TARGET_REGIONS } from "../config/regions";
import { sql } from "drizzle-orm";

type FacilityPointType =
  | "subway_station"
  | "bus_stop"
  | "police"
  | "fire_station"
  | "shelter"
  | "hospital"
  | "pharmacy";

const DATA_DIR = path.resolve(process.cwd(), "data");
const POI_DIR = path.join(DATA_DIR, "poi");
const FILE_BASENAME = "facility_points.csv";
const MARGIN_DEG = 0.2;

export async function loadFacilityPointsSnapshot(input: {
  dryRun: boolean;
}): Promise<number> {
  const filePath = path.join(POI_DIR, FILE_BASENAME);
  if (!fs.existsSync(filePath)) {
    console.log(
      JSON.stringify({
        event: "poi_snapshot_skip",
        reason: "file not found",
        file: filePath,
      }),
    );
    return 0;
  }

  const bbox = deriveBboxFromRegions(MARGIN_DEG);
  const content = readUtf8File(filePath);
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Array<Record<string, string>>;

  const rows: Array<{
    type: FacilityPointType;
    name: string | null;
    address: string | null;
    regionCode: string | null;
    lat: number;
    lng: number;
    externalId: string | null;
    source: string | null;
    dataDate: string | null;
  }> = [];

  for (const r of records) {
    const type = normalizeFacilityType(r["type"] ?? r["facility_type"] ?? r["poi_type"] ?? "");
    if (!type) continue;

    const lat = parseNumber(
      r["lat"] ?? r["latitude"] ?? r["위도"] ?? r["LAT"] ?? r["Y"],
    );
    const lng = parseNumber(
      r["lng"] ?? r["longitude"] ?? r["경도"] ?? r["LNG"] ?? r["X"],
    );
    if (!isValidKoreaCoord(lat, lng)) continue;
    if (!isInsideBbox(lat, lng, bbox)) continue;

    const name = nullIfEmpty(r["name"] ?? r["poi_name"] ?? r["시설명"] ?? "");
    const address = nullIfEmpty(r["address"] ?? r["addr"] ?? r["주소"] ?? "");
    const regionCode = nullIfEmpty(r["region_code"] ?? r["regionCode"] ?? "");
    const externalId = nullIfEmpty(r["external_id"] ?? r["externalId"] ?? r["id"] ?? "");
    const source = nullIfEmpty(r["source"] ?? "");
    const dataDate = normalizeDateString(nullIfEmpty(r["data_date"] ?? r["dataDate"] ?? ""));

    rows.push({
      type,
      name,
      address,
      regionCode,
      lat,
      lng,
      externalId,
      source,
      dataDate,
    });
  }

  console.log(
    JSON.stringify({
      event: "poi_snapshot_parsed",
      total: records.length,
      filtered: rows.length,
      bbox,
    }),
  );

  if (input.dryRun || rows.length === 0) {
    return rows.length;
  }

  // Snapshot load: truncate and reload
  await db.execute(sql`TRUNCATE TABLE facility_points RESTART IDENTITY`);

  const BATCH_SIZE = 1000;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await db.insert(facilityPoints).values(
      batch.map((b) => ({
        type: b.type,
        name: b.name,
        address: b.address,
        regionCode: b.regionCode,
        location: { latitude: b.lat, longitude: b.lng },
        externalId: b.externalId,
        source: b.source,
        dataDate: b.dataDate,
      })),
    );
  }

  return rows.length;
}

function deriveBboxFromRegions(marginDeg: number): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  const lats = TARGET_REGIONS.map((r) => r.lat);
  const lngs = TARGET_REGIONS.map((r) => r.lng);

  const minLat = Math.min(...lats) - marginDeg;
  const maxLat = Math.max(...lats) + marginDeg;
  const minLng = Math.min(...lngs) - marginDeg;
  const maxLng = Math.max(...lngs) + marginDeg;

  return { minLat, maxLat, minLng, maxLng };
}

function isInsideBbox(
  lat: number,
  lng: number,
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number },
): boolean {
  return lat >= bbox.minLat && lat <= bbox.maxLat && lng >= bbox.minLng && lng <= bbox.maxLng;
}

function isValidKoreaCoord(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132;
}

function parseNumber(v: string | undefined): number {
  if (!v) return Number.NaN;
  return Number(String(v).trim());
}

function nullIfEmpty(v: string): string | null {
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function normalizeFacilityType(raw: string): FacilityPointType | null {
  const t = raw.trim().toLowerCase();
  if (!t) return null;

  if (t === "subway_station" || t === "subway" || t === "station") return "subway_station";
  if (t === "bus_stop" || t === "bus" || t === "stop") return "bus_stop";
  if (t === "police" || t === "police_station") return "police";
  if (t === "fire_station" || t === "fire") return "fire_station";
  if (t === "shelter" || t === "evacuation_shelter") return "shelter";
  if (t === "hospital") return "hospital";
  if (t === "pharmacy") return "pharmacy";

  return null;
}

function readUtf8File(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  // Strip UTF-8 BOM if present
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.toString("utf-8", 3);
  }
  return buf.toString("utf-8");
}

function normalizeDateString(v: string | null): string | null {
  if (!v) return null;
  const t = v.trim();
  if (t.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  if (t.length === 8 && /^\d{8}$/.test(t)) {
    return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`;
  }
  return null;
}


import * as fs from "node:fs";
import * as path from "node:path";
import * as iconv from "iconv-lite";
import { parse } from "csv-parse/sync";
import { db } from "@/db/connection";
import { safetyInfra } from "@/db/schema/safety-infra";
import { sql } from "drizzle-orm";
import { TARGET_REGIONS } from "../config/regions";

/**
 * Safety infrastructure CSV loaders.
 * Loads CCTV, safe cameras, and streetlight data from CSV files.
 *
 * (a) CCTV national: data/cctv/CCTV정보_260218.csv (EUC-KR, 356K rows)
 * (b) Safe cameras:  data/cctv/서울시 안심이 CCTV 연계 현황.csv (EUC-KR, 129K rows)
 *     ⚠️ lat/lng columns are SWAPPED in this file
 * (c) Streetlights:  data/lamp/서울시 가로등 위치 정보.csv (EUC-KR, 19K rows)
 */

interface SafetyInfraRow {
  type: "cctv" | "safecam" | "lamp";
  lat: number;
  lng: number;
  cameraCount: number;
  source: string;
}

const DATA_DIR = path.resolve(process.cwd(), "data");

/** Find a file by partial name match with NFC normalization (macOS NFD workaround) */
function findFile(dir: string, partialName: string): string | null {
  if (!fs.existsSync(dir)) return null;
  const normalized = partialName.normalize("NFC");
  const found = fs.readdirSync(dir).find((f) => f.normalize("NFC").includes(normalized));
  return found ? path.join(dir, found) : null;
}

/** Read a file with EUC-KR encoding and return UTF-8 string */
function readEucKrFile(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  // Try to detect BOM for UTF-8
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.toString("utf-8");
  }
  return iconv.decode(buffer, "euc-kr");
}

/** Check if coordinates are within Korea bounding box */
function isValidKoreaCoord(lat: number, lng: number): boolean {
  return lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132;
}

const TARGET_BBOX = deriveBboxFromRegions(TARGET_REGIONS, 0.2);

/** Check if coordinates are within current TARGET_REGIONS bounding box */
function isWithinTargetBbox(lat: number, lng: number): boolean {
  return (
    lat >= TARGET_BBOX.minLat &&
    lat <= TARGET_BBOX.maxLat &&
    lng >= TARGET_BBOX.minLng &&
    lng <= TARGET_BBOX.maxLng
  );
}

function deriveBboxFromRegions(
  regions: Array<{ lat: number; lng: number }>,
  marginDeg: number,
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const lats = regions.map((r) => r.lat);
  const lngs = regions.map((r) => r.lng);
  return {
    minLat: Math.min(...lats) - marginDeg,
    maxLat: Math.max(...lats) + marginDeg,
    minLng: Math.min(...lngs) - marginDeg,
    maxLng: Math.max(...lngs) + marginDeg,
  };
}

// ─── (a) CCTV National CSV ───

export async function loadCctvCsv(dryRun: boolean = false): Promise<number> {
  const csvPath = findFile(path.join(DATA_DIR, "cctv"), "CCTV정보");

  if (!csvPath) {
    console.log(
      JSON.stringify({ event: "safety_csv_skip", type: "cctv", reason: "file not found" }),
    );
    return 0;
  }

  const content = readEucKrFile(csvPath);
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const rows: SafetyInfraRow[] = [];

  for (const record of records) {
    const lat = parseFloat(record["WGS84위도"] ?? "");
    const lng = parseFloat(record["WGS84경도"] ?? "");
    const cameraCount = parseInt(record["카메라대수"] ?? "1", 10) || 1;
    const mgr = record["관리기관명"] ?? "";

    if (!isValidKoreaCoord(lat, lng)) continue;
    // Filter to TARGET_REGIONS bbox (dynamic; avoids hard-coded ranges)
    if (!isWithinTargetBbox(lat, lng)) continue;

    rows.push({
      type: "cctv",
      lat,
      lng,
      cameraCount,
      source: mgr,
    });
  }

  console.log(
    JSON.stringify({
      event: "safety_csv_parsed",
      type: "cctv",
      total: records.length,
      filtered: rows.length,
    }),
  );

  if (!dryRun && rows.length > 0) {
    await upsertInfraRows(rows);
  }

  return rows.length;
}

// ─── (b) Safe Camera CSV ───

export async function loadSafecamCsv(dryRun: boolean = false): Promise<number> {
  const csvPath = findFile(path.join(DATA_DIR, "cctv"), "안심이");

  if (!csvPath) {
    console.log(
      JSON.stringify({ event: "safety_csv_skip", type: "safecam", reason: "file not found" }),
    );
    return 0;
  }

  const content = readEucKrFile(csvPath);
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const rows: SafetyInfraRow[] = [];

  for (const record of records) {
    // ⚠️ SWAPPED: "위도" column has longitude (127.xx), "경도" column has latitude (37.xx)
    const lat = parseFloat(record["경도"] ?? "");
    const lng = parseFloat(record["위도"] ?? "");
    const cameraCount = parseInt(record["CCTV 수량"] ?? record["CCTV수량"] ?? "1", 10) || 1;

    if (!isValidKoreaCoord(lat, lng)) continue;

    rows.push({
      type: "safecam",
      lat,
      lng,
      cameraCount,
      source: "서울시 안심이",
    });
  }

  console.log(
    JSON.stringify({
      event: "safety_csv_parsed",
      type: "safecam",
      total: records.length,
      filtered: rows.length,
    }),
  );

  if (!dryRun && rows.length > 0) {
    await upsertInfraRows(rows);
  }

  return rows.length;
}

// ─── (c) Streetlight CSV ───

export async function loadLampCsv(dryRun: boolean = false): Promise<number> {
  const csvPath = findFile(path.join(DATA_DIR, "lamp"), "가로등");

  if (!csvPath) {
    console.log(
      JSON.stringify({ event: "safety_csv_skip", type: "lamp", reason: "file not found" }),
    );
    return 0;
  }

  const content = readEucKrFile(csvPath);
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const rows: SafetyInfraRow[] = [];

  for (const record of records) {
    const lat = parseFloat(record["위도"] ?? "");
    const lng = parseFloat(record["경도"] ?? "");

    if (!isValidKoreaCoord(lat, lng)) continue;

    rows.push({
      type: "lamp",
      lat,
      lng,
      cameraCount: 1,
      source: "서울시 가로등",
    });
  }

  console.log(
    JSON.stringify({
      event: "safety_csv_parsed",
      type: "lamp",
      total: records.length,
      filtered: rows.length,
    }),
  );

  if (!dryRun && rows.length > 0) {
    await upsertInfraRows(rows);
  }

  return rows.length;
}

// ─── Shared upsert ───

async function upsertInfraRows(rows: SafetyInfraRow[]): Promise<void> {
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    const values = batch.map((r) => ({
      type: r.type,
      location: { latitude: r.lat, longitude: r.lng },
      cameraCount: r.cameraCount,
      source: r.source,
    }));

    await db.insert(safetyInfra).values(values);

    inserted += batch.length;

    if (inserted % 10000 === 0) {
      console.log(
        JSON.stringify({
          event: "safety_infra_upsert_progress",
          inserted,
          total: rows.length,
        }),
      );
    }
  }

  console.log(
    JSON.stringify({
      event: "safety_infra_upsert_complete",
      inserted,
    }),
  );
}

/** Load all safety CSV files */
export async function loadAllSafetyCsvs(dryRun: boolean = false): Promise<{
  cctv: number;
  safecam: number;
  lamp: number;
}> {
  // Dry-run parse all files first to verify they are readable before truncating
  const cctvCount = await loadCctvCsv(true);
  const safecamCount = await loadSafecamCsv(true);
  const lampCount = await loadLampCsv(true);

  if (dryRun) {
    return { cctv: cctvCount, safecam: safecamCount, lamp: lampCount };
  }

  // All files parsed successfully — safe to truncate and reload
  await db.execute(sql`TRUNCATE TABLE safety_infra RESTART IDENTITY`);

  const cctv = await loadCctvCsv(false);
  const safecam = await loadSafecamCsv(false);
  const lamp = await loadLampCsv(false);

  return { cctv, safecam, lamp };
}

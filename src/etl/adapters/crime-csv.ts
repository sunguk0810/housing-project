import * as fs from "node:fs";
import * as path from "node:path";
import * as iconv from "iconv-lite";
import { parse } from "csv-parse/sync";
import { db } from "@/db/connection";
import { safetyStats } from "@/db/schema/safety";
import { sql } from "drizzle-orm";
import { SEOUL_REGIONS } from "../config/regions";

/**
 * Crime statistics CSV loaders.
 *
 * (a) Police regional stats: 경찰청_범죄 발생 지역별 통계_20241231 (1).csv
 *     - EUC-KR, 249 columns (pivot), 38 rows (crime types)
 *     - Seoul 25구 in cols 2-26, Gyeonggi in cols 79~110
 *
 * (b) Seoul 5 major crimes: 5대+범죄+발생현황_20260218215937.csv
 *     - UTF-8 BOM, 14 columns, 30 rows
 *     - 3-row multi-header, data from row 4
 */

const DATA_DIR = path.resolve(process.cwd(), "data", "crim_stats");

/** Normalize filename for macOS NFD → NFC unicode */
function normalizedIncludes(str: string, search: string): boolean {
  return str.normalize("NFC").includes(search.normalize("NFC"));
}

/** District crime data */
interface DistrictCrimeData {
  regionCode: string;
  regionName: string;
  totalCrimes: number;
  violentCrimes: number;
  theftCrimes: number;
  crimeRate: number; // Normalized 0-1 score (lower = safer)
}

// ─── (a) Police Regional Stats ───

export async function loadPoliceRegionalStats(): Promise<DistrictCrimeData[]> {
  // Find the police stats file
  const files = fs.existsSync(DATA_DIR) ? fs.readdirSync(DATA_DIR) : [];
  const policeFile = files.find((f) => normalizedIncludes(f, "경찰청") && f.endsWith(".csv"));

  if (!policeFile) {
    console.log(
      JSON.stringify({
        event: "crime_csv_skip",
        type: "police_regional",
        reason: "file not found",
      }),
    );
    return [];
  }

  const filePath = path.join(DATA_DIR, policeFile);
  const buffer = fs.readFileSync(filePath);
  const content = iconv.decode(buffer, "euc-kr");

  // Parse as raw rows (no header auto-detect for pivot tables)
  const allRows = parse(content, {
    skip_empty_lines: true,
    relax_column_count: true,
  }) as string[][];

  if (allRows.length < 3) {
    console.log(
      JSON.stringify({
        event: "crime_csv_error",
        type: "police_regional",
        reason: "insufficient rows",
      }),
    );
    return [];
  }

  // Row 0 = header with district names as columns
  // Row 1+ = crime type data
  const headerRow = allRows[0];

  // Find Seoul district columns by matching names
  const seoulDistrictCols: { name: string; colIndex: number }[] = [];

  for (let col = 0; col < headerRow.length; col++) {
    const cellValue = (headerRow[col] ?? "").trim();
    // Match Seoul district names
    const region = SEOUL_REGIONS.find((r) => cellValue.includes(r.name));
    if (region) {
      seoulDistrictCols.push({ name: region.name, colIndex: col });
    }
  }

  // Sum total crimes per district (all crime types)
  const districtTotals = new Map<string, { total: number; violent: number; theft: number }>();

  for (let row = 1; row < allRows.length; row++) {
    const crimeType = (allRows[row][0] ?? "").trim();
    const isViolent = ["강력범죄", "살인", "강도", "강간·강제추행", "방화"].some(
      (t) => crimeType.includes(t),
    );
    const isTheft = crimeType.includes("절도");

    for (const { name, colIndex } of seoulDistrictCols) {
      const value = parseInt((allRows[row][colIndex] ?? "0").replace(/,/g, ""), 10) || 0;
      const existing = districtTotals.get(name) ?? { total: 0, violent: 0, theft: 0 };
      existing.total += value;
      if (isViolent) existing.violent += value;
      if (isTheft) existing.theft += value;
      districtTotals.set(name, existing);
    }
  }

  // Normalize crime rates (0-1 scale, lower = safer)
  const totals = Array.from(districtTotals.values()).map((d) => d.total);
  const maxTotal = Math.max(...totals, 1);

  const results: DistrictCrimeData[] = [];

  for (const [name, data] of districtTotals) {
    const region = SEOUL_REGIONS.find((r) => r.name === name);
    if (!region) continue;

    results.push({
      regionCode: region.code,
      regionName: name,
      totalCrimes: data.total,
      violentCrimes: data.violent,
      theftCrimes: data.theft,
      crimeRate: Number((data.total / maxTotal).toFixed(4)),
    });
  }

  console.log(
    JSON.stringify({
      event: "crime_csv_parsed",
      type: "police_regional",
      districts: results.length,
    }),
  );

  return results;
}

// ─── (b) Seoul 5 Major Crimes ───

export async function loadSeoul5MajorCrimes(): Promise<DistrictCrimeData[]> {
  const files = fs.existsSync(DATA_DIR) ? fs.readdirSync(DATA_DIR) : [];
  const crimeFile = files.find((f) => normalizedIncludes(f, "5대") && f.endsWith(".csv"));

  if (!crimeFile) {
    console.log(
      JSON.stringify({
        event: "crime_csv_skip",
        type: "seoul_5major",
        reason: "file not found",
      }),
    );
    return [];
  }

  const filePath = path.join(DATA_DIR, crimeFile);
  const buffer = fs.readFileSync(filePath);

  // UTF-8 BOM detection
  let content: string;
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    content = buffer.toString("utf-8").substring(1); // Skip BOM
  } else {
    content = buffer.toString("utf-8");
  }

  const allRows = parse(content, {
    skip_empty_lines: true,
    relax_column_count: true,
  }) as string[][];

  // Multi-header: rows 0-3 are headers, data from row 4+
  // Row 4 = 합계(소계), Row 5+ = 구별 데이터
  // col 0 = "합계", col 1 = 구 이름, col 2+ = 범죄 수치
  if (allRows.length < 6) {
    console.log(
      JSON.stringify({
        event: "crime_csv_error",
        type: "seoul_5major",
        reason: "insufficient rows",
      }),
    );
    return [];
  }

  const results: DistrictCrimeData[] = [];

  // Parse data rows (row 5+, skip row 4 which is 합계/소계)
  for (let i = 5; i < allRows.length; i++) {
    const row = allRows[i];
    const districtName = (row[1] ?? "").normalize("NFC").trim();

    const region = SEOUL_REGIONS.find(
      (r) => districtName.includes(r.name) || r.name.includes(districtName),
    );
    if (!region) continue;

    // Sum "발생" columns only (even indices: col 2,4,6,8,10,12)
    let totalCrimes = 0;
    for (let col = 2; col < row.length; col += 2) {
      const val = parseInt((row[col] ?? "0").replace(/,/g, ""), 10) || 0;
      totalCrimes += val;
    }

    results.push({
      regionCode: region.code,
      regionName: region.name,
      totalCrimes,
      violentCrimes: 0, // Will be supplemented by police stats
      theftCrimes: 0,
      crimeRate: 0, // Will be normalized after
    });
  }

  // Normalize
  const maxTotal = Math.max(...results.map((r) => r.totalCrimes), 1);
  for (const r of results) {
    r.crimeRate = Number((r.totalCrimes / maxTotal).toFixed(4));
  }

  console.log(
    JSON.stringify({
      event: "crime_csv_parsed",
      type: "seoul_5major",
      districts: results.length,
    }),
  );

  return results;
}

// ─── Combined Loader ───

export async function loadAllCrimeStats(
  dryRun: boolean = false,
): Promise<number> {
  const [policeStats, seoul5Major] = await Promise.all([
    loadPoliceRegionalStats(),
    loadSeoul5MajorCrimes(),
  ]);

  // Merge: prefer police stats, supplement with 5-major
  const merged = new Map<string, DistrictCrimeData>();

  for (const s of policeStats) {
    merged.set(s.regionCode, s);
  }
  for (const s of seoul5Major) {
    if (!merged.has(s.regionCode)) {
      merged.set(s.regionCode, s);
    }
  }

  if (dryRun || merged.size === 0) {
    return merged.size;
  }

  // Upsert to safety_stats
  const today = new Date().toISOString().split("T")[0];

  for (const [, data] of merged) {
    await db
      .insert(safetyStats)
      .values({
        regionCode: data.regionCode,
        regionName: data.regionName,
        crimeRate: String(data.crimeRate),
        dataDate: today,
      })
      .onConflictDoUpdate({
        target: [safetyStats.regionCode, safetyStats.dataDate],
        set: {
          regionName: sql`EXCLUDED."region_name"`,
          crimeRate: sql`EXCLUDED."crime_rate"`,
        },
      });
  }

  console.log(
    JSON.stringify({
      event: "crime_stats_upsert_complete",
      districts: merged.size,
    }),
  );

  return merged.size;
}

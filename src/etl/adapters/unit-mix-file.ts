/**
 * Unit-mix file loader — loads apartment unit areas from building register CSV files.
 *
 * Source: hub.go.kr 건축물대장 전유공용면적 (per-district CSV, UTF-8 w/ BOM)
 * Data dir: data/building-register/건축물대장_전유공용면적_*.csv
 *
 * Replaces API-based unit-mix for districts where CSV is available,
 * eliminating ~12,800 API calls per district.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { parse } from "csv-parse/sync";
import { db } from "@/db/connection";
import { apartmentUnitTypes } from "@/db/schema/apartment-unit-types";
import { sql } from "drizzle-orm";
import { parseJibunFromAddress, normalizeName } from "../utils/address";

// ─── Types ───

export interface UnitMixFileRunOptions {
  regionCode: string;
  dryRun: boolean;
  verbose?: boolean;
}

export interface UnitMixFileRunResult {
  totalTargets: number;
  matchedApts: number;
  unmatchedRecords: number;
  conflictSkipped: number;
  insertedRows: number;
  csvFile: string | null;
  csvTotalRows: number;
  csvFilteredRows: number;
}

interface AptCandidate {
  aptId: number;
  aptName: string;
}

interface CsvRecord {
  시군구코드: string;
  번: string;
  지: string;
  건물명: string;
  전유공용구분코드: string;
  주용도코드명: string;
  "면적(㎡)": string;
}

// ─── Constants ───

const DATA_DIR = path.resolve(process.cwd(), "data", "building-register");
const CSV_PARTIAL_NAME = "전유공용면적";

// ─── Helpers ───

function log(event: string, data: object = {}): void {
  console.log(
    JSON.stringify({
      event,
      ...data,
      timestamp: new Date().toISOString(),
    }),
  );
}

/**
 * Find CSV files in the data directory.
 * Returns all matching files, or filters by regionCode if specified.
 */
function findCsvFiles(regionCode: string | null): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  const normalizedPartial = CSV_PARTIAL_NAME.normalize("NFC");
  const allCsvs = fs.readdirSync(DATA_DIR)
    .filter((f) => f.normalize("NFC").includes(normalizedPartial) && f.endsWith(".csv"))
    .map((f) => path.join(DATA_DIR, f));

  if (!regionCode) return allCsvs;

  // Read first data row of each CSV to match regionCode
  return allCsvs.filter((csvPath) => {
    try {
      const content = fs.readFileSync(csvPath, "utf-8");
      const firstNewline = content.indexOf("\n");
      const secondNewline = content.indexOf("\n", firstNewline + 1);
      if (secondNewline === -1) return false;
      const firstDataLine = content.substring(firstNewline + 1, secondNewline);
      const regionInFile = firstDataLine.split(",")[0]?.trim();
      return regionInFile === regionCode;
    } catch {
      return false;
    }
  });
}

/**
 * Build apartment lookup map from DB.
 * Key: "regionCode:bun:ji" → AptCandidate[]
 */
async function buildAptLookup(
  regionCode: string,
): Promise<Map<string, AptCandidate[]>> {
  const rows = (await db.execute(sql`
    SELECT id, apt_name, address
    FROM apartments
    WHERE region_code = ${regionCode}
    ORDER BY id
  `)) as unknown as Array<{ id: number; apt_name: string; address: string }>;

  const lookup = new Map<string, AptCandidate[]>();

  for (const row of rows) {
    const parsed = parseJibunFromAddress(row.address);
    if (!parsed) continue;

    const key = `${regionCode}:${parsed.bun}:${parsed.ji}`;
    const candidates = lookup.get(key) ?? [];
    candidates.push({ aptId: row.id, aptName: row.apt_name });
    lookup.set(key, candidates);
  }

  return lookup;
}

/**
 * Resolve which apartment a CSV record belongs to when multiple candidates share the same (bun, ji).
 * Returns aptId or null if unresolvable.
 */
function resolveAptMatch(
  candidates: AptCandidate[],
  csvBuildingName: string,
  verbose: boolean,
): number | null {
  if (candidates.length === 1) return candidates[0].aptId;

  // Multiple candidates — need name matching
  if (!csvBuildingName.trim()) {
    if (verbose) {
      log("unit_mix_file_conflict_empty_name", {
        candidates: candidates.map((c) => ({ id: c.aptId, name: c.aptName })),
      });
    }
    return null;
  }

  const csvNorm = normalizeName(csvBuildingName);
  if (!csvNorm) return null;

  // Try containment match: csvNorm ⊃ dbNorm or dbNorm ⊃ csvNorm
  const matches = candidates.filter((c) => {
    const dbNorm = normalizeName(c.aptName);
    return csvNorm.includes(dbNorm) || dbNorm.includes(csvNorm);
  });

  if (matches.length === 1) return matches[0].aptId;

  // Still ambiguous or no match
  if (verbose) {
    log("unit_mix_file_conflict_unresolved", {
      csvName: csvBuildingName,
      csvNormalized: csvNorm,
      candidates: candidates.map((c) => ({
        id: c.aptId,
        name: c.aptName,
        normalized: normalizeName(c.aptName),
      })),
      matchCount: matches.length,
    });
  }
  return null;
}

// ─── Main ───

export async function collectUnitMixFromFile(
  opts: UnitMixFileRunOptions,
): Promise<UnitMixFileRunResult> {
  const debugEnabled = opts.verbose === true;

  // Find CSV file for region
  const csvFiles = findCsvFiles(opts.regionCode);
  if (csvFiles.length === 0) {
    log("unit_mix_file_no_csv", { regionCode: opts.regionCode, dataDir: DATA_DIR });
    return {
      totalTargets: 0,
      matchedApts: 0,
      unmatchedRecords: 0,
      conflictSkipped: 0,
      insertedRows: 0,
      csvFile: null,
      csvTotalRows: 0,
      csvFilteredRows: 0,
    };
  }

  const csvPath = csvFiles[0];
  log("unit_mix_file_start", {
    regionCode: opts.regionCode,
    csvFile: path.basename(csvPath),
    dryRun: opts.dryRun,
  });

  // Build apartment lookup from DB
  const aptLookup = await buildAptLookup(opts.regionCode);
  const totalTargets = [...aptLookup.values()].reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  if (debugEnabled) {
    log("unit_mix_file_apt_lookup", {
      regionCode: opts.regionCode,
      totalTargets,
      uniqueKeys: aptLookup.size,
    });
  }

  // Parse CSV
  const content = fs.readFileSync(csvPath, "utf-8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }) as CsvRecord[];

  const csvTotalRows = records.length;

  // Filter + match + aggregate
  // Map<aptId, Map<bucket(0.1sqm), count>>
  const areaMaps = new Map<number, Map<number, number>>();
  let unmatchedRecords = 0;
  let conflictSkipped = 0;
  let csvFilteredRows = 0;

  for (const record of records) {
    // Filter: 전유 only
    if (record["전유공용구분코드"] !== "1") continue;
    // Filter: 아파트 only
    if (record["주용도코드명"] !== "아파트") continue;

    csvFilteredRows++;

    const bun = (record["번"] ?? "").padStart(4, "0").slice(0, 4);
    const ji = (record["지"] ?? "").padStart(4, "0").slice(0, 4);
    const key = `${opts.regionCode}:${bun}:${ji}`;

    const candidates = aptLookup.get(key);
    if (!candidates || candidates.length === 0) {
      unmatchedRecords++;
      continue;
    }

    const aptId = resolveAptMatch(
      candidates,
      record["건물명"] ?? "",
      debugEnabled,
    );
    if (aptId === null) {
      conflictSkipped++;
      continue;
    }

    const area = parseFloat(record["면적(㎡)"] ?? "");
    if (!Number.isFinite(area) || area <= 0) continue;

    // Bucket to 0.1㎡
    const bucket = Math.round(area * 10) / 10;
    const bucketMap = areaMaps.get(aptId) ?? new Map<number, number>();
    bucketMap.set(bucket, (bucketMap.get(bucket) ?? 0) + 1);
    areaMaps.set(aptId, bucketMap);
  }

  log("unit_mix_file_parsed", {
    csvTotalRows,
    csvFilteredRows,
    matchedApts: areaMaps.size,
    unmatchedRecords,
    conflictSkipped,
  });

  // Upsert
  let insertedRows = 0;

  if (!opts.dryRun) {
    for (const [aptId, bucketMap] of areaMaps) {
      // Delete existing rows for this apartment
      await db.execute(sql`
        DELETE FROM apartment_unit_types WHERE apt_id = ${aptId}
      `);

      const values = [...bucketMap.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([areaSqm, householdCount]) => ({
          aptId,
          areaSqm: String(areaSqm),
          areaPyeong: Number((areaSqm / 3.3058).toFixed(2)),
          householdCount,
          source: "bldRgst_file",
        }));

      await db.insert(apartmentUnitTypes).values(values);
      insertedRows += values.length;
    }
  } else {
    // dry-run: count what would be inserted
    for (const bucketMap of areaMaps.values()) {
      insertedRows += bucketMap.size;
    }
  }

  log("unit_mix_file_complete", {
    regionCode: opts.regionCode,
    totalTargets,
    matchedApts: areaMaps.size,
    unmatchedRecords,
    conflictSkipped,
    insertedRows,
    dryRun: opts.dryRun,
  });

  return {
    totalTargets,
    matchedApts: areaMaps.size,
    unmatchedRecords,
    conflictSkipped,
    insertedRows,
    csvFile: path.basename(csvPath),
    csvTotalRows,
    csvFilteredRows,
  };
}

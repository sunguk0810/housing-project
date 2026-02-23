import { desc, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { db } from '@/db/connection';
import { safetyStats } from '@/db/schema';

/**
 * Batch safety data query for the recommend pipeline.
 * Eliminates N+1 by fetching all region safety data in one query.
 *
 * Source of Truth: M2 spec Section 6.1 (Step 5.5)
 */

export interface RegionSafetyData {
  readonly crimeLevel: number;
  readonly cctvDensity: number;
  readonly shelterCount: number;
  readonly dataDate: string | null;
}

/**
 * Fetch safety statistics for multiple region codes in a single query.
 * Returns the most recent record per region code.
 */
export async function batchFetchSafetyByRegions(
  regionCodes: string[],
): Promise<Map<string, RegionSafetyData>> {
  const result = new Map<string, RegionSafetyData>();

  if (regionCodes.length === 0) return result;

  const rows = await db
    .selectDistinctOn([safetyStats.regionCode], {
      regionCode: safetyStats.regionCode,
      crimeLevel: sql<number>`COALESCE(CAST(${safetyStats.crimeRate} AS REAL), 5)`,
      cctvDensity: sql<number>`COALESCE(CAST(${safetyStats.cctvDensity} AS REAL), 2)`,
      shelterCount: sql<number>`COALESCE(${safetyStats.shelterCount}, 3)`,
      dataDate: safetyStats.dataDate,
    })
    .from(safetyStats)
    .where(inArray(safetyStats.regionCode, regionCodes))
    .orderBy(safetyStats.regionCode, desc(safetyStats.dataDate));

  for (const row of rows) {
    result.set(row.regionCode, {
      crimeLevel: row.crimeLevel,
      cctvDensity: row.cctvDensity,
      shelterCount: row.shelterCount,
      dataDate: row.dataDate,
    });
  }

  return result;
}

import { sql } from 'drizzle-orm';
import { db } from '@/db/connection';
import { parseRouteSnapshot } from '@/lib/engines/spatial';
import type { CandidateRow } from '@/lib/queries/fetch-candidates';
import type { CommuteRouteInfo } from '@/types/engine';

/**
 * Batch spatial queries — replaces N+1 per-candidate queries with
 * a single query per spatial dimension.
 *
 * Pattern: VALUES list via sql.join() (validated in molit.ts:717)
 */

// --- Types ---

export interface BatchCommuteTimeRow {
  readonly gridId: string;
  readonly destinationKey: string;
  readonly timeMinutes: number | null;
  readonly routeSnapshot: CommuteRouteInfo | null;
}

// --- Batch functions ---

/**
 * Count childcare centers within `radiusMeters` for each candidate.
 * Returns Map<aptId, count>.
 */
export async function batchChildcareCounts(
  candidates: ReadonlyArray<CandidateRow>,
  radiusMeters: number,
): Promise<Map<number, number>> {
  if (candidates.length === 0) return new Map();

  const values = sql.join(
    candidates.map((c) => sql`(${c.id}, ST_SetSRID(ST_MakePoint(${c.longitude}, ${c.latitude}), 4326))`),
    sql`,`,
  );

  const rows = await db.execute(sql`
    WITH pts(apt_id, geom) AS (VALUES ${values})
    SELECT
      p.apt_id AS "aptId",
      COUNT(cc.id)::int AS "cnt"
    FROM pts p
    LEFT JOIN childcare_centers cc
      ON ST_DWithin(cc.location::geography, p.geom::geography, ${radiusMeters})
    GROUP BY p.apt_id
  `);

  const result = new Map<number, number>();
  for (const r of rows as Array<Record<string, unknown>>) {
    result.set(Number(r.aptId), Number(r.cnt));
  }
  return result;
}

/**
 * Average school achievement score within `radiusMeters` for each candidate.
 * Returns Map<aptId, avgScore>.
 */
export async function batchSchoolScores(
  candidates: ReadonlyArray<CandidateRow>,
  radiusMeters: number,
): Promise<Map<number, number>> {
  if (candidates.length === 0) return new Map();

  const values = sql.join(
    candidates.map((c) => sql`(${c.id}, ST_SetSRID(ST_MakePoint(${c.longitude}, ${c.latitude}), 4326))`),
    sql`,`,
  );

  const rows = await db.execute(sql`
    WITH pts(apt_id, geom) AS (VALUES ${values})
    SELECT
      p.apt_id AS "aptId",
      COALESCE(AVG(CAST(s.achievement_score AS REAL)), 0) AS "avgScore"
    FROM pts p
    LEFT JOIN schools s
      ON ST_DWithin(s.location::geography, p.geom::geography, ${radiusMeters})
    GROUP BY p.apt_id
  `);

  const result = new Map<number, number>();
  for (const r of rows as Array<Record<string, unknown>>) {
    result.set(Number(r.aptId), Number(r.avgScore));
  }
  return result;
}

/**
 * Find nearest commute grid point for each candidate using KNN <-> operator.
 * Returns Map<aptId, gridId>.
 */
export async function batchNearestGrids(
  candidates: ReadonlyArray<CandidateRow>,
): Promise<Map<number, string>> {
  if (candidates.length === 0) return new Map();

  const values = sql.join(
    candidates.map((c) => sql`(${c.id}, ST_SetSRID(ST_MakePoint(${c.longitude}, ${c.latitude}), 4326))`),
    sql`,`,
  );

  const rows = await db.execute(sql`
    WITH pts(apt_id, geom) AS (VALUES ${values})
    SELECT
      p.apt_id AS "aptId",
      nearest.grid_id AS "gridId"
    FROM pts p
    CROSS JOIN LATERAL (
      SELECT grid_id
      FROM commute_grid
      ORDER BY location <-> p.geom
      LIMIT 1
    ) nearest
  `);

  const result = new Map<number, string>();
  for (const r of rows as Array<Record<string, unknown>>) {
    result.set(Number(r.aptId), String(r.gridId));
  }
  return result;
}

/**
 * Fetch commute times + route snapshots for given grid IDs and destination keys.
 * Returns Map<`${gridId}:${destinationKey}`, BatchCommuteTimeRow>.
 */
export async function batchCommuteTimes(
  gridIds: ReadonlyArray<string>,
  destinationKeys: ReadonlyArray<string>,
): Promise<Map<string, BatchCommuteTimeRow>> {
  if (gridIds.length === 0 || destinationKeys.length === 0) return new Map();

  const uniqueGridIds = [...new Set(gridIds)];
  const uniqueDestKeys = [...new Set(destinationKeys)];

  const gridList = sql.join(uniqueGridIds.map((id) => sql`${id}`), sql`,`);
  const destList = sql.join(uniqueDestKeys.map((k) => sql`${k}`), sql`,`);

  const rows = await db.execute(sql`
    SELECT
      grid_id AS "gridId",
      destination_key AS "destinationKey",
      time_minutes AS "timeMinutes",
      route_snapshot AS "routeSnapshot"
    FROM commute_times
    WHERE grid_id IN (${gridList})
      AND destination_key IN (${destList})
  `);

  const result = new Map<string, BatchCommuteTimeRow>();
  for (const r of rows as Array<Record<string, unknown>>) {
    const gridId = String(r.gridId);
    const destinationKey = String(r.destinationKey);
    result.set(`${gridId}:${destinationKey}`, {
      gridId,
      destinationKey,
      timeMinutes: r.timeMinutes !== null ? Number(r.timeMinutes) : null,
      routeSnapshot: parseRouteSnapshot(r.routeSnapshot),
    });
  }
  return result;
}

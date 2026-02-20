import { sql as sqlTag } from 'drizzle-orm';
import { db } from '@/db/connection';
import type { CommuteRouteInfo, CommuteRouteSegment } from '@/types/engine';
import { safeNum } from '@/lib/utils/safe-num';
import type { CommuteRouteDetail } from '@/types/api';

/**
 * PostGIS spatial query helpers.
 * Source of Truth: M2 spec Section 5.4
 */

export interface ChildcareWithDistance {
  id: number;
  name: string;
  distanceMeters: number;
  evaluationGrade: string | null;
}

export interface SchoolWithDistance {
  id: number;
  name: string;
  schoolLevel: string | null;
  achievementScore: number | null;
  distanceMeters: number;
}

export interface CommuteGridRow {
  gridId: string;
}

export interface CommuteTimeRow {
  destinationKey: string;
  timeMinutes: number | null;
}

export interface CommuteTimeWithRouteRow {
  timeMinutes: number | null;
  routeSnapshot: CommuteRouteInfo | null;
}

/** Find childcare centers within radius using ST_DWithin */
export async function findNearbyChildcare(
  longitude: number,
  latitude: number,
  radiusMeters: number,
): Promise<ChildcareWithDistance[]> {
  const rows = await db.execute(sqlTag`
    SELECT
      id,
      name,
      evaluation_grade AS "evaluationGrade",
      ST_Distance(
        location::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      ) AS "distanceMeters"
    FROM childcare_centers
    WHERE ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
      ${radiusMeters}
    )
    ORDER BY "distanceMeters"
  `);

  return rows.map((r: Record<string, unknown>) => ({
    id: Number(r.id),
    name: String(r.name),
    distanceMeters: Number(r.distanceMeters),
    evaluationGrade: r.evaluationGrade ? String(r.evaluationGrade) : null,
  }));
}

/** Find schools within radius using ST_DWithin */
export async function findNearbySchools(
  longitude: number,
  latitude: number,
  radiusMeters: number,
): Promise<SchoolWithDistance[]> {
  const rows = await db.execute(sqlTag`
    SELECT
      id,
      name,
      school_level AS "schoolLevel",
      achievement_score AS "achievementScore",
      ST_Distance(
        location::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      ) AS "distanceMeters"
    FROM schools
    WHERE ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
      ${radiusMeters}
    )
    ORDER BY "distanceMeters"
  `);

  return rows.map((r: Record<string, unknown>) => ({
    id: Number(r.id),
    name: String(r.name),
    schoolLevel: r.schoolLevel ? String(r.schoolLevel) : null,
    achievementScore: r.achievementScore ? Number(r.achievementScore) : null,
    distanceMeters: Number(r.distanceMeters),
  }));
}

/** Find nearest commute grid point using KNN <-> operator */
export async function findNearestGrid(
  longitude: number,
  latitude: number,
): Promise<CommuteGridRow | null> {
  const rows = await db.execute(sqlTag`
    SELECT
      grid_id AS "gridId"
    FROM commute_grid
    ORDER BY location <-> ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
    LIMIT 1
  `);

  if (rows.length === 0) return null;

  const r = rows[0] as Record<string, unknown>;
  return {
    gridId: String(r.gridId),
  };
}

/**
 * Parse route snapshot value from DB.
 * [F3+R4+T2+T6+U3] Segment-level validation with fallbacks to preserve data.
 *
 * Segment DROP condition: only when trafficType is not 1/2/3.
 * lineName fallback: trafficType=3 → '도보', trafficType=1|2 → '노선 미상' (U3: no drop).
 * stationCount fallback: NaN → 0.
 * All zero valid segments → null return.
 */
function parseRouteSnapshot(value: unknown): CommuteRouteInfo | null {
  // Handle JSON string input
  let obj = value;
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj);
    } catch {
      return null;
    }
  }

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  const candidate = obj as Partial<CommuteRouteInfo>;

  if (!Array.isArray(candidate.segments) || !candidate.segments.length) {
    return null;
  }

  // [T6] Sampled warning log: 1% probability
  const shouldLog = Math.random() < 0.01;

  const validSegments: CommuteRouteSegment[] = [];
  for (const raw of candidate.segments) {
    if (!raw || typeof raw !== 'object') continue;

    const seg = raw as Partial<CommuteRouteSegment>;
    const tt = Number(seg.trafficType);
    // Only DROP condition: trafficType not 1/2/3
    if (tt !== 1 && tt !== 2 && tt !== 3) {
      if (shouldLog) {
        console.warn(JSON.stringify({
          event: 'route_segment_invalid_traffic_type',
          trafficType: seg.trafficType,
        }));
      }
      continue;
    }

    // [T2+U3] lineName fallback by trafficType
    let lineName: string;
    if (typeof seg.lineName === 'string' && seg.lineName.trim() !== '') {
      lineName = seg.lineName;
    } else if (tt === 3) {
      lineName = '도보';
    } else {
      // trafficType 1 (subway) or 2 (bus): fallback to '노선 미상' instead of drop
      lineName = '노선 미상';
    }

    // stationCount: NaN → 0 fallback
    const stationCount = Number.isFinite(Number(seg.stationCount)) ? Number(seg.stationCount) : 0;

    const validated: CommuteRouteSegment = { trafficType: tt as 1 | 2 | 3, lineName, stationCount };
    if (seg.sectionTime != null && Number.isFinite(Number(seg.sectionTime))) {
      validated.sectionTime = Number(seg.sectionTime);
    }
    if (seg.distance != null && Number.isFinite(Number(seg.distance))) {
      validated.distance = Number(seg.distance);
    }
    validSegments.push(validated);
  }

  // Zero valid segments → null
  if (validSegments.length === 0) {
    if (shouldLog) {
      console.warn(JSON.stringify({ event: 'route_snapshot_no_valid_segments' }));
    }
    return null;
  }

  // Safe defaults
  const transferCount = typeof candidate.transferCount === 'number' ? candidate.transferCount : 0;
  const summary =
    typeof candidate.summary === 'string' && candidate.summary.trim() !== ''
      ? candidate.summary
      : validSegments.map((s) => s.lineName).join(' → ');

  return {
    pathType: candidate.pathType,
    totalWalk: candidate.totalWalk,
    busTransitCount: candidate.busTransitCount,
    subwayTransitCount: candidate.subwayTransitCount,
    totalStationCount: candidate.totalStationCount,
    totalDistance: candidate.totalDistance,
    segments: validSegments,
    transferCount,
    summary,
  };
}

/** Fetch all commute times for a given grid_id */
export async function getCommuteTimesForGrid(gridId: string): Promise<CommuteTimeRow[]> {
  const rows = await db.execute(sqlTag`
    SELECT
      destination_key AS "destinationKey",
      time_minutes AS "timeMinutes"
    FROM commute_times
    WHERE grid_id = ${gridId}
  `);

  return rows.map((r: Record<string, unknown>) => ({
    destinationKey: String(r.destinationKey),
    timeMinutes: r.timeMinutes !== null ? Number(r.timeMinutes) : null,
  }));
}

/** Fetch single commute time + route snapshot for a given grid_id */
export async function getCommuteTimeWithRouteForGrid(
  gridId: string,
  destinationKey: string,
): Promise<CommuteTimeWithRouteRow | null> {
  const rows = await db.execute(sqlTag`
    SELECT
      time_minutes AS "timeMinutes",
      route_snapshot AS "routeSnapshot"
    FROM commute_times
    WHERE grid_id = ${gridId}
      AND destination_key = ${destinationKey}
    LIMIT 1
  `);

  if (rows.length === 0) return null;

  const r = rows[0] as Record<string, unknown>;
  return {
    timeMinutes: r.timeMinutes !== null ? Number(r.timeMinutes) : null,
    routeSnapshot: parseRouteSnapshot(r.routeSnapshot),
  };
}

/** Fetch single commute time (backward-compatible) */
export async function getCommuteTimeForGrid(
  gridId: string,
  destinationKey: string,
): Promise<number | null> {
  const row = await getCommuteTimeWithRouteForGrid(gridId, destinationKey);
  return row?.timeMinutes ?? null;
}

/** Convert engine CommuteRouteInfo → API CommuteRouteDetail */
function toCommuteRouteDetail(info: CommuteRouteInfo): CommuteRouteDetail {
  return {
    segments: info.segments.map((s) => ({
      trafficType: s.trafficType,
      lineName: s.lineName,
      stationCount: s.stationCount,
    })),
    transferCount: info.transferCount,
    summary: info.summary,
  };
}

export interface FullCommuteRow {
  destinationKey: string;
  name: string;
  timeMinutes: number | null;
  route: CommuteRouteDetail | null;
}

/**
 * Fetch all active commute destinations with times for a given grid_id.
 * LEFT JOIN ensures destinations without computed times still appear.
 */
export async function getFullCommuteForGrid(gridId: string): Promise<FullCommuteRow[]> {
  const rows = await db.execute(sqlTag`
    SELECT
      cd.destination_key AS "destinationKey",
      cd.name,
      ct.time_minutes AS "timeMinutes",
      ct.route_snapshot AS "routeSnapshot"
    FROM commute_destinations cd
    LEFT JOIN commute_times ct
      ON ct.grid_id = ${gridId}
      AND ct.destination_key = cd.destination_key
    WHERE cd.active = true
    ORDER BY cd.destination_key ASC
  `);

  return rows.map((r: Record<string, unknown>) => {
    const parsed = r.routeSnapshot != null ? parseRouteSnapshot(r.routeSnapshot) : null;
    return {
      destinationKey: String(r.destinationKey),
      name: String(r.name),
      timeMinutes: safeNum(r.timeMinutes),
      route: parsed ? toCommuteRouteDetail(parsed) : null,
    };
  });
}

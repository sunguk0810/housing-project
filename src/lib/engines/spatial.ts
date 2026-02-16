import { sql as sqlTag } from "drizzle-orm";
import { db } from "@/db/connection";

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
  toGbdTime: number | null;
  toYbdTime: number | null;
  toCbdTime: number | null;
  toPangyoTime: number | null;
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
      grid_id AS "gridId",
      to_gbd_time AS "toGbdTime",
      to_ybd_time AS "toYbdTime",
      to_cbd_time AS "toCbdTime",
      to_pangyo_time AS "toPangyoTime"
    FROM commute_grid
    ORDER BY location <-> ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
    LIMIT 1
  `);

  if (rows.length === 0) return null;

  const r = rows[0] as Record<string, unknown>;
  return {
    gridId: String(r.gridId),
    toGbdTime: r.toGbdTime !== null ? Number(r.toGbdTime) : null,
    toYbdTime: r.toYbdTime !== null ? Number(r.toYbdTime) : null,
    toCbdTime: r.toCbdTime !== null ? Number(r.toCbdTime) : null,
    toPangyoTime: r.toPangyoTime !== null ? Number(r.toPangyoTime) : null,
  };
}

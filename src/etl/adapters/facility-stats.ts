import { db } from "@/db/connection";
import { sql } from "drizzle-orm";

type FacilityPointType =
  | "subway_station"
  | "bus_stop"
  | "police"
  | "fire_station"
  | "shelter"
  | "hospital"
  | "pharmacy";

const FACILITY_TYPES: FacilityPointType[] = [
  "subway_station",
  "bus_stop",
  "police",
  "fire_station",
  "shelter",
  "hospital",
  "pharmacy",
];

export async function precomputeApartmentFacilityStats(input: {
  dryRun: boolean;
  radiusM: number;
}): Promise<number> {
  const radiusM = Math.max(1, Math.round(input.radiusM));

  const aptCountRows = (await db.execute(sql`
    SELECT COUNT(*)::int AS count FROM apartments
  `)) as unknown as Array<{ count: number }>;
  const aptCount = Number(aptCountRows[0]?.count ?? 0);
  if (aptCount <= 0) return 0;

  const fpCountRows = (await db.execute(sql`
    SELECT COUNT(*)::int AS count FROM facility_points
  `)) as unknown as Array<{ count: number }>;
  const fpCount = Number(fpCountRows[0]?.count ?? 0);
  if (fpCount <= 0) return 0;

  const computed = aptCount * FACILITY_TYPES.length;
  if (input.dryRun) return computed;

  for (const type of FACILITY_TYPES) {
    await db.execute(sql`
      INSERT INTO apartment_facility_stats (
        apt_id,
        type,
        within_radius_count,
        nearest_distance_m,
        radius_m,
        computed_at
      )
      SELECT
        a.id AS apt_id,
        ${type}::varchar(30) AS type,
        (
          SELECT COUNT(*)
          FROM facility_points fp
          WHERE fp.type = ${type}
            AND ST_DWithin(
              a.location::geography,
              fp.location::geography,
              ${radiusM}
            )
        ) AS within_radius_count,
        (
          SELECT MIN(ST_DistanceSphere(a.location::geometry, fp.location::geometry))
          FROM facility_points fp
          WHERE fp.type = ${type}
        ) AS nearest_distance_m,
        ${radiusM} AS radius_m,
        NOW() AS computed_at
      FROM apartments a
      ON CONFLICT (apt_id, type, radius_m) DO UPDATE
      SET
        within_radius_count = EXCLUDED.within_radius_count,
        nearest_distance_m = EXCLUDED.nearest_distance_m,
        computed_at = NOW()
    `);
  }

  return computed;
}


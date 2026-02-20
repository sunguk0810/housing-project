import {
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  timestamp,
  check,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { apartments } from "./apartments";

/**
 * Precomputed facility statistics per apartment complex.
 * Used to avoid expensive spatial queries at request time.
 *
 * Source of Truth: docs/PHASE1_design.md > S2 — apartment_facility_stats
 */
export const apartmentFacilityStats = pgTable(
  "apartment_facility_stats",
  {
    id: serial("id").primaryKey(),
    aptId: integer("apt_id")
      .references(() => apartments.id)
      .notNull(),
    type: varchar("type", { length: 30 }).notNull(),
    withinRadiusCount: integer("within_radius_count").notNull(),
    nearestDistanceM: numeric("nearest_distance_m"),
    radiusM: integer("radius_m").notNull(),
    computedAt: timestamp("computed_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "apartment_facility_stats_type_check",
      sql`${table.type} IN ('subway_station','bus_stop','police','fire_station','shelter','hospital','pharmacy')`,
    ),
    unique("apartment_facility_stats_unique").on(table.aptId, table.type, table.radiusM),
  ],
);


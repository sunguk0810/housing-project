import {
  pgTable,
  serial,
  varchar,
  text,
  numeric,
  integer,
  date,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// Source of Truth: docs/PHASE1_design.md > S2 — safety_stats
export const safetyStats = pgTable(
  "safety_stats",
  {
    id: serial("id").primaryKey(),
    regionCode: varchar("region_code", { length: 10 }).notNull(),
    regionName: text("region_name"),
    crimeRate: numeric("crime_rate"),
    cctvDensity: numeric("cctv_density"),
    policeStationDistance: numeric("police_station_distance"),
    streetlightDensity: numeric("streetlight_density"),
    shelterCount: integer("shelter_count"),
    calculatedScore: numeric("calculated_score"),
    dataDate: date("data_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("safety_stats_region_date_unique").on(
      table.regionCode,
      table.dataDate,
    ),
  ],
);

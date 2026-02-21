import {
  pgTable,
  serial,
  varchar,
  text,
  date,
  timestamp,
  check,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { geometryPoint } from "../types/geometry";

/**
 * Facility POI raw points.
 * Source: public/official APIs or official file snapshots (no crawling).
 *
 * Source of Truth: docs/PHASE1_design.md > S2 — facility_points
 */
export const facilityPoints = pgTable(
  "facility_points",
  {
    id: serial("id").primaryKey(),
    type: varchar("type", { length: 30 }).notNull(),
    name: text("name"),
    address: text("address"),
    regionCode: varchar("region_code", { length: 10 }),
    location: geometryPoint("location").notNull(),
    externalId: varchar("external_id", { length: 60 }),
    source: text("source"),
    dataDate: date("data_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "facility_points_type_check",
      sql`${table.type} IN ('subway_station','bus_stop','police','fire_station','shelter','hospital','pharmacy')`,
    ),
    unique("facility_points_type_external_unique").on(table.type, table.externalId),
  ],
);


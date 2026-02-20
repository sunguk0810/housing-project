import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { geometryPoint } from "../types/geometry";

/**
 * Safety infrastructure table for CCTV, safe cameras, and streetlights.
 * Used for PostGIS spatial density queries (ST_DWithin).
 *
 * Source of Truth: docs/PHASE1_design.md > S2
 */
export const safetyInfra = pgTable(
  "safety_infra",
  {
    id: serial("id").primaryKey(),
    type: varchar("type", { length: 20 }).notNull(),
    location: geometryPoint("location").notNull(),
    source: text("source"),
    cameraCount: integer("camera_count").default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "type_check",
      sql`${table.type} IN ('cctv', 'safecam', 'lamp')`,
    ),
  ],
);

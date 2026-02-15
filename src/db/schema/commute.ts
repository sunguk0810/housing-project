import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { geometryPoint } from "../types/geometry";

// Source of Truth: docs/PHASE1_design.md > S2 — commute_grid
export const commuteGrid = pgTable("commute_grid", {
  id: serial("id").primaryKey(),
  gridId: varchar("grid_id", { length: 20 }).notNull(),
  location: geometryPoint("location").notNull(),
  toGbdTime: integer("to_gbd_time"), // GBD: Gangnam Business District
  toYbdTime: integer("to_ybd_time"), // YBD: Yeouido Business District
  toCbdTime: integer("to_cbd_time"), // CBD: Jongno Business District
  toPangyoTime: integer("to_pangyo_time"), // Pangyo Techno Valley
  calculatedAt: timestamp("calculated_at", { withTimezone: true }).defaultNow(),
});

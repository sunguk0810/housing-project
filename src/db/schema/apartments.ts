import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  real,
  timestamp,
} from "drizzle-orm/pg-core";
import { geometryPoint } from "../types/geometry";

// Source of Truth: docs/PHASE1_design.md > S2 — apartments
export const apartments = pgTable("apartments", {
  id: serial("id").primaryKey(),
  aptCode: varchar("apt_code", { length: 20 }).notNull().unique(),
  aptName: text("apt_name").notNull(),
  address: text("address").notNull(),
  location: geometryPoint("location").notNull(),
  builtYear: integer("built_year"),
  householdCount: integer("household_count"),
  areaMin: real("area_min"),
  areaMax: real("area_max"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

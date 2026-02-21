import {
  pgTable,
  serial,
  integer,
  numeric,
  real,
  text,
  date,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { apartments } from "./apartments";

/**
 * Unit mix table (area bucket -> household count).
 * PII is NOT stored: no dong/ho-level identifiers.
 *
 * Source of Truth: docs/PHASE1_design.md > S2 — apartment_unit_types
 */
export const apartmentUnitTypes = pgTable(
  "apartment_unit_types",
  {
    id: serial("id").primaryKey(),
    aptId: integer("apt_id")
      .references(() => apartments.id)
      .notNull(),
    areaSqm: numeric("area_sqm").notNull(),
    areaPyeong: real("area_pyeong"),
    householdCount: integer("household_count").notNull(),
    source: text("source"),
    dataDate: date("data_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique("apartment_unit_types_unique").on(table.aptId, table.areaSqm)],
);


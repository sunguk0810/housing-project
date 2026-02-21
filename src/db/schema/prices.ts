import {
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { apartments } from "./apartments";

// Source of Truth: docs/PHASE1_design.md > S2 — apartment_prices
// Individual trade records (1 row = 1 trade)
//
// Dedup: UNIQUE INDEX "apt_prices_dedup" with NULLS NOT DISTINCT
// (created via migration SQL — Drizzle unique() does not support NULLS NOT DISTINCT)
// PostgreSQL 15+ required for NULLS NOT DISTINCT.
export const apartmentPrices = pgTable(
  "apartment_prices",
  {
    id: serial("id").primaryKey(),
    aptId: integer("apt_id").references(() => apartments.id),
    tradeType: varchar("trade_type", { length: 10 }),
    year: integer("year"),
    month: integer("month"),
    price: numeric("price").notNull(),              // individual trade price (만원)
    monthlyRent: numeric("monthly_rent"),            // monthly rent (만원, monthly only)
    exclusiveArea: numeric("exclusive_area"),         // exclusive area (㎡)
    floor: integer("floor"),                          // floor number
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "trade_type_check",
      sql`${table.tradeType} IN ('sale', 'jeonse', 'monthly')`,
    ),
  ],
);

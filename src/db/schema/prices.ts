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
export const apartmentPrices = pgTable(
  "apartment_prices",
  {
    id: serial("id").primaryKey(),
    aptId: integer("apt_id").references(() => apartments.id),
    tradeType: varchar("trade_type", { length: 10 }),
    year: integer("year"),
    month: integer("month"),
    averagePrice: numeric("average_price"),
    dealCount: integer("deal_count"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "trade_type_check",
      sql`${table.tradeType} IN ('sale', 'jeonse')`,
    ),
  ],
);

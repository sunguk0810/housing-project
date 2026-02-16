import {
  pgTable,
  serial,
  text,
  varchar,
  numeric,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { geometryPoint, geometryPolygon } from "../types/geometry";

// Source of Truth: docs/PHASE1_design.md > S2 — schools
export const schools = pgTable(
  "schools",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    schoolLevel: varchar("school_level", { length: 10 }),
    location: geometryPoint("location").notNull(),
    achievementScore: numeric("achievement_score"),
    assignmentArea: geometryPolygon("assignment_area"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "school_level_check",
      sql`${table.schoolLevel} IN ('elem', 'middle', 'high')`,
    ),
  ],
);

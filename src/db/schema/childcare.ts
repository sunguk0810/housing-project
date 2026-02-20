import {
  pgTable,
  serial,
  text,
  integer,
  varchar,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { geometryPoint } from "../types/geometry";

// Source of Truth: docs/PHASE1_design.md > S2 — childcare_centers
export const childcareCenters = pgTable(
  "childcare_centers",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address"),
    externalId: varchar("external_id", { length: 30 }),
    location: geometryPoint("location").notNull(),
    capacity: integer("capacity"),
    currentEnrollment: integer("current_enrollment"),
    evaluationGrade: varchar("evaluation_grade", { length: 10 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique("childcare_external_id_unique").on(table.externalId)],
);

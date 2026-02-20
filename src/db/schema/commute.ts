import {
  pgTable,
  serial,
  varchar,
  integer,
  jsonb,
  timestamp,
  unique,
  text,
  boolean,
} from 'drizzle-orm/pg-core';
import { geometryPoint } from '../types/geometry';

// Source of Truth: docs/PHASE1_design.md > S2 — commute_grid / commute_destinations / commute_times
export const commuteGrid = pgTable(
  'commute_grid',
  {
    id: serial('id').primaryKey(),
    gridId: varchar('grid_id', { length: 20 }).notNull(),
    location: geometryPoint('location').notNull(),
    calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [unique('commute_grid_id_unique').on(table.gridId)],
);

export const commuteDestinations = pgTable('commute_destinations', {
  destinationKey: varchar('destination_key', { length: 20 }).primaryKey(),
  name: text('name').notNull(),
  location: geometryPoint('location').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const commuteTimes = pgTable(
  'commute_times',
  {
    id: serial('id').primaryKey(),
    gridId: varchar('grid_id', { length: 20 })
      .notNull()
      .references(() => commuteGrid.gridId, { onDelete: 'cascade' }),
    destinationKey: varchar('destination_key', { length: 20 })
      .notNull()
      .references(() => commuteDestinations.destinationKey, {
        onDelete: 'restrict',
      }),
    timeMinutes: integer('time_minutes'),
    routeSnapshot: jsonb('route_snapshot'),
    calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [unique('commute_times_grid_dest_unique').on(table.gridId, table.destinationKey)],
);

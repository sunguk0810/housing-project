import { relations } from "drizzle-orm";
import { apartments } from "./apartments";
import { apartmentPrices } from "./prices";
import { apartmentUnitTypes } from "./apartment-unit-types";
import { apartmentFacilityStats } from "./apartment-facility-stats";

// Source of Truth: docs/PHASE1_design.md > S2
// apartments 1:N apartment_prices (apt_id FK)
// NOTE: Some tables use spatial JOINs, but FK relations are still declared where possible.

export const apartmentsRelations = relations(apartments, ({ many }) => ({
  prices: many(apartmentPrices),
  unitTypes: many(apartmentUnitTypes),
  facilityStats: many(apartmentFacilityStats),
}));

export const apartmentPricesRelations = relations(
  apartmentPrices,
  ({ one }) => ({
    apartment: one(apartments, {
      fields: [apartmentPrices.aptId],
      references: [apartments.id],
    }),
  }),
);

export const apartmentUnitTypesRelations = relations(
  apartmentUnitTypes,
  ({ one }) => ({
    apartment: one(apartments, {
      fields: [apartmentUnitTypes.aptId],
      references: [apartments.id],
    }),
  }),
);

export const apartmentFacilityStatsRelations = relations(
  apartmentFacilityStats,
  ({ one }) => ({
    apartment: one(apartments, {
      fields: [apartmentFacilityStats.aptId],
      references: [apartments.id],
    }),
  }),
);

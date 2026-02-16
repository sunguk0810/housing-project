import { relations } from "drizzle-orm";
import { apartments } from "./apartments";
import { apartmentPrices } from "./prices";

// Source of Truth: docs/PHASE1_design.md > S2
// apartments 1:N apartment_prices (apt_id FK)
// Other tables use spatial JOINs, not FK relations.

export const apartmentsRelations = relations(apartments, ({ many }) => ({
  prices: many(apartmentPrices),
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

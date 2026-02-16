/**
 * DB entity types — inferred from Drizzle ORM schema.
 * Source of Truth: PHASE1 S2 + db/schema.sql
 */

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  apartments,
  apartmentPrices,
  childcareCenters,
  schools,
  safetyStats,
  commuteGrid,
} from "@/db/schema";

// SELECT result types
export type Apartment = InferSelectModel<typeof apartments>;
export type ApartmentPrice = InferSelectModel<typeof apartmentPrices>;
export type ChildcareCenter = InferSelectModel<typeof childcareCenters>;
export type School = InferSelectModel<typeof schools>;
export type SafetyStat = InferSelectModel<typeof safetyStats>;
export type CommuteGridRow = InferSelectModel<typeof commuteGrid>;

// INSERT input types
export type NewApartment = InferInsertModel<typeof apartments>;
export type NewApartmentPrice = InferInsertModel<typeof apartmentPrices>;
export type NewChildcareCenter = InferInsertModel<typeof childcareCenters>;
export type NewSchool = InferInsertModel<typeof schools>;
export type NewSafetyStat = InferInsertModel<typeof safetyStats>;
export type NewCommuteGrid = InferInsertModel<typeof commuteGrid>;

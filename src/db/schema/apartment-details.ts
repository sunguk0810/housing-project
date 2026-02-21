import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  numeric,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { apartments } from "./apartments";

/**
 * K-apt apartment detail information (1:1 with apartments).
 * Source: AptBasisInfoServiceV4 + AptDtlInfoServiceV4
 *
 * Source of Truth: docs/PHASE1_design.md > S2
 */
export const apartmentDetails = pgTable(
  "apartment_details",
  {
    id: serial("id").primaryKey(),
    aptId: integer("apt_id")
      .references(() => apartments.id)
      .notNull(),
    kaptCode: varchar("kapt_code", { length: 20 }),

    // ─── Basic Info (getAphusBassInfoV4) ───
    // household_count는 apartments 테이블에 일원화 (건축물대장 기반)
    dongCount: integer("dong_count"),
    doroJuso: text("doro_juso"),
    useDate: varchar("use_date", { length: 8 }),
    builder: text("builder"),
    developer: text("developer"),
    heatType: varchar("heat_type", { length: 20 }),
    saleType: varchar("sale_type", { length: 20 }),
    hallType: varchar("hall_type", { length: 20 }),
    mgrType: varchar("mgr_type", { length: 20 }),
    totalArea: numeric("total_area"),
    privateArea: numeric("private_area"),

    // ─── Detail Info (getAphusDtlInfoV4) ───
    parkingGround: integer("parking_ground"),
    parkingUnderground: integer("parking_underground"),
    elevatorCount: integer("elevator_count"),
    cctvCount: integer("cctv_count"),
    evChargerGround: integer("ev_charger_ground"),
    evChargerUnderground: integer("ev_charger_underground"),
    subwayLine: text("subway_line"),
    subwayStation: text("subway_station"),
    subwayDistance: text("subway_distance"),
    busDistance: text("bus_distance"),
    buildingStructure: varchar("building_structure", { length: 30 }),
    welfareFacility: text("welfare_facility"),
    educationFacility: text("education_facility"),
    convenientFacility: text("convenient_facility"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("apartment_details_apt_id_unique").on(table.aptId),
    // kapt_code UNIQUE 제거 — N:1 매핑 허용 (통합 등록 K-apt 대응)
  ],
);

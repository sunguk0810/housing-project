-- Migration: Convert apartment_prices from aggregate to individual trade rows
-- Existing aggregate data will be cleared; ETL re-run will populate individual trades

-- Clear existing aggregate data (incompatible with new schema)
TRUNCATE TABLE "apartment_prices" RESTART IDENTITY;

-- Drop old unique constraint
ALTER TABLE "apartment_prices" DROP CONSTRAINT IF EXISTS "apt_prices_unique";

-- Drop old aggregate columns
ALTER TABLE "apartment_prices" DROP COLUMN IF EXISTS "average_price";
ALTER TABLE "apartment_prices" DROP COLUMN IF EXISTS "monthly_rent_avg";
ALTER TABLE "apartment_prices" DROP COLUMN IF EXISTS "deal_count";
ALTER TABLE "apartment_prices" DROP COLUMN IF EXISTS "area_avg";
ALTER TABLE "apartment_prices" DROP COLUMN IF EXISTS "area_min";
ALTER TABLE "apartment_prices" DROP COLUMN IF EXISTS "area_max";
ALTER TABLE "apartment_prices" DROP COLUMN IF EXISTS "floor_avg";
ALTER TABLE "apartment_prices" DROP COLUMN IF EXISTS "floor_min";
ALTER TABLE "apartment_prices" DROP COLUMN IF EXISTS "floor_max";

-- Add individual trade columns
ALTER TABLE "apartment_prices" ADD COLUMN "price" numeric NOT NULL DEFAULT 0;
ALTER TABLE "apartment_prices" ADD COLUMN "monthly_rent" numeric;
ALTER TABLE "apartment_prices" ADD COLUMN "exclusive_area" numeric;
ALTER TABLE "apartment_prices" ADD COLUMN "floor" integer;

-- Remove default after adding (was only for migration safety)
ALTER TABLE "apartment_prices" ALTER COLUMN "price" DROP DEFAULT;

-- Add dedup unique index for ETL idempotency
-- NULLS NOT DISTINCT: monthly_rent is NULL for sale/jeonse → without this, NULL != NULL
-- and duplicate rows would be inserted on ETL re-run. Requires PostgreSQL 15+.
CREATE UNIQUE INDEX "apt_prices_dedup"
  ON "apartment_prices" ("apt_id", "trade_type", "year", "month", "price", "monthly_rent", "exclusive_area", "floor")
  NULLS NOT DISTINCT;

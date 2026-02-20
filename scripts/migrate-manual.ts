/**
 * Manual schema migration for real-data-integration changes.
 * Run: pnpm exec tsx scripts/migrate-manual.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

// Load .env before anything else — find it relative to this script's location
const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
  console.log(`Loaded .env from ${envPath}`);
} else {
  console.error(`.env not found at ${envPath}`);
  process.exit(1);
}

// Dynamic import — runs AFTER .env is loaded
async function migrate() {
  const { sql } = await import("@/db/connection");

  console.log("Applying schema changes...\n");

  // 0. Widen apt_code column
  console.log("[0/6] Widening apt_code to VARCHAR(60)...");
  await sql`ALTER TABLE apartments ALTER COLUMN apt_code TYPE VARCHAR(60)`;

  // 1. New columns
  console.log("[1/7] Adding region_code column to apartments...");
  await sql`ALTER TABLE apartments ADD COLUMN IF NOT EXISTS region_code VARCHAR(10)`;

  console.log("[2/7] Adding school_code column to schools...");
  await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS school_code VARCHAR(20)`;

  console.log("[2/5] Adding external_id column to childcare_centers...");
  await sql`ALTER TABLE childcare_centers ADD COLUMN IF NOT EXISTS external_id VARCHAR(30)`;

  // 3. UNIQUE constraints
  console.log("[3/5] Adding UNIQUE constraints...");

  const constraints = await sql`
    SELECT conname FROM pg_constraint
    WHERE conname IN (
      'schools_school_code_unique',
      'childcare_external_id_unique',
      'apt_prices_unique',
      'safety_stats_region_date_unique',
      'commute_grid_id_unique'
    )
  `;
  const existing = new Set(constraints.map((r: { conname: string }) => r.conname));

  if (!existing.has("schools_school_code_unique")) {
    await sql`ALTER TABLE schools ADD CONSTRAINT schools_school_code_unique UNIQUE (school_code)`;
    console.log("  + schools_school_code_unique");
  } else {
    console.log("  = schools_school_code_unique (already exists)");
  }

  if (!existing.has("childcare_external_id_unique")) {
    await sql`ALTER TABLE childcare_centers ADD CONSTRAINT childcare_external_id_unique UNIQUE (external_id)`;
    console.log("  + childcare_external_id_unique");
  } else {
    console.log("  = childcare_external_id_unique (already exists)");
  }

  if (!existing.has("apt_prices_unique")) {
    await sql`ALTER TABLE apartment_prices ADD CONSTRAINT apt_prices_unique UNIQUE (apt_id, trade_type, year, month)`;
    console.log("  + apt_prices_unique");
  } else {
    console.log("  = apt_prices_unique (already exists)");
  }

  if (!existing.has("safety_stats_region_date_unique")) {
    await sql`ALTER TABLE safety_stats ADD CONSTRAINT safety_stats_region_date_unique UNIQUE (region_code, data_date)`;
    console.log("  + safety_stats_region_date_unique");
  } else {
    console.log("  = safety_stats_region_date_unique (already exists)");
  }

  if (!existing.has("commute_grid_id_unique")) {
    await sql`ALTER TABLE commute_grid ADD CONSTRAINT commute_grid_id_unique UNIQUE (grid_id)`;
    console.log("  + commute_grid_id_unique");
  } else {
    console.log("  = commute_grid_id_unique (already exists)");
  }

  // 4. New table: safety_infra
  console.log("[4/7] Creating safety_infra table...");
  await sql`
    CREATE TABLE IF NOT EXISTS safety_infra (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL CHECK (type IN ('cctv', 'safecam', 'lamp')),
      location geometry(Point, 4326) NOT NULL,
      source TEXT,
      camera_count INTEGER DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // 5. New table: apartment_details
  console.log("[5/7] Creating apartment_details table...");
  await sql`
    CREATE TABLE IF NOT EXISTS apartment_details (
      id SERIAL PRIMARY KEY,
      apt_id INTEGER NOT NULL REFERENCES apartments(id),
      kapt_code VARCHAR(20),
      household_count INTEGER,
      dong_count INTEGER,
      doro_juso TEXT,
      use_date VARCHAR(8),
      builder TEXT,
      developer TEXT,
      heat_type VARCHAR(20),
      sale_type VARCHAR(20),
      hall_type VARCHAR(20),
      mgr_type VARCHAR(20),
      total_area NUMERIC,
      private_area NUMERIC,
      parking_ground INTEGER,
      parking_underground INTEGER,
      elevator_count INTEGER,
      cctv_count INTEGER,
      ev_charger_ground INTEGER,
      ev_charger_underground INTEGER,
      subway_line TEXT,
      subway_station TEXT,
      subway_distance TEXT,
      bus_distance TEXT,
      building_structure VARCHAR(30),
      welfare_facility TEXT,
      education_facility TEXT,
      convenient_facility TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT apartment_details_apt_id_unique UNIQUE (apt_id),
      CONSTRAINT apartment_details_kapt_code_unique UNIQUE (kapt_code)
    )
  `;

  // ═══ 6. Building Register ETL 스키마 변경 ═══
  console.log("\n[6/8] Building Register ETL schema changes...");

  // 6-1. apartments.official_name 추가
  console.log("  6-1. Adding official_name to apartments...");
  await sql`ALTER TABLE apartments ADD COLUMN IF NOT EXISTS official_name TEXT`;

  // 6-2. 사전 검증 스냅샷
  const preCheck = await sql`
    SELECT
      (SELECT COUNT(*) FROM apartments) AS apt_total,
      (SELECT COUNT(household_count) FROM apartments) AS apt_hh_filled,
      (SELECT COUNT(*) FROM apartment_details) AS detail_total,
      (SELECT CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'apartment_details' AND column_name = 'household_count'
      ) THEN 1 ELSE 0 END) AS detail_hh_exists
  `;
  const pre = preCheck[0] as { apt_total: string; apt_hh_filled: string; detail_total: string; detail_hh_exists: number };
  console.log(`  Pre-check: apartments=${pre.apt_total}, hh_filled=${pre.apt_hh_filled}, details=${pre.detail_total}, detail_hh_column=${pre.detail_hh_exists}`);

  // 6-3. 백필: apartment_details.household_count → apartments.household_count
  if (Number(pre.detail_hh_exists) === 1) {
    console.log("  6-3. Backfilling household_count...");
    const backfillResult = await sql`
      UPDATE apartments a
      SET household_count = ad.household_count
      FROM apartment_details ad
      WHERE ad.apt_id = a.id
        AND ad.household_count IS NOT NULL
        AND a.household_count IS NULL
    `;
    console.log(`  Backfilled: ${(backfillResult as unknown as { count: number }).count ?? 0} rows`);

    // 6-4. 백필 검증
    const lossCheck = await sql`
      SELECT COUNT(*) AS lost
      FROM apartment_details ad
      JOIN apartments a ON a.id = ad.apt_id
      WHERE ad.household_count IS NOT NULL
        AND a.household_count IS NULL
    `;
    const lost = Number((lossCheck[0] as { lost: string }).lost);
    if (lost > 0) {
      console.error(`  ❌ DATA LOSS DETECTED: ${lost} rows not backfilled. ABORTING column drop.`);
    } else {
      console.log("  ✓ Backfill verified: 0 data loss");

      // 6-5. apartment_details.household_count 제거
      console.log("  6-5. Dropping apartment_details.household_count...");
      await sql`ALTER TABLE apartment_details DROP COLUMN IF EXISTS household_count`;
    }
  } else {
    console.log("  6-3. apartment_details.household_count already removed, skipping backfill");
  }

  // 6-6. kapt_code UNIQUE 제약 제거
  console.log("  6-6. Dropping kapt_code UNIQUE constraint...");
  const kaptConstraint = await sql`
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'apartment_details_kapt_code_unique'
  `;
  if (kaptConstraint.length > 0) {
    await sql`ALTER TABLE apartment_details DROP CONSTRAINT apartment_details_kapt_code_unique`;
    console.log("  ✓ Dropped apartment_details_kapt_code_unique");
  } else {
    console.log("  = apartment_details_kapt_code_unique (already removed)");
  }

  // 6-7. 사후 검증
  const postCheck = await sql`
    SELECT
      (SELECT COUNT(*) FROM apartments) AS apt_total,
      (SELECT COUNT(household_count) FROM apartments) AS apt_hh_filled,
      (SELECT COUNT(*) FROM apartment_details) AS detail_total,
      (SELECT COUNT(*) FROM apartment_details ad LEFT JOIN apartments a ON a.id = ad.apt_id WHERE a.id IS NULL) AS orphans
  `;
  const post = postCheck[0] as { apt_total: string; apt_hh_filled: string; detail_total: string; orphans: string };
  console.log(`  Post-check: apartments=${post.apt_total}, hh_filled=${post.apt_hh_filled}, details=${post.detail_total}, orphans=${post.orphans}`);

  // ═══ 7. Data coverage extensions (monthly / unit-mix / POI) ═══
  console.log("\n[7/11] Data coverage schema changes...");

  // 7-1. apartments.building_type
  console.log("  7-1. Adding building_type to apartments...");
  await sql`ALTER TABLE apartments ADD COLUMN IF NOT EXISTS building_type VARCHAR(20) NOT NULL DEFAULT 'apartment'`;

  // Add CHECK constraint (best-effort; skip if already exists)
  const buildingTypeConstraint = await sql`
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'apartments_building_type_check'
  `;
  if (buildingTypeConstraint.length === 0) {
    await sql`
      ALTER TABLE apartments
      ADD CONSTRAINT apartments_building_type_check
      CHECK (building_type IN ('apartment','officetel','other'))
    `;
    console.log("  ✓ Added apartments_building_type_check");
  } else {
    console.log("  = apartments_building_type_check (already exists)");
  }

  // 7-2. apartment_prices.monthly_rent_avg + trade_type CHECK expand
  console.log("  7-2. Adding monthly_rent_avg to apartment_prices...");
  await sql`ALTER TABLE apartment_prices ADD COLUMN IF NOT EXISTS monthly_rent_avg NUMERIC`;

  console.log("  7-3. Updating apartment_prices trade_type CHECK constraint...");
  const tradeTypeChecks = await sql`
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'apartment_prices'::regclass
      AND contype = 'c'
      AND (conname = 'apartment_prices_trade_type_check'
           OR pg_get_constraintdef(oid) ~* '(^|\\W)trade_type\\W+IN\\W*\\(')
  `;
  for (const row of tradeTypeChecks as Array<{ conname: string }>) {
    await sql`ALTER TABLE apartment_prices DROP CONSTRAINT ${sql(row.conname)}`;
    console.log(`  - Dropped ${row.conname}`);
  }

  const newTradeTypeCheck = await sql`
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'apartment_prices_trade_type_check'
  `;
  if (newTradeTypeCheck.length === 0) {
    await sql`
      ALTER TABLE apartment_prices
      ADD CONSTRAINT apartment_prices_trade_type_check
      CHECK (trade_type IN ('sale','jeonse','monthly'))
    `;
    console.log("  ✓ Added apartment_prices_trade_type_check");
  } else {
    console.log("  = apartment_prices_trade_type_check (already exists)");
  }

  // 7-4. New table: apartment_unit_types
  console.log("  7-4. Creating apartment_unit_types table...");
  await sql`
    CREATE TABLE IF NOT EXISTS apartment_unit_types (
      id SERIAL PRIMARY KEY,
      apt_id INTEGER NOT NULL REFERENCES apartments(id),
      area_sqm NUMERIC NOT NULL,
      area_pyeong REAL,
      household_count INTEGER NOT NULL,
      source TEXT,
      data_date DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT apartment_unit_types_unique UNIQUE (apt_id, area_sqm)
    )
  `;

  // 7-5. New table: facility_points
  console.log("  7-5. Creating facility_points table...");
  await sql`
    CREATE TABLE IF NOT EXISTS facility_points (
      id SERIAL PRIMARY KEY,
      type VARCHAR(30) NOT NULL CHECK (type IN ('subway_station','bus_stop','police','fire_station','shelter','hospital','pharmacy')),
      name TEXT,
      address TEXT,
      region_code VARCHAR(10),
      location geometry(Point, 4326) NOT NULL,
      external_id VARCHAR(60),
      source TEXT,
      data_date DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT facility_points_type_external_unique UNIQUE (type, external_id)
    )
  `;

  // 7-6. New table: apartment_facility_stats
  console.log("  7-6. Creating apartment_facility_stats table...");
  await sql`
    CREATE TABLE IF NOT EXISTS apartment_facility_stats (
      id SERIAL PRIMARY KEY,
      apt_id INTEGER NOT NULL REFERENCES apartments(id),
      type VARCHAR(30) NOT NULL CHECK (type IN ('subway_station','bus_stop','police','fire_station','shelter','hospital','pharmacy')),
      within_radius_count INTEGER NOT NULL,
      nearest_distance_m NUMERIC,
      radius_m INTEGER NOT NULL,
      computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT apartment_facility_stats_unique UNIQUE (apt_id, type, radius_m)
    )
  `;

  // 7-7. Indexes
  console.log("  7-7. Creating indexes for new tables...");
  await sql`CREATE INDEX IF NOT EXISTS idx_apartment_unit_types_apt_id ON apartment_unit_types(apt_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_facility_points_location ON facility_points USING GIST(location)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_facility_points_type ON facility_points(type)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_apartment_facility_stats_apt_id ON apartment_facility_stats(apt_id)`;

  // 8. Verify
  console.log("\n[8/11] Verifying tables...");
  const tables = await sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  console.log("  Tables:", tables.map((t: { tablename: string }) => t.tablename).join(", "));

  // 9. Verify apartment_details columns
  console.log("[9/11] Verifying apartment_details columns...");
  const detailCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'apartment_details'
    ORDER BY ordinal_position
  `;
  console.log("  Columns:", detailCols.map((c: { column_name: string }) => c.column_name).join(", "));

  // 10. commute_times route_snapshot
  console.log("\n[10/11] Adding commute_times.route_snapshot...");
  const commuteRouteCols = await sql`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'commute_times'
      AND column_name = 'route_snapshot'
  `;
  if (commuteRouteCols.length === 0) {
    await sql`ALTER TABLE commute_times ADD COLUMN IF NOT EXISTS route_snapshot jsonb`;
    console.log("  + commute_times.route_snapshot");
  } else {
    console.log("  = commute_times.route_snapshot (already exists)");
  }

  // 11. Verify commute_times columns
  console.log("[11/11] Verifying commute_times columns...");
  const commuteTimeCols = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'commute_times'
    ORDER BY ordinal_position
  `;
  console.log("  commute_times columns:", commuteTimeCols.map((c: { column_name: string }) => c.column_name).join(", "));

  // 12. Remove legacy commute_grid route-time columns (if any)
  console.log("\n[12/12] Cleaning legacy commute_grid columns...");
  const legacyRouteCols = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'commute_grid'
      AND column_name IN ('to_gbd_time', 'to_ybd_time', 'to_cbd_time', 'to_pangyo_time')
    ORDER BY column_name
  `;
  if (legacyRouteCols.length > 0) {
    await sql`ALTER TABLE commute_grid DROP COLUMN IF EXISTS "to_gbd_time"`;
    await sql`ALTER TABLE commute_grid DROP COLUMN IF EXISTS "to_ybd_time"`;
    await sql`ALTER TABLE commute_grid DROP COLUMN IF EXISTS "to_cbd_time"`;
    await sql`ALTER TABLE commute_grid DROP COLUMN IF EXISTS "to_pangyo_time"`;
    console.log(`  + Dropped legacy columns: ${legacyRouteCols.map((c: { column_name: string }) => c.column_name).join(", ")}`);
  } else {
    console.log("  = No legacy commute_grid columns found");
  }

  const remainingLegacyRouteCols = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'commute_grid'
      AND column_name IN ('to_gbd_time', 'to_ybd_time', 'to_cbd_time', 'to_pangyo_time')
  `;
  console.log(
    `  Remaining legacy columns after cleanup: ${
      remainingLegacyRouteCols.length ? remainingLegacyRouteCols.map((c: { column_name: string }) => c.column_name).join(", ") : "none"
    }`
  );

  console.log("\nDone!");
  await sql.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

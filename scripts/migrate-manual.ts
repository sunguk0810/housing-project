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

  // 7. Verify
  console.log("\n[7/8] Verifying tables...");
  const tables = await sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  console.log("  Tables:", tables.map((t: { tablename: string }) => t.tablename).join(", "));

  // 8. Verify apartment_details columns
  console.log("[8/8] Verifying apartment_details columns...");
  const detailCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'apartment_details'
    ORDER BY ordinal_position
  `;
  console.log("  Columns:", detailCols.map((c: { column_name: string }) => c.column_name).join(", "));

  console.log("\nDone!");
  await sql.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

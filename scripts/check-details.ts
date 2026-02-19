import { db } from "@/db/connection";
import { sql } from "drizzle-orm";

async function main() {
  // apartment_details stats (household_count removed — now in apartments table)
  const stats = await db.execute(sql`
    SELECT
      COUNT(*) as total,
      COUNT(kapt_code) as has_kapt,
      COUNT(elevator_count) as has_elevator,
      COUNT(cctv_count) as has_cctv
    FROM apartment_details
  `);
  console.log("apartment_details stats:", JSON.stringify(stats));

  // apartments stats (household_count + official_name from 건축물대장)
  const aptStats = await db.execute(sql`
    SELECT
      COUNT(*) as total,
      COUNT(household_count) as has_household,
      COUNT(official_name) as has_official_name
    FROM apartments
    WHERE region_code = '11680'
  `);
  console.log("apartments (강남) stats:", JSON.stringify(aptStats));

  const sample = await db.execute(sql`
    SELECT apt_id, kapt_code, elevator_count, cctv_count, subway_line FROM apartment_details LIMIT 3
  `);
  console.log("sample rows:", JSON.stringify(sample, null, 2));

  process.exit(0);
}

main();

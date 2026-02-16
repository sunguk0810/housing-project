import { sql, db, closePool } from "./connection";
import { apartments } from "./schema/apartments";
import { apartmentPrices } from "./schema/prices";
import { childcareCenters } from "./schema/childcare";
import { schools } from "./schema/schools";
import { safetyStats } from "./schema/safety";
import { commuteGrid } from "./schema/commute";
import { generateApartments } from "./mock/apartments";
import { generatePrices } from "./mock/prices";
import { generateChildcare } from "./mock/childcare";
import { generateSchools } from "./mock/schools";
import { generateSafety } from "./mock/safety";
import { generateCommute } from "./mock/commute";

async function seed() {
  console.log("[seed] Starting mock data seeding...");

  // Step 0: Truncate in reverse dependency order
  await sql`TRUNCATE apartment_prices, apartments,
            childcare_centers, schools, safety_stats, commute_grid
            RESTART IDENTITY CASCADE`;
  console.log("[seed] Tables truncated");

  // Step 1: Seed apartments (50 records)
  const apartmentRecords = generateApartments();
  await db.insert(apartments).values(apartmentRecords);
  console.log(`[seed] apartments: ${apartmentRecords.length} rows inserted`);

  // Step 2: Seed apartment_prices (300 records) — FK dependency on apartments
  const priceRecords = generatePrices(apartmentRecords.length);
  await db.insert(apartmentPrices).values(priceRecords);
  console.log(
    `[seed] apartment_prices: ${priceRecords.length} rows inserted`,
  );

  // Step 3: Seed independent tables in parallel
  const childcareRecords = generateChildcare();
  const schoolRecords = generateSchools();
  const safetyRecords = generateSafety();
  const commuteRecords = generateCommute();

  await Promise.all([
    db.insert(childcareCenters).values(childcareRecords),
    db.insert(schools).values(schoolRecords),
    db.insert(safetyStats).values(safetyRecords),
    db.insert(commuteGrid).values(commuteRecords),
  ]);

  console.log(
    `[seed] childcare_centers: ${childcareRecords.length} rows inserted`,
  );
  console.log(`[seed] schools: ${schoolRecords.length} rows inserted`);
  console.log(`[seed] safety_stats: ${safetyRecords.length} rows inserted`);
  console.log(`[seed] commute_grid: ${commuteRecords.length} rows inserted`);

  // Step 4: Verification
  const total =
    apartmentRecords.length +
    priceRecords.length +
    childcareRecords.length +
    schoolRecords.length +
    safetyRecords.length +
    commuteRecords.length;

  console.log(`[seed] Seed complete: ${total} records inserted`);

  // Step 5: Cleanup
  await closePool();
  console.log("[seed] Done. Connection closed.");
}

seed().catch((err: unknown) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});

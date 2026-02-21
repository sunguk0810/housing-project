/**
 * ETL validation runner.
 * Checks data coverage, integrity, and cross-references.
 *
 * Usage: pnpm exec tsx src/etl/validate.ts
 */

import { db } from "@/db/connection";
import { apartments } from "@/db/schema/apartments";
import { apartmentPrices } from "@/db/schema/prices";
import { schools } from "@/db/schema/schools";
import { childcareCenters } from "@/db/schema/childcare";
import { safetyStats } from "@/db/schema/safety";
import { commuteGrid } from "@/db/schema/commute";
import { closePool } from "@/db/connection";
import { sql } from "drizzle-orm";

interface ValidationResult {
  table: string;
  check: string;
  expected: string;
  actual: string | number;
  pass: boolean;
}

async function validate(): Promise<void> {
  const results: ValidationResult[] = [];

  console.log("=== ETL Data Validation ===\n");

  // ─── Row Counts ───
  const [aptCount] = await db.select({ count: sql<number>`count(*)` }).from(apartments);
  const [priceCount] = await db.select({ count: sql<number>`count(*)` }).from(apartmentPrices);
  const [schoolCount] = await db.select({ count: sql<number>`count(*)` }).from(schools);
  const [childcareCount] = await db.select({ count: sql<number>`count(*)` }).from(childcareCenters);
  const [safetyCount] = await db.select({ count: sql<number>`count(*)` }).from(safetyStats);
  const [commuteCount] = await db.select({ count: sql<number>`count(*)` }).from(commuteGrid);

  // Check safety_infra if it exists
  let safetyInfraCount = 0;
  try {
    const [infraCount] = await db.execute(sql`SELECT count(*) as count FROM safety_infra`);
    safetyInfraCount = Number((infraCount as Record<string, unknown>).count ?? 0);
  } catch {
    // Table may not exist yet
  }

  results.push({
    table: "apartments",
    check: "row count",
    expected: "50-1,500",
    actual: Number(aptCount.count),
    pass: Number(aptCount.count) >= 50,
  });

  results.push({
    table: "apartment_prices",
    check: "row count",
    expected: "300-9,000",
    actual: Number(priceCount.count),
    pass: Number(priceCount.count) >= 300,
  });

  results.push({
    table: "schools",
    check: "row count",
    expected: "100-3,000",
    actual: Number(schoolCount.count),
    pass: Number(schoolCount.count) >= 100,
  });

  results.push({
    table: "childcare_centers",
    check: "row count",
    expected: "100-7,000",
    actual: Number(childcareCount.count),
    pass: Number(childcareCount.count) >= 100,
  });

  results.push({
    table: "safety_stats",
    check: "row count",
    expected: "25+",
    actual: Number(safetyCount.count),
    pass: Number(safetyCount.count) >= 25,
  });

  results.push({
    table: "safety_infra",
    check: "row count",
    expected: "1,000+",
    actual: safetyInfraCount,
    pass: safetyInfraCount >= 1000,
  });

  results.push({
    table: "commute_grid",
    check: "row count",
    expected: "100-1,575",
    actual: Number(commuteCount.count),
    pass: Number(commuteCount.count) >= 100,
  });

  // ─── Referential Integrity ───

  // All prices should reference an existing apartment
  const [orphanPrices] = await db.execute(
    sql`SELECT count(*) as count FROM apartment_prices
        WHERE apt_id NOT IN (SELECT id FROM apartments)`,
  );
  results.push({
    table: "apartment_prices",
    check: "orphan records",
    expected: "0",
    actual: Number((orphanPrices as Record<string, unknown>).count ?? 0),
    pass: Number((orphanPrices as Record<string, unknown>).count ?? 0) === 0,
  });

  // ─── Print Report ───
  const passCount = results.filter((r) => r.pass).length;
  const failCount = results.filter((r) => !r.pass).length;

  for (const r of results) {
    const icon = r.pass ? "PASS" : "FAIL";
    console.log(
      `[${icon}] ${r.table}.${r.check}: ${r.actual} (expected: ${r.expected})`,
    );
  }

  console.log(`\n=== Summary: ${passCount} passed, ${failCount} failed ===`);

  await closePool();

  if (failCount > 0) {
    process.exit(1);
  }
}

validate().catch((err: unknown) => {
  console.error("Validation error:", err);
  process.exit(1);
});

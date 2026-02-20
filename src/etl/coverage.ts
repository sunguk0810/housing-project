/**
 * ETL coverage report.
 * Cross-references apartments with nearby schools, childcare, and commute grid.
 *
 * Usage: pnpm exec tsx src/etl/coverage.ts
 */

import { db } from "@/db/connection";
import { closePool } from "@/db/connection";
import { sql } from "drizzle-orm";

interface CoverageMetric {
  metric: string;
  value: number;
  target: string;
  pass: boolean;
}

async function coverage(): Promise<void> {
  const metrics: CoverageMetric[] = [];

  console.log("=== ETL Coverage Report ===\n");

  // Apartments with at least 1 price record
  const [aptsWithPrices] = await db.execute(sql`
    SELECT count(DISTINCT a.id) as count
    FROM apartments a
    INNER JOIN apartment_prices ap ON ap.apt_id = a.id
  `);
  const [totalApts] = await db.execute(sql`SELECT count(*) as count FROM apartments`);

  const aptsWithPricesCount = Number((aptsWithPrices as Record<string, unknown>).count ?? 0);
  const totalAptsCount = Number((totalApts as Record<string, unknown>).count ?? 0);
  const priceCoverage = totalAptsCount > 0
    ? Number(((aptsWithPricesCount / totalAptsCount) * 100).toFixed(1))
    : 0;

  metrics.push({
    metric: "Apartments with price data (%)",
    value: priceCoverage,
    target: ">=80%",
    pass: priceCoverage >= 80,
  });

  // Apartments within 1.5km of a school
  try {
    const [nearSchool] = await db.execute(sql`
      SELECT count(*) as count FROM apartments a
      WHERE EXISTS (
        SELECT 1 FROM schools s
        WHERE ST_DWithin(a.location::geography, s.location::geography, 1500)
      )
    `);
    const nearSchoolCount = Number((nearSchool as Record<string, unknown>).count ?? 0);
    const schoolCoverage = totalAptsCount > 0
      ? Number(((nearSchoolCount / totalAptsCount) * 100).toFixed(1))
      : 0;

    metrics.push({
      metric: "Apartments within 1.5km of school (%)",
      value: schoolCoverage,
      target: ">=90%",
      pass: schoolCoverage >= 90,
    });
  } catch {
    metrics.push({
      metric: "Apartments within 1.5km of school (%)",
      value: 0,
      target: ">=90%",
      pass: false,
    });
  }

  // Apartments within 800m of childcare
  try {
    const [nearChildcare] = await db.execute(sql`
      SELECT count(*) as count FROM apartments a
      WHERE EXISTS (
        SELECT 1 FROM childcare_centers c
        WHERE ST_DWithin(a.location::geography, c.location::geography, 800)
      )
    `);
    const nearChildcareCount = Number((nearChildcare as Record<string, unknown>).count ?? 0);
    const childcareCoverage = totalAptsCount > 0
      ? Number(((nearChildcareCount / totalAptsCount) * 100).toFixed(1))
      : 0;

    metrics.push({
      metric: "Apartments within 800m of childcare (%)",
      value: childcareCoverage,
      target: ">=85%",
      pass: childcareCoverage >= 85,
    });
  } catch {
    metrics.push({
      metric: "Apartments within 800m of childcare (%)",
      value: 0,
      target: ">=85%",
      pass: false,
    });
  }

  // Apartments within 1km of commute grid point
  try {
    const [nearGrid] = await db.execute(sql`
      SELECT count(*) as count FROM apartments a
      WHERE EXISTS (
        SELECT 1 FROM commute_grid g
        WHERE ST_DWithin(a.location::geography, g.location::geography, 1000)
      )
    `);
    const nearGridCount = Number((nearGrid as Record<string, unknown>).count ?? 0);
    const gridCoverage = totalAptsCount > 0
      ? Number(((nearGridCount / totalAptsCount) * 100).toFixed(1))
      : 0;

    metrics.push({
      metric: "Apartments within 1km of commute grid (%)",
      value: gridCoverage,
      target: ">=80%",
      pass: gridCoverage >= 80,
    });
  } catch {
    metrics.push({
      metric: "Apartments within 1km of commute grid (%)",
      value: 0,
      target: ">=80%",
      pass: false,
    });
  }

  // Safety infra coverage (CCTV within 500m)
  try {
    const [nearCctv] = await db.execute(sql`
      SELECT count(*) as count FROM apartments a
      WHERE EXISTS (
        SELECT 1 FROM safety_infra si
        WHERE si.type = 'cctv'
        AND ST_DWithin(a.location::geography, si.location::geography, 500)
      )
    `);
    const nearCctvCount = Number((nearCctv as Record<string, unknown>).count ?? 0);
    const cctvCoverage = totalAptsCount > 0
      ? Number(((nearCctvCount / totalAptsCount) * 100).toFixed(1))
      : 0;

    metrics.push({
      metric: "Apartments with CCTV within 500m (%)",
      value: cctvCoverage,
      target: ">=70%",
      pass: cctvCoverage >= 70,
    });
  } catch {
    metrics.push({
      metric: "Apartments with CCTV within 500m (%)",
      value: 0,
      target: ">=70%",
      pass: false,
    });
  }

  // Print report
  const passCount = metrics.filter((m) => m.pass).length;
  const failCount = metrics.filter((m) => !m.pass).length;

  for (const m of metrics) {
    const icon = m.pass ? "PASS" : "FAIL";
    console.log(`[${icon}] ${m.metric}: ${m.value}% (target: ${m.target})`);
  }

  console.log(`\n=== Summary: ${passCount} passed, ${failCount} failed ===`);

  await closePool();

  if (failCount > 0) {
    process.exit(1);
  }
}

coverage().catch((err: unknown) => {
  console.error("Coverage error:", err);
  process.exit(1);
});

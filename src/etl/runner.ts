/**
 * ETL runner entry point.
 * Execute: pnpm exec tsx src/etl/runner.ts
 *
 * When USE_MOCK_DATA=true, ETL simply verifies mock data is already seeded.
 * When USE_MOCK_DATA=false, it fetches from public APIs and upserts to DB.
 *
 * Source of Truth: M2 spec Section 4.2
 */

import { MolitAdapter } from "./adapters/molit";
import { MohwAdapter } from "./adapters/mohw";
import { MoeAdapter } from "./adapters/moe";
import { MoisAdapter } from "./adapters/mois";

const USE_MOCK = process.env.USE_MOCK_DATA === "true";

interface EtlResult {
  source: string;
  recordCount: number;
  status: "success" | "skipped" | "error";
  message?: string;
}

async function runAdapter(
  adapter: { name: string; fetch: (params: Record<string, unknown>) => Promise<unknown[]> },
  params: Record<string, unknown>,
): Promise<EtlResult> {
  try {
    const records = await adapter.fetch(params);
    if (USE_MOCK && records.length === 0) {
      return {
        source: adapter.name,
        recordCount: 0,
        status: "skipped",
        message: "Mock mode — data handled by seed.ts",
      };
    }
    return {
      source: adapter.name,
      recordCount: records.length,
      status: "success",
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      source: adapter.name,
      recordCount: 0,
      status: "error",
      message: msg,
    };
  }
}

async function main(): Promise<void> {
  console.log(
    JSON.stringify({
      event: "etl_start",
      mockMode: USE_MOCK,
      timestamp: new Date().toISOString(),
    }),
  );

  const defaultParams: Record<string, unknown> = {
    lawdCd: "11680",
    dealYmd: "202601",
    stcode: "11",
    arcode: "11680",
    atptCode: "B10",
    ctpvNm: "서울특별시",
  };

  const results = await Promise.all([
    runAdapter(new MolitAdapter(), defaultParams),
    runAdapter(new MohwAdapter(), defaultParams),
    runAdapter(new MoeAdapter(), defaultParams),
    runAdapter(new MoisAdapter(), defaultParams),
  ]);

  const successCount = results.filter((r) => r.status === "success").length;
  const skippedCount = results.filter((r) => r.status === "skipped").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  for (const result of results) {
    console.log(
      JSON.stringify({
        event: "etl_adapter_result",
        ...result,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  console.log(
    JSON.stringify({
      event: "etl_complete",
      success: successCount,
      skipped: skippedCount,
      errors: errorCount,
      timestamp: new Date().toISOString(),
    }),
  );

  if (errorCount > 0 && !USE_MOCK) {
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error("ETL runner fatal error:", err);
  process.exit(1);
});

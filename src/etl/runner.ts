/**
 * ETL runner entry point — multi-region, multi-adapter orchestrator.
 *
 * Usage:
 *   pnpm exec tsx src/etl/runner.ts [options]
 *
 * Options:
 *   --adapter=molit|moe|mohw|mois|unit-mix|unit-mix-file|poi|facility-stats|all
 *   --region=11680          (single region code)
 *   --dry-run               (fetch only, no DB writes)
 *   --months=6              (default 6)
 *   --limit=200             (optional: adapter-specific cap)
 *   --radius=800            (optional: meters, for facility-stats)
 *   --verbose               (additional debug logs for adapter progress)
 *
 * Source of Truth: M2 spec Section 4.2
 */

import { MolitAdapter } from "./adapters/molit";
import { MohwAdapter } from "./adapters/mohw";
import { MoeAdapter } from "./adapters/moe";
import { MoisAdapter } from "./adapters/mois";
import { collectUnitMixForRegion } from "./adapters/unit-mix";
import { collectUnitMixFromFile } from "./adapters/unit-mix-file";
import { loadFacilityPointsSnapshot } from "./adapters/poi-snapshot";
import { precomputeApartmentFacilityStats } from "./adapters/facility-stats";
import { DATA_GO_KR_LIMITER } from "./utils/rate-limiter";
import { TARGET_REGIONS, SEOUL_REGIONS, getDealMonths } from "./config/regions";
import type { RegionConfig } from "./config/regions";
import { closePool } from "@/db/connection";
import { closeRedis } from "@/lib/redis";

// ─── CLI argument parsing ───

interface CliOptions {
  adapter: string;
  region: string | null;
  dryRun: boolean;
  verbose: boolean;
  months: number;
  limit: number;
  radius: number;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const opts: CliOptions = {
    adapter: "all",
    region: null,
    dryRun: false,
    verbose: false,
    months: 6,
    limit: 0,
    radius: 800,
  };

  for (const arg of args) {
    if (arg.startsWith("--adapter=")) {
      opts.adapter = arg.split("=")[1];
    } else if (arg.startsWith("--region=")) {
      opts.region = arg.split("=")[1];
    } else if (arg.startsWith("--months=")) {
      opts.months = Number(arg.split("=")[1]) || 6;
    } else if (arg.startsWith("--limit=")) {
      opts.limit = Number(arg.split("=")[1]) || 0;
    } else if (arg.startsWith("--radius=")) {
      opts.radius = Number(arg.split("=")[1]) || 800;
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (arg === "--verbose") {
      opts.verbose = true;
    }
  }

  return opts;
}

// ─── Types ───

interface AdapterResult {
  adapter: string;
  region?: string;
  recordCount: number;
  status: "success" | "skipped" | "error";
  message?: string;
  durationMs: number;
}

interface RunReport {
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  results: AdapterResult[];
  summary: {
    success: number;
    skipped: number;
    errors: number;
    totalRecords: number;
  };
}

// ─── Logger ───

function log(event: string, data: object = {}): void {
  console.log(
    JSON.stringify({
      event,
      ...data,
      timestamp: new Date().toISOString(),
    }),
  );
}

// ─── Adapter runners ───

async function runMolit(
  regions: RegionConfig[],
  months: string[],
  dryRun: boolean,
): Promise<AdapterResult[]> {
  const adapter = new MolitAdapter();
  const results: AdapterResult[] = [];
  let totalRecords = 0;
  let regionIdx = 0;

  for (const region of regions) {
    regionIdx++;

    // Check daily limit before each region
    if (DATA_GO_KR_LIMITER.isExhausted) {
      log("molit_daily_limit_stop", {
        used: DATA_GO_KR_LIMITER.usedDaily,
        completedRegions: regionIdx - 1,
        totalRegions: regions.length,
        message: "내일 같은 명령어로 재실행하세요 (upsert로 이어서 적재)",
      });
      break;
    }

    log("molit_region_start", {
      region: region.name,
      progress: `[${regionIdx}/${regions.length}]`,
      months: months.length,
      apiUsed: DATA_GO_KR_LIMITER.usedDaily,
      apiRemaining: DATA_GO_KR_LIMITER.remainingDaily,
    });

    let regionRecords = 0;

    for (const month of months) {
      if (DATA_GO_KR_LIMITER.isExhausted) {
        log("molit_daily_limit_stop", {
          used: DATA_GO_KR_LIMITER.usedDaily,
          stoppedAt: `${region.name}/${month}`,
          message: "내일 같은 명령어로 재실행하세요",
        });
        break;
      }

      const start = Date.now();
      try {
        const records = await adapter.fetch({
          lawdCd: region.code,
          dealYmd: month,
          dryRun,
        });
        regionRecords += records.length;
        totalRecords += records.length;
        const result: AdapterResult = {
          adapter: "MOLIT",
          region: `${region.name}/${month}`,
          recordCount: records.length,
          status: "success",
          durationMs: Date.now() - start,
        };
        log("etl_adapter_result", result);
        results.push(result);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("Daily limit reached")) {
          log("molit_daily_limit_stop", {
            used: DATA_GO_KR_LIMITER.usedDaily,
            stoppedAt: `${region.name}/${month}`,
          });
          break;
        }
        const result: AdapterResult = {
          adapter: "MOLIT",
          region: `${region.name}/${month}`,
          recordCount: 0,
          status: "error",
          message: msg,
          durationMs: Date.now() - start,
        };
        log("etl_adapter_result", result);
        results.push(result);
      }
    }

    log("molit_region_complete", {
      region: region.name,
      progress: `[${regionIdx}/${regions.length}]`,
      records: regionRecords,
      totalRecords,
      apiUsed: DATA_GO_KR_LIMITER.usedDaily,
    });

    // Phase B: Building Register enrichment (region-level, 1 time after all months)
    if (!dryRun) {
      try {
        log("enrich_phase_b_start", { region: region.name, apiRemaining: DATA_GO_KR_LIMITER.remainingDaily });
        await adapter.enrichFromBuildingRegister(region.code);
      } catch (err: unknown) {
        log("enrich_phase_b_error", {
          region: region.name,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Phase C: K-apt enrichment (region-level, 1 time after building register)
    if (!dryRun) {
      try {
        log("enrich_phase_c_start", { region: region.name, apiRemaining: DATA_GO_KR_LIMITER.remainingDaily });
        await adapter.enrichFromKapt(region.code);
      } catch (err: unknown) {
        log("enrich_phase_c_error", {
          region: region.name,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  return results;
}

async function runMoe(
  regions: RegionConfig[],
  dryRun: boolean,
): Promise<AdapterResult[]> {
  if (!process.env.MOE_API_KEY) {
    const result: AdapterResult = {
      adapter: "MOE",
      region: "all",
      recordCount: 0,
      status: "skipped",
      message: "MOE_API_KEY not configured — skipping",
      durationMs: 0,
    };
    log("etl_adapter_result", result);
    return [result];
  }

  const adapter = new MoeAdapter();
  const results: AdapterResult[] = [];

  // Derive unique atptCodes from regions (NEIS groups by education office)
  const atptMap = new Map<string, string>();
  for (const r of regions) {
    if (!atptMap.has(r.atptCode)) {
      atptMap.set(r.atptCode, r.sidoCode === "11" ? "서울" : "경기");
    }
  }
  const atptCodes = Array.from(atptMap, ([code, name]) => ({ code, name }));

  for (const atpt of atptCodes) {
    const start = Date.now();
    try {
      const records = await adapter.fetch({
        atptCode: atpt.code,
        dryRun,
      });
      const result: AdapterResult = {
        adapter: "MOE",
        region: atpt.name,
        recordCount: records.length,
        status: "success",
        durationMs: Date.now() - start,
      };
      log("etl_adapter_result", result);
      results.push(result);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const result: AdapterResult = {
        adapter: "MOE",
        region: atpt.name,
        recordCount: 0,
        status: "error",
        message: msg,
        durationMs: Date.now() - start,
      };
      log("etl_adapter_result", result);
      results.push(result);
    }
  }

  return results;
}

async function runMohw(
  dryRun: boolean,
): Promise<AdapterResult[]> {
  const adapter = new MohwAdapter();
  const start = Date.now();

  try {
    const records = await adapter.fetch({ dryRun });
    const result: AdapterResult = {
      adapter: "MOHW",
      recordCount: records.length,
      status: "success",
      durationMs: Date.now() - start,
    };
    log("etl_adapter_result", result);
    return [result];
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const result: AdapterResult = {
      adapter: "MOHW",
      recordCount: 0,
      status: "error",
      message: msg,
      durationMs: Date.now() - start,
    };
    log("etl_adapter_result", result);
    return [result];
  }
}

async function runMois(
  regions: RegionConfig[],
  dryRun: boolean,
): Promise<AdapterResult[]> {
  const adapter = new MoisAdapter();
  const start = Date.now();

  try {
    const records = await adapter.fetch({
      regions,
      dryRun,
    });
    const result: AdapterResult = {
      adapter: "MOIS",
      recordCount: records.length,
      status: "success",
      durationMs: Date.now() - start,
    };
    log("etl_adapter_result", result);
    return [result];
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const result: AdapterResult = {
      adapter: "MOIS",
      recordCount: 0,
      status: "error",
      message: msg,
      durationMs: Date.now() - start,
    };
    log("etl_adapter_result", result);
    return [result];
  }
}

async function runUnitMix(
  regions: RegionConfig[],
  dryRun: boolean,
  limit: number,
  verbose: boolean,
): Promise<AdapterResult[]> {
  const results: AdapterResult[] = [];
  let regionIdx = 0;

  for (const region of regions) {
    regionIdx++;

    if (DATA_GO_KR_LIMITER.isExhausted) {
      log("unit_mix_daily_limit_stop", {
        used: DATA_GO_KR_LIMITER.usedDaily,
        completedRegions: regionIdx - 1,
        totalRegions: regions.length,
        message: "내일 같은 명령어로 재실행하세요 (멱등 upsert)",
      });
      break;
    }

    const start = Date.now();
    try {
      log("unit_mix_region_start", {
        region: region.name,
        progress: `[${regionIdx}/${regions.length}]`,
        dryRun,
        limit,
        apiUsed: DATA_GO_KR_LIMITER.usedDaily,
        apiRemaining: DATA_GO_KR_LIMITER.remainingDaily,
      });

      const {
        totalTargets,
        insertedRows,
        processedApts,
        skippedApts,
        skippedNoAddress,
        skippedNoBjd,
        skippedNoArea,
      } = await collectUnitMixForRegion({
        regionCode: region.code,
        dryRun,
        limit,
        verbose,
      });

      if (verbose) {
        log("unit_mix_region_complete", {
          region: region.name,
          totalTargets,
          processedApts,
          skippedApts,
          insertedRows,
          skippedNoAddress,
          skippedNoBjd,
          skippedNoArea,
        });
      }

      const result: AdapterResult = {
        adapter: "UNIT_MIX",
        region: region.name,
        recordCount: insertedRows,
        status: processedApts > 0 ? "success" : "skipped",
        message:
          processedApts > 0
            ? undefined
            : totalTargets === 0
              ? "No target apartments"
              : `No processable apartments (skipped total=${skippedApts})`,
        durationMs: Date.now() - start,
      };
      log("etl_adapter_result", result);
      results.push(result);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const result: AdapterResult = {
        adapter: "UNIT_MIX",
        region: region.name,
        recordCount: 0,
        status: "error",
        message: msg,
        durationMs: Date.now() - start,
      };
      log("etl_adapter_result", result);
      results.push(result);
    }
  }

  return results;
}

async function runPoi(dryRun: boolean): Promise<AdapterResult[]> {
  const start = Date.now();
  try {
    const inserted = await loadFacilityPointsSnapshot({ dryRun });
    const result: AdapterResult = {
      adapter: "POI",
      recordCount: inserted,
      status: inserted > 0 ? "success" : "skipped",
      message: inserted > 0 ? undefined : "No snapshot file found",
      durationMs: Date.now() - start,
    };
    log("etl_adapter_result", result);
    return [result];
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const result: AdapterResult = {
      adapter: "POI",
      recordCount: 0,
      status: "error",
      message: msg,
      durationMs: Date.now() - start,
    };
    log("etl_adapter_result", result);
    return [result];
  }
}

async function runFacilityStats(
  dryRun: boolean,
  radiusM: number,
): Promise<AdapterResult[]> {
  const start = Date.now();
  try {
    const computed = await precomputeApartmentFacilityStats({ dryRun, radiusM });
    const result: AdapterResult = {
      adapter: "FACILITY_STATS",
      recordCount: computed,
      status: computed > 0 ? "success" : "skipped",
      message: computed > 0 ? undefined : "No apartments or no facility points",
      durationMs: Date.now() - start,
    };
    log("etl_adapter_result", result);
    return [result];
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const result: AdapterResult = {
      adapter: "FACILITY_STATS",
      recordCount: 0,
      status: "error",
      message: msg,
      durationMs: Date.now() - start,
    };
    log("etl_adapter_result", result);
    return [result];
  }
}

async function runUnitMixFile(
  regions: RegionConfig[],
  dryRun: boolean,
  verbose: boolean,
): Promise<AdapterResult[]> {
  const results: AdapterResult[] = [];

  for (const region of regions) {
    const start = Date.now();
    try {
      log("unit_mix_file_region_start", {
        region: region.name,
        dryRun,
      });

      const res = await collectUnitMixFromFile({
        regionCode: region.code,
        dryRun,
        verbose,
      });

      if (!res.csvFile) {
        const result: AdapterResult = {
          adapter: "UNIT_MIX_FILE",
          region: region.name,
          recordCount: 0,
          status: "skipped",
          message: "No CSV file found for region",
          durationMs: Date.now() - start,
        };
        log("etl_adapter_result", result);
        results.push(result);
        continue;
      }

      const result: AdapterResult = {
        adapter: "UNIT_MIX_FILE",
        region: region.name,
        recordCount: res.insertedRows,
        status: res.matchedApts > 0 ? "success" : "skipped",
        message:
          res.matchedApts > 0
            ? `matched=${res.matchedApts} conflict=${res.conflictSkipped} unmatched=${res.unmatchedRecords}`
            : "No apartments matched",
        durationMs: Date.now() - start,
      };
      log("etl_adapter_result", result);
      results.push(result);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const result: AdapterResult = {
        adapter: "UNIT_MIX_FILE",
        region: region.name,
        recordCount: 0,
        status: "error",
        message: msg,
        durationMs: Date.now() - start,
      };
      log("etl_adapter_result", result);
      results.push(result);
    }
  }

  return results;
}

// ─── Main ───

async function main(): Promise<void> {
  const opts = parseArgs();
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  const months = getDealMonths(opts.months);

  log("etl_start", {
    adapter: opts.adapter,
    region: opts.region,
    dryRun: opts.dryRun,
    verbose: opts.verbose,
    months: opts.months,
    limit: opts.limit,
    radius: opts.radius,
  });

  // Determine target regions
  let regions: RegionConfig[];
  if (opts.region) {
    const found = TARGET_REGIONS.find((r) => r.code === opts.region);
    if (!found) {
      console.error(`Unknown region code: ${opts.region}`);
      process.exit(1);
    }
    regions = [found];
  } else {
    regions = [...TARGET_REGIONS];
  }

  const seoulRegions = regions.filter((r) => r.sidoCode === "11");
  const allResults: AdapterResult[] = [];

  // Run selected adapters
  const adapterName = opts.adapter.toLowerCase();

  if (adapterName === "all" || adapterName === "molit") {
    const results = await runMolit(regions, months, opts.dryRun);
    allResults.push(...results);
  }

  if (adapterName === "all" || adapterName === "mohw") {
    const results = await runMohw(opts.dryRun);
    allResults.push(...results);
  }

  if (adapterName === "all" || adapterName === "moe") {
    const results = await runMoe(regions, opts.dryRun);
    allResults.push(...results);
  }

  if (adapterName === "all" || adapterName === "mois") {
    const results = await runMois(
      seoulRegions.length > 0 ? seoulRegions : SEOUL_REGIONS,
      opts.dryRun,
    );
    allResults.push(...results);
  }

  if (adapterName === "unit-mix") {
    const results = await runUnitMix(
      regions,
      opts.dryRun,
      opts.limit,
      opts.verbose,
    );
    allResults.push(...results);
  }

  if (adapterName === "unit-mix-file") {
    const results = await runUnitMixFile(regions, opts.dryRun, opts.verbose);
    allResults.push(...results);
  }

  if (adapterName === "all" || adapterName === "poi") {
    const results = await runPoi(opts.dryRun);
    allResults.push(...results);
  }

  // facility-stats runs last (depends on POI data)
  if (adapterName === "all" || adapterName === "facility-stats") {
    const results = await runFacilityStats(opts.dryRun, opts.radius);
    allResults.push(...results);
  }

  // Generate report
  const report: RunReport = {
    startedAt,
    completedAt: new Date().toISOString(),
    totalDurationMs: Date.now() - startMs,
    results: allResults,
    summary: {
      success: allResults.filter((r) => r.status === "success").length,
      skipped: allResults.filter((r) => r.status === "skipped").length,
      errors: allResults.filter((r) => r.status === "error").length,
      totalRecords: allResults.reduce((sum, r) => sum + r.recordCount, 0),
    },
  };

  log("etl_complete", {
    ...report.summary,
    totalDurationMs: report.totalDurationMs,
  });

  // Close connections
  await closeRedis();
  await closePool();

  if (report.summary.errors > 0) {
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error("ETL runner fatal error:", err);
  process.exit(1);
});

import { fetchAllPages } from "../utils/paginate";
import { DATA_GO_KR_LIMITER } from "../utils/rate-limiter";
import { parseJibunFromAddress } from "../utils/address";
import { db } from "@/db/connection";
import { apartmentUnitTypes } from "@/db/schema/apartment-unit-types";
import { sql } from "drizzle-orm";

// getBrExposPubuseAreaInfo returns per-unit area data (전유/공용면적)
// getBrExposInfo only returns registry metadata without area fields
const EXPOS_AREA_ENDPOINT =
  "https://apis.data.go.kr/1613000/BldRgstHubService/getBrExposPubuseAreaInfo";

export interface UnitMixRunOptions {
  regionCode: string;
  dryRun: boolean;
  /** Max apartments to process (0 = unlimited) */
  limit: number;
  verbose?: boolean;
}

export interface UnitMixRunResult {
  totalTargets: number;
  processedApts: number;
  insertedRows: number;
  skippedApts: number;
  skippedNoAddress: number;
  skippedNoBjd: number;
  skippedNoArea: number;
}

export async function collectUnitMixForRegion(
  opts: UnitMixRunOptions,
): Promise<UnitMixRunResult> {
  const serviceKey = process.env.MOLIT_API_KEY;
  if (!serviceKey) {
    throw new Error("[UNIT_MIX] MOLIT_API_KEY not configured");
  }
  const encodedKey = encodeURIComponent(serviceKey);
  const debugEnabled = opts.verbose === true;
  const now = () => new Date().toISOString();
  const debug = (event: string, data: Record<string, unknown>): void => {
    if (!debugEnabled) return;
    console.log(
      JSON.stringify({
        event,
        ...data,
        timestamp: now(),
      }),
    );
  };

  const limitClause = opts.limit > 0 ? sql`LIMIT ${opts.limit}` : sql``;

  const targets = (await db.execute(sql`
    SELECT a.id, a.address
    FROM apartments a
    WHERE a.region_code = ${opts.regionCode}
      AND NOT EXISTS (
        SELECT 1 FROM apartment_unit_types ut
        WHERE ut.apt_id = a.id AND ut.source = 'bldRgst_file'
      )
    ORDER BY a.id
    ${limitClause}
  `)) as unknown as Array<{ id: number; address: string }>;

  debug("unit_mix_targets_query_done", {
    regionCode: opts.regionCode,
    totalTargets: targets.length,
    dryRun: opts.dryRun,
    limit: opts.limit,
  });

  if (targets.length === 0) {
    return {
      totalTargets: 0,
      processedApts: 0,
      insertedRows: 0,
      skippedApts: 0,
      skippedNoAddress: 0,
      skippedNoBjd: 0,
      skippedNoArea: 0,
    };
  }

  const dongBjdMap = await fetchDongBjdMap(encodedKey, opts.regionCode);
  debug("unit_mix_bjd_map_done", {
    regionCode: opts.regionCode,
    bjdCount: dongBjdMap.size,
  });

  let processedApts = 0;
  let insertedRows = 0;
  let skippedApts = 0;
  let skippedNoAddress = 0;
  let skippedNoBjd = 0;
  let skippedNoArea = 0;
  let processedCount = 0;

  for (const apt of targets) {
    processedCount++;
    if (DATA_GO_KR_LIMITER.isExhausted) break;

    const parsed = parseJibunFromAddress(apt.address);
    if (!parsed) {
      skippedApts++;
      skippedNoAddress++;
      debug("unit_mix_skip_no_address", {
        aptId: apt.id,
        address: apt.address,
      });
      continue;
    }

    const bjdongCd = dongBjdMap.get(parsed.dong.normalize("NFC"));
    if (!bjdongCd) {
      skippedApts++;
      skippedNoBjd++;
      debug("unit_mix_skip_no_bjd", {
        aptId: apt.id,
        dong: parsed.dong,
      });
      continue;
    }

    const startedAt = Date.now();
    const items = await fetchAllPages<Record<string, unknown>>(
      async (pageNo, pageSize) => {
        await DATA_GO_KR_LIMITER.acquire();
        const params = new URLSearchParams();
        params.set("sigunguCd", opts.regionCode);
        params.set("bjdongCd", bjdongCd);
        params.set("platGbCd", parsed.platGbCd);
        params.set("bun", parsed.bun);
        params.set("ji", parsed.ji);
        params.set("_type", "json");
        params.set("numOfRows", String(pageSize));
        params.set("pageNo", String(pageNo));

        const url = `${EXPOS_AREA_ENDPOINT}?serviceKey=${encodedKey}&${params.toString()}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
        if (!res.ok) {
          throw new Error(`[UNIT_MIX] HTTP ${res.status} for getBrExposPubuseAreaInfo`);
        }
        const json = (await res.json()) as unknown;
        const parsedRes = parseBldgExposResponse(json);
        return {
          items: parsedRes.items,
          totalCount: parsedRes.totalCount,
          pageNo,
        };
      },
      // API caps at ~100 items/page despite numOfRows; use 100 for correct pagination
      { pageSize: 100, delayMs: 200, maxPages: 200 },
    );

    // Filter to 전유 (exclusive use) only — exposPubuseGbCd "1"
    const exclusiveItems = items.filter(
      (it) => String(it["exposPubuseGbCd"]) === "1",
    );
    const areaCounts = aggregateAreaCounts(exclusiveItems);
    if (areaCounts.length === 0) {
      skippedApts++;
      skippedNoArea++;
      debug("unit_mix_skip_no_area", {
        aptId: apt.id,
        totalItems: items.length,
        exclusiveItems: exclusiveItems.length,
        durationMs: Date.now() - startedAt,
      });
      continue;
    }

    processedApts++;

    if (opts.dryRun) {
      insertedRows += areaCounts.length;
      continue;
    }

    // Replace per-apartment unit-mix snapshot (idempotent)
    await db.execute(sql`
      DELETE FROM apartment_unit_types
      WHERE apt_id = ${apt.id}
    `);

    const values = areaCounts.map((row) => ({
      aptId: apt.id,
      areaSqm: String(row.areaSqm),
      areaPyeong: row.areaPyeong,
      householdCount: row.householdCount,
      source: "bldRgst_exposPubuseArea",
    }));

    await db.insert(apartmentUnitTypes).values(values);
    insertedRows += values.length;

    debug("unit_mix_apt_complete", {
      aptId: apt.id,
      durationMs: Date.now() - startedAt,
      bucketCount: areaCounts.length,
      totalProcessed: processedApts,
      totalSkipped: skippedApts,
    });

    if (debugEnabled && processedCount % 10 === 0) {
      debug("unit_mix_progress", {
        regionCode: opts.regionCode,
        processed: processedCount,
        skipped: skippedApts,
        targets: targets.length,
        insertedRows,
      });
    }
  }

  if (DATA_GO_KR_LIMITER.isExhausted) {
    debug("unit_mix_rate_limit_stop", {
      regionCode: opts.regionCode,
      processed: processedCount,
      skipped: skippedApts,
      remaining: DATA_GO_KR_LIMITER.remainingDaily,
    });
  }

  debug("unit_mix_collect_summary", {
    regionCode: opts.regionCode,
    totalTargets: targets.length,
    processedApts,
    skippedApts,
    skippedNoAddress,
    skippedNoBjd,
    skippedNoArea,
    insertedRows,
    dryRun: opts.dryRun,
  });

  return {
    totalTargets: targets.length,
    processedApts,
    insertedRows,
    skippedApts,
    skippedNoAddress,
    skippedNoBjd,
    skippedNoArea,
  };
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function normalizeArray<T>(v: T | T[] | undefined | null): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function normalizeRecordArray(v: unknown): Array<Record<string, unknown>> {
  const arr = normalizeArray(v);
  const out: Array<Record<string, unknown>> = [];
  for (const item of arr) {
    const r = asRecord(item);
    if (r) out.push(r);
  }
  return out;
}

async function fetchDongBjdMap(
  encodedKey: string,
  regionCode: string,
): Promise<Map<string, string>> {
  const dongMap = new Map<string, string>();
  let page = 1;

  while (true) {
    if (DATA_GO_KR_LIMITER.isExhausted) break;
    await DATA_GO_KR_LIMITER.acquire();

    const url = `https://apis.data.go.kr/1613000/AptListService3/getSigunguAptList3?serviceKey=${encodedKey}&sigunguCode=${regionCode}&pageNo=${page}&numOfRows=1000&_type=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) break;

    const json = (await res.json()) as unknown;
    const response = asRecord(json)?.response;
    const body = asRecord(asRecord(response)?.body);
    const itemsValue = body?.["items"];
    const items = normalizeRecordArray(
      Array.isArray(itemsValue) ? itemsValue : asRecord(itemsValue)?.["item"],
    );

    for (const item of items) {
      const as3 = String(item["as3"] ?? "").trim();
      const bjdCode = String(item["bjdCode"] ?? "").trim();
      if (!as3 || bjdCode.length < 10) continue;
      dongMap.set(as3.normalize("NFC"), bjdCode.substring(5, 10));
    }

    const totalCount = Number(body?.["totalCount"] ?? 0);
    if (items.length < 1000 || (totalCount > 0 && page * 1000 >= totalCount)) break;
    page++;
  }

  return dongMap;
}

function parseBldgExposResponse(json: unknown): {
  items: Array<Record<string, unknown>>;
  totalCount: number;
} {
  const response = asRecord(json)?.response;
  const body = asRecord(asRecord(response)?.body);
  const itemsRaw = asRecord(body)?.items;
  const itemsObj = asRecord(itemsRaw);
  const items = normalizeArray(asRecord(itemsObj)?.item) as Array<Record<string, unknown>>;

  const totalCount = Number(body?.["totalCount"] ?? items.length);
  return { items, totalCount: Number.isFinite(totalCount) ? totalCount : items.length };
}

function parseAreaSqm(item: Record<string, unknown>): number | null {
  const candidates = [
    item["excluUseAr"],
    item["area"],
    item["totArea"],
    item["privateArea"],
  ];
  for (const c of candidates) {
    if (c === undefined || c === null) continue;
    const n = typeof c === "number" ? c : Number(String(c).trim());
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function aggregateAreaCounts(items: Array<Record<string, unknown>>): Array<{
  areaSqm: number;
  areaPyeong: number;
  householdCount: number;
}> {
  const counts = new Map<number, number>();

  for (const item of items) {
    const area = parseAreaSqm(item);
    if (!area) continue;

    // Bucket to 0.1㎡ to reduce noise (e.g., 84.98 vs 85.02)
    const bucket = Math.round(area * 10) / 10;
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }

  const rows = [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([areaSqm, householdCount]) => ({
      areaSqm,
      areaPyeong: Number((areaSqm / 3.3058).toFixed(2)),
      householdCount,
    }));

  return rows;
}

import { fetchAllPages } from "../utils/paginate";
import { DATA_GO_KR_LIMITER } from "../utils/rate-limiter";
import { db } from "@/db/connection";
import { apartmentUnitTypes } from "@/db/schema/apartment-unit-types";
import { sql } from "drizzle-orm";

const EXPOS_ENDPOINT =
  "https://apis.data.go.kr/1613000/BldRgstHubService/getBrExposInfo";

export interface UnitMixRunOptions {
  regionCode: string;
  dryRun: boolean;
  /** Max apartments to process (0 = unlimited) */
  limit: number;
}

export async function collectUnitMixForRegion(
  opts: UnitMixRunOptions,
): Promise<{ processedApts: number; insertedRows: number; skippedApts: number }> {
  const serviceKey = process.env.MOLIT_API_KEY;
  if (!serviceKey) {
    throw new Error("[UNIT_MIX] MOLIT_API_KEY not configured");
  }
  const encodedKey = encodeURIComponent(serviceKey);

  const limitClause = opts.limit > 0 ? sql`LIMIT ${opts.limit}` : sql``;

  const targets = (await db.execute(sql`
    SELECT id, address
    FROM apartments
    WHERE region_code = ${opts.regionCode}
    ORDER BY id
    ${limitClause}
  `)) as unknown as Array<{ id: number; address: string }>;

  if (targets.length === 0) {
    return { processedApts: 0, insertedRows: 0, skippedApts: 0 };
  }

  const dongBjdMap = await fetchDongBjdMap(encodedKey, opts.regionCode);

  let processedApts = 0;
  let insertedRows = 0;
  let skippedApts = 0;

  for (const apt of targets) {
    if (DATA_GO_KR_LIMITER.isExhausted) break;

    const parsed = parseJibunFromAddress(apt.address);
    if (!parsed) {
      skippedApts++;
      continue;
    }

    const bjdongCd = dongBjdMap.get(parsed.dong.normalize("NFC"));
    if (!bjdongCd) {
      skippedApts++;
      continue;
    }

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

        const url = `${EXPOS_ENDPOINT}?serviceKey=${encodedKey}&${params.toString()}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
        if (!res.ok) {
          throw new Error(`[UNIT_MIX] HTTP ${res.status} for getBrExposInfo`);
        }
        const json = (await res.json()) as unknown;
        const parsedRes = parseBldgExposResponse(json);
        return {
          items: parsedRes.items,
          totalCount: parsedRes.totalCount,
          pageNo,
        };
      },
      { pageSize: 1000, delayMs: 200, maxPages: 50 },
    );

    const areaCounts = aggregateAreaCounts(items);
    if (areaCounts.length === 0) {
      skippedApts++;
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
      source: "bldRgst_expos",
    }));

    await db.insert(apartmentUnitTypes).values(values);
    insertedRows += values.length;
  }

  return { processedApts, insertedRows, skippedApts };
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

function parseJibunFromAddress(address: string): {
  dong: string;
  bun: string;
  ji: string;
  platGbCd: "0" | "1";
} | null {
  const parts = address.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const jibunRaw = parts[parts.length - 1] ?? "";
  const dong = parts[parts.length - 2] ?? "";
  if (!dong || !jibunRaw) return null;

  let platGbCd: "0" | "1" = "0";
  let jibun = jibunRaw;
  if (jibun.startsWith("산")) {
    platGbCd = "1";
    jibun = jibun.slice(1);
  }

  const [bunPart, jiPart] = jibun.split("-");
  if (!bunPart || !/^\d+$/.test(bunPart)) return null;
  const bun = bunPart.padStart(4, "0").slice(0, 4);
  const ji = (jiPart && /^\d+$/.test(jiPart) ? jiPart : "0").padStart(4, "0").slice(0, 4);

  return { dong, bun, ji, platGbCd };
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

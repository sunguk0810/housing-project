import type { DataSourceAdapter } from "../types";
import { DataSourceError } from "../types";
import { fetchAllPages } from "../utils/paginate";
import { DATA_GO_KR_LIMITER } from "../utils/rate-limiter";
import { geocodeAddress } from "./kakao-geocoding";
import { TARGET_REGIONS } from "../config/regions";
import { db } from "@/db/connection";
import { apartments } from "@/db/schema/apartments";
import { apartmentDetails } from "@/db/schema/apartment-details";
import { apartmentPrices } from "@/db/schema/prices";
import { sql } from "drizzle-orm";

/**
 * MOLIT (국토교통부) apartment trade data adapter.
 * Fetches both sale and jeonse data with full pagination.
 * Extracts apartment masters and aggregates trade statistics.
 *
 * Source of Truth: M2 spec Section 4.1.1, 4.1.2
 */

export interface ApartmentTradeRecord {
  aptName: string;
  address: string;
  dealAmount: number;
  monthlyRent: number;
  dealYear: number;
  dealMonth: number;
  exclusiveArea: number;
  floor: number;
  builtYear: number;
  tradeType: "sale" | "jeonse" | "monthly";
  regionCode: string;
}

/** Raw MOLIT API response item */
interface MolitApiItem {
  aptNm?: string;
  umdNm?: string;
  jibun?: string;
  dealAmount?: string;
  dealYear?: string;
  dealMonth?: string;
  excluUseAr?: string;
  floor?: string;
  buildYear?: string;
  sggCd?: string;
  deposit?: string;
  monthlyRent?: string;
}

/** Aggregated price statistics per apartment + month */
interface PriceAggregate {
  aptKey: string;
  aptName: string;
  address: string;
  regionCode: string;
  builtYear: number;
  tradeType: "sale" | "jeonse" | "monthly";
  year: number;
  month: number;
  avgPrice: number;
  monthlyRentAvg: number | null;
  dealCount: number;
  areaAvg: number;
  areaMin: number;
  areaMax: number;
  floorAvg: number;
  floorMin: number;
  floorMax: number;
}

const SALE_ENDPOINT =
  "https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade";
const RENT_ENDPOINT =
  "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent";

/** Parse <item> elements from MOLIT XML response */
function parseXmlItems(xml: string): MolitApiItem[] {
  const items: MolitApiItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      aptNm: xmlTag(block, "aptNm"),
      umdNm: xmlTag(block, "umdNm"),
      jibun: xmlTag(block, "jibun"),
      dealAmount: xmlTag(block, "dealAmount"),
      dealYear: xmlTag(block, "dealYear"),
      dealMonth: xmlTag(block, "dealMonth"),
      excluUseAr: xmlTag(block, "excluUseAr"),
      floor: xmlTag(block, "floor"),
      buildYear: xmlTag(block, "buildYear"),
      sggCd: xmlTag(block, "sggCd"),
      deposit: xmlTag(block, "deposit"),
      monthlyRent: xmlTag(block, "monthlyRent"),
    });
  }

  return items;
}

function xmlTag(block: string, tag: string): string | undefined {
  const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? m[1].trim() : undefined;
}

export class MolitAdapter implements DataSourceAdapter<ApartmentTradeRecord> {
  readonly name = "MOLIT";

  async fetch(
    params: Record<string, unknown>,
  ): Promise<ApartmentTradeRecord[]> {
    const serviceKey = process.env.MOLIT_API_KEY;
    if (!serviceKey) {
      throw new DataSourceError(
        this.name,
        "FETCH_FAILED",
        "MOLIT_API_KEY not configured",
      );
    }

    const lawdCd = String(params.lawdCd ?? "");
    const dealYmd = String(params.dealYmd ?? "");
    const dryRun = Boolean(params.dryRun);

    if (!lawdCd || !dealYmd) {
      throw new DataSourceError(
        this.name,
        "VALIDATION_FAILED",
        "lawdCd and dealYmd are required",
      );
    }

    // Fetch both sale and rent data
    const [saleRecords, rentRecords] = await Promise.all([
      this.fetchEndpoint(serviceKey, SALE_ENDPOINT, lawdCd, dealYmd, "sale"),
      this.fetchEndpoint(serviceKey, RENT_ENDPOINT, lawdCd, dealYmd, "rent"),
    ]);

    const allRecords = [...saleRecords, ...rentRecords];

    // Aggregate and upsert if not dry run
    if (!dryRun && allRecords.length > 0) {
      const aggregates = this.aggregateTradeRecords(allRecords);
      await this.upsertAggregates(aggregates, lawdCd);
    }

    return allRecords;
  }

  private async fetchEndpoint(
    serviceKey: string,
    endpoint: string,
    lawdCd: string,
    dealYmd: string,
    endpointType: "sale" | "rent",
  ): Promise<ApartmentTradeRecord[]> {
    return fetchAllPages<ApartmentTradeRecord>(
      async (pageNo, pageSize) => {
        await DATA_GO_KR_LIMITER.acquire();

        // data.go.kr expects URL-encoded serviceKey; this API returns XML only
        const params = new URLSearchParams();
        params.set("LAWD_CD", lawdCd);
        params.set("DEAL_YMD", dealYmd);
        params.set("numOfRows", String(pageSize));
        params.set("pageNo", String(pageNo));
        const encodedKey = encodeURIComponent(serviceKey);
        const requestUrl = `${endpoint}?serviceKey=${encodedKey}&${params.toString()}`;

        const res = await fetch(requestUrl, {
          signal: AbortSignal.timeout(15_000),
        });

        if (!res.ok) {
          throw new DataSourceError(
            this.name,
            "FETCH_FAILED",
            `HTTP ${res.status} for ${endpointType}`,
          );
        }

        const xml = await res.text();

        // Parse totalCount from XML
        const totalCountMatch = xml.match(/<totalCount>(\d+)<\/totalCount>/);
        const totalCount = totalCountMatch ? Number(totalCountMatch[1]) : 0;

        // Parse items from XML
        const items = parseXmlItems(xml);
        const records = items.map((item) => this.mapItem(item, endpointType));

        return { items: records, totalCount, pageNo };
      },
      { pageSize: 1000, delayMs: 300 },
    );
  }

  private mapItem(
    item: MolitApiItem,
    endpointType: "sale" | "rent",
  ): ApartmentTradeRecord {
    const deposit = Number(String(item.deposit ?? "0").replace(/,/g, ""));
    const monthlyRent = Number(String(item.monthlyRent ?? "0").replace(/,/g, ""));

    const amount =
      endpointType === "sale"
        ? Number(String(item.dealAmount ?? "0").replace(/,/g, ""))
        : deposit;

    const tradeType: ApartmentTradeRecord["tradeType"] =
      endpointType === "sale"
        ? "sale"
        : monthlyRent > 0
          ? "monthly"
          : "jeonse";

    return {
      aptName: item.aptNm ?? "",
      address: `${item.umdNm ?? ""} ${item.jibun ?? ""}`.trim(),
      dealAmount: amount,
      monthlyRent: endpointType === "rent" ? monthlyRent : 0,
      dealYear: Number(item.dealYear ?? 0),
      dealMonth: Number(item.dealMonth ?? 0),
      exclusiveArea: Number(item.excluUseAr ?? 0),
      floor: Number(item.floor ?? 0),
      builtYear: Number(item.buildYear ?? 0),
      tradeType,
      regionCode: item.sggCd ?? "",
    };
  }

  /** Group records by apartment + month and compute statistics */
  private aggregateTradeRecords(
    records: ApartmentTradeRecord[],
  ): PriceAggregate[] {
    const groups = new Map<string, ApartmentTradeRecord[]>();

    for (const record of records) {
      const key = `${record.aptName}|${record.address}|${record.tradeType}|${record.dealYear}|${record.dealMonth}`;
      const existing = groups.get(key) ?? [];
      existing.push(record);
      groups.set(key, existing);
    }

    const aggregates: PriceAggregate[] = [];

    for (const [key, group] of groups) {
      const [aptName, address, tradeType, yearStr, monthStr] = key.split("|");
      const areas = group.map((r) => r.exclusiveArea);
      const floors = group.map((r) => r.floor);
      const prices = group.map((r) => r.dealAmount);
      const monthlyRents = group.map((r) => r.monthlyRent);

      aggregates.push({
        aptKey: `${group[0].regionCode}-${aptName}`,
        aptName,
        address,
        regionCode: group[0].regionCode,
        builtYear: group[0].builtYear,
        tradeType: tradeType as "sale" | "jeonse" | "monthly",
        year: Number(yearStr),
        month: Number(monthStr),
        avgPrice: Math.round(
          prices.reduce((a, b) => a + b, 0) / prices.length,
        ),
        monthlyRentAvg:
          tradeType === "monthly"
            ? Number(
                (
                  monthlyRents.reduce((a, b) => a + b, 0) / monthlyRents.length
                ).toFixed(1),
              )
            : null,
        dealCount: group.length,
        areaAvg: Number((areas.reduce((a, b) => a + b, 0) / areas.length).toFixed(2)),
        areaMin: Math.min(...areas),
        areaMax: Math.max(...areas),
        floorAvg: Number((floors.reduce((a, b) => a + b, 0) / floors.length).toFixed(1)),
        floorMin: Math.min(...floors),
        floorMax: Math.max(...floors),
      });
    }

    return aggregates;
  }

  /** Upsert apartment masters and price aggregates */
  private async upsertAggregates(
    aggregates: PriceAggregate[],
    regionCode: string,
  ): Promise<void> {
    // Resolve region name for geocoding address
    const regionConfig = TARGET_REGIONS.find((r) => r.code === regionCode);
    const regionName = regionConfig?.name ?? "";
    const sidoName = regionConfig?.sidoCode === "11" ? "서울특별시" : "경기도";

    // Extract unique apartments with area stats across all months
    const aptMap = new Map<
      string,
      {
        aptName: string;
        address: string;
        builtYear: number;
        regionCode: string;
        areas: number[];
      }
    >();
    for (const agg of aggregates) {
      const existing = aptMap.get(agg.aptKey);
      if (existing) {
        existing.areas.push(agg.areaMin, agg.areaMax);
      } else {
        aptMap.set(agg.aptKey, {
          aptName: agg.aptName,
          address: agg.address,
          builtYear: agg.builtYear,
          regionCode: agg.regionCode,
          areas: [agg.areaMin, agg.areaMax],
        });
      }
    }

    // Upsert apartments with geocoding
    const aptIdMap = new Map<string, number>();
    let geocodeCount = 0;
    const totalApts = aptMap.size;

    console.log(
      JSON.stringify({
        event: "molit_upsert_start",
        region: regionCode,
        apartments: totalApts,
        priceRecords: aggregates.length,
      }),
    );

    for (const [aptKey, apt] of aptMap) {
      geocodeCount++;
      if (geocodeCount % 50 === 0 || geocodeCount === 1) {
        console.log(
          JSON.stringify({
            event: "molit_geocode_progress",
            progress: `${geocodeCount}/${totalApts}`,
            region: regionCode,
          }),
        );
      }

      // Build full address with region: "서울특별시 강남구 논현동 22"
      const fullAddress = `${sidoName} ${regionName} ${apt.address}`;
      const geoResult = await geocodeAddress(fullAddress, true);
      if (!geoResult) {
        console.log(
          JSON.stringify({
            event: "molit_geocode_skip",
            aptName: apt.aptName,
            address: fullAddress,
          }),
        );
        continue;
      }
      const coord = geoResult.coordinate;

      // Compute area min/max across all trade records
      const validAreas = apt.areas.filter((a) => a > 0);
      const areaMin = validAreas.length > 0 ? Math.min(...validAreas) : null;
      const areaMax = validAreas.length > 0 ? Math.max(...validAreas) : null;

      try {
        const result = await db
          .insert(apartments)
          .values({
            aptCode: aptKey.substring(0, 60),
            aptName: apt.aptName,
            address: `${regionName} ${apt.address}`,
            regionCode: apt.regionCode,
            buildingType: "apartment",
            location: { latitude: coord.lat, longitude: coord.lng },
            builtYear: apt.builtYear || null,
            areaMin,
            areaMax,
          })
          .onConflictDoUpdate({
            target: apartments.aptCode,
            set: {
              aptName: sql`EXCLUDED."apt_name"`,
              builtYear: sql`EXCLUDED."built_year"`,
              areaMin: sql`EXCLUDED."area_min"`,
              areaMax: sql`EXCLUDED."area_max"`,
              location: sql`EXCLUDED."location"`,
              updatedAt: sql`NOW()`,
            },
          })
          .returning({ id: apartments.id });

        if (result[0]) {
          aptIdMap.set(aptKey, result[0].id);
        }
      } catch {
        // If upsert fails, try to fetch existing ID
        const existing = await db
          .select({ id: apartments.id })
          .from(apartments)
          .where(sql`${apartments.aptCode} = ${aptKey.substring(0, 60)}`)
          .limit(1);

        if (existing[0]) {
          aptIdMap.set(aptKey, existing[0].id);
        }
      }
    }

    // Upsert price aggregates
    for (const agg of aggregates) {
      const aptId = aptIdMap.get(agg.aptKey);
      if (!aptId) continue;

      try {
        await db
          .insert(apartmentPrices)
          .values({
            aptId,
            tradeType: agg.tradeType,
            year: agg.year,
            month: agg.month,
            averagePrice: String(agg.avgPrice),
            monthlyRentAvg: agg.monthlyRentAvg !== null ? String(agg.monthlyRentAvg) : null,
            dealCount: agg.dealCount,
            areaAvg: String(agg.areaAvg),
            areaMin: String(agg.areaMin),
            areaMax: String(agg.areaMax),
            floorAvg: String(agg.floorAvg),
            floorMin: agg.floorMin,
            floorMax: agg.floorMax,
          })
          .onConflictDoUpdate({
            target: [
              apartmentPrices.aptId,
              apartmentPrices.tradeType,
              apartmentPrices.year,
              apartmentPrices.month,
            ],
            set: {
              averagePrice: sql`EXCLUDED."average_price"`,
              monthlyRentAvg: sql`EXCLUDED."monthly_rent_avg"`,
              dealCount: sql`EXCLUDED."deal_count"`,
              areaAvg: sql`EXCLUDED."area_avg"`,
              areaMin: sql`EXCLUDED."area_min"`,
              areaMax: sql`EXCLUDED."area_max"`,
              floorAvg: sql`EXCLUDED."floor_avg"`,
              floorMin: sql`EXCLUDED."floor_min"`,
              floorMax: sql`EXCLUDED."floor_max"`,
            },
          });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("duplicate key") && !msg.includes("unique constraint")) {
          console.log(
            JSON.stringify({ event: "molit_price_upsert_error", aptKey: agg.aptKey, message: msg }),
          );
        }
      }
    }

    // Enrichment (건축물대장 + K-apt) is now called from runner.ts after all months complete
    // See enrichFromBuildingRegister() and enrichFromKapt()

    console.log(
      JSON.stringify({
        event: "molit_upsert_complete",
        region: regionCode,
        apartments: aptIdMap.size,
        priceRecords: aggregates.length,
      }),
    );
  }

  /**
   * Phase B: Enrich apartments with building register data (건축물대장 총괄표제부).
   * Called from runner.ts after all months complete (region-level, 1 time).
   * Fills: apartments.householdCount, apartments.officialName
   */
  async enrichFromBuildingRegister(regionCode: string): Promise<void> {
    const serviceKey = process.env.MOLIT_API_KEY;
    if (!serviceKey) return;
    const encodedKey = encodeURIComponent(serviceKey);

    // Target: apartments in this region with NULL householdCount
    const targets = await db.execute(sql`
      SELECT id, address FROM apartments
      WHERE region_code = ${regionCode} AND household_count IS NULL
    `) as unknown as Array<{ id: number; address: string }>;

    if (targets.length === 0) {
      console.log(JSON.stringify({ event: "bldg_skip", region: regionCode, message: "All have householdCount" }));
      return;
    }

    // Build dong→bjdongCd map from K-apt list
    const dongBjdMap = await this.fetchDongBjdMap(encodedKey, regionCode);

    const dongMapEntries = Object.fromEntries(dongBjdMap);
    console.log(JSON.stringify({
      event: "bldg_start",
      region: regionCode,
      targets: targets.length,
      dongMappings: dongBjdMap.size,
      dongMap: dongMapEntries,
    }));

    const stats = { success: 0, skipped: 0, failed: 0 };

    for (const apt of targets) {
      if (DATA_GO_KR_LIMITER.isExhausted) {
        console.log(JSON.stringify({ event: "bldg_quota_stop", region: regionCode, ...stats }));
        break;
      }

      const parsed = parseAddress(apt.address);
      if (!parsed) {
        stats.skipped++;
        console.log(JSON.stringify({ event: "bldg_skip_reason", aptId: apt.id, address: apt.address, reason: "parse_failed" }));
        continue;
      }

      const bjdongCd = dongBjdMap.get(parsed.dong);
      if (!bjdongCd) {
        stats.skipped++;
        console.log(JSON.stringify({ event: "bldg_skip_reason", aptId: apt.id, address: apt.address, dong: parsed.dong, reason: "bjdongCd_not_found" }));
        continue;
      }

      try {
        await DATA_GO_KR_LIMITER.acquire();
        const url = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrRecapTitleInfo?serviceKey=${encodedKey}&sigunguCd=${regionCode}&bjdongCd=${bjdongCd}&platGbCd=${parsed.platGbCd}&bun=${parsed.bun}&ji=${parsed.ji}&_type=json&numOfRows=10`;
        const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });

        if (!res.ok) {
          if (res.status >= 500) {
            await DATA_GO_KR_LIMITER.acquire();
            const retry = await fetch(url, { signal: AbortSignal.timeout(10_000) });
            if (!retry.ok) { stats.failed++; continue; }
            const item = parseBldgRecapResponse(await retry.json());
            if (!item) {
              stats.skipped++;
              console.log(JSON.stringify({ event: "bldg_skip_reason", aptId: apt.id, address: apt.address, reason: "empty_response_retry" }));
              continue;
            }
            await this.updateBuildingInfo(apt.id, item);
            stats.success++;
            continue;
          }
          stats.failed++;
          console.log(JSON.stringify({ event: "bldg_fail_reason", aptId: apt.id, address: apt.address, reason: `http_${res.status}` }));
          continue;
        }

        let item = parseBldgRecapResponse(await res.json());

        // Fallback: if ji != 0000 and empty response, retry with ji=0000 (main lot only)
        if (!item && parsed.ji !== "0000") {
          await DATA_GO_KR_LIMITER.acquire();
          const fallbackUrl = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrRecapTitleInfo?serviceKey=${encodedKey}&sigunguCd=${regionCode}&bjdongCd=${bjdongCd}&platGbCd=${parsed.platGbCd}&bun=${parsed.bun}&ji=0000&_type=json&numOfRows=10`;
          const fallbackRes = await fetch(fallbackUrl, { signal: AbortSignal.timeout(10_000) });
          if (fallbackRes.ok) {
            item = parseBldgRecapResponse(await fallbackRes.json());
          }
        }

        // Fallback 2: try 표제부 (getBrTitleInfo) for smaller buildings
        if (!item) {
          await DATA_GO_KR_LIMITER.acquire();
          const titleUrl = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?serviceKey=${encodedKey}&sigunguCd=${regionCode}&bjdongCd=${bjdongCd}&platGbCd=${parsed.platGbCd}&bun=${parsed.bun}&ji=${parsed.ji}&_type=json&numOfRows=10`;
          const titleRes = await fetch(titleUrl, { signal: AbortSignal.timeout(10_000) });
          if (titleRes.ok) {
            const titleJson = await titleRes.json();
            // Debug: log first successful response
            if (stats.success === 0 && stats.skipped < 3) {
              console.log(JSON.stringify({ event: "bldg_title_debug", aptId: apt.id, response: titleJson }));
            }
            item = parseBldgTitleResponse(titleJson);

            // Fallback 2-1: retry 표제부 with ji=0000
            if (!item && parsed.ji !== "0000") {
              await DATA_GO_KR_LIMITER.acquire();
              const titleFbUrl = `https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?serviceKey=${encodedKey}&sigunguCd=${regionCode}&bjdongCd=${bjdongCd}&platGbCd=${parsed.platGbCd}&bun=${parsed.bun}&ji=0000&_type=json&numOfRows=10`;
              const titleFbRes = await fetch(titleFbUrl, { signal: AbortSignal.timeout(10_000) });
              if (titleFbRes.ok) {
                item = parseBldgTitleResponse(await titleFbRes.json());
              }
            }
          }
        }

        if (!item) {
          stats.skipped++;
          console.log(JSON.stringify({ event: "bldg_skip_reason", aptId: apt.id, address: apt.address, reason: "all_endpoints_empty", bun: parsed.bun, ji: parsed.ji }));
          continue;
        }
        await this.updateBuildingInfo(apt.id, item);
        stats.success++;
      } catch (err: unknown) {
        stats.failed++;
        console.log(JSON.stringify({ event: "bldg_fail_reason", aptId: apt.id, address: apt.address, reason: err instanceof Error ? err.message : String(err) }));
      }
    }

    console.log(JSON.stringify({ event: "bldg_complete", region: regionCode, ...stats }));
  }

  /** Update apartments with building register data */
  private async updateBuildingInfo(
    aptId: number,
    item: { hhldCnt: number; bldNm: string },
  ): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (item.hhldCnt > 0) updates.householdCount = item.hhldCnt;
    if (item.bldNm) updates.officialName = item.bldNm;
    if (Object.keys(updates).length === 0) return;

    await db
      .update(apartments)
      .set(updates as { householdCount?: number; officialName?: string })
      .where(sql`${apartments.id} = ${aptId}`);
  }

  /** Fetch dong→bjdongCd mapping from K-apt list */
  private async fetchDongBjdMap(
    encodedKey: string,
    regionCode: string,
  ): Promise<Map<string, string>> {
    const dongMap = new Map<string, string>();
    let page = 1;

    try {
      while (true) {
        await DATA_GO_KR_LIMITER.acquire();
        const url = `https://apis.data.go.kr/1613000/AptListService3/getSigunguAptList3?serviceKey=${encodedKey}&sigunguCode=${regionCode}&pageNo=${page}&numOfRows=1000`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
        if (!res.ok) break;

        const json = (await res.json()) as {
          response?: { body?: { items?: Array<{ bjdCode?: string; as3?: string }>; totalCount?: number } };
        };
        const items = json.response?.body?.items ?? [];
        for (const item of items) {
          if (item.bjdCode && item.as3) {
            const bjdongCd = item.bjdCode.substring(5, 10);
            dongMap.set(item.as3.normalize("NFC"), bjdongCd);
          }
        }
        const total = json.response?.body?.totalCount ?? 0;
        if (items.length < 1000 || dongMap.size > 0 && items.length >= total) break;
        page++;
      }
    } catch {
      // best effort
    }

    return dongMap;
  }

  /**
   * Phase C: Enrich apartments with K-apt detail data (CCTV, parking, subway, etc.)
   * Called from runner.ts after enrichFromBuildingRegister (region-level, 1 time).
   */
  async enrichFromKapt(regionCode: string): Promise<void> {
    const serviceKey = process.env.MOLIT_API_KEY;
    if (!serviceKey) return;
    const encodedKey = encodeURIComponent(serviceKey);

    // Check which apartments already have details — skip
    const allApts = await db.execute(sql`
      SELECT id, apt_code, apt_name, address, official_name
      FROM apartments WHERE region_code = ${regionCode}
    `) as unknown as Array<{
      id: number; apt_code: string; apt_name: string; address: string; official_name: string | null;
    }>;

    const existingDetails = await db
      .select({ aptId: apartmentDetails.aptId })
      .from(apartmentDetails);
    const existingAptIds = new Set(existingDetails.map((r) => r.aptId));

    const pendingApts = allApts.filter((a) => !existingAptIds.has(a.id));
    if (pendingApts.length === 0) {
      console.log(JSON.stringify({ event: "kapt_skip", region: regionCode, message: "All already enriched" }));
      return;
    }

    // Fetch K-apt list (with bjdCode + dong)
    type KaptListEntry = { kaptCode: string; kaptName: string; dong: string; bjdCode: string };
    const kaptList: KaptListEntry[] = [];
    let page = 1;

    try {
      while (true) {
        await DATA_GO_KR_LIMITER.acquire();
        const url = `https://apis.data.go.kr/1613000/AptListService3/getSigunguAptList3?serviceKey=${encodedKey}&sigunguCode=${regionCode}&pageNo=${page}&numOfRows=1000`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
        if (!res.ok) break;

        const json = (await res.json()) as {
          response?: { body?: { items?: Array<{ kaptCode?: string; kaptName?: string; as3?: string; bjdCode?: string }>; totalCount?: number } };
        };
        const items = json.response?.body?.items ?? [];
        for (const item of items) {
          if (item.kaptCode && item.kaptName) {
            kaptList.push({
              kaptCode: item.kaptCode,
              kaptName: item.kaptName.normalize("NFC"),
              dong: (item.as3 ?? "").normalize("NFC"),
              bjdCode: item.bjdCode ?? "",
            });
          }
        }
        const total = json.response?.body?.totalCount ?? 0;
        if (items.length < 1000 || kaptList.length >= total) break;
        page++;
      }
    } catch {
      // best effort
    }

    if (kaptList.length === 0) {
      console.log(JSON.stringify({ event: "kapt_list_empty", region: regionCode }));
      return;
    }

    console.log(JSON.stringify({
      event: "kapt_enrich_start",
      region: regionCode,
      kaptComplexes: kaptList.length,
      pending: pendingApts.length,
    }));

    // ── Pass 1: Name-based matching ──
    const matched = new Map<number, string>(); // aptId → kaptCode
    const unmatchedApts: typeof pendingApts = [];

    for (const apt of pendingApts) {
      const aptName = apt.apt_name.normalize("NFC");
      const addrParts = apt.address.split(/\s+/);
      const aptDong = addrParts.find((p) => p.endsWith("동")) || "";

      // Try official name first (from 건축물대장), then MOLIT name
      const namesToTry = apt.official_name
        ? [apt.official_name.normalize("NFC"), aptName]
        : [aptName];

      let found = false;
      for (const name of namesToTry) {
        const kaptMatch = matchKapt(name, aptDong, kaptList);
        if (kaptMatch) {
          matched.set(apt.id, kaptMatch.kaptCode);
          found = true;
          break;
        }
      }
      if (!found) unmatchedApts.push(apt);
    }

    const matchedKaptCodes = new Set(matched.values());

    console.log(JSON.stringify({
      event: "kapt_name_match",
      region: regionCode,
      nameMatched: matched.size,
      unmatched: unmatchedApts.length,
    }));

    // ── Pass 2: Coordinate-based matching ──
    if (unmatchedApts.length > 0 && !DATA_GO_KR_LIMITER.isExhausted) {
      const unmatchedIds = unmatchedApts.map((a) => a.id);
      const idList = sql.join(unmatchedIds.map((id) => sql`${id}`), sql`,`);
      const aptCoords = await db.execute(sql`
        SELECT id, ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat
        FROM apartments WHERE id IN (${idList})
      `) as unknown as Array<{ id: number; lng: number; lat: number }>;
      const aptCoordsMap = new Map(aptCoords.map((r) => [r.id, { lat: Number(r.lat), lng: Number(r.lng) }]));

      // Geocode unmatched K-apt entries
      const unmatchedKapt = kaptList.filter((k) => !matchedKaptCodes.has(k.kaptCode));
      const kaptCoords: Array<{ kaptCode: string; kaptName: string; lat: number; lng: number }> = [];
      const geocodeStats = { total: unmatchedKapt.length, success: 0, noAddr: 0, noGeo: 0, error: 0 };

      for (const k of unmatchedKapt) {
        if (DATA_GO_KR_LIMITER.isExhausted) break;
        try {
          await DATA_GO_KR_LIMITER.acquire();
          const basicUrl = `https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusBassInfoV4?ServiceKey=${encodedKey}&kaptCode=${k.kaptCode}`;
          const basicRes = await fetch(basicUrl, { signal: AbortSignal.timeout(10_000) });
          if (!basicRes.ok) { geocodeStats.error++; continue; }
          const b = parseKaptResponseItem(await basicRes.json());
          const doroJuso = str(b.doroJuso);
          if (!doroJuso) { geocodeStats.noAddr++; continue; }
          const geo = await geocodeAddress(doroJuso, true);
          if (!geo) { geocodeStats.noGeo++; continue; }
          kaptCoords.push({ kaptCode: k.kaptCode, kaptName: k.kaptName, lat: geo.coordinate.lat, lng: geo.coordinate.lng });
          geocodeStats.success++;
        } catch { geocodeStats.error++; }
      }

      console.log(JSON.stringify({ event: "kapt_geocode_stats", region: regionCode, ...geocodeStats, coordsBuilt: kaptCoords.length }));

      // Match by proximity (150m threshold)
      let coordMatched = 0;
      for (const apt of unmatchedApts) {
        const coord = aptCoordsMap.get(apt.id);
        if (!coord) continue;
        const aptBigrams: string[] = normalizeAptName(apt.apt_name).match(/.{2}/g) ?? [];

        let bestDist = Infinity;
        let bestKapt: (typeof kaptCoords)[0] | null = null;
        for (const kc of kaptCoords) {
          if (matchedKaptCodes.has(kc.kaptCode)) continue;
          const dist = haversineMeters(coord.lat, coord.lng, kc.lat, kc.lng);
          if (dist < bestDist) { bestDist = dist; bestKapt = kc; }
        }

        if (!bestKapt || bestDist > 150) continue;
        // Name guard: <30m accept, 30-100m 2 bigrams, 100-150m 3 bigrams
        if (bestDist >= 30) {
          const kaptBigrams: string[] = normalizeAptName(bestKapt.kaptName).match(/.{2}/g) ?? [];
          const overlap = aptBigrams.filter((t) => kaptBigrams.includes(t)).length;
          const minOverlap = bestDist > 100 ? 3 : 2;
          if (overlap < minOverlap) continue;
        }

        matched.set(apt.id, bestKapt.kaptCode);
        matchedKaptCodes.add(bestKapt.kaptCode);
        coordMatched++;
      }

      console.log(JSON.stringify({ event: "kapt_coord_match", region: regionCode, coordMatched, totalMatched: matched.size }));
    }

    // ── Phase 3: Fetch detail and upsert ──
    let enriched = 0;
    for (const [aptId, kaptCode] of matched) {
      if (DATA_GO_KR_LIMITER.isExhausted) break;
      try {
        const ok = await this.fetchAndUpsertKaptDetail(encodedKey, kaptCode, aptId);
        if (ok) enriched++;
      } catch { /* skip */ }
    }

    console.log(JSON.stringify({ event: "kapt_enrich_complete", region: regionCode, enriched, total: pendingApts.length }));
  }

  /** Fetch K-apt basic + detail info for one kaptCode and upsert into DB */
  private async fetchAndUpsertKaptDetail(
    encodedKey: string,
    kaptCode: string,
    aptId: number,
  ): Promise<boolean> {
    // Fetch basic info
    await DATA_GO_KR_LIMITER.acquire();
    const basicUrl = `https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusBassInfoV4?ServiceKey=${encodedKey}&kaptCode=${kaptCode}`;
    const basicRes = await fetch(basicUrl, { signal: AbortSignal.timeout(10_000) });
    if (!basicRes.ok) return false;
    const b = parseKaptResponseItem(await basicRes.json());

    // Fetch detail info
    await DATA_GO_KR_LIMITER.acquire();
    const detailUrl = `https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusDtlInfoV4?ServiceKey=${encodedKey}&kaptCode=${kaptCode}`;
    const detailRes = await fetch(detailUrl, { signal: AbortSignal.timeout(10_000) });
    let d: Record<string, unknown> = {};
    if (detailRes.ok) {
      d = parseKaptResponseItem(await detailRes.json());
    }

    // householdCount는 건축물대장 API에서 채움 (apartments 테이블에 일원화)
    const dongCount = toInt(String(b.kaptDongCnt ?? ""));

    const values = {
      aptId,
      kaptCode,
      dongCount,
      doroJuso: str(b.doroJuso),
      useDate: str(b.kaptUsedate)?.substring(0, 8) ?? null,
      builder: str(b.kaptBcompany),
      developer: str(b.kaptAcompany),
      heatType: str(b.codeHeatNm)?.substring(0, 20) ?? null,
      saleType: str(b.codeSaleNm)?.substring(0, 20) ?? null,
      hallType: str(b.codeHallNm)?.substring(0, 20) ?? null,
      mgrType: str(b.codeMgrNm)?.substring(0, 20) ?? null,
      totalArea: str(b.kaptTarea),
      privateArea: str(b.privArea),
      parkingGround: toInt(String(d.kaptdPcnt ?? "")),
      parkingUnderground: toInt(String(d.kaptdPcntu ?? "")),
      elevatorCount: toInt(String(d.kaptdEcnt ?? "")),
      cctvCount: toInt(String(d.kaptdCccnt ?? "")),
      evChargerGround: toInt(String(d.groundElChargerCnt ?? "")),
      evChargerUnderground: toInt(String(d.undergroundElChargerCnt ?? "")),
      subwayLine: str(d.subwayLine),
      subwayStation: str(d.subwayStation),
      subwayDistance: str(d.kaptdWtimesub),
      busDistance: str(d.kaptdWtimebus),
      buildingStructure: str(d.codeStr)?.substring(0, 30) ?? null,
      welfareFacility: str(d.welfareFacility),
      educationFacility: str(d.educationFacility),
      convenientFacility: str(d.convenientFacility),
    };

    // Delete existing row for this kaptCode if it belongs to a different apt_id
    // (skip for merged K-apt complexes to allow N:1 mapping)
    await db
      .delete(apartmentDetails)
      .where(
        sql`${apartmentDetails.kaptCode} = ${kaptCode} AND ${apartmentDetails.aptId} != ${aptId}`,
      );

    await db
      .insert(apartmentDetails)
      .values(values)
      .onConflictDoUpdate({
        target: apartmentDetails.aptId,
        set: {
          kaptCode: sql`EXCLUDED."kapt_code"`,
          dongCount: sql`EXCLUDED."dong_count"`,
          doroJuso: sql`EXCLUDED."doro_juso"`,
          useDate: sql`EXCLUDED."use_date"`,
          builder: sql`EXCLUDED."builder"`,
          developer: sql`EXCLUDED."developer"`,
          heatType: sql`EXCLUDED."heat_type"`,
          saleType: sql`EXCLUDED."sale_type"`,
          hallType: sql`EXCLUDED."hall_type"`,
          mgrType: sql`EXCLUDED."mgr_type"`,
          totalArea: sql`EXCLUDED."total_area"`,
          privateArea: sql`EXCLUDED."private_area"`,
          parkingGround: sql`EXCLUDED."parking_ground"`,
          parkingUnderground: sql`EXCLUDED."parking_underground"`,
          elevatorCount: sql`EXCLUDED."elevator_count"`,
          cctvCount: sql`EXCLUDED."cctv_count"`,
          evChargerGround: sql`EXCLUDED."ev_charger_ground"`,
          evChargerUnderground: sql`EXCLUDED."ev_charger_underground"`,
          subwayLine: sql`EXCLUDED."subway_line"`,
          subwayStation: sql`EXCLUDED."subway_station"`,
          subwayDistance: sql`EXCLUDED."subway_distance"`,
          busDistance: sql`EXCLUDED."bus_distance"`,
          buildingStructure: sql`EXCLUDED."building_structure"`,
          welfareFacility: sql`EXCLUDED."welfare_facility"`,
          educationFacility: sql`EXCLUDED."education_facility"`,
          convenientFacility: sql`EXCLUDED."convenient_facility"`,
          updatedAt: sql`NOW()`,
        },
      });

    return true;
  }
}

function toInt(val: string | undefined): number | null {
  if (!val) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

function str(val: unknown): string | null {
  if (val === null || val === undefined || val === "") return null;
  return String(val).trim() || null;
}

/** Parse K-apt API V4 response → item record */
function parseKaptResponseItem(json: unknown): Record<string, unknown> {
  const body = (json as Record<string, unknown>);
  const bodyObj = (body.response as Record<string, unknown>)?.body as Record<string, unknown>
    ?? body.body as Record<string, unknown>
    ?? body;
  return (bodyObj.item as Record<string, unknown>) ?? bodyObj;
}

/** Haversine distance in meters between two lat/lng points */
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Normalize apartment name for fuzzy comparison */
function normalizeAptName(name: string): string {
  let n = name.normalize("NFC");
  // Brand aliases
  n = n.replace(/레미안/g, "래미안");
  n = n
    .replace(/아파트$/g, "")
    .replace(/\s+/g, "")
    .replace(/[()（）\-·,\/]/g, "")
    .toLowerCase();
  return n;
}

/** Parse MOLIT address "역삼동 722" or "역삼동 831-29" or "양평동3가 103" into bun/ji */
function parseAddress(address: string): {
  dong: string; bun: string; ji: string; platGbCd: string;
} | null {
  // address format: "강남구 역삼동 722" or "역삼동 722-5" or "영등포구 양평동3가 103"
  const parts = address.split(/\s+/);
  // Find dong part (ends with 동 or 동+숫자+가, e.g. 양평동3가, 문래동6가)
  const dongIdx = parts.findIndex((p) => /동(\d+가)?$/.test(p));
  if (dongIdx === -1) return null;
  const dong = parts[dongIdx];

  // Find number part after dong
  const numPart = parts.slice(dongIdx + 1).join(" ").trim();
  if (!numPart) return null;

  // Handle 산번지
  let platGbCd = "0";
  let numStr = numPart;
  if (numStr.startsWith("산")) {
    platGbCd = "1";
    numStr = numStr.replace(/^산\s*/, "");
  }

  // Parse bun-ji
  const match = numStr.match(/^(\d+)(?:-(\d+))?/);
  if (!match) return null;

  const bun = String(match[1]).padStart(4, "0");
  const ji = match[2] ? String(match[2]).padStart(4, "0") : "0000";

  return { dong, bun, ji, platGbCd };
}

/** Parse 건축물대장 총괄표제부 API response */
function parseBldgRecapResponse(json: unknown): { hhldCnt: number; bldNm: string } | null {
  const body = (json as Record<string, unknown>);
  const resp = body.response as Record<string, unknown> | undefined;
  if (!resp) return null;
  const bodyObj = resp.body as Record<string, unknown> | undefined;
  if (!bodyObj) return null;
  const itemsWrapper = bodyObj.items as Record<string, unknown> | undefined;
  if (!itemsWrapper) return null;

  // items.item can be array or single object or empty string
  let items: Array<Record<string, unknown>>;
  const rawItem = itemsWrapper.item;
  if (Array.isArray(rawItem)) {
    items = rawItem as Array<Record<string, unknown>>;
  } else if (rawItem && typeof rawItem === "object") {
    items = [rawItem as Record<string, unknown>];
  } else {
    return null; // empty or invalid
  }

  // Filter for 공동주택 if multiple items
  const housing = items.filter((i) => {
    const purps = String(i.mainPurpsCdNm ?? "");
    return purps.includes("주택") || purps.includes("아파트");
  });
  const target = housing[0] ?? items[0];
  if (!target) return null;

  const hhldCnt = Number(target.hhldCnt ?? 0);
  const bldNm = String(target.bldNm ?? "").trim();

  return { hhldCnt, bldNm };
}

/** Parse 건축물대장 표제부 API response (getBrTitleInfo) */
function parseBldgTitleResponse(json: unknown): { hhldCnt: number; bldNm: string } | null {
  const body = (json as Record<string, unknown>);
  const resp = body.response as Record<string, unknown> | undefined;
  if (!resp) return null;
  const bodyObj = resp.body as Record<string, unknown> | undefined;
  if (!bodyObj) return null;
  const itemsWrapper = bodyObj.items as Record<string, unknown> | string | undefined;
  if (!itemsWrapper || typeof itemsWrapper === "string") return null;

  let items: Array<Record<string, unknown>>;
  const rawItem = (itemsWrapper as Record<string, unknown>).item;
  if (Array.isArray(rawItem)) {
    items = rawItem as Array<Record<string, unknown>>;
  } else if (rawItem && typeof rawItem === "object") {
    items = [rawItem as Record<string, unknown>];
  } else {
    return null;
  }

  // Filter for 공동주택/주거 if multiple
  const housing = items.filter((i) => {
    const purps = String(i.mainPurpsCdNm ?? "");
    return purps.includes("주택") || purps.includes("아파트") || purps.includes("주거");
  });
  const target = housing[0] ?? items[0];
  if (!target) return null;

  // 표제부 may have hhldCnt or hoCnt (호수) or we estimate from grndFlrCnt
  const hhldCnt = Number(target.hhldCnt ?? target.hoCnt ?? 0);
  const bldNm = String(target.bldNm ?? "").trim();

  if (hhldCnt === 0 && !bldNm) return null;
  return { hhldCnt, bldNm };
}

/** Extract ordinal suffix (차수/단지) from name: "래미안삼성2차" → "2차" */
function extractOrdinal(name: string): string | null {
  const m = name.match(/(\d+)\s*(차|단지)/);
  return m ? `${m[1]}${m[2]}` : null;
}

/**
 * Match a MOLIT apartment to K-apt list entry.
 * Strategy: dong filter → exact → includes → token overlap (with ordinal guard)
 */
function matchKapt(
  aptName: string,
  aptDong: string,
  kaptList: Array<{ kaptCode: string; kaptName: string; dong: string }>,
): { kaptCode: string; kaptName: string; dong: string } | undefined {
  const normApt = normalizeAptName(aptName);
  if (!normApt) return undefined;

  // Also try with dong prefix stripped: "삼성동힐스테이트" → "힐스테이트"
  const normAptStripped = aptDong
    ? normalizeAptName(aptName.replace(new RegExp(`^${aptDong}`), ""))
    : normApt;

  type KaptEntry = { kaptCode: string; kaptName: string; dong: string };

  // Candidates in the same dong first, then all as fallback
  const sameDong: KaptEntry[] = aptDong
    ? kaptList.filter((k) => k.dong === aptDong)
    : [];
  const pools: KaptEntry[][] = sameDong.length > 0 ? [sameDong, kaptList] : [kaptList];

  const aptOrd = extractOrdinal(aptName);

  for (const pool of pools) {
    // Pass 1: exact normalized match (original + dong-stripped)
    const exact = pool.find((k) => {
      const nk = normalizeAptName(k.kaptName);
      return nk === normApt || (normAptStripped !== normApt && nk === normAptStripped);
    });
    if (exact) return exact;

    // Pass 2: one includes the other (normalized), with ordinal guard
    const incl = pool.find((k) => {
      const normKapt = normalizeAptName(k.kaptName);
      const matches =
        normKapt.includes(normApt) || normApt.includes(normKapt) ||
        (normAptStripped !== normApt && (normKapt.includes(normAptStripped) || normAptStripped.includes(normKapt)));
      if (!matches) return false;
      const kOrd = extractOrdinal(k.kaptName);
      if (aptOrd && kOrd && aptOrd !== kOrd) return false;
      return true;
    });
    if (incl) return incl;

    // Pass 3: bigram overlap (≥ 70% of shorter name), same dong only
    if (pool === sameDong) {
      const aptTokens: string[] = normApt.match(/.{2}/g) ?? [];
      if (aptTokens.length < 2) continue;
      let bestScore = 0;
      let bestMatch: KaptEntry | undefined;

      for (const k of pool) {
        // Ordinal guard
        const kOrd = extractOrdinal(k.kaptName);
        if (aptOrd && kOrd && aptOrd !== kOrd) continue;

        const kTokens: string[] = normalizeAptName(k.kaptName).match(/.{2}/g) ?? [];
        if (kTokens.length < 2) continue;
        const overlap = aptTokens.filter((t) => kTokens.includes(t)).length;
        const shorter = Math.min(aptTokens.length, kTokens.length);
        const score = shorter > 0 ? overlap / shorter : 0;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = k;
        }
      }

      if (bestScore >= 0.7 && bestMatch) return bestMatch;
    }
  }

  return undefined;
}

import type { DataSourceAdapter } from "../types";
import { DataSourceError } from "../types";

/**
 * MOIS (행정안전부) safety data adapter.
 * Combines CCTV + shelter data into aggregated safety stats.
 * Source of Truth: M2 spec Section 4.1.5
 */

export interface SafetyRecord {
  regionCode: string;
  regionName: string;
  crimeRate: number;
  cctvDensity: number;
  shelterCount: number;
  dataDate: string;
}

const USE_MOCK = process.env.USE_MOCK_DATA === "true";

export class MoisAdapter implements DataSourceAdapter<SafetyRecord> {
  readonly name = "MOIS";

  async fetch(params: Record<string, unknown>): Promise<SafetyRecord[]> {
    if (USE_MOCK) {
      return [];
    }
    return this.fetchReal(params);
  }

  private async fetchReal(
    params: Record<string, unknown>,
  ): Promise<SafetyRecord[]> {
    const serviceKey = process.env.MOIS_API_KEY;
    if (!serviceKey) {
      throw new DataSourceError(
        this.name,
        "FETCH_FAILED",
        "MOIS_API_KEY not configured",
      );
    }

    const ctpvNm = String(params.ctpvNm ?? "서울특별시");

    // CCTV data
    const cctvUrl = new URL(
      "https://apis.data.go.kr/B553530/CctvInfoService/getCctvInfo",
    );
    cctvUrl.searchParams.set("serviceKey", serviceKey);
    cctvUrl.searchParams.set("ctpvNm", ctpvNm);
    cctvUrl.searchParams.set("numOfRows", "100");
    cctvUrl.searchParams.set("pageNo", "1");

    const res = await fetch(cctvUrl.toString(), {
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new DataSourceError(
        this.name,
        "FETCH_FAILED",
        `HTTP ${res.status}`,
      );
    }

    const json = (await res.json()) as {
      response?: {
        body?: {
          items?: {
            item?: Array<{
              mngInstNm?: string;
              cameraCnt?: number;
            }>;
          };
        };
      };
    };

    // Aggregate by managing institution (approximation of region)
    const items = json.response?.body?.items?.item ?? [];
    const regionMap = new Map<string, number>();

    for (const item of items) {
      const region = item.mngInstNm ?? "unknown";
      const count = item.cameraCnt ?? 1;
      regionMap.set(region, (regionMap.get(region) ?? 0) + count);
    }

    return Array.from(regionMap.entries()).map(([region, cctvCount]) => ({
      regionCode: region,
      regionName: region,
      crimeRate: 0, // Requires separate crime statistics data
      cctvDensity: cctvCount / 10, // Approximation: count / 10 km²
      shelterCount: 0, // Requires separate shelter API call
      dataDate: new Date().toISOString().split("T")[0],
    }));
  }
}

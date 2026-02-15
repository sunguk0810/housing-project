import type { DataSourceAdapter } from "../types";
import { DataSourceError } from "../types";

/**
 * MOLIT (국토교통부) apartment trade data adapter.
 * Mock mode: returns data from db/mock.
 * Real mode: calls data.go.kr API.
 *
 * Source of Truth: M2 spec Section 4.1.1, 4.1.2
 */

export interface ApartmentTradeRecord {
  aptName: string;
  address: string;
  dealAmount: number;
  dealYear: number;
  dealMonth: number;
  exclusiveArea: number;
  floor: number;
  builtYear: number;
  tradeType: "sale" | "jeonse";
  regionCode: string;
}

const USE_MOCK = process.env.USE_MOCK_DATA === "true";

export class MolitAdapter implements DataSourceAdapter<ApartmentTradeRecord> {
  readonly name = "MOLIT";

  async fetch(
    params: Record<string, unknown>,
  ): Promise<ApartmentTradeRecord[]> {
    if (USE_MOCK) {
      return this.fetchMock();
    }
    return this.fetchReal(params);
  }

  private async fetchMock(): Promise<ApartmentTradeRecord[]> {
    // Return empty array — mock data is handled by seed.ts
    // ETL mock simply signals "no new data to fetch"
    return [];
  }

  private async fetchReal(
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

    if (!lawdCd || !dealYmd) {
      throw new DataSourceError(
        this.name,
        "VALIDATION_FAILED",
        "lawdCd and dealYmd are required",
      );
    }

    const url = new URL(
      "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev",
    );
    url.searchParams.set("serviceKey", serviceKey);
    url.searchParams.set("LAWD_CD", lawdCd);
    url.searchParams.set("DEAL_YMD", dealYmd);
    url.searchParams.set("numOfRows", "100");
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("type", "json");

    const res = await fetch(url.toString(), {
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
            }>;
          };
        };
      };
    };

    const items = json.response?.body?.items?.item ?? [];

    return items.map((item) => ({
      aptName: item.aptNm ?? "",
      address: `${item.umdNm ?? ""} ${item.jibun ?? ""}`.trim(),
      dealAmount: Number(String(item.dealAmount ?? "0").replace(/,/g, "")),
      dealYear: Number(item.dealYear ?? 0),
      dealMonth: Number(item.dealMonth ?? 0),
      exclusiveArea: Number(item.excluUseAr ?? 0),
      floor: Number(item.floor ?? 0),
      builtYear: Number(item.buildYear ?? 0),
      tradeType: "sale" as const,
      regionCode: item.sggCd ?? "",
    }));
  }
}

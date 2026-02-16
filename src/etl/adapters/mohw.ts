import type { DataSourceAdapter } from "../types";
import { DataSourceError } from "../types";

/**
 * MOHW (보건복지부/사회보장정보원) childcare adapter.
 * Source of Truth: M2 spec Section 4.1.3
 */

export interface ChildcareRecord {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentEnrollment: number;
  evaluationGrade: string | null;
  facilityType: string;
}

const USE_MOCK = process.env.USE_MOCK_DATA === "true";

export class MohwAdapter implements DataSourceAdapter<ChildcareRecord> {
  readonly name = "MOHW";

  async fetch(params: Record<string, unknown>): Promise<ChildcareRecord[]> {
    if (USE_MOCK) {
      return [];
    }
    return this.fetchReal(params);
  }

  private async fetchReal(
    params: Record<string, unknown>,
  ): Promise<ChildcareRecord[]> {
    const serviceKey = process.env.MOHW_API_KEY;
    if (!serviceKey) {
      throw new DataSourceError(
        this.name,
        "FETCH_FAILED",
        "MOHW_API_KEY not configured",
      );
    }

    const stcode = String(params.stcode ?? "");
    const arcode = String(params.arcode ?? "");

    const url = new URL(
      "https://apis.data.go.kr/1352159/ChildCareService_v2/getCenterInfo",
    );
    url.searchParams.set("serviceKey", serviceKey);
    url.searchParams.set("stcode", stcode);
    url.searchParams.set("arcode", arcode);
    url.searchParams.set("numOfRows", "100");
    url.searchParams.set("pageNo", "1");

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
              crname?: string;
              craddr?: string;
              la?: string;
              lo?: string;
              crcapacity?: number;
              crchcnt?: number;
              craccgrd?: string;
              crtypename?: string;
            }>;
          };
        };
      };
    };

    const items = json.response?.body?.items?.item ?? [];

    return items.map((item) => ({
      name: item.crname ?? "",
      address: item.craddr ?? "",
      latitude: Number(item.la ?? 0),
      longitude: Number(item.lo ?? 0),
      capacity: item.crcapacity ?? 0,
      currentEnrollment: item.crchcnt ?? 0,
      evaluationGrade: item.craccgrd || null,
      facilityType: item.crtypename ?? "",
    }));
  }
}

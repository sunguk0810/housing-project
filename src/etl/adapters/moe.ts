import type { DataSourceAdapter } from "../types";
import { DataSourceError } from "../types";

/**
 * MOE (교육부/NEIS) school data adapter.
 * Source of Truth: M2 spec Section 4.1.4
 */

export interface SchoolRecord {
  schoolCode: string;
  name: string;
  schoolLevel: "elem" | "middle" | "high";
  address: string;
  achievementScore: number | null;
}

const SCHOOL_LEVEL_MAP: Record<string, "elem" | "middle" | "high"> = {
  초등학교: "elem",
  중학교: "middle",
  고등학교: "high",
};

const USE_MOCK = process.env.USE_MOCK_DATA === "true";

export class MoeAdapter implements DataSourceAdapter<SchoolRecord> {
  readonly name = "MOE";

  async fetch(params: Record<string, unknown>): Promise<SchoolRecord[]> {
    if (USE_MOCK) {
      return [];
    }
    return this.fetchReal(params);
  }

  private async fetchReal(
    params: Record<string, unknown>,
  ): Promise<SchoolRecord[]> {
    const apiKey = process.env.MOE_API_KEY;
    if (!apiKey) {
      throw new DataSourceError(
        this.name,
        "FETCH_FAILED",
        "MOE_API_KEY not configured",
      );
    }

    const atptCode = String(params.atptCode ?? "B10"); // Seoul default

    const url = new URL("https://open.neis.go.kr/hub/schoolInfo");
    url.searchParams.set("KEY", apiKey);
    url.searchParams.set("Type", "json");
    url.searchParams.set("ATPT_OFCDC_SC_CODE", atptCode);
    url.searchParams.set("pIndex", "1");
    url.searchParams.set("pSize", "100");

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
      schoolInfo?: Array<{
        row?: Array<{
          SD_SCHUL_CODE?: string;
          SCHUL_NM?: string;
          SCHUL_KND_SC_NM?: string;
          ORG_RDNMA?: string;
        }>;
      }>;
    };

    const rows = json.schoolInfo?.[1]?.row ?? [];

    return rows
      .filter((r) => r.SCHUL_KND_SC_NM && r.SCHUL_KND_SC_NM in SCHOOL_LEVEL_MAP)
      .map((r) => ({
        schoolCode: r.SD_SCHUL_CODE ?? "",
        name: r.SCHUL_NM ?? "",
        schoolLevel:
          SCHOOL_LEVEL_MAP[r.SCHUL_KND_SC_NM ?? ""] ?? "elem",
        address: r.ORG_RDNMA ?? "",
        achievementScore: null, // Requires separate achievement data API/CSV
      }));
  }
}

import type { DataSourceAdapter } from "../types";
import { DataSourceError } from "../types";
import { fetchAllPages } from "../utils/paginate";
import { NEIS_LIMITER } from "../utils/rate-limiter";
import { geocodeAddress } from "./kakao-geocoding";
import { db } from "@/db/connection";
import { schools } from "@/db/schema/schools";
import { sql } from "drizzle-orm";

/**
 * MOE (교육부/NEIS) school data adapter.
 * Fetches school info with pagination (pIndex/pSize) and geocodes addresses.
 *
 * Source of Truth: M2 spec Section 4.1.4
 */

export interface SchoolRecord {
  schoolCode: string;
  name: string;
  schoolLevel: "elem" | "middle" | "high";
  address: string;
  achievementScore: number | null;
  latitude: number | null;
  longitude: number | null;
}

const SCHOOL_LEVEL_MAP: Record<string, "elem" | "middle" | "high"> = {
  초등학교: "elem",
  중학교: "middle",
  고등학교: "high",
};

/** Raw NEIS API response row */
interface NeisSchoolRow {
  SD_SCHUL_CODE?: string;
  SCHUL_NM?: string;
  SCHUL_KND_SC_NM?: string;
  ORG_RDNMA?: string;
}

export class MoeAdapter implements DataSourceAdapter<SchoolRecord> {
  readonly name = "MOE";

  async fetch(
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

    const atptCode = String(params.atptCode ?? "B10");
    const dryRun = Boolean(params.dryRun);

    // Fetch all school records with NEIS pagination (pIndex/pSize)
    const records = await fetchAllPages<SchoolRecord>(
      async (pageNo, pageSize) => {
        await NEIS_LIMITER.acquire();

        const url = new URL("https://open.neis.go.kr/hub/schoolInfo");
        url.searchParams.set("KEY", apiKey);
        url.searchParams.set("Type", "json");
        url.searchParams.set("ATPT_OFCDC_SC_CODE", atptCode);
        url.searchParams.set("pIndex", String(pageNo));
        url.searchParams.set("pSize", String(pageSize));

        const res = await fetch(url.toString(), {
          signal: AbortSignal.timeout(15_000),
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
            head?: Array<{ list_total_count?: number }>;
            row?: NeisSchoolRow[];
          }>;
        };

        // NEIS returns [head, data] array
        const head = json.schoolInfo?.[0]?.head?.[0];
        const totalCount = head?.list_total_count ?? 0;
        const rows = json.schoolInfo?.[1]?.row ?? [];

        const items = rows
          .filter(
            (r) =>
              r.SCHUL_KND_SC_NM &&
              r.SCHUL_KND_SC_NM in SCHOOL_LEVEL_MAP,
          )
          .map((r) => ({
            schoolCode: r.SD_SCHUL_CODE ?? "",
            name: r.SCHUL_NM ?? "",
            schoolLevel:
              SCHOOL_LEVEL_MAP[r.SCHUL_KND_SC_NM ?? ""] ?? "elem",
            address: r.ORG_RDNMA ?? "",
            achievementScore: null,
            latitude: null as number | null,
            longitude: null as number | null,
          }));

        return { items, totalCount, pageNo };
      },
      { pageSize: 1000, delayMs: 300 },
    );

    console.log(
      JSON.stringify({
        event: "moe_fetched",
        atptCode,
        count: records.length,
      }),
    );

    // Geocode addresses
    if (records.length > 0) {
      await this.geocodeRecords(records);
    }

    // Upsert to DB
    if (!dryRun && records.length > 0) {
      await this.upsertRecords(records);
    }

    return records;
  }

  /** Geocode all school addresses using Kakao API */
  private async geocodeRecords(records: SchoolRecord[]): Promise<void> {
    let geocoded = 0;
    let failed = 0;

    for (const record of records) {
      if (!record.address) {
        failed++;
        continue;
      }

      const result = await geocodeAddress(record.address);
      if (result) {
        record.latitude = result.coordinate.lat;
        record.longitude = result.coordinate.lng;
        geocoded++;
      } else {
        failed++;
      }

      if ((geocoded + failed) % 500 === 0) {
        console.log(
          JSON.stringify({
            event: "moe_geocode_progress",
            geocoded,
            failed,
            total: records.length,
          }),
        );
      }
    }

    console.log(
      JSON.stringify({
        event: "moe_geocode_complete",
        geocoded,
        failed,
      }),
    );
  }

  /** Upsert school records to DB */
  private async upsertRecords(records: SchoolRecord[]): Promise<void> {
    const BATCH_SIZE = 100;
    let inserted = 0;

    // Filter out records without coordinates
    const validRecords = records.filter(
      (r) => r.latitude !== null && r.longitude !== null,
    );

    for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
      const batch = validRecords.slice(i, i + BATCH_SIZE);

      for (const record of batch) {
        const code = record.schoolCode || null;
        const values = {
          name: record.name,
          schoolCode: code,
          schoolLevel: record.schoolLevel,
          location: {
            latitude: record.latitude!,
            longitude: record.longitude!,
          },
          achievementScore: record.achievementScore
            ? String(record.achievementScore)
            : null,
        };

        try {
          if (code) {
            // Has school code → upsert on conflict
            await db
              .insert(schools)
              .values(values)
              .onConflictDoUpdate({
                target: schools.schoolCode,
                set: {
                  name: sql`EXCLUDED."name"`,
                  schoolLevel: sql`EXCLUDED."school_level"`,
                  location: sql`EXCLUDED."location"`,
                },
              });
          } else {
            // No school code → simple insert (skip if duplicate name+level exists)
            await db.insert(schools).values(values);
          }
          inserted++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (!msg.includes("duplicate key") && !msg.includes("unique constraint")) {
            console.log(
              JSON.stringify({ event: "moe_upsert_error", school: record.name, message: msg }),
            );
          }
        }
      }

      if (inserted % 500 === 0 && inserted > 0) {
        console.log(
          JSON.stringify({
            event: "moe_upsert_progress",
            inserted,
            total: validRecords.length,
          }),
        );
      }
    }

    console.log(
      JSON.stringify({
        event: "moe_upsert_complete",
        inserted,
        totalValid: validRecords.length,
      }),
    );
  }
}

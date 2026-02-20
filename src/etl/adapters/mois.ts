import type { DataSourceAdapter } from "../types";
import { loadAllSafetyCsvs } from "./safety-csv";
import { loadAllCrimeStats } from "./crime-csv";

/**
 * MOIS (행정안전부) safety data adapter — CSV orchestrator.
 * No API key required. Loads from pre-downloaded CSV files.
 *
 * Orchestrates:
 *   1. Safety infrastructure CSVs (CCTV, safe cameras, streetlights) → safety_infra table
 *   2. Crime statistics CSVs → safety_stats table
 *
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

export class MoisAdapter implements DataSourceAdapter<SafetyRecord> {
  readonly name = "MOIS";

  async fetch(params: Record<string, unknown>): Promise<SafetyRecord[]> {
    const dryRun = Boolean(params.dryRun);

    // Load safety infrastructure CSVs
    console.log(
      JSON.stringify({ event: "mois_start", phase: "safety_infra" }),
    );
    const infraResult = await loadAllSafetyCsvs(dryRun);

    // Load crime statistics CSVs
    console.log(
      JSON.stringify({ event: "mois_start", phase: "crime_stats" }),
    );
    const crimeCount = await loadAllCrimeStats(dryRun);

    console.log(
      JSON.stringify({
        event: "mois_complete",
        cctv: infraResult.cctv,
        safecam: infraResult.safecam,
        lamp: infraResult.lamp,
        crimeDistricts: crimeCount,
      }),
    );

    // Return a summary record for the runner report
    const totalInfra =
      infraResult.cctv + infraResult.safecam + infraResult.lamp;

    return [
      {
        regionCode: "summary",
        regionName: "전체",
        crimeRate: 0,
        cctvDensity: totalInfra,
        shelterCount: 0,
        dataDate: new Date().toISOString().split("T")[0],
      },
    ];
  }
}

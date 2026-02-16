import type { InferInsertModel } from "drizzle-orm";
import { safetyStats } from "../schema/safety";
import {
  createRng,
  randomFloat,
  randomInt,
  clamp,
  SEOUL_DISTRICTS,
} from "./constants";

type SafetyInsert = InferInsertModel<typeof safetyStats>;

export function generateSafety(): SafetyInsert[] {
  const rng = createRng(46);
  const result: SafetyInsert[] = [];

  for (const district of SEOUL_DISTRICTS) {
    const crimeRate = randomFloat(rng, 1.0, 8.0);
    const cctvDensity = randomFloat(rng, 1.0, 8.0);
    const policeDistance = randomFloat(rng, 200, 2000, 0);
    const streetlightDensity = randomFloat(rng, 10, 60, 0);
    const shelterCount = randomInt(rng, 2, 15);

    // Pre-calculated score (PHASE1 S4 formula)
    const crimeNorm = (10 - crimeRate) / 9;
    const cctvNorm = clamp(cctvDensity / 5, 0, 1);
    const shelterNorm = Math.min(shelterCount, 10) / 10;
    const calculatedScore =
      Math.round(
        (0.5 * crimeNorm + 0.3 * cctvNorm + 0.2 * shelterNorm) * 10000,
      ) / 10000;

    result.push({
      regionCode: district.code,
      regionName: district.name,
      crimeRate: String(crimeRate),
      cctvDensity: String(cctvDensity),
      policeStationDistance: String(policeDistance),
      streetlightDensity: String(streetlightDensity),
      shelterCount,
      calculatedScore: String(calculatedScore),
      dataDate: "2025-12-01",
    });
  }

  return result;
}

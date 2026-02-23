import { sql } from 'drizzle-orm';
import pLimit from 'p-limit';
import { db } from '@/db/connection';
import { findNearbyChildcare } from '@/lib/engines/spatial';
import { getCommuteTime } from '@/lib/engines/commute';
import { calculateFinalScore } from '@/lib/engines/scoring';
import { estimateApartmentMonthlyCost } from '@/lib/engines/budget';
import type { CandidateRow } from '@/lib/queries/fetch-candidates';
import type { RegionSafetyData } from '@/lib/queries/fetch-safety';
import type { RecommendationItem, TradeType } from '@/types/api';
import type { ScoringInput, WeightProfileKey, LoanProgramKey, CustomWeights } from '@/types/engine';

/**
 * Scoring pipeline: enriches candidate apartments with spatial/commute/safety data
 * and computes final weighted scores.
 *
 * Source of Truth: M2 spec Section 6.1 (Steps 6-10)
 */

// --- Types ---

export interface GeocodedDestination {
  readonly lng: number;
  readonly lat: number;
  readonly label: string;
}

export interface ScoringPipelineInput {
  readonly candidates: readonly CandidateRow[];
  readonly regionSafetyMap: ReadonlyMap<string, RegionSafetyData>;
  readonly job1: GeocodedDestination | null;
  readonly job2: GeocodedDestination | null;
  readonly tradeType: TradeType;
  readonly cash: number;
  readonly maxPrice: number;
  readonly weightProfile: WeightProfileKey;
  readonly loanProgram: LoanProgramKey;
  readonly customWeights?: CustomWeights;
}

export interface ScoredCandidate {
  readonly score: number;
  readonly item: RecommendationItem;
}

// --- Constants ---

const CONCURRENCY_LIMIT = 5;

// --- Main pipeline ---

/**
 * Score all candidate apartments concurrently.
 * Each candidate is enriched with childcare, school, safety, and commute data,
 * then scored using the 6-dimension weighted engine.
 */
export async function scoreCandidates(
  input: ScoringPipelineInput,
): Promise<ScoredCandidate[]> {
  const limit = pLimit(CONCURRENCY_LIMIT);

  return Promise.all(
    input.candidates.map((row) =>
      limit(() => scoreOneCandidate(row, input)),
    ),
  );
}

async function scoreOneCandidate(
  row: CandidateRow,
  ctx: ScoringPipelineInput,
): Promise<ScoredCandidate> {
  const aptLon = row.longitude;
  const aptLat = row.latitude;

  // Step 6: Childcare within 800m
  const childcareItems = await findNearbyChildcare(aptLon, aptLat, 800);

  // Step 7: School score
  const schoolRows = await db.execute(sql`
    SELECT COALESCE(AVG(CAST(achievement_score AS REAL)), 0) AS "avgScore"
    FROM schools
    WHERE ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint(${aptLon}, ${aptLat}), 4326)::geography,
      1500
    )
  `);
  const avgSchoolScore = Number(
    (schoolRows[0] as Record<string, unknown>)?.avgScore ?? 0,
  );

  // Step 8: Safety from batch map
  const safetyData = row.regionCode
    ? ctx.regionSafetyMap.get(row.regionCode)
    : undefined;

  // Step 9: Commute times
  const commute1 =
    !ctx.job1
      ? { timeMinutes: 0 }
      : await getCommuteTime({
          aptId: row.id,
          aptLon,
          aptLat,
          destLon: ctx.job1.lng,
          destLat: ctx.job1.lat,
          destLabel: ctx.job1.label,
        });

  let commute2Time = 0;
  if (ctx.job2) {
    const c2 = await getCommuteTime({
      aptId: row.id,
      aptLon,
      aptLat,
      destLon: ctx.job2.lng,
      destLat: ctx.job2.lat,
      destLabel: ctx.job2.label,
    });
    commute2Time = c2.timeMinutes;
  }

  // Step 10: Scoring
  const monthlyCost = estimateApartmentMonthlyCost(
    row.averagePrice ?? 0,
    ctx.cash,
    ctx.tradeType,
    {
      monthlyRent:
        ctx.tradeType === 'monthly' ? (row.monthlyRentAvg ?? 0) : undefined,
      loanProgram: ctx.loanProgram,
    },
  );

  const scoringInput: ScoringInput = {
    apartmentPrice: row.averagePrice ?? 0,
    maxPrice: ctx.maxPrice,
    commuteTime1: commute1.timeMinutes,
    commuteTime2: commute2Time,
    childcareCount800m: childcareItems.length,
    crimeLevel: safetyData?.crimeLevel ?? 5,
    cctvDensity: safetyData?.cctvDensity ?? 2,
    shelterCount: safetyData?.shelterCount ?? 3,
    achievementScore: avgSchoolScore,
    householdCount: row.householdCount,
  };

  const result = calculateFinalScore(scoringInput, ctx.weightProfile, ctx.customWeights);

  return {
    score: result.finalScore,
    item: {
      rank: 0,
      aptId: row.id,
      aptName: row.aptName,
      address: row.address,
      lat: aptLat,
      lng: aptLon,
      tradeType: ctx.tradeType,
      averagePrice: row.averagePrice ?? 0,
      representativeArea: row.representativeArea,
      householdCount: row.householdCount,
      areaMin: row.areaMin,
      areaMax: row.areaMax,
      monthlyRentAvg: row.monthlyRentAvg,
      builtYear: row.builtYear,
      monthlyCost: Math.round(monthlyCost),
      commuteTime1: commute1.timeMinutes,
      commuteTime2: ctx.job2 ? commute2Time : null,
      childcareCount: childcareItems.length,
      schoolScore: Math.round(avgSchoolScore),
      safetyScore:
        Math.round((result.dimensions.safety + Number.EPSILON) * 100) / 100,
      finalScore: result.finalScore,
      reason: result.reason,
      whyNot: result.whyNot || null,
      dimensions: {
        budget: Math.round(result.dimensions.budget * 100) / 100,
        commute: Math.round(result.dimensions.commute * 100) / 100,
        childcare: Math.round(result.dimensions.childcare * 100) / 100,
        safety: Math.round(result.dimensions.safety * 100) / 100,
        school: Math.round(result.dimensions.school * 100) / 100,
        complexScale:
          Math.round(result.dimensions.complexScale * 100) / 100,
      },
      sources: {
        priceDate: `${row.priceYear ?? 2026}-${String(row.priceMonth ?? 1).padStart(2, '0')}`,
        safetyDate: safetyData?.dataDate ?? '데이터 없음',
      },
    },
  };
}

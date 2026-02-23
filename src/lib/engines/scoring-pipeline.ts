import { calculateFinalScore } from '@/lib/engines/scoring';
import { estimateApartmentMonthlyCost } from '@/lib/engines/budget';
import { enrichCandidates } from '@/lib/engines/enrich-candidates';
import type { CandidateEnrichment } from '@/lib/engines/enrich-candidates';
import type { CandidateRow } from '@/lib/queries/fetch-candidates';
import type { RegionSafetyData } from '@/lib/queries/fetch-safety';
import type { RecommendationItem, TradeType } from '@/types/api';
import type { ScoringInput, WeightProfileKey, LoanProgramKey, CustomWeights } from '@/types/engine';

/**
 * Scoring pipeline: enriches candidate apartments with spatial/commute/safety data
 * and computes final weighted scores.
 *
 * V2: Batch enrichment (4 DB queries total) replaces N+1 per-candidate queries.
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

// --- Main pipeline ---

/**
 * Score all candidate apartments using batch enrichment.
 * Runs 4 DB queries total for all candidates, then scores in pure JS.
 */
export async function scoreCandidates(
  input: ScoringPipelineInput,
): Promise<ScoredCandidate[]> {
  const enrichmentMap = await enrichCandidates(
    input.candidates,
    input.job1,
    input.job2,
  );

  return input.candidates.map((row) =>
    scoreFromEnrichmentRow(row, enrichmentMap.get(row.id), input),
  );
}

/**
 * Score candidates from a pre-built enrichment map (no DB calls).
 * Used by budget-sensitivity to reuse enrichment across 5 budget levels.
 */
export function scoreFromEnrichment(
  candidates: ReadonlyArray<CandidateRow>,
  enrichmentMap: ReadonlyMap<number, CandidateEnrichment>,
  ctx: Omit<ScoringPipelineInput, 'candidates'>,
): ScoredCandidate[] {
  return candidates.map((row) =>
    scoreFromEnrichmentRow(row, enrichmentMap.get(row.id), ctx),
  );
}

// Re-export for budget-sensitivity to call enrichCandidates directly
export type { CandidateEnrichment };

// --- Internal ---

function scoreFromEnrichmentRow(
  row: CandidateRow,
  enrichment: CandidateEnrichment | undefined,
  ctx: Omit<ScoringPipelineInput, 'candidates'>,
): ScoredCandidate {
  const childcareCount = enrichment?.childcareCount ?? 0;
  const avgSchoolScore = enrichment?.avgSchoolScore ?? 0;
  const commuteTime1 = enrichment?.commuteTime1 ?? 0;
  const commuteTime2 = enrichment?.commuteTime2 ?? 0;

  // Safety from batch map
  const safetyData = row.regionCode
    ? ctx.regionSafetyMap.get(row.regionCode)
    : undefined;

  // Monthly cost
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
    commuteTime1,
    commuteTime2,
    childcareCount800m: childcareCount,
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
      lat: row.latitude,
      lng: row.longitude,
      tradeType: ctx.tradeType,
      averagePrice: row.averagePrice ?? 0,
      representativeArea: row.representativeArea,
      householdCount: row.householdCount,
      areaMin: row.areaMin,
      areaMax: row.areaMax,
      monthlyRentAvg: row.monthlyRentAvg,
      builtYear: row.builtYear,
      monthlyCost: Math.round(monthlyCost),
      commuteTime1,
      commuteTime2: ctx.job2 ? commuteTime2 : null,
      childcareCount,
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

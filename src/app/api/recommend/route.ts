import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isRateLimited, getClientIp } from '@/lib/rate-limit';
import { recommendRequestSchema } from '@/lib/validators/recommend';
import { calculateBudget, estimateApartmentMonthlyCost } from '@/lib/engines/budget';
import { geocodeAddress } from '@/etl/adapters/kakao-geocoding';
import { diversityRerank, DEFAULT_TOP_K } from '@/lib/engines/diversity';
import { fetchCandidateApartments } from '@/lib/queries/fetch-candidates';
import { batchFetchSafetyByRegions } from '@/lib/queries/fetch-safety';
import { scoreCandidates } from '@/lib/engines/scoring-pipeline';
import type { GeocodedDestination } from '@/lib/engines/scoring-pipeline';
import {
  invalidJsonError,
  validationError,
  addressNotFoundError,
  rateLimitedError,
  internalError,
  logPipelineError,
} from '@/lib/handlers/api-error';
import type { RecommendResponse, ApiErrorResponse, SortOrders } from '@/types/api';
import type { WeightProfileKey, LoanProgramKey } from '@/types/engine';

/**
 * POST /api/recommend — 10-step analysis pipeline.
 * Returns apartments ranked by weighted score.
 *
 * Source of Truth: M2 spec Section 6.1
 * NOTE: "분석 결과" used instead of "추천" (PHASE0 S4 compliance)
 */

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RecommendResponse | ApiErrorResponse>> {
  // Rate limit: 10 requests / minute per IP
  if (isRateLimited(`recommend:${getClientIp(request)}`, 10)) {
    return rateLimitedError();
  }

  // Step 1: Parse request body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return invalidJsonError();
  }

  // Step 2: Zod validation
  const parsed = recommendRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const details = parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return validationError(details);
  }

  const input = parsed.data;

  try {
    // Step 3: Geocode job addresses
    const job1Result = input.job1Remote ? null : await geocodeAddress(input.job1);
    const job2Result = input.job2Remote
      ? null
      : input.job2
        ? await geocodeAddress(input.job2)
        : null;

    if (!input.job1Remote && !job1Result) {
      return addressNotFoundError('직장1');
    }
    if (!input.job2Remote && input.job2 && !job2Result) {
      return addressNotFoundError('직장2');
    }

    // Step 4: Budget calculation (policy-based, 2-axis)
    const budget = calculateBudget({
      cash: input.cash,
      income: input.income,
      loans: input.loans,
      monthlyBudget: input.monthlyBudget,
      tradeType: input.tradeType,
      budgetProfile: input.budgetProfile,
      loanProgram: input.loanProgram,
    });

    // Step 5: Fetch candidate apartments within budget
    const candidateRows = await fetchCandidateApartments({
      tradeType: input.tradeType,
      maxPrice: budget.maxPrice,
      desiredAreas: input.desiredAreas,
    });

    if (candidateRows.length === 0) {
      return NextResponse.json(emptyResponse());
    }

    // Monthly: pre-filter by monthlyBudget
    const candidatesForScoring =
      input.tradeType === 'monthly'
        ? candidateRows.filter((row) => {
            const monthlyCost = estimateApartmentMonthlyCost(
              row.averagePrice ?? 0,
              input.cash,
              'monthly',
              { monthlyRent: row.monthlyRentAvg ?? 0, loanProgram: input.loanProgram },
            );
            return monthlyCost <= input.monthlyBudget;
          })
        : candidateRows;

    if (candidatesForScoring.length === 0) {
      return NextResponse.json(emptyResponse());
    }

    // Step 5.5: Batch safety data query
    const uniqueRegionCodes = [
      ...new Set(candidatesForScoring.map((r) => r.regionCode).filter(Boolean)),
    ] as string[];
    const regionSafetyMap = await batchFetchSafetyByRegions(uniqueRegionCodes);

    // Step 6-10: Score candidates (parallelized)
    const job1Dest: GeocodedDestination | null = job1Result
      ? { lng: job1Result.coordinate.lng, lat: job1Result.coordinate.lat, label: input.job1 }
      : null;
    const job2Dest: GeocodedDestination | null = job2Result
      ? { lng: job2Result.coordinate.lng, lat: job2Result.coordinate.lat, label: input.job2 ?? '' }
      : null;

    const scoredCandidates = await scoreCandidates({
      candidates: candidatesForScoring,
      regionSafetyMap,
      job1: job1Dest,
      job2: job2Dest,
      tradeType: input.tradeType,
      cash: input.cash,
      maxPrice: budget.maxPrice,
      weightProfile: input.weightProfile as WeightProfileKey,
      loanProgram: input.loanProgram as LoanProgramKey,
    });

    // Sort by score descending, then apply diversity reranking for value_maximized
    scoredCandidates.sort((a, b) => b.score - a.score);

    let finalCandidates: typeof scoredCandidates;

    if (input.weightProfile === 'value_maximized' && scoredCandidates.length > DEFAULT_TOP_K) {
      const wrapped = scoredCandidates.map((c) => ({
        score: c.score,
        price: c.item.averagePrice,
        item: c,
      }));
      const diverse = diversityRerank(wrapped, budget.maxPrice);
      const diverseSet = new Set(diverse.map((d) => d.item));
      const rest = scoredCandidates.filter((c) => !diverseSet.has(c));
      finalCandidates = [...diverse.map((d) => d.item), ...rest];
    } else {
      finalCandidates = scoredCandidates;
    }

    const ranked = finalCandidates.map((c, idx) => ({
      ...c.item,
      rank: idx + 1,
    }));

    // Build server-side sort orders (aptId arrays for each sort mode)
    const byScore = ranked.map((r) => r.aptId);
    const byBudget = [...ranked]
      .sort((a, b) => (b.dimensions.budget - a.dimensions.budget) || (b.finalScore - a.finalScore))
      .map((r) => r.aptId);
    const byCommute = [...ranked]
      .sort((a, b) => (b.dimensions.commute - a.dimensions.commute) || (b.finalScore - a.finalScore))
      .map((r) => r.aptId);

    const sortOrders: SortOrders = {
      score: byScore,
      budget: byBudget,
      commute: byCommute,
    };

    const response: RecommendResponse = {
      recommendations: ranked,
      meta: {
        totalCandidates: candidatesForScoring.length,
        computedAt: new Date().toISOString(),
        sortOrders,
      },
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    logPipelineError('recommend_error', input.tradeType, err);
    return internalError();
  }
}

// --- Helpers ---

function emptyResponse(): RecommendResponse {
  return {
    recommendations: [],
    meta: {
      totalCandidates: 0,
      computedAt: new Date().toISOString(),
    },
  };
}

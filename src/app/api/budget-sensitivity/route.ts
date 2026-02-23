import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isRateLimited, getClientIp } from '@/lib/rate-limit';
import { recommendRequestSchema } from '@/lib/validators/recommend';
import { calculateBudget, estimateApartmentMonthlyCost } from '@/lib/engines/budget';
import { geocodeAddress } from '@/etl/adapters/kakao-geocoding';
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
import type {
  BudgetSensitivityResponse,
  BudgetLevelResult,
  ApiErrorResponse,
} from '@/types/api';
import type { WeightProfileKey, LoanProgramKey, CustomWeights } from '@/types/engine';

/**
 * POST /api/budget-sensitivity
 * Returns Top10 results for 5 budget levels (±2500만, ±5000만 from base).
 * Fetches candidates once at the highest budget, then re-scores per level.
 *
 * Source of Truth: PHASE2 enhance-proptech-features plan
 */

export const dynamic = 'force-dynamic';

const DEFAULT_OFFSETS = [-5000, -2500, 0, 2500, 5000];
const TOP_K = 10;

export async function POST(
  request: NextRequest,
): Promise<NextResponse<BudgetSensitivityResponse | ApiErrorResponse>> {
  if (isRateLimited(`budget-sensitivity:${getClientIp(request)}`, 5)) {
    return rateLimitedError();
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return invalidJsonError();
  }

  const parsed = recommendRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const details = parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return validationError(details);
  }

  const input = parsed.data;
  const offsets = DEFAULT_OFFSETS;

  try {
    // Geocode job addresses
    const job1Result = input.job1Remote ? null : await geocodeAddress(input.job1);
    const job2Result = input.job2Remote
      ? null
      : input.job2
        ? await geocodeAddress(input.job2)
        : null;

    if (!input.job1Remote && !job1Result) return addressNotFoundError('직장1');
    if (!input.job2Remote && input.job2 && !job2Result) return addressNotFoundError('직장2');

    // Calculate budget at highest offset to get widest candidate pool
    const maxOffset = Math.max(...offsets);
    const highBudget = calculateBudget({
      cash: input.cash + maxOffset,
      income: input.income,
      loans: input.loans,
      monthlyBudget: input.monthlyBudget,
      tradeType: input.tradeType,
      budgetProfile: input.budgetProfile,
      loanProgram: input.loanProgram,
    });

    // Fetch candidates with the highest budget
    const candidateRows = await fetchCandidateApartments({
      tradeType: input.tradeType,
      maxPrice: highBudget.maxPrice,
      desiredAreas: input.desiredAreas,
      candidateLimit: 300,
    });

    if (candidateRows.length === 0) {
      return NextResponse.json({
        levels: offsets.map((offset) => ({
          offset,
          adjustedCash: input.cash + offset,
          top: [],
          entered: [],
          exited: [],
        })),
        meta: { totalCandidates: 0, computedAt: new Date().toISOString() },
      });
    }

    // Batch safety data
    const uniqueRegionCodes = [
      ...new Set(candidateRows.map((r) => r.regionCode).filter(Boolean)),
    ] as string[];
    const regionSafetyMap = await batchFetchSafetyByRegions(uniqueRegionCodes);

    const job1Dest: GeocodedDestination | null = job1Result
      ? { lng: job1Result.coordinate.lng, lat: job1Result.coordinate.lat, label: input.job1 }
      : null;
    const job2Dest: GeocodedDestination | null = job2Result
      ? { lng: job2Result.coordinate.lng, lat: job2Result.coordinate.lat, label: input.job2 ?? '' }
      : null;

    // Helper: score one budget level and return its top-K result
    async function scoreAtOffset(offset: number) {
      const adjustedCash = Math.max(0, input.cash + offset);
      const budget = calculateBudget({
        cash: adjustedCash,
        income: input.income,
        loans: input.loans,
        monthlyBudget: input.monthlyBudget,
        tradeType: input.tradeType,
        budgetProfile: input.budgetProfile,
        loanProgram: input.loanProgram,
      });

      const filtered =
        input.tradeType === 'monthly'
          ? candidateRows.filter((row) => {
              if ((row.averagePrice ?? 0) > budget.maxPrice) return false;
              const monthlyCost = estimateApartmentMonthlyCost(
                row.averagePrice ?? 0,
                adjustedCash,
                'monthly',
                { monthlyRent: row.monthlyRentAvg ?? 0, loanProgram: input.loanProgram },
              );
              return monthlyCost <= input.monthlyBudget;
            })
          : candidateRows.filter(
              (row) => (row.averagePrice ?? 0) <= budget.maxPrice,
            );

      if (filtered.length === 0) {
        return { offset, adjustedCash, topK: [], topIds: new Set<number>() };
      }

      const scored = await scoreCandidates({
        candidates: filtered,
        regionSafetyMap,
        job1: job1Dest,
        job2: job2Dest,
        tradeType: input.tradeType,
        cash: adjustedCash,
        maxPrice: budget.maxPrice,
        weightProfile: input.weightProfile as WeightProfileKey,
        loanProgram: input.loanProgram as LoanProgramKey,
        customWeights: input.customWeights as CustomWeights | undefined,
      });

      scored.sort((a, b) => b.score - a.score);
      const topK = scored.slice(0, TOP_K);
      const topIds = new Set(topK.map((c) => c.item.aptId));

      return { offset, adjustedCash, topK, topIds };
    }

    // Pass 1: score base level (offset=0) first to establish reference Top-K
    const baseResult = await scoreAtOffset(0);
    const baseTopIds = baseResult.topIds;

    // Pass 2: score all offsets and compute entered/exited against the base
    const levels: BudgetLevelResult[] = [];

    for (const offset of offsets) {
      const result = offset === 0 ? baseResult : await scoreAtOffset(offset);

      const entered = offset === 0 ? [] : [...result.topIds].filter((id) => !baseTopIds.has(id));
      const exited = offset === 0 ? [] : [...baseTopIds].filter((id) => !result.topIds.has(id));

      levels.push({
        offset,
        adjustedCash: result.adjustedCash,
        top: result.topK.map((c) => ({
          aptId: c.item.aptId,
          aptName: c.item.aptName,
          finalScore: c.item.finalScore,
          averagePrice: c.item.averagePrice,
        })),
        entered,
        exited,
      });
    }

    return NextResponse.json({
      levels,
      meta: {
        totalCandidates: candidateRows.length,
        computedAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    logPipelineError('budget_sensitivity_error', input.tradeType, err);
    return internalError();
  }
}

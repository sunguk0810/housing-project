import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isRateLimited, getClientIp } from '@/lib/rate-limit';
import { desc, sql, inArray } from 'drizzle-orm';
import pLimit from 'p-limit';
import { db } from '@/db/connection';
import { safetyStats } from '@/db/schema';
import { recommendRequestSchema } from '@/lib/validators/recommend';
import { calculateBudget, estimateApartmentMonthlyCost } from '@/lib/engines/budget';
import { calculateFinalScore } from '@/lib/engines/scoring';
import { findNearbyChildcare } from '@/lib/engines/spatial';
import { getCommuteTime } from '@/lib/engines/commute';
import { geocodeAddress } from '@/etl/adapters/kakao-geocoding';
import type { RecommendResponse, RecommendationItem, ApiErrorResponse } from '@/types/api';
import type { ScoringInput, WeightProfileKey } from '@/types/engine';

/**
 * POST /api/recommend — 10-step analysis pipeline.
 * Returns top-10 apartments ranked by weighted score.
 *
 * Source of Truth: M2 spec Section 6.1
 * NOTE: "분석 결과" used instead of "추천" (PHASE0 S4 compliance)
 */

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RecommendResponse | ApiErrorResponse>> {
  // Rate limit: 10 requests / minute per IP (heavy pipeline — geocoding + DB + scoring)
  if (isRateLimited(`recommend:${getClientIp(request)}`, 10)) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMITED' as const,
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        },
      },
      { status: 429 },
    );
  }

  // Step 1: Parse request body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_JSON' as const,
          message: '요청 본문이 올바른 JSON이 아닙니다.',
        },
      },
      { status: 400 },
    );
  }

  // Step 2: Zod validation
  const parsed = recommendRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const details = parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR' as const,
          message: '입력값 검증에 실패했습니다.',
          details,
        },
      },
      { status: 400 },
    );
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
      return NextResponse.json(
        {
          error: {
            code: 'ADDRESS_NOT_FOUND' as const,
            message:
              '직장1 주소를 찾을 수 없습니다. 주소를 더 상세히 입력해주세요. (예: 서울 강남구 역삼동)',
          },
        },
        { status: 400 },
      );
    }

    if (!input.job2Remote && input.job2 && !job2Result) {
      return NextResponse.json(
        {
          error: {
            code: 'ADDRESS_NOT_FOUND' as const,
            message:
              '직장2 주소를 찾을 수 없습니다. 주소를 더 상세히 입력해주세요. (예: 서울 강남구 역삼동)',
          },
        },
        { status: 400 },
      );
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

    // Step 5: Spatial filter — apartments within budget
    // Fix 3: Filter recent prices (last 2 years)
    const minYear = new Date().getFullYear() - 2;
    const candidateLimit = 200;

    const rawCandidateRows = (await db.execute(sql`
      SELECT
        "apartments"."id",
        "apartments"."apt_code" AS "aptCode",
        "apartments"."apt_name" AS "aptName",
        "apartments"."address" AS "address",
        "apartments"."region_code" AS "regionCode",
        ST_X("apartments"."location"::geometry) AS "longitude",
        ST_Y("apartments"."location"::geometry) AS "latitude",
        "apartments"."built_year" AS "builtYear",
        "apartments"."household_count" AS "householdCount",
        "apartments"."area_min" AS "areaMin",
        "latest_price_per_apt"."average_price" AS "averagePrice",
        "latest_price_per_apt"."monthly_rent_avg" AS "monthlyRentAvg",
        "latest_price_per_apt"."deal_count" AS "dealCount",
        "latest_price_per_apt"."year" AS "priceYear",
        "latest_price_per_apt"."month" AS "priceMonth"
      FROM "apartments"
      INNER JOIN (
        SELECT
          "latest_row"."apt_id",
          "latest_row"."average_price",
          "latest_row"."monthly_rent_avg",
          "latest_row"."deal_count",
          "latest_row"."year",
          "latest_row"."month"
        FROM "apartment_prices" AS "latest_row"
        INNER JOIN (
          SELECT
            "apartment_prices"."apt_id",
            MAX(("apartment_prices"."year" * 100 + "apartment_prices"."month")::int4) AS "yearMonth"
          FROM "apartment_prices"
          WHERE
            "apartment_prices"."trade_type" = ${input.tradeType}
            AND "apartment_prices"."average_price" <= ${budget.maxPrice}
            AND "apartment_prices"."year" >= ${minYear}
          GROUP BY "apartment_prices"."apt_id"
        ) AS "latest_meta"
          ON "latest_meta"."apt_id" = "latest_row"."apt_id"
          AND ("latest_row"."year" * 100 + "latest_row"."month") = "latest_meta"."yearMonth"
          AND "latest_row"."trade_type" = ${input.tradeType}
          AND "latest_row"."average_price" <= ${budget.maxPrice}
          AND "latest_row"."year" >= ${minYear}
      ) AS "latest_price_per_apt"
        ON "apartments"."id" = "latest_price_per_apt"."apt_id"
      LIMIT ${candidateLimit}
    `)) as Array<{
      id: number;
      aptCode: string;
      aptName: string;
      address: string;
      regionCode: string | null;
      longitude: number;
      latitude: number;
      builtYear: number | null;
      householdCount: number | null;
      areaMin: number | null;
      averagePrice: string | number | null;
      monthlyRentAvg: string | number | null;
      dealCount: number | null;
      priceYear: number | null;
      priceMonth: number | null;
    }>;

    // Fix 2: LIMIT 200 for broader candidate pool (safe with batch safety query)
    const candidateRows = rawCandidateRows.map((r) => ({
      id: Number(r.id),
      aptCode: r.aptCode,
      aptName: r.aptName,
      address: r.address,
      regionCode: r.regionCode,
      longitude: Number(r.longitude),
      latitude: Number(r.latitude),
      builtYear: r.builtYear === null ? null : Number(r.builtYear),
      householdCount: r.householdCount === null ? null : Number(r.householdCount),
      areaMin: r.areaMin === null ? null : Number(r.areaMin),
      averagePrice: r.averagePrice,
      monthlyRentAvg: r.monthlyRentAvg,
      dealCount: r.dealCount === null ? null : Number(r.dealCount),
      priceYear: r.priceYear === null ? null : Number(r.priceYear),
      priceMonth: r.priceMonth === null ? null : Number(r.priceMonth),
    }));

    if (candidateRows.length === 0) {
      return NextResponse.json({
        recommendations: [],
        meta: {
          totalCandidates: 0,
          computedAt: new Date().toISOString(),
        },
      });
    }

    // Monthly: pre-filter by monthlyBudget using (rent + financed deposit / 24m)
    const candidatesForScoring =
      input.tradeType === 'monthly'
        ? candidateRows.filter((row) => {
            const deposit = Number(row.averagePrice ?? 0);
            const rent = Number(row.monthlyRentAvg ?? 0);
            const monthlyCost = estimateApartmentMonthlyCost(deposit, input.cash, 'monthly', {
              monthlyRent: rent,
            });
            return monthlyCost <= input.monthlyBudget;
          })
        : candidateRows;

    if (candidatesForScoring.length === 0) {
      return NextResponse.json({
        recommendations: [],
        meta: {
          totalCandidates: 0,
          computedAt: new Date().toISOString(),
        },
      });
    }

    // Step 5.5: Batch safety query (Fix 5 — eliminates N+1)
    const uniqueRegionCodes = [
      ...new Set(candidatesForScoring.map((r) => r.regionCode).filter(Boolean)),
    ] as string[];

    const regionSafetyMap = new Map<string, {
      crimeLevel: number;
      cctvDensity: number;
      shelterCount: number;
      dataDate: string | null;
    }>();

    if (uniqueRegionCodes.length > 0) {
      const safetyBatch = await db
        .selectDistinctOn([safetyStats.regionCode], {
          regionCode: safetyStats.regionCode,
          crimeLevel: sql<number>`COALESCE(CAST(${safetyStats.crimeRate} AS REAL), 5)`,
          cctvDensity: sql<number>`COALESCE(CAST(${safetyStats.cctvDensity} AS REAL), 2)`,
          shelterCount: sql<number>`COALESCE(${safetyStats.shelterCount}, 3)`,
          dataDate: safetyStats.dataDate,
        })
        .from(safetyStats)
        .where(inArray(safetyStats.regionCode, uniqueRegionCodes))
        .orderBy(safetyStats.regionCode, desc(safetyStats.dataDate));

      for (const row of safetyBatch) {
        regionSafetyMap.set(row.regionCode, {
          crimeLevel: row.crimeLevel,
          cctvDensity: row.cctvDensity,
          shelterCount: row.shelterCount,
          dataDate: row.dataDate,
        });
      }
    }

    // Step 6-10: Score each candidate (parallelized with concurrency limit)
    const limit = pLimit(5);

    const scoredCandidates = await Promise.all(
      candidatesForScoring.map((row) =>
        limit(async (): Promise<{ item: RecommendationItem; score: number }> => {
          const aptId = row.id;
          const aptLon = row.longitude;
          const aptLat = row.latitude;

          // Step 6: Childcare within 800m
          const childcareItems = await findNearbyChildcare(aptLon, aptLat, 800);

          // Step 7: School score — simplified to average nearby school scores
          const schoolRows = await db.execute(sql`
            SELECT COALESCE(AVG(CAST(achievement_score AS REAL)), 0) AS "avgScore"
            FROM schools
            WHERE ST_DWithin(
              location::geography,
              ST_SetSRID(ST_MakePoint(${aptLon}, ${aptLat}), 4326)::geography,
              1500
            )
          `);
          const avgSchoolScore = Number((schoolRows[0] as Record<string, unknown>)?.avgScore ?? 0);

          // Step 8: Safety — from batch map (Fix 5)
          const safetyData = row.regionCode
            ? regionSafetyMap.get(row.regionCode)
            : undefined;

          // Step 9: Commute times
          const commute1 =
            input.job1Remote || !job1Result
              ? { timeMinutes: 0 }
              : await getCommuteTime({
                  aptId,
                  aptLon,
                  aptLat,
                  destLon: job1Result.coordinate.lng,
                  destLat: job1Result.coordinate.lat,
                  destLabel: input.job1,
                });

          let commute2Time = 0;
          if (!input.job2Remote && job2Result) {
            const c2 = await getCommuteTime({
              aptId,
              aptLon,
              aptLat,
              destLon: job2Result.coordinate.lng,
              destLat: job2Result.coordinate.lat,
              destLabel: input.job2 ?? '',
            });
            commute2Time = c2.timeMinutes;
          }

          // Step 10: Scoring — price utilization + per-apartment monthly cost
          const monthlyCost = estimateApartmentMonthlyCost(
            Number(row.averagePrice),
            input.cash,
            input.tradeType,
            input.tradeType === 'monthly'
              ? { monthlyRent: Number(row.monthlyRentAvg ?? 0) }
              : undefined,
          );
          const scoringInput: ScoringInput = {
            apartmentPrice: Number(row.averagePrice),
            maxPrice: budget.maxPrice,
            commuteTime1: commute1.timeMinutes,
            commuteTime2: commute2Time,
            childcareCount800m: childcareItems.length,
            crimeLevel: safetyData?.crimeLevel ?? 5,
            cctvDensity: safetyData?.cctvDensity ?? 2,
            shelterCount: safetyData?.shelterCount ?? 3,
            achievementScore: avgSchoolScore,
          };

          const result = calculateFinalScore(scoringInput, input.weightProfile as WeightProfileKey);

          return {
            score: result.finalScore,
            item: {
              rank: 0,
              aptId,
              aptName: row.aptName,
              address: row.address,
              lat: aptLat,
              lng: aptLon,
              tradeType: input.tradeType,
              averagePrice: Number(row.averagePrice),
              householdCount: row.householdCount,
              areaMin: row.areaMin,
              monthlyCost: Math.round(monthlyCost),
              commuteTime1: commute1.timeMinutes,
              commuteTime2: job2Result ? commute2Time : null,
              childcareCount: childcareItems.length,
              schoolScore: Math.round(avgSchoolScore),
              safetyScore: Math.round((result.dimensions.safety + Number.EPSILON) * 100) / 100,
              finalScore: result.finalScore,
              reason: result.reason,
              whyNot: result.whyNot || null,
              dimensions: {
                budget: Math.round(result.dimensions.budget * 100) / 100,
                commute: Math.round(result.dimensions.commute * 100) / 100,
                childcare: Math.round(result.dimensions.childcare * 100) / 100,
                safety: Math.round(result.dimensions.safety * 100) / 100,
                school: Math.round(result.dimensions.school * 100) / 100,
              },
              sources: {
                priceDate: `${row.priceYear ?? 2026}-${String(row.priceMonth ?? 1).padStart(2, '0')}`,
                // Fix 5: explicit Korean label for missing safety data
                safetyDate: safetyData?.dataDate ?? '데이터 없음',
              },
            },
          };
        }),
      ),
    );

    // Sort by score descending, take top 10
    scoredCandidates.sort((a, b) => b.score - a.score);
    const top10 = scoredCandidates.slice(0, 10).map((c, idx) => ({
      ...c.item,
      rank: idx + 1,
    }));

    const response: RecommendResponse = {
      recommendations: top10,
      meta: {
        totalCandidates: candidatesForScoring.length,
        computedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const stack = err instanceof Error ? err.stack : undefined;
    const rawErrorCode =
      err && typeof err === 'object' && 'code' in err ? (err as { code?: unknown }).code : undefined;
    const dbErrorCode =
      typeof rawErrorCode === 'string' || typeof rawErrorCode === 'number'
        ? String(rawErrorCode)
        : undefined;
    const rawErrorCause =
      err && typeof err === 'object' && 'cause' in err ? (err as { cause?: unknown }).cause : undefined;
    const dbErrorCause =
      rawErrorCause && typeof rawErrorCause === 'object' && 'message' in rawErrorCause
        ? String((rawErrorCause as { message?: unknown }).message)
        : undefined;
    console.error(
      JSON.stringify({
        event: 'recommend_error',
        tradeType: input.tradeType,
        error: message,
        code: dbErrorCode,
        cause: dbErrorCause,
        stack,
        timestamp: new Date().toISOString(),
      }),
    );

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR' as const,
          message: '서버 내부 오류가 발생했습니다.',
        },
      },
      { status: 500 },
    );
  }
}

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
import { diversityRerank, DEFAULT_TOP_K } from '@/lib/engines/diversity';
import { safeNum } from '@/lib/utils/safe-num';
import type { RecommendResponse, RecommendationItem, ApiErrorResponse, DesiredAreaKey } from '@/types/api';
import type { ScoringInput, WeightProfileKey } from '@/types/engine';

const AREA_RANGES: Record<DesiredAreaKey, { min: number; max: number }> = {
  small: { min: 0, max: 49 },
  medium: { min: 50, max: 69 },
  large: { min: 70, max: 9999 },
};

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
    // Step 5: Spatial filter — apartments within budget
    // Filter recent prices (last 24 months) using CTE with individual trades
    const now = new Date();
    const minDate = new Date(now.getFullYear(), now.getMonth() - 23, 1);
    const minYearMonth = minDate.getFullYear() * 100 + (minDate.getMonth() + 1);
    const candidateLimit = 200;

    // Build area filter SQL fragment — skip when all 3 selected (accuracy guarantee)
    const desiredAreas = input.desiredAreas;
    let areaFilterSql = sql``;
    if (desiredAreas.length < 3) {
      const conditions = desiredAreas.map((key) => {
        const range = AREA_RANGES[key];
        if (key === 'small') {
          // area_max > 0 AND area_min < 50 (or area_min IS NULL)
          return sql`(a.area_max > 0 AND (a.area_min < ${range.max + 1} OR a.area_min IS NULL))`;
        }
        if (key === 'large') {
          // area_max >= 70
          return sql`(a.area_max >= ${range.min})`;
        }
        // medium: area_min < 70 AND area_max >= 50
        return sql`(a.area_min < ${range.max + 1} AND a.area_max >= ${range.min})`;
      });
      // Combine with OR
      areaFilterSql = sql`AND (${sql.join(conditions, sql` OR `)})`;
    }

    const rawCandidateRows = (await db.execute(sql`
      WITH latest_month AS (
        SELECT apt_id,
          MAX(year * 100 + month) as ym
        FROM apartment_prices
        WHERE trade_type = ${input.tradeType}
          AND (year * 100 + month) >= ${minYearMonth}
        GROUP BY apt_id
      ),
      latest_agg AS (
        SELECT
          p.apt_id,
          AVG(p.price::numeric) as average_price,
          AVG(p.monthly_rent::numeric) FILTER (WHERE p.monthly_rent IS NOT NULL) as monthly_rent_avg,
          COUNT(*) as deal_count,
          MAX(p.year) as price_year,
          MAX(p.month) as price_month
        FROM apartment_prices p
        INNER JOIN latest_month lm
          ON p.apt_id = lm.apt_id
          AND (p.year * 100 + p.month) = lm.ym
        WHERE p.trade_type = ${input.tradeType}
        GROUP BY p.apt_id
        HAVING AVG(p.price::numeric) <= ${budget.maxPrice}
      )
      SELECT
        a.id,
        a.apt_code AS "aptCode",
        a.apt_name AS "aptName",
        a.address AS "address",
        a.region_code AS "regionCode",
        ST_X(a.location::geometry) AS "longitude",
        ST_Y(a.location::geometry) AS "latitude",
        a.built_year AS "builtYear",
        a.household_count AS "householdCount",
        a.area_min AS "areaMin",
        a.area_max AS "areaMax",
        la.average_price AS "averagePrice",
        la.monthly_rent_avg AS "monthlyRentAvg",
        la.deal_count AS "dealCount",
        la.price_year AS "priceYear",
        la.price_month AS "priceMonth"
      FROM apartments a
      INNER JOIN latest_agg la ON a.id = la.apt_id
      WHERE 1=1 ${areaFilterSql}
      ORDER BY la.price_year DESC, la.price_month DESC, la.average_price DESC, a.id ASC
      LIMIT ${candidateLimit}
    `)) as Array<{
      id: unknown;
      aptCode: string;
      aptName: string;
      address: string;
      regionCode: string | null;
      longitude: unknown;
      latitude: unknown;
      builtYear: unknown;
      householdCount: unknown;
      areaMin: unknown;
      areaMax: unknown;
      averagePrice: unknown;
      monthlyRentAvg: unknown;
      dealCount: unknown;
      priceYear: number | null;
      priceMonth: number | null;
    }>;

    // [U1+V1] Filter rows with invalid id/coordinates, then safeNum all numeric fields
    const candidateRows = rawCandidateRows
      .filter((r) => {
        const id = Number(r.id);
        const lon = Number(r.longitude);
        const lat = Number(r.latitude);
        const validId = Number.isFinite(id) && id > 0;
        const validCoord = Number.isFinite(lon) && Number.isFinite(lat)
          && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
        if (!validId || !validCoord) {
          console.error(JSON.stringify({
            event: 'recommend_invalid_row',
            rawId: r.id, rawLon: r.longitude, rawLat: r.latitude,
            reason: !validId ? 'invalid_id' : 'invalid_coord',
          }));
          return false;
        }
        return true;
      })
      .map((r) => ({
        id: Number(r.id),
        aptCode: r.aptCode,
        aptName: r.aptName,
        address: r.address,
        regionCode: r.regionCode,
        longitude: Number(r.longitude),
        latitude: Number(r.latitude),
        builtYear: safeNum(r.builtYear),
        householdCount: safeNum(r.householdCount),
        areaMin: safeNum(r.areaMin),
        areaMax: safeNum(r.areaMax),
        averagePrice: safeNum(r.averagePrice),
        monthlyRentAvg: safeNum(r.monthlyRentAvg),
        dealCount: safeNum(r.dealCount),
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
            const deposit = row.averagePrice ?? 0;
            const rent = row.monthlyRentAvg ?? 0;
            const monthlyCost = estimateApartmentMonthlyCost(deposit, input.cash, 'monthly', {
              monthlyRent: rent,
              loanProgram: input.loanProgram,
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
            row.averagePrice ?? 0,
            input.cash,
            input.tradeType,
            {
              monthlyRent: input.tradeType === 'monthly' ? (row.monthlyRentAvg ?? 0) : undefined,
              loanProgram: input.loanProgram,
            },
          );
          const scoringInput: ScoringInput = {
            apartmentPrice: row.averagePrice ?? 0,
            maxPrice: budget.maxPrice,
            commuteTime1: commute1.timeMinutes,
            commuteTime2: commute2Time,
            childcareCount800m: childcareItems.length,
            crimeLevel: safetyData?.crimeLevel ?? 5,
            cctvDensity: safetyData?.cctvDensity ?? 2,
            shelterCount: safetyData?.shelterCount ?? 3,
            achievementScore: avgSchoolScore,
            householdCount: row.householdCount,
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
              averagePrice: row.averagePrice ?? 0,
              householdCount: row.householdCount,
              areaMin: row.areaMin,
              areaMax: row.areaMax,
              monthlyRentAvg: row.monthlyRentAvg,
              builtYear: row.builtYear,
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
                complexScale: Math.round(result.dimensions.complexScale * 100) / 100,
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

    const response: RecommendResponse = {
      recommendations: ranked,
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
        ...(process.env.NODE_ENV !== 'production' && stack ? { stack } : {}),
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

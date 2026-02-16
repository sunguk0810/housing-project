import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq, lte, desc, and, sql } from "drizzle-orm";
import { db } from "@/db/connection";
import { apartments, apartmentPrices, safetyStats } from "@/db/schema";
import { recommendRequestSchema } from "@/lib/validators/recommend";
import { calculateBudget } from "@/lib/engines/budget";
import { calculateFinalScore } from "@/lib/engines/scoring";
import { findNearbyChildcare } from "@/lib/engines/spatial";
import { getCommuteTime } from "@/lib/engines/commute";
import { geocodeAddress } from "@/etl/adapters/kakao-geocoding";
import type {
  RecommendResponse,
  RecommendationItem,
  ApiErrorResponse,
} from "@/types/api";
import type { ScoringInput, WeightProfileKey } from "@/types/engine";

/**
 * POST /api/recommend — 10-step analysis pipeline.
 * Returns top-10 apartments ranked by weighted score.
 *
 * Source of Truth: M2 spec Section 6.1
 * NOTE: "분석 결과" used instead of "추천" (PHASE0 S4 compliance)
 */

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<RecommendResponse | ApiErrorResponse>> {
  // Step 1: Parse request body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_JSON" as const,
          message: "요청 본문이 올바른 JSON이 아닙니다.",
        },
      },
      { status: 400 },
    );
  }

  // Step 2: Zod validation
  const parsed = recommendRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const details = parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR" as const,
          message: "입력값 검증에 실패했습니다.",
          details,
        },
      },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    // Step 3: Geocode job addresses
    const job1Result = await geocodeAddress(input.job1);
    const job2Result = input.job2
      ? await geocodeAddress(input.job2)
      : null;

    if (!job1Result) {
      return NextResponse.json(
        {
          error: {
            code: "ADDRESS_NOT_FOUND" as const,
            message: "직장1 주소를 좌표로 변환할 수 없습니다.",
          },
        },
        { status: 400 },
      );
    }

    // Step 4: Budget calculation
    const budget = calculateBudget({
      cash: input.cash,
      income: input.income,
      loans: input.loans,
      monthlyBudget: input.monthlyBudget,
      tradeType: input.tradeType,
    });

    // Step 5: Spatial filter — apartments within budget
    const candidateRows = await db
      .select({
        id: apartments.id,
        aptCode: apartments.aptCode,
        aptName: apartments.aptName,
        address: apartments.address,
        longitude: sql<number>`ST_X(${apartments.location}::geometry)`,
        latitude: sql<number>`ST_Y(${apartments.location}::geometry)`,
        builtYear: apartments.builtYear,
        averagePrice: apartmentPrices.averagePrice,
        dealCount: apartmentPrices.dealCount,
        priceYear: apartmentPrices.year,
        priceMonth: apartmentPrices.month,
      })
      .from(apartments)
      .innerJoin(apartmentPrices, eq(apartments.id, apartmentPrices.aptId))
      .where(
        and(
          eq(apartmentPrices.tradeType, input.tradeType),
          lte(sql<number>`CAST(${apartmentPrices.averagePrice} AS INTEGER)`, budget.maxPrice),
        ),
      )
      .orderBy(desc(apartmentPrices.averagePrice))
      .limit(50);

    if (candidateRows.length === 0) {
      return NextResponse.json({
        recommendations: [],
        meta: {
          totalCandidates: 0,
          computedAt: new Date().toISOString(),
        },
      });
    }

    // Step 6-10: Score each candidate
    const scoredCandidates: Array<{
      item: RecommendationItem;
      score: number;
    }> = [];

    for (const row of candidateRows) {
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
      const avgSchoolScore = Number(
        (schoolRows[0] as Record<string, unknown>)?.avgScore ?? 0,
      );

      // Step 8: Safety mapping
      const safetyRows = await db
        .select({
          crimeLevel: sql<number>`COALESCE(CAST(${safetyStats.crimeRate} AS REAL), 5)`,
          cctvDensity: sql<number>`COALESCE(CAST(${safetyStats.cctvDensity} AS REAL), 2)`,
          shelterCount: sql<number>`COALESCE(${safetyStats.shelterCount}, 3)`,
          dataDate: safetyStats.dataDate,
        })
        .from(safetyStats)
        .limit(1);

      const safetyData = safetyRows[0];

      // Step 9: Commute times
      const commute1 = await getCommuteTime({
        aptId,
        aptLon,
        aptLat,
        destLon: job1Result.coordinate.lng,
        destLat: job1Result.coordinate.lat,
        destLabel: input.job1,
      });

      let commute2Time = 0;
      if (job2Result) {
        const c2 = await getCommuteTime({
          aptId,
          aptLon,
          aptLat,
          destLon: job2Result.coordinate.lng,
          destLat: job2Result.coordinate.lat,
          destLabel: input.job2 ?? "",
        });
        commute2Time = c2.timeMinutes;
      }

      // Step 10: Scoring
      const monthlyCost = budget.estimatedMonthlyCost;
      const scoringInput: ScoringInput = {
        maxBudget: input.monthlyBudget,
        monthlyCost,
        commuteTime1: commute1.timeMinutes,
        commuteTime2: commute2Time,
        childcareCount800m: childcareItems.length,
        crimeLevel: safetyData?.crimeLevel ?? 5,
        cctvDensity: safetyData?.cctvDensity ?? 2,
        shelterCount: safetyData?.shelterCount ?? 3,
        achievementScore: avgSchoolScore,
      };

      const result = calculateFinalScore(
        scoringInput,
        input.weightProfile as WeightProfileKey,
      );

      scoredCandidates.push({
        score: result.finalScore,
        item: {
          rank: 0, // Will be set after sorting
          aptId,
          aptName: row.aptName,
          address: row.address,
          lat: aptLat,
          lng: aptLon,
          monthlyCost: Math.round(monthlyCost),
          commuteTime1: commute1.timeMinutes,
          commuteTime2: job2Result ? commute2Time : null,
          childcareCount: childcareItems.length,
          schoolScore: Math.round(avgSchoolScore),
          safetyScore:
            Math.round(
              (result.dimensions.safety + Number.EPSILON) * 100,
            ) / 100,
          finalScore: result.finalScore,
          reason: result.reason,
          whyNot: result.whyNot || null,
          sources: {
            priceDate: `${row.priceYear ?? 2026}-${String(row.priceMonth ?? 1).padStart(2, "0")}`,
            safetyDate: safetyData?.dataDate ?? "N/A",
          },
        },
      });
    }

    // Sort by score descending, take top 10
    scoredCandidates.sort((a, b) => b.score - a.score);
    const top10 = scoredCandidates.slice(0, 10).map((c, idx) => ({
      ...c.item,
      rank: idx + 1,
    }));

    const response: RecommendResponse = {
      recommendations: top10,
      meta: {
        totalCandidates: candidateRows.length,
        computedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    console.error(
      JSON.stringify({
        event: "recommend_error",
        error: message,
        timestamp: new Date().toISOString(),
      }),
    );

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR" as const,
          message: "서버 내부 오류가 발생했습니다.",
        },
      },
      { status: 500 },
    );
  }
}

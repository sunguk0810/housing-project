import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sql as sqlTag } from "drizzle-orm";
import { db } from "@/db/connection";
import { apartmentIdSchema } from "@/lib/validators/apartment";
import { findNearbyChildcare, findNearbySchools, findNearestGrid } from "@/lib/engines/spatial";
import type {
  ApartmentDetailResponse,
  ApiErrorResponse,
} from "@/types/api";

/**
 * GET /api/apartments/[id] — Apartment detail with nearby facilities.
 * Source of Truth: M2 spec Section 6.2
 */

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApartmentDetailResponse | ApiErrorResponse>> {
  // Step 1: Validate ID parameter
  const { id: rawId } = await params;
  const parsed = apartmentIdSchema.safeParse(rawId);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_PARAMETER" as const,
          message: "id는 양의 정수여야 합니다.",
        },
      },
      { status: 400 },
    );
  }

  const aptId = parsed.data;

  try {
    // Step 2: Fetch apartment basic info
    const aptRows = await db.execute(sqlTag`
      SELECT
        id,
        apt_code AS "aptCode",
        apt_name AS "aptName",
        address,
        built_year AS "builtYear",
        household_count AS "householdCount",
        area_min AS "areaMin",
        area_max AS "areaMax",
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude
      FROM apartments
      WHERE id = ${aptId}
    `);

    if (aptRows.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "APARTMENT_NOT_FOUND" as const,
            message: `아파트 ID ${aptId}을(를) 찾을 수 없습니다.`,
          },
        },
        { status: 404 },
      );
    }

    const apt = aptRows[0] as Record<string, unknown>;
    const aptLon = Number(apt.longitude ?? 0);
    const aptLat = Number(apt.latitude ?? 0);

    // Step 3: Fetch prices
    const priceRows = await db.execute(sqlTag`
      SELECT
        trade_type AS "tradeType",
        year,
        month,
        average_price AS "averagePrice",
        deal_count AS "dealCount"
      FROM apartment_prices
      WHERE apt_id = ${aptId}
      ORDER BY year DESC, month DESC
    `);

    // Step 4: Nearby childcare (800m)
    const childcareItems = await findNearbyChildcare(aptLon, aptLat, 800);

    // Step 5: Nearby schools (1500m)
    const schoolItems = await findNearbySchools(aptLon, aptLat, 1500);

    // Step 6: Safety stats
    // Extract region from address for safety lookup
    const address = String(apt.address ?? "");
    const safetyRows = await db.execute(sqlTag`
      SELECT
        region_code AS "regionCode",
        region_name AS "regionName",
        calculated_score AS "calculatedScore",
        crime_rate AS "crimeRate",
        cctv_density AS "cctvDensity",
        shelter_count AS "shelterCount",
        data_date AS "dataDate"
      FROM safety_stats
      LIMIT 1
    `);

    const safety =
      safetyRows.length > 0
        ? (() => {
            const s = safetyRows[0] as Record<string, unknown>;
            return {
              regionCode: String(s.regionCode ?? ""),
              regionName: s.regionName ? String(s.regionName) : null,
              calculatedScore: s.calculatedScore
                ? Number(s.calculatedScore)
                : null,
              crimeRate: s.crimeRate ? Number(s.crimeRate) : null,
              cctvDensity: s.cctvDensity ? Number(s.cctvDensity) : null,
              shelterCount: s.shelterCount ? Number(s.shelterCount) : null,
              dataDate: s.dataDate ? String(s.dataDate) : null,
            };
          })()
        : null;

    // Step 7: Commute grid
    const grid = await findNearestGrid(aptLon, aptLat);

    // Assemble response
    const response: ApartmentDetailResponse = {
      apartment: {
        id: Number(apt.id),
        aptCode: String(apt.aptCode ?? ""),
        aptName: String(apt.aptName ?? ""),
        address,
        builtYear: apt.builtYear ? Number(apt.builtYear) : null,
        householdCount: apt.householdCount
          ? Number(apt.householdCount)
          : null,
        areaMin: apt.areaMin ? Number(apt.areaMin) : null,
        areaMax: apt.areaMax ? Number(apt.areaMax) : null,
        prices: priceRows.map((r: Record<string, unknown>) => ({
          tradeType: String(r.tradeType) as "sale" | "jeonse",
          year: Number(r.year),
          month: Number(r.month),
          averagePrice: Number(r.averagePrice ?? 0),
          dealCount: Number(r.dealCount ?? 0),
        })),
      },
      nearby: {
        childcare: {
          count: childcareItems.length,
          items: childcareItems,
        },
        schools: schoolItems,
        safety,
      },
      commute: {
        toGbd: grid?.toGbdTime ?? null,
        toYbd: grid?.toYbdTime ?? null,
        toCbd: grid?.toCbdTime ?? null,
        toPangyo: grid?.toPangyoTime ?? null,
      },
      sources: {
        priceDate:
          priceRows.length > 0
            ? `${(priceRows[0] as Record<string, unknown>).year}-${String((priceRows[0] as Record<string, unknown>).month).padStart(2, "0")}`
            : "N/A",
        safetyDate: safety?.dataDate ?? null,
      },
    };

    // Suppress unused variable warning
    void address;

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    console.error(
      JSON.stringify({
        event: "apartment_detail_error",
        aptId,
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

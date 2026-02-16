import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apartmentIdSchema } from "@/lib/validators/apartment";
import { getApartmentDetail } from "@/lib/data/apartment";
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
    const data = await getApartmentDetail(aptId);

    if (!data) {
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

    return NextResponse.json(data);
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

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

/**
 * Zod schema to validate Kakao Local Search API response shape.
 * Only passes through safe, expected fields to the client.
 */
const kakaoDocumentSchema = z.object({
  place_name: z.string(),
  address_name: z.string(),
  road_address_name: z.string().optional().default(""),
  x: z.string(),
  y: z.string(),
  category_group_code: z.string().optional().default(""),
  category_group_name: z.string().optional().default(""),
  phone: z.string().optional().default(""),
});

const kakaoResponseSchema = z.object({
  meta: z.object({
    total_count: z.number(),
    pageable_count: z.number(),
    is_end: z.boolean(),
  }),
  documents: z.array(kakaoDocumentSchema),
});

/**
 * Proxy for Kakao Local Keyword Search API.
 * Keeps KAKAO_REST_API_KEY server-side only (never exposed to client).
 * Rate limit: 60 requests / minute per IP.
 */
export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);

  if (isRateLimited(`kakao-local:${clientIp}`, 60)) {
    console.warn(
      JSON.stringify({
        event: "rate_limit_exceeded",
        route: "kakao-local",
        ip: clientIp,
        timestamp: new Date().toISOString(),
      }),
    );
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." } },
      { status: 429 },
    );
  }

  const query = request.nextUrl.searchParams.get("query");

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "query는 2글자 이상이어야 합니다." } },
      { status: 400 },
    );
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kakao API key is not configured." } },
      { status: 500 },
    );
  }

  try {
    const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
    url.searchParams.set("query", query.trim());
    url.searchParams.set("size", "10");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `KakaoAK ${apiKey}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: "Kakao API 호출에 실패했습니다." } },
        { status: 502 },
      );
    }

    const raw: unknown = await res.json();
    const parsed = kakaoResponseSchema.safeParse(raw);

    if (!parsed.success) {
      console.error(
        JSON.stringify({
          event: "kakao_response_validation_failed",
          errors: parsed.error.issues.map((i) => i.message),
          timestamp: new Date().toISOString(),
        }),
      );
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: "Kakao API 응답 형식이 올바르지 않습니다." } },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed.data);
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kakao API 호출 중 오류가 발생했습니다." } },
      { status: 500 },
    );
  }
}

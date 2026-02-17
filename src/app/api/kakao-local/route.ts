import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy for Kakao Local Keyword Search API.
 * Keeps KAKAO_REST_API_KEY server-side only (never exposed to client).
 */
export async function GET(request: NextRequest) {
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

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Kakao API 호출 중 오류가 발생했습니다." } },
      { status: 500 },
    );
  }
}

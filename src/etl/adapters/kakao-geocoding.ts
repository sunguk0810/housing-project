import type { Coordinate } from "@/types/api";
import { getRedis } from "@/lib/redis";

/**
 * Kakao Geocoding helper — address to coordinate conversion.
 * Mock mode: returns from pre-defined coordinate table.
 * Real mode: calls Kakao REST API with Redis cache.
 *
 * Source of Truth: M2 spec Section 4.1.6, 6.1 Step 3
 */

const USE_MOCK = process.env.USE_MOCK_DATA === "true";
const CACHE_TTL_SECONDS = 604800; // 7 days

/** Mock coordinate mapping for development/testing */
const MOCK_COORDINATES: Record<string, Coordinate> = {
  "서울 강남구 역삼동": { lat: 37.5007, lng: 127.0365 },
  "서울 강남구 삼성동": { lat: 37.5088, lng: 127.0629 },
  "서울 영등포구 여의도동": { lat: 37.5219, lng: 126.9245 },
  "서울 종로구 종로1가": { lat: 37.5704, lng: 126.9831 },
  "서울 종로구": { lat: 37.57, lng: 126.977 },
  "서울 중구": { lat: 37.5636, lng: 126.997 },
  "서울 서초구": { lat: 37.4837, lng: 127.0324 },
  "서울 송파구": { lat: 37.5145, lng: 127.106 },
  "서울 마포구": { lat: 37.5633, lng: 126.9082 },
  "경기 성남시 분당구 판교동": { lat: 37.3947, lng: 127.1112 },
  "경기 성남시 분당구": { lat: 37.3826, lng: 127.1191 },
  "경기 수원시": { lat: 37.2636, lng: 127.0286 },
  판교: { lat: 37.3948, lng: 127.1112 },
  강남: { lat: 37.4979, lng: 127.0276 },
  여의도: { lat: 37.5219, lng: 126.9245 },
  종로: { lat: 37.57, lng: 126.977 },
  GBD: { lat: 37.4979, lng: 127.0276 },
  YBD: { lat: 37.5219, lng: 126.9245 },
  CBD: { lat: 37.57, lng: 126.977 },
};

export interface GeocodingResult {
  coordinate: Coordinate;
  source: "kakao" | "cache" | "mock";
}

/**
 * Convert address to coordinates.
 * Priority: Mock → Redis cache → Kakao API
 * @param forceLive - skip mock mode (used by ETL adapters)
 */
export async function geocodeAddress(
  address: string,
  forceLive: boolean = false,
): Promise<GeocodingResult | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }

  const normalized = address.trim();

  // Mock mode — return from pre-defined table (skip if forceLive)
  if (USE_MOCK && !forceLive) {
    return geocodeMock(normalized);
  }

  // Real mode — cache first, then API
  const redis = getRedis();
  if (redis) {
    try {
      const cacheKey = `geocode:${normalized}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        const coord = JSON.parse(cached) as Coordinate;
        return { coordinate: coord, source: "cache" };
      }
    } catch {
      // Redis unavailable — continue
    }
  }

  return geocodeKakao(normalized);
}

function geocodeMock(address: string): GeocodingResult | null {
  // Try exact match first
  if (MOCK_COORDINATES[address]) {
    return { coordinate: MOCK_COORDINATES[address], source: "mock" };
  }

  // Try partial match
  for (const [key, coord] of Object.entries(MOCK_COORDINATES)) {
    if (address.includes(key) || key.includes(address)) {
      return { coordinate: coord, source: "mock" };
    }
  }

  // Default to Seoul center for unknown addresses in mock mode
  return {
    coordinate: { lat: 37.5665, lng: 126.978 },
    source: "mock",
  };
}

async function geocodeKakao(
  address: string,
): Promise<GeocodingResult | null> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return null;
  }

  const url = new URL("https://dapi.kakao.com/v2/local/search/address.json");
  url.searchParams.set("query", address);
  url.searchParams.set("size", "1");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${apiKey}` },
    signal: AbortSignal.timeout(3000),
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as {
    documents?: Array<{ x?: string; y?: string }>;
  };

  const doc = data.documents?.[0];
  if (!doc?.x || !doc?.y) {
    return null;
  }

  const coordinate: Coordinate = {
    lat: Number(doc.y),
    lng: Number(doc.x),
  };

  // Cache result
  const redis = getRedis();
  if (redis) {
    const cacheKey = `geocode:${address}`;
    redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(coordinate)).catch(() => {
      // Ignore cache write failures
    });
  }

  return { coordinate, source: "kakao" };
}

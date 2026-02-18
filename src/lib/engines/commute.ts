import type { CommuteInput, CommuteResult, CommuteRouteInfo, CommuteRouteSegment } from "@/types/engine";
import { getRedis } from "@/lib/redis";
import { sanitizeCacheKey } from "@/lib/sanitize";
import { findNearestGrid } from "./spatial";
import { haversine } from "./normalize";

/**
 * 4-stage commute time lookup.
 * Priority: Grid → Redis → ODsay API → Mock fallback.
 *
 * Source of Truth: M2 spec Section 5.3
 */

const BUSINESS_DISTRICTS: Record<
  string,
  { lon: number; lat: number; column: string }
> = {
  GBD: { lon: 127.0276, lat: 37.4979, column: "toGbdTime" },
  YBD: { lon: 126.9245, lat: 37.5219, column: "toYbdTime" },
  CBD: { lon: 126.977, lat: 37.57, column: "toCbdTime" },
  PANGYO: { lon: 127.1112, lat: 37.3948, column: "toPangyoTime" },
};

const DISTRICT_MATCH_DISTANCE_KM = 2;
const CACHE_TTL_SECONDS = 86400; // 24 hours

function matchBusinessDistrict(
  lon: number,
  lat: number,
): string | null {
  for (const [key, bd] of Object.entries(BUSINESS_DISTRICTS)) {
    const dist = haversine({ x: lon, y: lat }, { x: bd.lon, y: bd.lat });
    if (dist <= DISTRICT_MATCH_DISTANCE_KM) {
      return key;
    }
  }
  return null;
}

export async function getCommuteTime(
  input: CommuteInput,
): Promise<CommuteResult> {
  // Stage 1: Grid lookup — findNearestGrid uses KNN <-> for closest match
  const districtKey = matchBusinessDistrict(input.destLon, input.destLat);
  if (districtKey) {
    const grid = await findNearestGrid(input.aptLon, input.aptLat);
    if (grid) {
      const column =
        BUSINESS_DISTRICTS[districtKey].column as keyof typeof grid;
      const time = grid[column];
      if (typeof time === "number") {
        return { timeMinutes: time, source: "grid" };
      }
    }
  }

  // Stage 2: Redis cache
  const redis = getRedis();
  if (redis) {
    const cacheKey = `commute:${input.aptLat}:${input.aptLon}:${sanitizeCacheKey(input.destLabel)}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached !== null) {
        return { timeMinutes: Number(cached), source: "redis" };
      }
    } catch {
      // Redis unavailable — continue to next stage
    }
  }

  // Stage 3: ODsay API (skip if no API key)
  if (process.env.ODSAY_API_KEY) {
    try {
      const odsayResult = await callODsayApi(input);
      // Cache time only (routes are ODsay real-time data)
      if (redis) {
        const cacheKey = `commute:${input.aptLat}:${input.aptLon}:${sanitizeCacheKey(input.destLabel)}`;
        redis.setex(cacheKey, CACHE_TTL_SECONDS, String(odsayResult.timeMinutes)).catch(() => {
          // Ignore cache write failures
        });
      }
      return { timeMinutes: odsayResult.timeMinutes, source: "odsay", routes: odsayResult.routes };
    } catch {
      // API failed — fall through to mock
    }
  }

  // Stage 4: Mock fallback — distance-based estimation
  const distKm = haversine(
    { x: input.aptLon, y: input.aptLat },
    { x: input.destLon, y: input.destLat },
  );
  const mockTime = Math.round(distKm * 3 + 10);
  return { timeMinutes: mockTime, source: "mock" };
}

interface ODsayApiResult {
  timeMinutes: number;
  routes: CommuteRouteInfo;
}

interface ODsaySubPath {
  trafficType?: number;
  sectionTime?: number;
  stationCount?: number;
  lane?: Array<{ name?: string }>;
}

interface ODsayResponse {
  result?: {
    path?: Array<{
      info?: { totalTime?: number };
      subPath?: ODsaySubPath[];
    }>;
  };
}

function parseSubPaths(subPaths: ODsaySubPath[]): CommuteRouteInfo {
  const segments: CommuteRouteSegment[] = [];
  let transferCount = 0;
  const lineNames: string[] = [];

  for (const sp of subPaths) {
    const tt = sp.trafficType;
    if (tt !== 1 && tt !== 2 && tt !== 3) continue;

    const lineName = sp.lane?.[0]?.name ?? (tt === 3 ? "도보" : "노선 정보 없음");
    segments.push({
      trafficType: tt,
      lineName,
      stationCount: sp.stationCount ?? 0,
    });

    if (tt !== 3) {
      lineNames.push(lineName);
    }
  }

  // transferCount = number of transit segments - 1 (min 0)
  const transitSegments = segments.filter((s) => s.trafficType !== 3);
  transferCount = Math.max(0, transitSegments.length - 1);

  const summary = lineNames.length > 0
    ? lineNames.join(" → ")
    : "도보";

  return { segments, transferCount, summary };
}

async function callODsayApi(input: CommuteInput): Promise<ODsayApiResult> {
  const apiKey = process.env.ODSAY_API_KEY;
  if (!apiKey) throw new Error("ODSAY_API_KEY not set");

  const url = new URL("https://api.odsay.com/v1/api/searchPubTransPathT");
  url.searchParams.set("SX", String(input.aptLon));
  url.searchParams.set("SY", String(input.aptLat));
  url.searchParams.set("EX", String(input.destLon));
  url.searchParams.set("EY", String(input.destLat));
  url.searchParams.set("apiKey", apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    const data = (await res.json()) as ODsayResponse;
    const path = data.result?.path?.[0];
    const time = path?.info?.totalTime;
    if (typeof time !== "number") throw new Error("Invalid ODsay response");

    const routes = parseSubPaths(path?.subPath ?? []);
    return { timeMinutes: time, routes };
  } finally {
    clearTimeout(timeout);
  }
}

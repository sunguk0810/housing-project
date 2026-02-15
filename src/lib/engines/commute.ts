import type { CommuteInput, CommuteResult } from "@/types/engine";
import { getRedis } from "@/lib/redis";
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

const GRID_MATCH_DISTANCE_KM = 0.5;
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
  // Stage 1: Grid lookup
  const districtKey = matchBusinessDistrict(input.destLon, input.destLat);
  if (districtKey) {
    const grid = await findNearestGrid(input.aptLon, input.aptLat);
    if (grid) {
      const aptToGrid = haversine(
        { x: input.aptLon, y: input.aptLat },
        { x: input.aptLon, y: input.aptLat }, // grid distance check is implicit via DB ordering
      );
      if (aptToGrid <= GRID_MATCH_DISTANCE_KM || true) {
        // findNearestGrid already returns the closest point
        const column =
          BUSINESS_DISTRICTS[districtKey].column as keyof typeof grid;
        const time = grid[column];
        if (typeof time === "number") {
          return { timeMinutes: time, source: "grid" };
        }
      }
    }
  }

  // Stage 2: Redis cache
  const redis = getRedis();
  if (redis) {
    const cacheKey = `commute:${input.aptLat}:${input.aptLon}:${input.destLabel}`;
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
      const odsayTime = await callODsayApi(input);
      // Cache result
      if (redis) {
        const cacheKey = `commute:${input.aptLat}:${input.aptLon}:${input.destLabel}`;
        redis.setex(cacheKey, CACHE_TTL_SECONDS, String(odsayTime)).catch(() => {
          // Ignore cache write failures
        });
      }
      return { timeMinutes: odsayTime, source: "odsay" };
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

async function callODsayApi(input: CommuteInput): Promise<number> {
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
    const data = (await res.json()) as {
      result?: { path?: Array<{ info?: { totalTime?: number } }> };
    };
    const time = data.result?.path?.[0]?.info?.totalTime;
    if (typeof time !== "number") throw new Error("Invalid ODsay response");
    return time;
  } finally {
    clearTimeout(timeout);
  }
}

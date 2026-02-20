import type {
  CommuteInput,
  CommuteResult,
  CommuteRouteInfo,
  CommuteRouteSegment,
} from '@/types/engine';
import { getRedis } from '@/lib/redis';
import { sanitizeCacheKey } from '@/lib/sanitize';
import { findNearestGrid, getCommuteTimeWithRouteForGrid } from './spatial';
import { haversine } from './normalize';

/**
 * 4-stage commute time lookup.
 * Priority: Grid → Redis → ODsay API → Mock fallback.
 *
 * Source of Truth: M2 spec Section 5.3
 */

type ODsayRequestResult = {
  timeMinutes: number;
  routes: CommuteRouteInfo;
};

type ODsayErrorAction = 'retry' | 'walkFallback' | 'abort';

type TrafficType = 1 | 2 | 3;

const BUSINESS_DISTRICTS: Record<string, { lon: number; lat: number }> = {
  GBD: { lon: 127.0276, lat: 37.4979 },
  YBD: { lon: 126.9245, lat: 37.5219 },
  CBD: { lon: 126.977, lat: 37.57 },
  PANGYO: { lon: 127.1112, lat: 37.3948 },
  MAGOK: { lon: 126.8336, lat: 37.5602 },
  JAMSIL: { lon: 127.1002, lat: 37.5133 },
  GASAN: { lon: 126.8826, lat: 37.4814 },
  GURO: { lon: 126.9016, lat: 37.4854 },
};

const DISTRICT_MATCH_DISTANCE_KM = 2;
const CACHE_TTL_SECONDS = 86400; // 24 hours
const ODSAY_TIMEOUT_MS = 3000;
const ODSAY_REQUEST_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [120, 250, 600];
const WALKING_SPEED = 3;
const ODSAY_DEBUG =
  process.env.ODSAY_DEBUG === '1' || process.env.ODSAY_DEBUG?.toLowerCase() === 'true';

interface ODsaySubPath {
  trafficType?: number;
  sectionTime?: number;
  stationCount?: number;
  distance?: number;
  lane?: Array<{
    name?: string;
    nameKor?: string;
    nameJpnKata?: string;
  }>;
}

interface ODsayPathInfo {
  totalTime?: number;
  totalWalk?: number;
  busTransitCount?: number;
  subwayTransitCount?: number;
  totalStationCount?: number;
  totalDistance?: number;
  pathType?: number;
}

interface ODsayPath {
  pathType?: number;
  info?: ODsayPathInfo;
  subPath?: ODsaySubPath[];
}

interface ODsayErrorItem {
  code?: string | number;
  msg?: string;
  message?: string;
}

interface ODsayResponse {
  result?: {
    path?: ODsayPath[];
  };
  error?: ODsayErrorItem | ODsayErrorItem[];
}

type ODsayApiCallError = Error & { reason?: ODsayErrorAction };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function debugODSAY(event: string, payload: Record<string, unknown>): void {
  if (!ODSAY_DEBUG) return;
  console.log(
    JSON.stringify({
      event: `odsay_commute_debug_${event}`,
      ...payload,
    }),
  );
}

function maskOdsayUrl(url: string): string {
  return url.replace(/([?&]apiKey=)[^&]+/g, '$1***');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function matchBusinessDistrict(lon: number, lat: number): string | null {
  for (const [key, bd] of Object.entries(BUSINESS_DISTRICTS)) {
    const dist = haversine({ x: lon, y: lat }, { x: bd.lon, y: bd.lat });
    if (dist <= DISTRICT_MATCH_DISTANCE_KM) {
      return key;
    }
  }
  return null;
}

function walkingTimeFallback(distanceKm: number): number {
  return Math.max(1, Math.round(distanceKm * WALKING_SPEED + 10));
}

function buildWalkingRouteSnapshot(distanceKm: number, timeMinutes: number): CommuteRouteInfo {
  return {
    pathType: 3,
    totalWalk: timeMinutes,
    busTransitCount: 0,
    subwayTransitCount: 0,
    totalStationCount: 0,
    totalDistance: Math.round(distanceKm * 1000),
    transferCount: 0,
    summary: '도보',
    segments: [
      {
        trafficType: 3,
        lineName: '도보',
        stationCount: 0,
        sectionTime: timeMinutes,
        distance: Math.round(distanceKm * 1000),
      },
    ],
  };
}

function parseErrorCode(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function classifyOdsayErrorCode(code: string | null): ODsayErrorAction {
  if (code === null) return 'abort';

  switch (code) {
    case '-98':
    case '-99':
      return 'walkFallback';
    case '500':
      return 'retry';
    case '-8':
    case '-9':
    case '3':
    case '4':
    case '5':
    case '6':
      return 'abort';
    default: {
      const numeric = Number(code);
      if (Number.isFinite(numeric) && numeric >= 500) {
        return 'retry';
      }
      return 'abort';
    }
  }
}

function classifyHttpStatus(status: number): ODsayErrorAction {
  if (status >= 500 || status === 429 || status === 408) {
    return 'retry';
  }
  return 'abort';
}

function parseOdsayError(payload: ODsayResponse | unknown): ODsayErrorItem | null {
  if (!isObject(payload) || !('error' in payload)) return null;
  const raw = payload.error;
  if (!raw) return null;

  const errors = Array.isArray(raw) ? raw : [raw];
  for (const item of errors) {
    if (!isObject(item)) continue;
    const candidate = item as ODsayErrorItem;
    if (candidate.code !== undefined || candidate.msg || candidate.message) return candidate;
  }

  return null;
}

function normalizeTrafficType(value: unknown): TrafficType {
  if (value === 1) return 1;
  if (value === 2) return 2;
  return 3;
}

function lineNameFromSubPath(trafficType: TrafficType, subPath: ODsaySubPath): string {
  if (trafficType === 3) return '도보';

  const lane = Array.isArray(subPath.lane) ? subPath.lane[0] : undefined;
  if (lane) {
    if (typeof lane === 'string') return lane;
    if (isObject(lane)) {
      const candidate = lane as {
        name?: string;
        nameKor?: string;
        nameJpnKata?: string;
      };
      return (
        candidate.name ?? candidate.nameKor ?? candidate.nameJpnKata ?? (trafficType === 1 ? '지하철' : '버스')
      );
    }
  }

  return trafficType === 1 ? '지하철' : '버스';
}

function parseSegments(subPaths: ODsaySubPath[] = []): CommuteRouteSegment[] {
  return subPaths
    .map((subPath) => {
      const trafficType = normalizeTrafficType(subPath.trafficType);
      return {
        trafficType,
        lineName: lineNameFromSubPath(trafficType, subPath),
        stationCount: subPath.stationCount ?? 0,
        sectionTime: subPath.sectionTime,
        distance: subPath.distance,
      };
    })
    .filter(
      (segment) =>
        segment.trafficType === 1 || segment.trafficType === 2 || segment.trafficType === 3,
    ) as CommuteRouteSegment[];
}

function buildRouteSnapshot(path: ODsayPath): CommuteRouteInfo {
  const segments = parseSegments(path.subPath);
  const transitSegments = segments.filter((segment) => segment.trafficType !== 3);
  const transferCount = Math.max(0, transitSegments.length - 1);
  const transferLines = Array.from(
    new Set(transitSegments.map((segment) => segment.lineName).filter((lineName) => lineName.length > 0)),
  );
  const summary = transferLines.length > 0 ? transferLines.join(' → ') : '도보';

  return {
    pathType: path.pathType ?? path.info?.pathType,
    totalWalk: path.info?.totalWalk,
    busTransitCount: path.info?.busTransitCount,
    subwayTransitCount: path.info?.subwayTransitCount,
    totalStationCount: path.info?.totalStationCount,
    totalDistance: path.info?.totalDistance,
    transferCount,
    summary,
    segments,
  };
}

function pickBestPath(paths: ODsayPath[] | undefined): ODsayPath | null {
  if (!Array.isArray(paths)) return null;

  let best: ODsayPath | null = null;
  let bestTime = Infinity;

  for (const path of paths) {
    const totalTime = path.info?.totalTime;
    if (typeof totalTime !== 'number' || !Number.isFinite(totalTime)) {
      continue;
    }

    if (totalTime < bestTime) {
      best = path;
      bestTime = totalTime;
    }
  }

  return best;
}

function buildOdsayUrl(fromLon: number, fromLat: number, toLon: number, toLat: number, apiKey: string): string {
  const params = new URLSearchParams();
  params.set('SX', String(fromLon));
  params.set('SY', String(fromLat));
  params.set('EX', String(toLon));
  params.set('EY', String(toLat));
  params.set('apiKey', apiKey);
  return `https://api.odsay.com/v1/api/searchPubTransPathT?${params.toString()}`;
}

function asAbortAwareError(message: string, reason: ODsayErrorAction): ODsayApiCallError {
  const error = new Error(message) as ODsayApiCallError;
  error.reason = reason;
  return error;
}

export async function getCommuteTime(input: CommuteInput): Promise<CommuteResult> {
  // Stage 1: Grid lookup
  const districtKey = matchBusinessDistrict(input.destLon, input.destLat);
  if (districtKey) {
    const grid = await findNearestGrid(input.aptLon, input.aptLat);
    if (grid) {
      const cached = await getCommuteTimeWithRouteForGrid(grid.gridId, districtKey);
      if (cached != null && cached.timeMinutes !== null) {
        return {
          timeMinutes: cached.timeMinutes,
          source: 'grid',
          ...(cached.routeSnapshot ? { routes: cached.routeSnapshot } : {}),
        };
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
        return { timeMinutes: Number(cached), source: 'redis' };
      }
    } catch {
      // Redis unavailable — continue to next stage
    }
  }

  // Stage 3: ODsay API (skip if no API key)
  if (process.env.ODSAY_API_KEY) {
    try {
      const odsayResult = await callODsayApi(input);
      if (redis) {
        const cacheKey = `commute:${input.aptLat}:${input.aptLon}:${sanitizeCacheKey(input.destLabel)}`;
        redis.setex(cacheKey, CACHE_TTL_SECONDS, String(odsayResult.timeMinutes)).catch(() => {
          // Ignore cache write failures
        });
      }

      return {
        timeMinutes: odsayResult.timeMinutes,
        source: 'odsay',
        routes: odsayResult.routes,
      };
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
  return { timeMinutes: mockTime, source: 'mock' };
}

async function callODsayApi(input: CommuteInput): Promise<ODsayRequestResult> {
  const apiKey = process.env.ODSAY_API_KEY;
  if (!apiKey) throw new Error('ODSAY_API_KEY not set');

  const distanceKm = haversine(
    { x: input.aptLon, y: input.aptLat },
    { x: input.destLon, y: input.destLat },
  );
  const fallbackMinutes = walkingTimeFallback(distanceKm);
  const fallbackRoute = buildWalkingRouteSnapshot(distanceKm, fallbackMinutes);
  const requestUrl = buildOdsayUrl(input.aptLon, input.aptLat, input.destLon, input.destLat, apiKey);
  debugODSAY('request_start', {
    from: `${input.aptLon.toFixed(5)},${input.aptLat.toFixed(5)}`,
    to: `${input.destLon.toFixed(5)},${input.destLat.toFixed(5)}`,
    url: maskOdsayUrl(requestUrl),
    attemptLimit: ODSAY_REQUEST_ATTEMPTS,
  });

  for (let attempt = 1; attempt <= ODSAY_REQUEST_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ODSAY_TIMEOUT_MS);

    try {
      const res = await fetch(requestUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        const action = classifyHttpStatus(res.status);
        const message = `ODSay HTTP status ${res.status}`;
        debugODSAY('http_non_ok', {
          status: res.status,
          statusText: res.statusText,
          action,
          attempt,
        });
        if (action === 'retry' && attempt < ODSAY_REQUEST_ATTEMPTS) {
          console.log(
            JSON.stringify({
              event: 'odsay_http_retry',
              status: res.status,
              message,
              attempt,
            }),
          );
          debugODSAY('retry_wait', {
            reason: 'http',
            attempt,
            delayMs: RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)],
          });
          await sleep(RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)]);
          continue;
        }

        throw asAbortAwareError(message, action);
      }

      const data = (await res.json()) as ODsayResponse;
      const odsayError = parseOdsayError(data);
      if (odsayError) {
        const code = parseErrorCode(odsayError.code);
        const action = classifyOdsayErrorCode(code);
        const message = odsayError.msg ?? odsayError.message ?? 'ODsay API error';
        debugODSAY('error_response', {
          code,
          message,
          action,
          attempt,
        });

        if (action === 'walkFallback') {
          debugODSAY('walk_fallback', {
            fallbackMinutes,
            attempt,
            reason: code,
          });
          return {
            timeMinutes: fallbackMinutes,
            routes: fallbackRoute,
          };
        }

        if (action === 'retry' && attempt < ODSAY_REQUEST_ATTEMPTS) {
          console.log(
            JSON.stringify({
              event: 'odsay_api_retry',
              code,
              message,
              attempt,
            }),
          );
          debugODSAY('retry_wait', {
            reason: 'error',
            code,
            attempt,
            delayMs: RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)],
          });
          await sleep(RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)]);
          continue;
        }

        throw asAbortAwareError(`${code ?? 'Unknown'}: ${message}`, action);
      }

      const path = pickBestPath(data.result?.path);
      if (!path || !path.info) {
        debugODSAY('invalid_path', {
          attempt,
          reason: 'missing path/info',
        });
        throw asAbortAwareError('No ODsay path result', 'abort');
      }

      const totalTime = path.info.totalTime;
      if (typeof totalTime !== 'number' || !Number.isFinite(totalTime)) {
        debugODSAY('invalid_result', {
          attempt,
          reason: 'invalid totalTime',
        });
        throw asAbortAwareError('Invalid ODsay totalTime', 'abort');
      }

      const routeSnapshot = buildRouteSnapshot(path);
      debugODSAY('success', {
        attempt,
        totalTime,
        pathType: path.pathType ?? path.info?.pathType,
        segments: routeSnapshot.segments.length,
        transferCount: routeSnapshot.transferCount,
      });

      return {
        timeMinutes: totalTime,
        routes: routeSnapshot,
      };
    } catch (err) {
      clearTimeout(timeout);
      const typedErr = err as ODsayApiCallError | undefined;
      if (typedErr?.reason === 'abort') {
        debugODSAY('abort', {
          attempt,
          message: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }

      debugODSAY('attempt_error', {
        attempt,
        reason: typedErr?.reason ?? 'retry',
        message: err instanceof Error ? err.message : String(err),
      });

      if (attempt < ODSAY_REQUEST_ATTEMPTS) {
        const delayMs = RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)];
        console.log(
          JSON.stringify({
            event: 'odsay_api_error',
            message: err instanceof Error ? err.message : String(err),
            attempt,
            delayMs,
          }),
        );
        await sleep(delayMs);
        continue;
      }
      throw err;
    }
  }

  throw new Error('ODSay API request failed');
}

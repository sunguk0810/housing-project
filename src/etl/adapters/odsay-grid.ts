import { ODSAY_LIMITER } from '../utils/rate-limiter';
import { BUSINESS_DISTRICTS } from '../config/regions';
import { db } from '@/db/connection';
import { commuteDestinations, commuteGrid, commuteTimes } from '@/db/schema/commute';
import { haversine } from '@/lib/engines/normalize';
import type { CommuteRouteInfo } from '@/types/engine';

/**
 * ODsay commute grid generator.
 *
 * Generates a grid of lat/lng points across Seoul+suburbs and queries
 * ODsay API for public transit time to each business district.
 *
 * Grid: lat 37.35-37.70, lng 126.75-127.20, step 0.01 (~1km)
 * Destinations: BUSINESS_DISTRICTS (config-driven)
 * Total: ~1,575 points × N destinations
 * Rate: 1,000/day free tier → days = (points × destinations) / 1,000
 *
 * Features:
 *   - Resume support (skip existing grid points)
 *   - Priority: central Seoul first
 *   - Stores route snapshot(jsonb) for later UI/분석 활용
 */

const GRID = {
  latMin: 37.35,
  latMax: 37.7,
  lngMin: 126.75,
  lngMax: 127.2,
  step: 0.01,
};

// Central Seoul bounding box (processed first)
const CENTER = {
  latMin: 37.45,
  latMax: 37.6,
  lngMin: 126.85,
  lngMax: 127.1,
};

const WALKING_SPEED = 3;
const ODSAY_FETCH_TIMEOUT_MS = 10_000;
const ODSAY_REQUEST_ATTEMPTS = 3;
const RETRY_DELAY_MS = [200, 600, 1200];
const ODSAY_DEBUG =
  process.env.ODSAY_DEBUG === '1' || process.env.ODSAY_DEBUG?.toLowerCase() === 'true';

type ODsayErrorAction = 'retry' | 'walkFallback' | 'abort';

type TrafficType = 1 | 2 | 3;

interface GridPoint {
  gridId: string;
  lat: number;
  lng: number;
}

interface CommuteResult {
  gridId: string;
  lat: number;
  lng: number;
  destinationKey: string;
  timeMinutes: number | null;
  routeSnapshot: CommuteRouteInfo | null;
}

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
  pathType?: number;
  totalTime?: number;
  totalWalk?: number;
  busTransitCount?: number;
  subwayTransitCount?: number;
  totalStationCount?: number;
  totalDistance?: number;
  checkIntervalTime?: number;
  checkIntervalTimeOverYn?: string;
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

interface ODsayApiResponse {
  result?: {
    path?: ODsayPath[];
  };
  error?: ODsayErrorItem | ODsayErrorItem[];
}

function debugODSAY(event: string, payload: Record<string, unknown>): void {
  if (!ODSAY_DEBUG) return;
  console.log(
    JSON.stringify({
      event: `odsay_grid_debug_${event}`,
      ...payload,
    }),
  );
}

function maskOdsayUrl(url: string): string {
  return url.replace(/([?&]apiKey=)[^&]+/g, '$1***');
}

interface ODsayTransitResult {
  timeMinutes: number;
  route: CommuteRouteInfo;
}

function pairKey(gridId: string, destinationKey: string): string {
  return `${gridId}:${destinationKey}`;
}

function formatCoordinatePair(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Generate all grid points, center first */
function generateGridPoints(): GridPoint[] {
  const centerPoints: GridPoint[] = [];
  const outerPoints: GridPoint[] = [];

  for (let lat = GRID.latMin; lat <= GRID.latMax; lat = Number((lat + GRID.step).toFixed(4))) {
    for (let lng = GRID.lngMin; lng <= GRID.lngMax; lng = Number((lng + GRID.step).toFixed(4))) {
      const gridId = `G${lat.toFixed(2)}_${lng.toFixed(2)}`;
      const point = { gridId, lat, lng };

      const isCenter =
        lat >= CENTER.latMin &&
        lat <= CENTER.latMax &&
        lng >= CENTER.lngMin &&
        lng <= CENTER.lngMax;

      if (isCenter) {
        centerPoints.push(point);
      } else {
        outerPoints.push(point);
      }
    }
  }

  // Center points first for priority processing
  return [...centerPoints, ...outerPoints];
}

function walkingTimeFallback(distanceKm: number): number {
  return Math.max(1, Math.round(distanceKm * WALKING_SPEED + 10));
}

function makeWalkingSnapshot(distanceKm: number, timeMinutes: number): CommuteRouteInfo {
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

function extractError(response: ODsayApiResponse | unknown): ODsayErrorItem | null {
  if (!isObject(response) || !('error' in response)) return null;
  const rawError = response.error;
  if (!rawError) return null;

  const errors = Array.isArray(rawError) ? rawError : [rawError];
  for (const item of errors) {
    if (!isObject(item)) continue;
    const candidate = item as ODsayErrorItem;
    if (candidate.code !== undefined || candidate.msg || candidate.message) return candidate;
  }

  return null;
}

function pickBestPath(paths: ODsayPath[] | undefined): ODsayPath | null {
  if (!Array.isArray(paths)) return null;

  let best: ODsayPath | null = null;
  let bestTime = Infinity;

  for (const path of paths) {
    const totalTime = path.info?.totalTime;
    if (typeof totalTime !== 'number' || !Number.isFinite(totalTime)) continue;
    if (totalTime < bestTime) {
      best = path;
      bestTime = totalTime;
    }
  }

  return best;
}

function routeLineName(trafficType: number | undefined, path: ODsaySubPath): string {
  if (trafficType === 3) return '도보';

  const lane = Array.isArray(path.lane) ? path.lane[0] : undefined;
  if (lane && isObject(lane)) {
    return (
      lane.name ??
      lane.nameKor ??
      lane.nameJpnKata ??
      (trafficType === 1 ? '지하철' : '버스')
    );
  }

  return trafficType === 1 ? '지하철' : '버스';
}

function normalizeTrafficType(value: unknown): TrafficType {
  return value === 1 ? 1 : value === 2 ? 2 : 3;
}

function buildRouteSnapshot(path: ODsayPath): CommuteRouteInfo {
  const subPaths = Array.isArray(path.subPath) ? path.subPath : [];
  const segments = subPaths.map((segment) => {
    const trafficType = normalizeTrafficType(segment.trafficType);
    return {
      trafficType,
      lineName: routeLineName(trafficType, segment),
      stationCount: segment.stationCount ?? 0,
      sectionTime: segment.sectionTime,
      distance: segment.distance,
    } satisfies CommuteRouteInfo['segments'][number];
  });

  const transitSegments = segments.filter((segment) => segment.trafficType !== 3);
  const transferCount = Math.max(0, transitSegments.length - 1);
  const names = Array.from(
    new Set(transitSegments.map((segment) => segment.lineName).filter((name) => name.length > 0)),
  );
  const summary = names.length > 0 ? names.join(' → ') : '도보';

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

/** Query ODsay API for transit time between two points */
async function getTransitTime(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<ODsayTransitResult | null> {
  const apiKey = process.env.ODSAY_API_KEY;
  if (!apiKey) {
    debugODSAY('missing_api_key', {
      from: formatCoordinatePair(fromLat, fromLng),
      to: formatCoordinatePair(toLat, toLng),
    });
    return null;
  }

  const distanceKm = haversine({ x: fromLng, y: fromLat }, { x: toLng, y: toLat });
  const fallbackTime = walkingTimeFallback(distanceKm);
  const fallbackRoute = makeWalkingSnapshot(distanceKm, fallbackTime);

  const params = new URLSearchParams();
  params.set('SX', String(fromLng));
  params.set('SY', String(fromLat));
  params.set('EX', String(toLng));
  params.set('EY', String(toLat));
  const encodedKey = encodeURIComponent(apiKey);
  const requestUrlBase = `https://api.odsay.com/v1/api/searchPubTransPathT?apiKey=${encodedKey}&${params.toString()}`;

  for (let attempt = 1; attempt <= ODSAY_REQUEST_ATTEMPTS; attempt += 1) {
    const requestUrl = requestUrlBase;

    try {
      await ODSAY_LIMITER.acquire();
    } catch (acquireErr) {
      const msg = acquireErr instanceof Error ? acquireErr.message : String(acquireErr);
      if (msg.includes('Daily limit reached')) {
        console.log(JSON.stringify({ event: 'odsay_daily_limit_reached' }));
        return null;
      }
      throw acquireErr;
    }

    debugODSAY('request_start', {
      attempt,
      from: formatCoordinatePair(fromLat, fromLng),
      to: formatCoordinatePair(toLat, toLng),
      requestKey: pairKey(`G${fromLat.toFixed(2)}_${fromLng.toFixed(2)}`, `D${toLat.toFixed(2)}_${toLng.toFixed(2)}`),
      url: maskOdsayUrl(requestUrl),
    });

    try {
      const res = await fetch(requestUrl, {
        signal: AbortSignal.timeout(ODSAY_FETCH_TIMEOUT_MS),
      });

      if (!res.ok) {
        const action = classifyHttpStatus(res.status);
        debugODSAY('http_non_ok', {
          attempt,
          status: res.status,
          statusText: res.statusText,
          action,
          retryAfter: res.headers.get('retry-after') ?? null,
          remainingDaily: ODSAY_LIMITER.remainingDaily,
        });
        console.log(
          JSON.stringify({
            event: 'odsay_api_http_error',
            status: res.status,
            attempt,
            maxAttempts: ODSAY_REQUEST_ATTEMPTS,
          }),
        );

        if (action === 'retry' && attempt < ODSAY_REQUEST_ATTEMPTS) {
          await sleep(RETRY_DELAY_MS[Math.min(attempt - 1, RETRY_DELAY_MS.length - 1)]);
          continue;
        }

        return null;
      }

      const data = (await res.json()) as ODsayApiResponse;
      const apiError = extractError(data);
      if (apiError) {
        const code = parseErrorCode(apiError.code);
        const action = classifyOdsayErrorCode(code);
        const message = apiError.msg ?? apiError.message ?? 'Unknown ODsay error';
        debugODSAY('error_response', {
          attempt,
          code,
          action,
          apiStatus: data.result ? 'result' : 'no_result',
          message,
        });

        if (action === 'walkFallback') {
          debugODSAY('walk_fallback', {
            attempt,
            fallbackTime,
          });
          return {
            timeMinutes: fallbackTime,
            route: fallbackRoute,
          };
        }

        console.log(
          JSON.stringify({
            event: 'odsay_api_error',
            code,
            message,
            attempt,
            maxAttempts: ODSAY_REQUEST_ATTEMPTS,
          }),
        );

        if (action === 'retry' && attempt < ODSAY_REQUEST_ATTEMPTS) {
          await sleep(RETRY_DELAY_MS[Math.min(attempt - 1, RETRY_DELAY_MS.length - 1)]);
          continue;
        }

        return null;
      }

      const path = pickBestPath(data.result?.path);
      if (!path || !path.info) {
        debugODSAY('invalid_path', {
          attempt,
          reason: 'missing path/info',
        });
        return null;
      }

      const totalTime = path.info.totalTime;
      if (typeof totalTime !== 'number' || !Number.isFinite(totalTime)) {
        debugODSAY('invalid_path', {
          attempt,
          reason: 'invalid totalTime',
        });
        console.log(
          JSON.stringify({
            event: 'odsay_api_invalid_result',
            detail: 'missing or invalid totalTime',
            attempt,
          }),
        );
        return null;
      }

      debugODSAY('success', {
        attempt,
        totalTime,
        pathType: path.pathType ?? path.info?.pathType,
        segmentCount: Array.isArray(path.subPath) ? path.subPath.length : 0,
      });

      return {
        timeMinutes: totalTime,
        route: buildRouteSnapshot(path),
      };
    } catch (err) {
      debugODSAY('fetch_error', {
        attempt,
        message: err instanceof Error ? err.message : String(err),
      });
      console.log(
        JSON.stringify({
          event: 'odsay_fetch_error',
          message: err instanceof Error ? err.message : String(err),
          attempt,
          maxAttempts: ODSAY_REQUEST_ATTEMPTS,
        }),
      );

      if (attempt < ODSAY_REQUEST_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS[Math.min(attempt - 1, RETRY_DELAY_MS.length - 1)]);
        continue;
      }

      return null;
    }
  }

  return null;
}

/** Check which (grid_id, destination_key) already exist in DB */
async function getExistingGridDestinationPairs(): Promise<Set<string>> {
  const existing = await db
    .select({ gridId: commuteTimes.gridId, destinationKey: commuteTimes.destinationKey })
    .from(commuteTimes);

  return new Set(existing.map((r) => pairKey(r.gridId, r.destinationKey)));
}

/** Run the commute grid generation */
export async function runCommuteGrid(
  dryRun: boolean = false,
  maxPoints: number = Infinity,
  clearExisting: boolean = false,
): Promise<number> {
  const apiKey = process.env.ODSAY_API_KEY;
  if (!apiKey) {
    console.log(
      JSON.stringify({
        event: 'odsay_grid_skip',
        reason: 'ODSAY_API_KEY not configured',
      }),
    );
    return 0;
  }

  const allPoints = generateGridPoints();
  const destinations = Object.entries(BUSINESS_DISTRICTS).map(([destinationKey, d]) => ({
    destinationKey,
    ...d,
  }));

  console.log(
    JSON.stringify({
      event: 'odsay_grid_start',
      totalPoints: allPoints.length,
      maxPoints,
      destinations: destinations.length,
      clearExisting,
      dailyRemaining: ODSAY_LIMITER.remainingDaily,
    }),
  );

  if (clearExisting && !dryRun) {
    await db.delete(commuteTimes);
    await db.delete(commuteGrid);
    console.log(
      JSON.stringify({
        event: 'odsay_grid_reset',
        mode: 'clear_existing',
      }),
    );
  }

  if (!dryRun) {
    // Ensure destinations exist (idempotent)
    await db
      .insert(commuteDestinations)
      .values(
        destinations.map((d) => ({
          destinationKey: d.destinationKey,
          name: d.name,
          location: { latitude: d.lat, longitude: d.lng },
          active: true,
        })),
      )
      .onConflictDoNothing();
  }

  // Get existing (grid_id, destination_key) for resume support
  const existingPairs = dryRun || clearExisting ? new Set<string>() : await getExistingGridDestinationPairs();

  const pendingPoints = allPoints.filter((p) =>
    destinations.some((d) => !existingPairs.has(pairKey(p.gridId, d.destinationKey))),
  );

  console.log(
    JSON.stringify({
      event: 'odsay_grid_resume',
      existingPairs: existingPairs.size,
      pending: pendingPoints.length,
    }),
  );

  const pointsToProcess = pendingPoints.slice(0, maxPoints);
  let processed = 0;

  for (const point of pointsToProcess) {
    const missingDestinations = destinations.filter(
      (d) => !existingPairs.has(pairKey(point.gridId, d.destinationKey)),
    );

    if (missingDestinations.length === 0) {
      continue;
    }

    // Check daily limit (calls per point depends on missing destinations)
    if (ODSAY_LIMITER.remainingDaily < missingDestinations.length) {
      console.log(
        JSON.stringify({
          event: 'odsay_grid_daily_limit',
          processed,
          remaining: pointsToProcess.length - processed,
          missingDestinations: missingDestinations.length,
        }),
      );
      break;
    }

    if (!dryRun) {
      // Ensure grid point exists
      await db
        .insert(commuteGrid)
        .values({
          gridId: point.gridId,
          location: { latitude: point.lat, longitude: point.lng },
        })
        .onConflictDoNothing();

      // Query missing destinations only
      const results: CommuteResult[] = [];
      for (const d of missingDestinations) {
        const odsayResult = await getTransitTime(point.lat, point.lng, d.lat, d.lng);
        if (odsayResult) {
          results.push({
            gridId: point.gridId,
            lat: point.lat,
            lng: point.lng,
            destinationKey: d.destinationKey,
            timeMinutes: odsayResult.timeMinutes,
            routeSnapshot: odsayResult.route,
          });
        } else {
          results.push({
            gridId: point.gridId,
            lat: point.lat,
            lng: point.lng,
            destinationKey: d.destinationKey,
            timeMinutes: null,
            routeSnapshot: null,
          });
        }
      }

      // Insert — skip if already present
      await db
        .insert(commuteTimes)
        .values(
          results.map((r) => ({
            gridId: r.gridId,
            destinationKey: r.destinationKey,
            timeMinutes: r.timeMinutes,
            routeSnapshot: r.routeSnapshot,
          })),
        )
        .onConflictDoNothing();

      for (const r of results) {
        existingPairs.add(pairKey(r.gridId, r.destinationKey));
      }
    }

    processed++;

    if (processed % 50 === 0) {
      console.log(
        JSON.stringify({
          event: 'odsay_grid_progress',
          processed,
          total: pointsToProcess.length,
          dailyRemaining: ODSAY_LIMITER.remainingDaily,
        }),
      );
    }
  }

  console.log(
    JSON.stringify({
      event: 'odsay_grid_complete',
      processed,
      existingPairs: existingPairs.size,
    }),
  );

  return processed;
}

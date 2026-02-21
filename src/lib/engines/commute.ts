import type { CommuteInput, CommuteResult } from '@/types/engine';
import { findNearestGrid, getCommuteTimeWithRouteForGrid } from './spatial';
import { haversine } from './normalize';
import { BUSINESS_DISTRICTS } from '@/etl/config/regions';

/**
 * 2-stage commute time lookup.
 * Priority: Grid DB (pre-computed) → Distance-based estimation.
 *
 * ODsay API removed from runtime path — pre-computed grid data covers
 * business districts; other destinations use distance estimation for
 * relative ranking in the recommend pipeline.
 *
 * Source of Truth: M2 spec Section 5.3
 */

const DISTRICT_MATCH_DISTANCE_KM = 2;

function matchBusinessDistrict(lon: number, lat: number): string | null {
  for (const [key, bd] of Object.entries(BUSINESS_DISTRICTS)) {
    const dist = haversine({ x: lon, y: lat }, { x: bd.lng, y: bd.lat });
    if (dist <= DISTRICT_MATCH_DISTANCE_KM) {
      return key;
    }
  }
  return null;
}

export async function getCommuteTime(input: CommuteInput): Promise<CommuteResult> {
  // Stage 1: Grid DB lookup (pre-computed business district commute times)
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

  // Stage 2: Distance-based estimation (for relative ranking)
  const distKm = haversine(
    { x: input.aptLon, y: input.aptLat },
    { x: input.destLon, y: input.destLat },
  );
  const estimatedTime = Math.round(distKm * 3 + 10);
  return { timeMinutes: estimatedTime, source: 'mock' };
}

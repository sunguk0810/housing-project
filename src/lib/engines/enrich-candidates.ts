import {
  batchChildcareCounts,
  batchSchoolScores,
  batchNearestGrids,
  batchCommuteTimes,
} from '@/lib/queries/batch-spatial';
import { haversine } from '@/lib/engines/normalize';
import { BUSINESS_DISTRICTS } from '@/etl/config/regions';
import type { GeocodedDestination } from '@/lib/engines/scoring-pipeline';
import type { CandidateRow } from '@/lib/queries/fetch-candidates';
import type { CommuteRouteInfo } from '@/types/engine';

/**
 * Batch enrichment: runs 4 DB queries total (instead of N×4~6)
 * then assembles per-candidate enrichment data in JS.
 *
 * Source of Truth: M2 spec Section 6.1 (Steps 6-9)
 */

// --- Types ---

export interface CandidateEnrichment {
  readonly childcareCount: number;
  readonly avgSchoolScore: number;
  readonly commuteTime1: number;
  readonly commuteTime2: number;
  readonly commuteRoute1: CommuteRouteInfo | null;
}

// --- Constants ---

const CHILDCARE_RADIUS = 800;
const SCHOOL_RADIUS = 1500;
const DISTRICT_MATCH_DISTANCE_KM = 2;

// --- Helpers ---

function matchBusinessDistrict(lon: number, lat: number): string | null {
  for (const [key, bd] of Object.entries(BUSINESS_DISTRICTS)) {
    const dist = haversine({ x: lon, y: lat }, { x: bd.lng, y: bd.lat });
    if (dist <= DISTRICT_MATCH_DISTANCE_KM) {
      return key;
    }
  }
  return null;
}

function estimateCommuteByDistance(
  aptLon: number,
  aptLat: number,
  destLon: number,
  destLat: number,
): number {
  const distKm = haversine(
    { x: aptLon, y: aptLat },
    { x: destLon, y: destLat },
  );
  return Math.round(distKm * 3 + 10);
}

// --- Main ---

/**
 * Enrich all candidates with spatial data using batch queries.
 * Returns Map<aptId, CandidateEnrichment>.
 */
export async function enrichCandidates(
  candidates: ReadonlyArray<CandidateRow>,
  job1: GeocodedDestination | null,
  job2: GeocodedDestination | null,
): Promise<Map<number, CandidateEnrichment>> {
  if (candidates.length === 0) return new Map();

  // Batch DB queries (run in parallel where possible)
  const [childcareMap, schoolMap] = await Promise.all([
    batchChildcareCounts(candidates, CHILDCARE_RADIUS),
    batchSchoolScores(candidates, SCHOOL_RADIUS),
  ]);

  // Determine destination keys for grid-based commute lookup
  const dest1Key = job1 ? matchBusinessDistrict(job1.lng, job1.lat) : null;
  const dest2Key = job2 ? matchBusinessDistrict(job2.lng, job2.lat) : null;
  const needGrid = dest1Key !== null || dest2Key !== null;

  let gridMap = new Map<number, string>();
  let commuteMap = new Map<string, { timeMinutes: number | null; routeSnapshot: CommuteRouteInfo | null }>();

  if (needGrid) {
    gridMap = await batchNearestGrids(candidates);

    const gridIds = [...gridMap.values()];
    const destKeys = [dest1Key, dest2Key].filter((k): k is string => k !== null);

    if (gridIds.length > 0 && destKeys.length > 0) {
      commuteMap = await batchCommuteTimes(gridIds, destKeys);
    }
  }

  // Assemble per-candidate enrichment (pure JS)
  const result = new Map<number, CandidateEnrichment>();

  for (const c of candidates) {
    const childcareCount = childcareMap.get(c.id) ?? 0;
    const avgSchoolScore = schoolMap.get(c.id) ?? 0;

    // Commute 1
    let commuteTime1 = 0;
    let commuteRoute1: CommuteRouteInfo | null = null;
    if (job1) {
      if (dest1Key) {
        const gridId = gridMap.get(c.id);
        if (gridId) {
          const ct = commuteMap.get(`${gridId}:${dest1Key}`);
          if (ct && ct.timeMinutes !== null) {
            commuteTime1 = ct.timeMinutes;
            commuteRoute1 = ct.routeSnapshot;
          } else {
            commuteTime1 = estimateCommuteByDistance(c.longitude, c.latitude, job1.lng, job1.lat);
          }
        } else {
          commuteTime1 = estimateCommuteByDistance(c.longitude, c.latitude, job1.lng, job1.lat);
        }
      } else {
        commuteTime1 = estimateCommuteByDistance(c.longitude, c.latitude, job1.lng, job1.lat);
      }
    }

    // Commute 2
    let commuteTime2 = 0;
    if (job2) {
      if (dest2Key) {
        const gridId = gridMap.get(c.id);
        if (gridId) {
          const ct = commuteMap.get(`${gridId}:${dest2Key}`);
          if (ct && ct.timeMinutes !== null) {
            commuteTime2 = ct.timeMinutes;
          } else {
            commuteTime2 = estimateCommuteByDistance(c.longitude, c.latitude, job2.lng, job2.lat);
          }
        } else {
          commuteTime2 = estimateCommuteByDistance(c.longitude, c.latitude, job2.lng, job2.lat);
        }
      } else {
        commuteTime2 = estimateCommuteByDistance(c.longitude, c.latitude, job2.lng, job2.lat);
      }
    }

    result.set(c.id, {
      childcareCount,
      avgSchoolScore,
      commuteTime1,
      commuteTime2,
      commuteRoute1,
    });
  }

  return result;
}

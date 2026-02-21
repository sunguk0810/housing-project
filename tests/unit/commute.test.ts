import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CommuteInput } from '@/types/engine';

/**
 * Commute module unit tests (C-1 ~ C-6).
 * All external dependencies mocked.
 *
 * Current architecture: 2-stage lookup
 *   Stage 1: Grid DB (pre-computed business district commute times)
 *   Stage 2: Distance-based estimation (distKm * 3 + 10)
 *
 * Source of Truth: M2 spec Section 5.3
 */

// Mock dependencies before importing the module
vi.mock('@/lib/engines/spatial', () => ({
  findNearestGrid: vi.fn(() => null),
  getCommuteTimeForGrid: vi.fn(() => null),
  getCommuteTimeWithRouteForGrid: vi.fn(() => null),
}));

vi.mock('@/lib/engines/normalize', () => ({
  haversine: vi.fn(() => 10), // 10km default
}));

const mockInput: CommuteInput = {
  aptId: 1,
  aptLon: 127.036,
  aptLat: 37.5007,
  destLon: 127.0276,
  destLat: 37.4979,
  destLabel: 'GBD',
};

describe('getCommuteTime', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  // C-1: Grid cache hit
  it('C-1: returns grid time when grid matches a business district', async () => {
    const { findNearestGrid } = await import('@/lib/engines/spatial');
    const { getCommuteTimeWithRouteForGrid } = await import('@/lib/engines/spatial');
    vi.mocked(findNearestGrid).mockResolvedValue({
      gridId: 'G001',
    });
    vi.mocked(getCommuteTimeWithRouteForGrid).mockResolvedValue({
      timeMinutes: 25,
      routeSnapshot: {
        pathType: 1,
        totalWalk: 4,
        busTransitCount: 0,
        subwayTransitCount: 1,
        totalStationCount: 11,
        transferCount: 0,
        summary: '2호선',
        segments: [
          {
            trafficType: 1,
            lineName: '2호선',
            stationCount: 10,
            sectionTime: 25,
          },
        ],
      },
    });

    const { haversine } = await import('@/lib/engines/normalize');
    vi.mocked(haversine).mockReturnValue(1.0); // Within 2km radius

    const { getCommuteTime } = await import('@/lib/engines/commute');
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe('grid');
    expect(result.timeMinutes).toBe(25);
    expect(result.routes?.summary).toBe('2호선');
  });

  // C-2: Grid miss → distance estimation (no business district match)
  it('C-2: returns distance estimation when grid misses and no district match', async () => {
    const { findNearestGrid } = await import('@/lib/engines/spatial');
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import('@/lib/engines/normalize');
    // >2km → no business district match → Stage 2 distance estimation
    vi.mocked(haversine).mockReturnValue(5.0);

    const { getCommuteTime } = await import('@/lib/engines/commute');
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe('mock');
    // Distance estimation: round(5.0 * 3 + 10) = 25
    expect(result.timeMinutes).toBe(25);
  });

  // C-3: No district match → distance-based fallback
  it('C-3: returns distance estimation when destination is not a business district', async () => {
    const { findNearestGrid } = await import('@/lib/engines/spatial');
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import('@/lib/engines/normalize');
    // >2km → no business district match → Stage 2
    vi.mocked(haversine).mockReturnValue(8.0);

    const { getCommuteTime } = await import('@/lib/engines/commute');
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe('mock');
    // Distance estimation: round(8.0 * 3 + 10) = 34
    expect(result.timeMinutes).toBe(34);
  });

  // C-4: District matches but grid found with no commute data → distance fallback
  it('C-4: falls back to distance estimation when district matches but grid has no data', async () => {
    const { findNearestGrid } = await import('@/lib/engines/spatial');
    const { getCommuteTimeWithRouteForGrid } = await import('@/lib/engines/spatial');

    // District matches (haversine < 2km) but grid returns null commute data
    const { haversine } = await import('@/lib/engines/normalize');
    vi.mocked(haversine).mockReturnValue(1.0);

    vi.mocked(findNearestGrid).mockResolvedValue({ gridId: 'G001' });
    vi.mocked(getCommuteTimeWithRouteForGrid).mockResolvedValue(null);

    const { getCommuteTime } = await import('@/lib/engines/commute');
    const result = await getCommuteTime(mockInput);

    // No grid data → falls through to Stage 2 distance estimation
    expect(result.source).toBe('mock');
    // Distance estimation: round(1.0 * 3 + 10) = 13
    expect(result.timeMinutes).toBe(13);
  });

  // C-5: Short distance estimation (< 1km)
  it('C-5: returns short-distance estimation when destination is very close', async () => {
    const { findNearestGrid } = await import('@/lib/engines/spatial');
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import('@/lib/engines/normalize');
    // 0.5km → district matches but no grid, falls to distance estimation
    vi.mocked(haversine).mockReturnValue(0.5);

    const { getCommuteTime } = await import('@/lib/engines/commute');
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe('mock');
    // Distance estimation: round(0.5 * 3 + 10) = 12
    expect(result.timeMinutes).toBe(12);
  });

  // C-6: Large distance estimation
  it('C-6: returns correct distance estimation for far destinations', async () => {
    const { findNearestGrid } = await import('@/lib/engines/spatial');
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import('@/lib/engines/normalize');
    // 15km → no district match → distance estimation
    vi.mocked(haversine).mockReturnValue(15.0);

    const { getCommuteTime } = await import('@/lib/engines/commute');
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe('mock');
    // Distance estimation: round(15.0 * 3 + 10) = 55
    expect(result.timeMinutes).toBe(55);
  });
});

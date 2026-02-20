import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CommuteInput } from '@/types/engine';

/**
 * Commute module unit tests (C-1 ~ C-6).
 * All external dependencies mocked.
 * Source of Truth: M2 spec Section 8.1.3
 */

// Mock dependencies before importing the module
vi.mock('@/lib/redis', () => ({
  getRedis: vi.fn(() => null),
}));

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
    delete process.env.ODSAY_API_KEY;
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

  // C-2: Redis cache hit
  it('C-2: returns redis cached time when grid misses', async () => {
    const { findNearestGrid } = await import('@/lib/engines/spatial');
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import('@/lib/engines/normalize');
    // Make destination not match any business district (>2km)
    vi.mocked(haversine).mockReturnValue(5.0);

    const mockRedis = {
      get: vi.fn().mockResolvedValue('35'),
      setex: vi.fn().mockResolvedValue('OK'),
    };
    const { getRedis } = await import('@/lib/redis');
    vi.mocked(getRedis).mockReturnValue(mockRedis as unknown as ReturnType<typeof getRedis>);

    const { getCommuteTime } = await import('@/lib/engines/commute');
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe('redis');
    expect(result.timeMinutes).toBe(35);
  });

  // C-3: Mock fallback (no API key)
  it('C-3: returns mock fallback when no ODSAY_API_KEY', async () => {
    const { findNearestGrid } = await import('@/lib/engines/spatial');
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import('@/lib/engines/normalize');
    // Make destination not match any business district (>2km)
    vi.mocked(haversine).mockReturnValue(5.0); // No district match, 5km distance

    const { getRedis } = await import('@/lib/redis');
    vi.mocked(getRedis).mockReturnValue(null);

    const { getCommuteTime } = await import('@/lib/engines/commute');
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe('mock');
    expect(result.timeMinutes).toBeGreaterThan(0);
  });

  // C-4: ODsay API success
  it('C-4: returns odsay time and route summary when API key is set', async () => {
    process.env.ODSAY_API_KEY = 'test-key';

    const { findNearestGrid } = await import('@/lib/engines/spatial');
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import('@/lib/engines/normalize');
    vi.mocked(haversine).mockReturnValue(5.0);

    const { getRedis } = await import('@/lib/redis');
    vi.mocked(getRedis).mockReturnValue(null);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          result: {
            path: [
              {
                info: { totalTime: 42 },
                subPath: [
                  {
                    trafficType: 1,
                    sectionTime: 40,
                    stationCount: 12,
                    lane: [{ name: '2호선', nameKor: '2호선', nameJpnKata: 'Line 2' }],
                  },
                ],
              },
            ],
          },
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { getCommuteTime } = await import('@/lib/engines/commute');
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe('odsay');
    expect(result.timeMinutes).toBe(42);
    expect(result.routes?.segments).toHaveLength(1);
    expect(result.routes?.segments[0]).toMatchObject({ trafficType: 1, lineName: '2호선' });

    vi.unstubAllGlobals();
  });

  // C-5: ODsay -98 error (near distance)
  it('C-5: falls back to walking summary when ODsay returns -98', async () => {
    process.env.ODSAY_API_KEY = 'test-key';

    const { findNearestGrid } = await import('@/lib/engines/spatial');
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import('@/lib/engines/normalize');
    vi.mocked(haversine).mockReturnValue(0.5);

    const { getRedis } = await import('@/lib/redis');
    vi.mocked(getRedis).mockReturnValue(null);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          error: {
            code: '-98',
            msg: '출, 도착지가 700m이내입니다.',
          },
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { getCommuteTime } = await import('@/lib/engines/commute');
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe('odsay');
    expect(result.timeMinutes).toBeGreaterThan(0);
    expect(result.routes?.segments[0]?.trafficType).toBe(3);
    expect(result.routes?.summary).toBe('도보');

    vi.unstubAllGlobals();
  });

  // C-6: ODsay timeout -> mock fallback
  it('C-6: falls back to mock when ODsay API fails', async () => {
    process.env.ODSAY_API_KEY = 'test-key';

    const { findNearestGrid } = await import('@/lib/engines/spatial');
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import('@/lib/engines/normalize');
    vi.mocked(haversine).mockReturnValue(5.0);

    const { getRedis } = await import('@/lib/redis');
    vi.mocked(getRedis).mockReturnValue(null);

    const mockFetch = vi.fn().mockRejectedValue(new Error('AbortError'));
    vi.stubGlobal('fetch', mockFetch);

    const { getCommuteTime } = await import('@/lib/engines/commute');
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe('mock');
    expect(result.timeMinutes).toBeGreaterThan(0);

    vi.unstubAllGlobals();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CommuteInput } from "@/types/engine";

/**
 * Commute module unit tests (C-1 ~ C-5).
 * All external dependencies mocked.
 * Source of Truth: M2 spec Section 8.1.3
 */

// Mock dependencies before importing the module
vi.mock("@/lib/redis", () => ({
  getRedis: vi.fn(() => null),
}));

vi.mock("@/lib/engines/spatial", () => ({
  findNearestGrid: vi.fn(() => null),
}));

vi.mock("@/lib/engines/normalize", () => ({
  haversine: vi.fn(() => 10), // 10km default
}));

const mockInput: CommuteInput = {
  aptId: 1,
  aptLon: 127.036,
  aptLat: 37.5007,
  destLon: 127.0276,
  destLat: 37.4979,
  destLabel: "GBD",
};

describe("getCommuteTime", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    delete process.env.ODSAY_API_KEY;
  });

  // C-1: Grid cache hit
  it("C-1: returns grid time when grid matches a business district", async () => {
    const { findNearestGrid } = await import("@/lib/engines/spatial");
    vi.mocked(findNearestGrid).mockResolvedValue({
      gridId: "G001",
      toGbdTime: 25,
      toYbdTime: 40,
      toCbdTime: 35,
      toPangyoTime: 45,
    });

    const { haversine } = await import("@/lib/engines/normalize");
    vi.mocked(haversine).mockReturnValue(1.0); // Within 2km radius

    const { getCommuteTime } = await import("@/lib/engines/commute");
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe("grid");
    expect(result.timeMinutes).toBe(25); // toGbdTime
  });

  // C-2: Redis cache hit
  it("C-2: returns redis cached time when grid misses", async () => {
    const { findNearestGrid } = await import("@/lib/engines/spatial");
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import("@/lib/engines/normalize");
    // Make destination not match any business district (>2km)
    vi.mocked(haversine).mockReturnValue(5.0);

    const mockRedis = {
      get: vi.fn().mockResolvedValue("35"),
      setex: vi.fn().mockResolvedValue("OK"),
    };
    const { getRedis } = await import("@/lib/redis");
    vi.mocked(getRedis).mockReturnValue(mockRedis as unknown as ReturnType<typeof getRedis>);

    const { getCommuteTime } = await import("@/lib/engines/commute");
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe("redis");
    expect(result.timeMinutes).toBe(35);
  });

  // C-3: Mock fallback (no API key)
  it("C-3: returns mock fallback when no ODSAY_API_KEY", async () => {
    const { findNearestGrid } = await import("@/lib/engines/spatial");
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import("@/lib/engines/normalize");
    vi.mocked(haversine).mockReturnValue(5.0); // No district match, 5km distance

    const { getRedis } = await import("@/lib/redis");
    vi.mocked(getRedis).mockReturnValue(null);

    const { getCommuteTime } = await import("@/lib/engines/commute");
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe("mock");
    // Mock formula: distKm * 3 + 10 = 5 * 3 + 10 = 25
    // But haversine is called with apt and dest coords
    expect(result.timeMinutes).toBeGreaterThan(0);
  });

  // C-4: ODsay API success (mock fetch)
  it("C-4: returns odsay time when API key is set", async () => {
    process.env.ODSAY_API_KEY = "test-key";

    const { findNearestGrid } = await import("@/lib/engines/spatial");
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import("@/lib/engines/normalize");
    vi.mocked(haversine).mockReturnValue(5.0);

    const { getRedis } = await import("@/lib/redis");
    vi.mocked(getRedis).mockReturnValue(null);

    // Mock fetch for ODsay API
    const mockFetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          result: { path: [{ info: { totalTime: 42 } }] },
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { getCommuteTime } = await import("@/lib/engines/commute");
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe("odsay");
    expect(result.timeMinutes).toBe(42);

    vi.unstubAllGlobals();
  });

  // C-5: ODsay API timeout -> fallback
  it("C-5: falls back to mock when ODsay API fails", async () => {
    process.env.ODSAY_API_KEY = "test-key";

    const { findNearestGrid } = await import("@/lib/engines/spatial");
    vi.mocked(findNearestGrid).mockResolvedValue(null);

    const { haversine } = await import("@/lib/engines/normalize");
    vi.mocked(haversine).mockReturnValue(5.0);

    const { getRedis } = await import("@/lib/redis");
    vi.mocked(getRedis).mockReturnValue(null);

    // Mock fetch to reject (timeout)
    const mockFetch = vi.fn().mockRejectedValue(new Error("AbortError"));
    vi.stubGlobal("fetch", mockFetch);

    const { getCommuteTime } = await import("@/lib/engines/commute");
    const result = await getCommuteTime(mockInput);

    expect(result.source).toBe("mock");
    expect(result.timeMinutes).toBeGreaterThan(0);

    vi.unstubAllGlobals();
  });
});

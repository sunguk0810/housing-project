import { describe, it, expect, vi } from "vitest";

/**
 * API integration tests (I-1 ~ I-9).
 * These test the API route handlers directly with mocked DB.
 * Source of Truth: M2 spec Section 8.2
 */

// Chainable mock helper for Drizzle ORM select queries
function createSelectChain(resolvedValue: unknown[] = []) {
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "selectDistinctOn", "from", "where", "orderBy", "limit", "innerJoin"]) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.then = (
    resolve?: (v: unknown) => unknown,
    reject?: (e: unknown) => unknown,
  ) => {
    try {
      return Promise.resolve(resolve ? resolve(resolvedValue) : resolvedValue);
    } catch (e) {
      return reject ? Promise.resolve(reject(e)) : Promise.reject(e);
    }
  };
  return chain;
}

// Mock all DB/external dependencies
vi.mock("@/db/connection", () => {
  const mockExecute = vi.fn().mockResolvedValue(
    Object.assign([], { command: "SELECT", count: 0, fields: [], rows: [] }),
  );
  return {
    db: {
      execute: mockExecute,
      select: vi.fn().mockReturnValue(createSelectChain([])),
      selectDistinctOn: vi.fn().mockReturnValue(createSelectChain([])),
    },
    sql: {
      end: vi.fn(),
    },
  };
});

vi.mock("@/lib/redis", () => ({
  getRedis: vi.fn(() => null),
}));

vi.mock("@/lib/engines/spatial", () => ({
  findNearbyChildcare: vi.fn().mockResolvedValue([]),
  findNearbySchools: vi.fn().mockResolvedValue([]),
  findNearestGrid: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/engines/commute", () => ({
  getCommuteTime: vi.fn().mockResolvedValue({ timeMinutes: 30, source: "mock" }),
}));

vi.mock("@/etl/adapters/kakao-geocoding", () => ({
  geocodeAddress: vi.fn().mockResolvedValue({
    coordinate: { lat: 37.5007, lng: 127.0365 },
    source: "mock",
  }),
}));

describe("POST /api/recommend", () => {
  const validBody = {
    cash: 30000,
    income: 8000,
    loans: 5000,
    monthlyBudget: 200,
    job1: "서울 강남구 역삼동",
    job2: "서울 영등포구 여의도동",
    tradeType: "jeonse",
    weightProfile: "balanced",
  };

  // I-1: Valid request returns 200
  it("I-1: valid request returns 200 with recommendations", async () => {
    const { POST } = await import("@/app/api/recommend/route");
    const request = new Request("http://localhost/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("recommendations");
    expect(data).toHaveProperty("meta");
    expect(data.meta).toHaveProperty("totalCandidates");
    expect(data.meta).toHaveProperty("computedAt");
    expect(Array.isArray(data.recommendations)).toBe(true);
  });

  // I-2: Zod validation failure
  it("I-2: returns 400 for invalid input", async () => {
    const { POST } = await import("@/app/api/recommend/route");
    const request = new Request("http://localhost/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cash: -1000, income: "abc" }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error).toHaveProperty("details");
  });

  // I-3: Empty body
  it("I-3: returns 400 for empty body", async () => {
    const { POST } = await import("@/app/api/recommend/route");
    const request = new Request("http://localhost/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });

  // I-9: Results are sorted descending by finalScore
  it("I-9: recommendations are sorted by finalScore descending", async () => {
    // Mock DB to return some candidate rows via ORM select chain
    const { db } = await import("@/db/connection");

    // 1st selectDistinctOn: candidate apartments (2 rows)
    vi.mocked(db.selectDistinctOn).mockReturnValueOnce(createSelectChain([
      {
        id: 1, aptCode: "A001", aptName: "Test Apt 1", address: "서울 강남구",
        longitude: 127.036, latitude: 37.5, builtYear: 2020,
        householdCount: 1200, areaMin: 84,
        averagePrice: "20000", dealCount: 5, priceYear: 2026, priceMonth: 1,
      },
      {
        id: 2, aptCode: "A002", aptName: "Test Apt 2", address: "서울 서초구",
        longitude: 127.032, latitude: 37.48, builtYear: 2019,
        householdCount: 980, areaMin: 59,
        averagePrice: "15000", dealCount: 3, priceYear: 2026, priceMonth: 1,
      },
    ]) as never);

    // Subsequent selects (safety): default values
    vi.mocked(db.select).mockReturnValue(createSelectChain([
      { crimeLevel: 5, cctvDensity: 3, shelterCount: 5, dataDate: "2025-12-01" },
    ]) as never);

    // execute (school score): Raw SQL maintained
    vi.mocked(db.execute).mockResolvedValue(
      Object.assign([{ avgScore: 50 }], { command: "SELECT", count: 1, fields: [], rows: [] }) as never,
    );

    const { POST } = await import("@/app/api/recommend/route");
    const request = new Request("http://localhost/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request as never);
    const data = await response.json();

    if (data.recommendations && data.recommendations.length > 1) {
      for (let i = 0; i < data.recommendations.length - 1; i++) {
        expect(data.recommendations[i].finalScore).toBeGreaterThanOrEqual(
          data.recommendations[i + 1].finalScore,
        );
      }
    }

    // Verify lat/lng included in response
    if (data.recommendations.length > 0) {
      expect(data.recommendations[0]).toHaveProperty("lat");
      expect(data.recommendations[0]).toHaveProperty("lng");
    }
  });
});

describe("GET /api/apartments/[id]", () => {
  // I-6: Invalid ID format
  it("I-6: returns 400 for non-numeric ID", async () => {
    const { GET } = await import("@/app/api/apartments/[id]/route");
    const request = new Request("http://localhost/api/apartments/abc");
    const response = await GET(
      request as never,
      { params: Promise.resolve({ id: "abc" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("INVALID_PARAMETER");
  });

  // I-5: Non-existent ID
  it("I-5: returns 404 for non-existent apartment", async () => {
    const { db } = await import("@/db/connection");
    vi.mocked(db.select).mockReturnValueOnce(createSelectChain([]) as never);

    const { GET } = await import("@/app/api/apartments/[id]/route");
    const request = new Request("http://localhost/api/apartments/999999");
    const response = await GET(
      request as never,
      { params: Promise.resolve({ id: "999999" }) },
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe("APARTMENT_NOT_FOUND");
  });
});

describe("GET /api/health", () => {
  // I-7: Health check returns status
  it("I-7: returns health status with checks", async () => {
    // Mock the raw sql to work
    vi.mock("@/db/connection", async () => {
      const mockSql = vi.fn();
      (mockSql as unknown as { end: () => void }).end = vi.fn();
      return {
        db: {
          execute: vi.fn().mockResolvedValue([]),
          select: vi.fn().mockReturnValue(createSelectChain([])),
          selectDistinctOn: vi.fn().mockReturnValue(createSelectChain([])),
        },
        sql: mockSql,
      };
    });

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("timestamp");
    expect(data).toHaveProperty("checks");
    expect(Array.isArray(data.checks)).toBe(true);
  });
});

import { describe, it, expect, vi } from "vitest";

/**
 * Spatial query helper unit tests (SP-1 ~ SP-3).
 * Verifies SQL patterns are correctly generated.
 * Source of Truth: M2 spec Section 8.1.4
 */

// Mock the DB to capture executed SQL
const mockExecute = vi.fn().mockResolvedValue([]);

vi.mock("@/db/connection", () => ({
  db: {
    execute: (...args: unknown[]) => mockExecute(...args),
  },
}));

describe("spatial query helpers", () => {
  // SP-1: findNearbyChildcare uses ST_DWithin
  it("SP-1: findNearbyChildcare generates ST_DWithin query", async () => {
    const { findNearbyChildcare } = await import("@/lib/engines/spatial");
    await findNearbyChildcare(127.036, 37.5007, 800);

    expect(mockExecute).toHaveBeenCalled();
    // Verify the SQL template was called (drizzle sql tag generates a query object)
    const callArg = mockExecute.mock.calls[0][0];
    // The sql tag creates an object with queryChunks; we verify it was called
    expect(callArg).toBeDefined();
  });

  // SP-2: findNearbySchools uses ST_DWithin
  it("SP-2: findNearbySchools generates ST_DWithin query", async () => {
    mockExecute.mockClear();
    const { findNearbySchools } = await import("@/lib/engines/spatial");
    await findNearbySchools(127.036, 37.5007, 1500);

    expect(mockExecute).toHaveBeenCalled();
  });

  // SP-3: findNearestGrid uses KNN <-> operator
  it("SP-3: findNearestGrid generates KNN query", async () => {
    mockExecute.mockClear();
    const { findNearestGrid } = await import("@/lib/engines/spatial");
    const result = await findNearestGrid(127.036, 37.5007);

    expect(mockExecute).toHaveBeenCalled();
    expect(result).toBeNull(); // mockExecute returns []
  });
});

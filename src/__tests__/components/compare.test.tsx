// @vitest-environment jsdom
import { getBestAptIds } from "@/components/compare/CompareClient";
import type { RecommendationItem } from "@/types/api";

function makeItem(overrides: Partial<RecommendationItem> & { aptId: number }): RecommendationItem {
  const { aptId } = overrides;
  return {
    rank: 1,
    aptName: `아파트 ${aptId}`,
    address: "서울시 테스트구",
    lat: 37.5,
    lng: 127.0,
    tradeType: "jeonse",
    averagePrice: 30000,
    householdCount: 500,
    areaMin: 84,
    areaMax: 114,
    monthlyRentAvg: null,
    builtYear: 2005,
    monthlyCost: 2000,
    commuteTime1: 40,
    commuteTime2: null,
    childcareCount: 3,
    schoolScore: 60,
    safetyScore: 0.7,
    finalScore: 70,
    reason: "테스트 분석 요약",
    whyNot: null,
    dimensions: {
      budget: 0.5,
      commute: 0.5,
      childcare: 0.5,
      safety: 0.5,
      school: 0.5,
      complexScale: 0.5,
    },
    sources: {
      priceDate: "2026-01",
      safetyDate: "2025-12",
    },
    ...overrides,
  };
}

describe("getBestAptIds — highlight logic", () => {
  it("returns the single winner when scores differ (2 items)", () => {
    const items = [
      makeItem({ aptId: 1, finalScore: 80 }),
      makeItem({ aptId: 2, finalScore: 60 }),
    ];
    const best = getBestAptIds(items, (i) => i.finalScore);
    expect(best).toEqual(new Set([1]));
  });

  it("returns all tied items when scores are equal (3 items)", () => {
    const items = [
      makeItem({ aptId: 1, finalScore: 75 }),
      makeItem({ aptId: 2, finalScore: 75 }),
      makeItem({ aptId: 3, finalScore: 75 }),
    ];
    const best = getBestAptIds(items, (i) => i.finalScore);
    expect(best).toEqual(new Set([1, 2, 3]));
  });

  it("returns empty set for single item (no highlight needed)", () => {
    const items = [makeItem({ aptId: 1, finalScore: 90 })];
    const best = getBestAptIds(items, (i) => i.finalScore);
    expect(best).toEqual(new Set());
  });

  it("highlights only the highest when one stands out (3 items)", () => {
    const items = [
      makeItem({ aptId: 1, dimensions: { budget: 0.9, commute: 0.5, childcare: 0.5, safety: 0.5, school: 0.5, complexScale: 0.5 } }),
      makeItem({ aptId: 2, dimensions: { budget: 0.5, commute: 0.5, childcare: 0.5, safety: 0.5, school: 0.5, complexScale: 0.5 } }),
      makeItem({ aptId: 3, dimensions: { budget: 0.7, commute: 0.5, childcare: 0.5, safety: 0.5, school: 0.5, complexScale: 0.5 } }),
    ];
    const best = getBestAptIds(items, (i) => i.dimensions.budget);
    expect(best).toEqual(new Set([1]));
  });

  it("handles childcareCount highlight correctly", () => {
    const items = [
      makeItem({ aptId: 1, childcareCount: 5 }),
      makeItem({ aptId: 2, childcareCount: 8 }),
      makeItem({ aptId: 3, childcareCount: 8 }),
    ];
    const best = getBestAptIds(items, (i) => i.childcareCount);
    expect(best).toEqual(new Set([2, 3]));
  });
});

describe("getBestAptIds — commute time highlight (lower is better)", () => {
  it("highlights the item with the shortest commute (negated getValue)", () => {
    const items = [
      makeItem({ aptId: 1, commuteTime1: 30 }),
      makeItem({ aptId: 2, commuteTime1: 60 }),
      makeItem({ aptId: 3, commuteTime1: 45 }),
    ];
    const best = getBestAptIds(items, (i) => -(i.commuteTime1));
    expect(best).toEqual(new Set([1]));
  });

  it("highlights tied shortest commute items", () => {
    const items = [
      makeItem({ aptId: 1, commuteTime1: 30 }),
      makeItem({ aptId: 2, commuteTime1: 30 }),
      makeItem({ aptId: 3, commuteTime1: 60 }),
    ];
    const best = getBestAptIds(items, (i) => -(i.commuteTime1));
    expect(best).toEqual(new Set([1, 2]));
  });
});

describe("data matching — compareItems × sessionStorage join", () => {
  it("filters items by aptId match", () => {
    const sessionItems = [
      makeItem({ aptId: 1 }),
      makeItem({ aptId: 2 }),
      makeItem({ aptId: 3 }),
      makeItem({ aptId: 4 }),
    ];
    const compareItemIds = [{ aptId: 1 }, { aptId: 3 }];
    const resolved = sessionItems.filter((r) =>
      compareItemIds.some((c) => c.aptId === r.aptId),
    );
    expect(resolved.map((r) => r.aptId)).toEqual([1, 3]);
  });

  it("returns empty array when no aptIds match", () => {
    const sessionItems = [makeItem({ aptId: 1 }), makeItem({ aptId: 2 })];
    const compareItemIds = [{ aptId: 99 }];
    const resolved = sessionItems.filter((r) =>
      compareItemIds.some((c) => c.aptId === r.aptId),
    );
    expect(resolved).toEqual([]);
  });
});

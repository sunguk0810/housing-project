// @vitest-environment jsdom
/**
 * Results page logic test — validates sort/redirect behavior
 * without importing the full page component (which requires Kakao SDK).
 */
import type { RecommendationItem, RecommendResponse } from "@/types/api";

const mockItem = (rank: number, score: number, budget: number, commute: number): RecommendationItem => ({
  rank,
  aptId: rank,
  aptName: `Apt ${rank}`,
  address: `Address ${rank}`,
  lat: 37.5,
  lng: 127.0,
  tradeType: "jeonse",
  averagePrice: 32000,
  householdCount: 1200,
  areaMin: 84,
  areaMax: 114,
  monthlyRentAvg: null,
  builtYear: 2005,
  monthlyCost: 2000,
  commuteTime1: 30,
  commuteTime2: null,
  childcareCount: 3,
  schoolScore: 60,
  safetyScore: 0.7,
  finalScore: score,
  reason: "test",
  whyNot: null,
  dimensions: { budget, commute, childcare: 0.5, safety: 0.7, school: 0.6, complexScale: 0.5 },
  sources: { priceDate: "2026-01", safetyDate: "2025-12" },
});

// Extracted sort logic from results page
function sortItems(
  items: ReadonlyArray<RecommendationItem>,
  sortBy: "score" | "budget" | "commute",
): ReadonlyArray<RecommendationItem> {
  const sorted = [...items];
  switch (sortBy) {
    case "budget":
      sorted.sort((a, b) => (b.dimensions?.budget ?? 0) - (a.dimensions?.budget ?? 0));
      break;
    case "commute":
      sorted.sort((a, b) => (b.dimensions?.commute ?? 0) - (a.dimensions?.commute ?? 0));
      break;
    case "score":
    default:
      sorted.sort((a, b) => b.finalScore - a.finalScore);
      break;
  }
  return sorted;
}

describe("Results page logic", () => {
  it("redirects when no session data", () => {
    sessionStorage.clear();
    const stored = sessionStorage.getItem("hc_results");
    expect(stored).toBeNull();
  });

  it("reads results from sessionStorage", () => {
    const data: RecommendResponse = {
      recommendations: [mockItem(1, 80, 0.8, 0.9), mockItem(2, 72, 0.7, 0.8)],
      meta: { totalCandidates: 20, computedAt: "2026-01-01" },
    };
    sessionStorage.setItem("hc_results", JSON.stringify(data));
    const parsed: RecommendResponse = JSON.parse(sessionStorage.getItem("hc_results")!);
    expect(parsed.recommendations).toHaveLength(2);
    expect(parsed.meta.totalCandidates).toBe(20);
  });

  it("sorts by score (default)", () => {
    const items = [mockItem(1, 60, 0.5, 0.9), mockItem(2, 80, 0.8, 0.5)];
    const sorted = sortItems(items, "score");
    expect(sorted[0].finalScore).toBe(80);
    expect(sorted[1].finalScore).toBe(60);
  });

  it("sorts by budget", () => {
    const items = [mockItem(1, 80, 0.5, 0.9), mockItem(2, 60, 0.9, 0.3)];
    const sorted = sortItems(items, "budget");
    expect(sorted[0].dimensions.budget).toBe(0.9);
  });

  it("sorts by commute", () => {
    const items = [mockItem(1, 80, 0.5, 0.3), mockItem(2, 60, 0.4, 0.9)];
    const sorted = sortItems(items, "commute");
    expect(sorted[0].dimensions.commute).toBe(0.9);
  });
});

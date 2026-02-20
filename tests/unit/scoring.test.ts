import { describe, it, expect } from "vitest";
import { normalizeScore, calculateFinalScore, WEIGHT_PROFILES } from "@/lib/engines/scoring";
import type { ScoringInput } from "@/types/engine";

/**
 * Scoring engine unit tests (S-1 ~ S-23).
 * Source of Truth: PHASE1 S4 (V2 normalization)
 *
 * Budget normalization: price utilization curve
 *   0-50%: 0.3 → 0.85 | 50-85%: 0.85 → 1.0 | 85-100%: 1.0 → 0.7
 * Childcare normalization: sqrt(count / 30), cap 1.0
 */

function makeInput(overrides: Partial<ScoringInput> = {}): ScoringInput {
  return {
    apartmentPrice: 40000,
    maxPrice: 60000,
    commuteTime1: 30,
    commuteTime2: 30,
    childcareCount800m: 15,
    crimeLevel: 5,
    cctvDensity: 3,
    shelterCount: 5,
    achievementScore: 50,
    ...overrides,
  };
}

describe("normalizeScore", () => {
  // S-1: Budget — 70% utilization (sweet spot)
  it("S-1: budget at 70% utilization ≈ 0.94", () => {
    const dims = normalizeScore(makeInput({ apartmentPrice: 42000, maxPrice: 60000 }));
    // ratio = 0.7 → 0.85 + (0.2/0.35)*0.15 = 0.85 + 0.086 = 0.936
    expect(dims.budget).toBeCloseTo(0.936, 2);
  });

  // S-2: Budget — 100% utilization
  it("S-2: budget at 100% utilization = 0.7", () => {
    const dims = normalizeScore(makeInput({ apartmentPrice: 60000, maxPrice: 60000 }));
    expect(dims.budget).toBeCloseTo(0.7, 2);
  });

  // S-3: Budget — low utilization (22.5%)
  it("S-3: budget at 22.5% utilization ≈ 0.55", () => {
    const dims = normalizeScore(makeInput({ apartmentPrice: 13500, maxPrice: 60000 }));
    // ratio = 0.225 → 0.3 + 0.225*1.1 = 0.548
    expect(dims.budget).toBeCloseTo(0.548, 2);
  });

  // S-4: Budget — 85% utilization (peak)
  it("S-4: budget at 85% utilization = 1.0", () => {
    const dims = normalizeScore(makeInput({ apartmentPrice: 51000, maxPrice: 60000 }));
    expect(dims.budget).toBeCloseTo(1.0, 2);
  });

  // S-5: Budget — maxPrice is 0
  it("S-5: budget = 0 when maxPrice is 0", () => {
    const dims = normalizeScore(makeInput({ apartmentPrice: 10000, maxPrice: 0 }));
    expect(dims.budget).toBe(0);
  });

  // S-6: Budget — mid utilization differentiates expensive from cheap
  it("S-6: 63% utilization scores higher than 22% utilization", () => {
    const cheap = normalizeScore(makeInput({ apartmentPrice: 13500, maxPrice: 60000 }));
    const mid = normalizeScore(makeInput({ apartmentPrice: 38000, maxPrice: 60000 }));
    expect(mid.budget).toBeGreaterThan(cheap.budget);
    expect(mid.budget - cheap.budget).toBeGreaterThan(0.3); // meaningful difference
  });

  // S-7: Commute normalization — 0 min
  it("S-7: commute = 1.0 at 0 min", () => {
    const dims = normalizeScore(makeInput({ commuteTime1: 0, commuteTime2: 0 }));
    expect(dims.commute).toBeCloseTo(1.0, 5);
  });

  // S-8: Commute normalization — 30 min
  it("S-8: commute = 0.5 at 30 min", () => {
    const dims = normalizeScore(makeInput({ commuteTime1: 20, commuteTime2: 30 }));
    expect(dims.commute).toBeCloseTo(0.5, 5);
  });

  // S-9: Commute normalization — 60 min (boundary)
  it("S-9: commute = 0.0 at 60 min", () => {
    const dims = normalizeScore(makeInput({ commuteTime1: 60, commuteTime2: 45 }));
    expect(dims.commute).toBeCloseTo(0.0, 5);
  });

  // S-10: Commute normalization — 90 min (over)
  it("S-10: commute = 0.0 at 90 min", () => {
    const dims = normalizeScore(makeInput({ commuteTime1: 90, commuteTime2: 60 }));
    expect(dims.commute).toBeCloseTo(0.0, 5);
  });

  // S-11: Childcare normalization — 0
  it("S-11: childcare = 0.0 at 0 centers", () => {
    const dims = normalizeScore(makeInput({ childcareCount800m: 0 }));
    expect(dims.childcare).toBeCloseTo(0.0, 5);
  });

  // S-12: Childcare normalization — 8 centers (diminishing returns)
  it("S-12: childcare ≈ 0.52 at 8 centers", () => {
    const dims = normalizeScore(makeInput({ childcareCount800m: 8 }));
    // sqrt(8/30) = 0.516
    expect(dims.childcare).toBeCloseTo(0.516, 2);
  });

  // S-13: Childcare normalization — 20 centers
  it("S-13: childcare ≈ 0.82 at 20 centers", () => {
    const dims = normalizeScore(makeInput({ childcareCount800m: 20 }));
    // sqrt(20/30) = 0.816
    expect(dims.childcare).toBeCloseTo(0.816, 2);
  });

  // S-14: Childcare normalization — 30 centers (cap)
  it("S-14: childcare = 1.0 at 30 centers", () => {
    const dims = normalizeScore(makeInput({ childcareCount800m: 30 }));
    expect(dims.childcare).toBeCloseTo(1.0, 2);
  });

  // S-15: Childcare normalization — 50 centers (clamped)
  it("S-15: childcare = 1.0 at 50+ centers (clamped)", () => {
    const dims = normalizeScore(makeInput({ childcareCount800m: 50 }));
    expect(dims.childcare).toBeCloseTo(1.0, 2);
  });

  // S-16: Safety composite — safest
  it("S-16: safety = 1.0 at best values", () => {
    const dims = normalizeScore(
      makeInput({ crimeLevel: 1, cctvDensity: 5, shelterCount: 10 }),
    );
    expect(dims.safety).toBeCloseTo(1.0, 5);
  });

  // S-17: Safety composite — most dangerous
  it("S-17: safety = 0.0 at worst values", () => {
    const dims = normalizeScore(
      makeInput({ crimeLevel: 10, cctvDensity: 0, shelterCount: 0 }),
    );
    expect(dims.safety).toBeCloseTo(0.0, 5);
  });

  // S-18: Safety composite — medium values
  it("S-18: safety ≈ 0.558 at medium values", () => {
    const dims = normalizeScore(
      makeInput({ crimeLevel: 5, cctvDensity: 3, shelterCount: 5 }),
    );
    expect(dims.safety).toBeCloseTo(0.5578, 3);
  });

  // S-19: School normalization
  it("S-19: school = 0.0/0.5/1.0 at 0/50/100", () => {
    expect(normalizeScore(makeInput({ achievementScore: 0 })).school).toBeCloseTo(0.0, 5);
    expect(normalizeScore(makeInput({ achievementScore: 50 })).school).toBeCloseTo(0.5, 5);
    expect(normalizeScore(makeInput({ achievementScore: 100 })).school).toBeCloseTo(1.0, 5);
  });
});

describe("calculateFinalScore", () => {
  // S-20: All perfect — balanced (85% utilization = budget peak, 30 childcare)
  it("S-20: balanced near-perfect ≈ 100", () => {
    const input = makeInput({
      apartmentPrice: 51000,
      maxPrice: 60000,     // 85% utilization → budget = 1.0
      commuteTime1: 0,
      commuteTime2: 0,
      childcareCount800m: 30,
      crimeLevel: 1,
      cctvDensity: 5,
      shelterCount: 10,
      achievementScore: 100,
    });
    const result = calculateFinalScore(input, "balanced");
    expect(result.finalScore).toBeCloseTo(100.0, 0);
  });

  // S-21: All worst — balanced
  it("S-21: balanced all worst ≈ 0", () => {
    const input = makeInput({
      apartmentPrice: 0,
      maxPrice: 60000,   // 0% utilization → budget = 0.3
      commuteTime1: 90,
      commuteTime2: 90,
      childcareCount800m: 0,
      crimeLevel: 10,
      cctvDensity: 0,
      shelterCount: 0,
      achievementScore: 0,
    });
    const result = calculateFinalScore(input, "balanced");
    // budget=0.3 → 0.3*0.3=0.09, rest=0 → score ≈ 9.0
    expect(result.finalScore).toBeLessThan(15);
  });

  // S-22: budget_focused scores higher with high budget utilization
  it("S-22: budget_focused scores higher with high budget dimension", () => {
    const input = makeInput({
      apartmentPrice: 48000,
      maxPrice: 60000,   // 80% utilization → budget ≈ 0.98
      commuteTime1: 42,
      commuteTime2: 42,
      childcareCount800m: 15,
      crimeLevel: 5,
      cctvDensity: 3,
      shelterCount: 5,
      achievementScore: 40,
    });
    const balanced = calculateFinalScore(input, "balanced");
    const budgetFocused = calculateFinalScore(input, "budget_focused");
    expect(budgetFocused.finalScore).toBeGreaterThan(balanced.finalScore);
  });

  // S-23: commute_focused benefits from high commute score
  it("S-23: commute_focused scores higher with high commute dimension", () => {
    const input = makeInput({
      apartmentPrice: 12000,
      maxPrice: 60000,   // 20% → budget ≈ 0.52
      commuteTime1: 6,
      commuteTime2: 6,
      childcareCount800m: 15,
      crimeLevel: 5,
      cctvDensity: 3,
      shelterCount: 5,
      achievementScore: 50,
    });
    const balanced = calculateFinalScore(input, "balanced");
    const commuteFocused = calculateFinalScore(input, "commute_focused");
    expect(commuteFocused.finalScore).toBeGreaterThan(balanced.finalScore);
  });

  // S-24: whyNot generation — lowest dimension < 0.5
  it("S-24: generates whyNot when commute score is 0", () => {
    const input = makeInput({
      apartmentPrice: 48000,
      maxPrice: 60000,
      commuteTime1: 90,
      commuteTime2: 90,
      childcareCount800m: 30,
      crimeLevel: 1,
      cctvDensity: 5,
      shelterCount: 10,
      achievementScore: 100,
    });
    const result = calculateFinalScore(input, "balanced");
    expect(result.whyNot).toBeTruthy();
    expect(result.whyNot.length).toBeGreaterThan(0);
  });

  // S-25: whyNot empty when all scores >= 0.5
  it("S-25: whyNot is empty when all dimensions >= 0.5", () => {
    const input = makeInput({
      apartmentPrice: 42000,
      maxPrice: 60000,   // 70% → budget ≈ 0.94
      commuteTime1: 20,
      commuteTime2: 20,
      childcareCount800m: 10,
      crimeLevel: 3,
      cctvDensity: 4,
      shelterCount: 8,
      achievementScore: 60,
    });
    const result = calculateFinalScore(input, "balanced");
    expect(result.whyNot).toBe("");
  });

  // S-26: Price utilization differentiates same-commute apartments
  it("S-26: higher-priced affordable apartment scores better on budget", () => {
    const cheap = calculateFinalScore(
      makeInput({ apartmentPrice: 13500, maxPrice: 60000 }),
      "balanced",
    );
    const expensive = calculateFinalScore(
      makeInput({ apartmentPrice: 45000, maxPrice: 60000 }),
      "balanced",
    );
    expect(expensive.dimensions.budget).toBeGreaterThan(cheap.dimensions.budget);
  });
});

describe("WEIGHT_PROFILES", () => {
  it("all profiles sum to 1.0", () => {
    for (const [, weights] of Object.entries(WEIGHT_PROFILES)) {
      const sum =
        weights.budget +
        weights.commute +
        weights.childcare +
        weights.safety +
        weights.school;
      expect(sum).toBeCloseTo(1.0, 5);
    }
  });
});

import { describe, it, expect } from "vitest";
import { normalizeScore, calculateFinalScore, WEIGHT_PROFILES } from "@/lib/engines/scoring";
import type { ScoringInput } from "@/types/engine";

/**
 * Scoring engine unit tests (S-1 ~ S-23).
 * Source of Truth: M2 spec Section 8.1.2, PHASE1 S4
 */

function makeInput(overrides: Partial<ScoringInput> = {}): ScoringInput {
  return {
    maxBudget: 50000,
    monthlyCost: 25000,
    commuteTime1: 30,
    commuteTime2: 30,
    childcareCount800m: 5,
    crimeLevel: 5,
    cctvDensity: 3,
    shelterCount: 5,
    achievementScore: 50,
    ...overrides,
  };
}

describe("normalizeScore", () => {
  // S-1: Budget normalization — plenty of room
  it("S-1: budget = max(0, (50000-10000)/50000) = 0.8", () => {
    const dims = normalizeScore(makeInput({ maxBudget: 50000, monthlyCost: 10000 }));
    expect(dims.budget).toBeCloseTo(0.8, 5);
  });

  // S-2: Budget normalization — no room
  it("S-2: budget = max(0, (30000-30000)/30000) = 0.0", () => {
    const dims = normalizeScore(makeInput({ maxBudget: 30000, monthlyCost: 30000 }));
    expect(dims.budget).toBeCloseTo(0.0, 5);
  });

  // S-3: Budget normalization — over budget (clamped to 0)
  it("S-3: budget = max(0, (20000-25000)/20000) = 0.0", () => {
    const dims = normalizeScore(makeInput({ maxBudget: 20000, monthlyCost: 25000 }));
    expect(dims.budget).toBeCloseTo(0.0, 5);
  });

  // S-4: Commute normalization — 0 min
  it("S-4: commute = max(0, (60-max(0,0))/60) = 1.0", () => {
    const dims = normalizeScore(makeInput({ commuteTime1: 0, commuteTime2: 0 }));
    expect(dims.commute).toBeCloseTo(1.0, 5);
  });

  // S-5: Commute normalization — 30 min
  it("S-5: commute = max(0, (60-30)/60) = 0.5", () => {
    const dims = normalizeScore(makeInput({ commuteTime1: 20, commuteTime2: 30 }));
    expect(dims.commute).toBeCloseTo(0.5, 5);
  });

  // S-6: Commute normalization — 60 min (boundary)
  it("S-6: commute = max(0, (60-60)/60) = 0.0", () => {
    const dims = normalizeScore(makeInput({ commuteTime1: 60, commuteTime2: 45 }));
    expect(dims.commute).toBeCloseTo(0.0, 5);
  });

  // S-7: Commute normalization — 90 min (over)
  it("S-7: commute = max(0, (60-90)/60) = 0.0", () => {
    const dims = normalizeScore(makeInput({ commuteTime1: 90, commuteTime2: 60 }));
    expect(dims.commute).toBeCloseTo(0.0, 5);
  });

  // S-8: Childcare normalization — 0
  it("S-8: childcare = min(0, 10)/10 = 0.0", () => {
    const dims = normalizeScore(makeInput({ childcareCount800m: 0 }));
    expect(dims.childcare).toBeCloseTo(0.0, 5);
  });

  // S-9: Childcare normalization — 5
  it("S-9: childcare = min(5, 10)/10 = 0.5", () => {
    const dims = normalizeScore(makeInput({ childcareCount800m: 5 }));
    expect(dims.childcare).toBeCloseTo(0.5, 5);
  });

  // S-10: Childcare normalization — 10
  it("S-10: childcare = min(10, 10)/10 = 1.0", () => {
    const dims = normalizeScore(makeInput({ childcareCount800m: 10 }));
    expect(dims.childcare).toBeCloseTo(1.0, 5);
  });

  // S-11: Childcare normalization — 15 (clamped)
  it("S-11: childcare = min(15, 10)/10 = 1.0", () => {
    const dims = normalizeScore(makeInput({ childcareCount800m: 15 }));
    expect(dims.childcare).toBeCloseTo(1.0, 5);
  });

  // S-12: Safety composite — safest
  it("S-12: safety = 0.5*1.0 + 0.3*1.0 + 0.2*1.0 = 1.0", () => {
    const dims = normalizeScore(
      makeInput({ crimeLevel: 1, cctvDensity: 5, shelterCount: 10 }),
    );
    expect(dims.safety).toBeCloseTo(1.0, 5);
  });

  // S-13: Safety composite — most dangerous
  it("S-13: safety = 0.5*0.0 + 0.3*0.0 + 0.2*0.0 = 0.0", () => {
    const dims = normalizeScore(
      makeInput({ crimeLevel: 10, cctvDensity: 0, shelterCount: 0 }),
    );
    expect(dims.safety).toBeCloseTo(0.0, 5);
  });

  // S-14: Safety composite — medium values
  it("S-14: safety ≈ 0.558", () => {
    const dims = normalizeScore(
      makeInput({ crimeLevel: 5, cctvDensity: 3, shelterCount: 5 }),
    );
    // crime_norm = (10-5)/9 = 0.5556
    // cctv_norm = 3/5 = 0.6
    // shelter_norm = 5/10 = 0.5
    // safety = 0.5*0.5556 + 0.3*0.6 + 0.2*0.5 = 0.2778 + 0.18 + 0.1 = 0.5578
    expect(dims.safety).toBeCloseTo(0.5578, 3);
  });

  // S-15: School normalization — 0
  it("S-15: school = 0/100 = 0.0", () => {
    const dims = normalizeScore(makeInput({ achievementScore: 0 }));
    expect(dims.school).toBeCloseTo(0.0, 5);
  });

  // S-16: School normalization — 50
  it("S-16: school = 50/100 = 0.5", () => {
    const dims = normalizeScore(makeInput({ achievementScore: 50 }));
    expect(dims.school).toBeCloseTo(0.5, 5);
  });

  // S-17: School normalization — 100
  it("S-17: school = 100/100 = 1.0", () => {
    const dims = normalizeScore(makeInput({ achievementScore: 100 }));
    expect(dims.school).toBeCloseTo(1.0, 5);
  });
});

describe("calculateFinalScore", () => {
  // S-18: All perfect — balanced
  it("S-18: balanced all 1.0 = 100.0", () => {
    const input = makeInput({
      maxBudget: 100,
      monthlyCost: 0,
      commuteTime1: 0,
      commuteTime2: 0,
      childcareCount800m: 10,
      crimeLevel: 1,
      cctvDensity: 5,
      shelterCount: 10,
      achievementScore: 100,
    });
    const result = calculateFinalScore(input, "balanced");
    expect(result.finalScore).toBeCloseTo(100.0, 0);
  });

  // S-19: All zero — balanced
  it("S-19: balanced all 0.0 = 0.0", () => {
    const input = makeInput({
      maxBudget: 100,
      monthlyCost: 200, // over budget
      commuteTime1: 90,
      commuteTime2: 90,
      childcareCount800m: 0,
      crimeLevel: 10,
      cctvDensity: 0,
      shelterCount: 0,
      achievementScore: 0,
    });
    const result = calculateFinalScore(input, "balanced");
    expect(result.finalScore).toBeCloseTo(0.0, 0);
  });

  // S-20: balanced vs budget_focused comparison
  it("S-20: budget_focused scores higher with high budget dimension", () => {
    const input = makeInput({
      maxBudget: 1000,
      monthlyCost: 100, // budget dim = 0.9
      commuteTime1: 42,
      commuteTime2: 42, // commute dim = (60-42)/60 = 0.3
      childcareCount800m: 5, // childcare dim = 0.5
      crimeLevel: 5,
      cctvDensity: 3,
      shelterCount: 5, // safety ≈ 0.558
      achievementScore: 40, // school = 0.4
    });
    const balanced = calculateFinalScore(input, "balanced");
    const budgetFocused = calculateFinalScore(input, "budget_focused");
    // budget_focused should score higher with high budget, low commute
    expect(budgetFocused.finalScore).toBeGreaterThan(balanced.finalScore);
  });

  // S-21: commute_focused benefits from high commute score
  it("S-21: commute_focused scores higher with high commute dimension", () => {
    const input = makeInput({
      maxBudget: 1000,
      monthlyCost: 700, // budget dim = 0.3
      commuteTime1: 6,
      commuteTime2: 6, // commute dim = (60-6)/60 = 0.9
      childcareCount800m: 5,
      crimeLevel: 5,
      cctvDensity: 3,
      shelterCount: 5,
      achievementScore: 50,
    });
    const balanced = calculateFinalScore(input, "balanced");
    const commuteFocused = calculateFinalScore(input, "commute_focused");
    expect(commuteFocused.finalScore).toBeGreaterThan(balanced.finalScore);
  });

  // S-22: whyNot generation — lowest dimension < 0.5
  it("S-22: generates whyNot when commute score is 0", () => {
    const input = makeInput({
      maxBudget: 1000,
      monthlyCost: 100,
      commuteTime1: 90, // commute = 0
      commuteTime2: 90,
      childcareCount800m: 10,
      crimeLevel: 1,
      cctvDensity: 5,
      shelterCount: 10,
      achievementScore: 100,
    });
    const result = calculateFinalScore(input, "balanced");
    expect(result.whyNot).toBeTruthy();
    expect(result.whyNot.length).toBeGreaterThan(0);
  });

  // S-23: whyNot empty when all scores >= 0.5
  it("S-23: whyNot is empty when all dimensions >= 0.5", () => {
    const input = makeInput({
      maxBudget: 200,
      monthlyCost: 80, // budget = 0.6
      commuteTime1: 20,
      commuteTime2: 20, // commute = 0.667
      childcareCount800m: 6, // childcare = 0.6
      crimeLevel: 3,
      cctvDensity: 4,
      shelterCount: 8, // safety ≈ 0.789+0.24+0.16 ≈ 0.81
      achievementScore: 60, // school = 0.6
    });
    const result = calculateFinalScore(input, "balanced");
    expect(result.whyNot).toBe("");
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

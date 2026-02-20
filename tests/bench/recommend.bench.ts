import { bench, describe } from "vitest";
import { calculateBudget } from "@/lib/engines/budget";
import { calculateFinalScore, normalizeScore } from "@/lib/engines/scoring";
import type { ScoringInput, BudgetInput } from "@/types/engine";

/**
 * Performance benchmarks for engine modules.
 * Run: pnpm vitest bench
 *
 * Source of Truth: M2 spec Section 8.4
 * Target: p95 < 2000ms for full pipeline
 */

const budgetInput: BudgetInput = {
  cash: 30000,
  income: 500,
  loans: 100,
  monthlyBudget: 200,
  tradeType: "jeonse",
  budgetProfile: "noProperty",
  loanProgram: "bankMortgage",
};

const scoringInput: ScoringInput = {
  apartmentPrice: 45000,
  maxPrice: 60000,
  commuteTime1: 35,
  commuteTime2: 42,
  childcareCount800m: 7,
  crimeLevel: 4,
  cctvDensity: 3.5,
  shelterCount: 6,
  achievementScore: 72,
};

describe("Engine module benchmarks", () => {
  bench("calculateBudget (single)", () => {
    calculateBudget(budgetInput);
  });

  bench("normalizeScore (single)", () => {
    normalizeScore(scoringInput);
  });

  bench("calculateFinalScore balanced (single)", () => {
    calculateFinalScore(scoringInput, "balanced");
  });

  bench("full scoring pipeline x50 candidates", () => {
    const budget = calculateBudget(budgetInput);
    for (let i = 0; i < 50; i++) {
      const input: ScoringInput = {
        apartmentPrice: 20000 + i * 800,
        maxPrice: budget.maxPrice || 60000,
        commuteTime1: 20 + i,
        commuteTime2: 25 + i,
        childcareCount800m: Math.min(i % 12, 10),
        crimeLevel: 3 + (i % 7),
        cctvDensity: 1 + (i % 5),
        shelterCount: i % 10,
        achievementScore: 40 + (i % 60),
      };
      calculateFinalScore(input, "balanced");
    }
  });
});

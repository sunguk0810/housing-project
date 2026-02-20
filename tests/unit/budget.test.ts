import { describe, it, expect } from "vitest";
import { calculateBudget } from "@/lib/engines/budget";

/**
 * Budget calculator unit tests (B-1 ~ B-7).
 * Source of Truth: 2025.10.15 주택시장 안정화 대책
 *
 * Constants:
 *   bankMortgage: firstTime LTV=0.7, noProperty LTV=0.4, homeowner LTV=0
 *   bogeumjari: LTV=0.7, maxHousePrice=60000
 *   jeonse: guarantee ratio 0.8, DTI=0.4, term=2yr
 */

describe("calculateBudget", () => {
  // B-1: Jeonse normal (noProperty)
  it("B-1: calculates jeonse budget correctly", () => {
    const result = calculateBudget({
      cash: 30000,
      income: 500,
      loans: 0,
      monthlyBudget: 200,
      tradeType: "jeonse",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    // Jeonse: maxLoanByRatio = 30000 * 0.8 / 0.2 = 120000
    // annualAvailable = 500*12*0.4 = 2400
    // maxLoanByDti = 2400 * 2 = 4800
    // maxLoan = min(120000, 4800) = 4800
    // maxPrice = 30000 + 4800 = 34800
    expect(result.maxPrice).toBe(34800);
    expect(result.maxLoan).toBe(4800);
    expect(result.estimatedMonthlyCost).toBeGreaterThan(0);
  });

  // B-2: Sale normal (noProperty, bankMortgage)
  it("B-2: calculates sale budget correctly (noProperty)", () => {
    const result = calculateBudget({
      cash: 50000,
      income: 800,
      loans: 0,
      monthlyBudget: 300,
      tradeType: "sale",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    // noProperty LTV=0.4: maxLoanByLtv = 50000 * 0.4 / 0.6 = 33333
    // annualAvailable = 800*12*0.4 = 3840
    // maxLoanByDti = 3840 * 30 = 115200
    // uncappedLoan = min(33333, 115200) = 33333
    // tentativePrice = 50000 + 33333 = 83333 (≤150000, cap=60000)
    // cappedLoan = min(33333, 60000) = 33333
    // maxPrice = 50000 + 33333 = 83333
    expect(result.maxPrice).toBe(83333);
    expect(result.maxLoan).toBe(33333);
    expect(result.estimatedMonthlyCost).toBeGreaterThan(0);
  });

  // B-3: Zero income
  it("B-3: returns cash-only when income is 0", () => {
    const result = calculateBudget({
      cash: 30000,
      income: 0,
      loans: 0,
      monthlyBudget: 200,
      tradeType: "jeonse",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    // DTI-based loan = 0, ratio-based = 120000
    // maxLoan = min(120000, 0) = 0
    expect(result.maxPrice).toBe(30000);
    expect(result.maxLoan).toBe(0);
    expect(result.estimatedMonthlyCost).toBe(0);
  });

  // B-4: No existing loans — max DTI headroom
  it("B-4: maximizes loan when no existing loans", () => {
    const result = calculateBudget({
      cash: 20000,
      income: 500,
      loans: 0,
      monthlyBudget: 200,
      tradeType: "jeonse",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    expect(result.maxLoan).toBeGreaterThan(0);
    expect(result.maxPrice).toBeGreaterThan(20000);
  });

  // B-5: DTI exceeded — high loans relative to income
  it("B-5: returns cash-only when DTI is exceeded", () => {
    const result = calculateBudget({
      cash: 50000,
      income: 100,
      loans: 1000,
      monthlyBudget: 300,
      tradeType: "sale",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    // annualAvailable = max(0, 100*12*0.4 - 1000*12) = max(0, -11520) = 0
    // maxLoanByDti = 0
    expect(result.maxLoan).toBe(0);
    expect(result.maxPrice).toBe(50000); // cash only
  });

  // B-6: Cash=0, sale -> returns 0
  it("B-6: returns 0 for sale with zero cash", () => {
    const result = calculateBudget({
      cash: 0,
      income: 500,
      loans: 0,
      monthlyBudget: 200,
      tradeType: "sale",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    expect(result.maxPrice).toBe(0);
    expect(result.maxLoan).toBe(0);
  });

  // B-7: Boundary: cash=0, jeonse
  it("B-7: handles zero cash for jeonse (loan only)", () => {
    const result = calculateBudget({
      cash: 0,
      income: 500,
      loans: 0,
      monthlyBudget: 200,
      tradeType: "jeonse",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    // maxLoanByRatio = 0 * 0.8 / 0.2 = 0
    // maxLoanByDti = 4800
    // maxLoan = min(0, 4800) = 0
    expect(result.maxPrice).toBe(0);
  });

  // B-8: firstTime profile (LTV 70%)
  it("B-8: firstTime profile gets LTV 70%", () => {
    const result = calculateBudget({
      cash: 55000,
      income: 500,
      loans: 0,
      monthlyBudget: 0,
      tradeType: "sale",
      budgetProfile: "firstTime",
      loanProgram: "bankMortgage",
    });

    // maxLoanByLtv = 55000 * 0.7 / 0.3 = 128333
    // maxLoanByDti = 500*12*0.4*30 = 72000
    // uncapped = min(128333, 72000) = 72000
    // tentativePrice = 127000 (≤150000, cap=60000)
    // cappedLoan = min(72000, 60000) = 60000
    // maxPrice = 55000 + 60000 = 115000
    expect(result.maxPrice).toBe(115000);
    expect(result.maxLoan).toBe(60000);
  });

  // B-9: homeowner profile (LTV 0%)
  it("B-9: homeowner gets no mortgage in regulated area", () => {
    const result = calculateBudget({
      cash: 55000,
      income: 500,
      loans: 0,
      monthlyBudget: 0,
      tradeType: "sale",
      budgetProfile: "homeowner",
      loanProgram: "bankMortgage",
    });

    expect(result.maxPrice).toBe(55000);
    expect(result.maxLoan).toBe(0);
  });

  // B-10: bogeumjari loan program
  it("B-10: bogeumjari caps at 6억 house price", () => {
    const result = calculateBudget({
      cash: 20000,
      income: 500,
      loans: 0,
      monthlyBudget: 0,
      tradeType: "sale",
      budgetProfile: "firstTime",
      loanProgram: "bogeumjari",
    });

    // priceLimit = 60000
    // maxLoanByLtv = min(20000*0.7/0.3, 60000*0.7) = min(46667, 42000) = 42000
    // maxLoanByDti = 500*12*0.6*30 = 108000
    // cap = 42000
    // maxLoan = min(42000, 108000, 42000) = 42000
    // maxPrice = min(20000+42000, 60000) = 60000
    // actualLoan = min(42000, 60000-20000) = 40000
    expect(result.maxPrice).toBe(60000);
    expect(result.maxLoan).toBe(40000);
  });

  // B-11: homeowner jeonse with 2억 cap
  it("B-11: homeowner jeonse capped at 2억", () => {
    const result = calculateBudget({
      cash: 10000,
      income: 500,
      loans: 0,
      monthlyBudget: 0,
      tradeType: "jeonse",
      budgetProfile: "homeowner",
      loanProgram: "bankMortgage",
    });

    // maxLoanByRatio = 10000 * 0.8 / 0.2 = 40000
    // maxLoanByDti = 500*12*0.4*2 = 4800
    // maxLoan before cap = min(40000, 4800) = 4800
    // homeowner cap = 20000, so maxLoan = min(4800, 20000) = 4800
    // (DTI binds first here, so cap doesn't matter)
    expect(result.maxLoan).toBeLessThanOrEqual(20000);
    expect(result.maxPrice).toBe(10000 + result.maxLoan);
  });

  // B-12: effectiveMonthlyBudget
  it("B-12: effectiveMonthlyBudget uses min(estimated, input) or estimated when 0", () => {
    const resultWithBudget = calculateBudget({
      cash: 55000,
      income: 500,
      loans: 0,
      monthlyBudget: 100,
      tradeType: "sale",
      budgetProfile: "firstTime",
      loanProgram: "bankMortgage",
    });

    // estimated = 60000 / 360 ≈ 166.7
    // effectiveMonthlyBudget = min(166.7, 100) = 100
    expect(resultWithBudget.effectiveMonthlyBudget).toBe(100);

    const resultNoBudget = calculateBudget({
      cash: 55000,
      income: 500,
      loans: 0,
      monthlyBudget: 0,
      tradeType: "sale",
      budgetProfile: "firstTime",
      loanProgram: "bankMortgage",
    });

    // monthlyBudget=0 → effectiveMonthlyBudget = estimatedMonthlyCost
    expect(resultNoBudget.effectiveMonthlyBudget).toBeGreaterThan(0);
  });
});

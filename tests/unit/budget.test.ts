import { describe, it, expect } from "vitest";
import { calculateBudget } from "@/lib/engines/budget";

/**
 * Budget calculator unit tests (B-1 ~ B-12).
 * Source of Truth: 2025.10.15 주택시장 안정화 대책
 *
 * V2: 원리금균등상환(DSR/DTI) + 만기일시상환(전세) 기반
 *
 * Rates:
 *   bankMortgage: 4.5%, DSR 40%
 *   bogeumjari: 4.0%, 신DTI 60%
 *   jeonse: 3.5%, 만기일시상환(이자만)
 *
 * Constants:
 *   bankMortgage: firstTime LTV=0.7, noProperty LTV=0.4, homeowner LTV=0
 *   bogeumjari: LTV=0.7, maxHousePrice=60000
 *   jeonse: guarantee ratio 0.8, DTI=0.4
 */

describe("calculateBudget", () => {
  // B-1: Jeonse normal (noProperty) — interest-only DTI
  it("B-1: calculates jeonse budget correctly", () => {
    const result = calculateBudget({
      cash: 30000,
      income: 6000,
      loans: 0,
      monthlyBudget: 200,
      tradeType: "jeonse",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    // Jeonse (interest-only DTI):
    // maxLoanByRatio = 30000 * 0.8 / 0.2 = 120000
    // annualAvailable = 6000 * 0.4 = 2400
    // maxLoanByDti = 2400 / 0.035 = 68571
    // maxLoan = min(120000, 68571) = 68571
    // maxPrice = 30000 + 68571 = 98571
    expect(result.maxPrice).toBe(98571);
    expect(result.maxLoan).toBe(68571);
    // monthly = 68571 * 0.035 / 12 ≈ 200
    expect(result.estimatedMonthlyCost).toBeCloseTo(200, 0);
  });

  // B-2: Sale normal (noProperty, bankMortgage) — LTV binds
  it("B-2: calculates sale budget correctly (noProperty)", () => {
    const result = calculateBudget({
      cash: 50000,
      income: 9600,
      loans: 0,
      monthlyBudget: 300,
      tradeType: "sale",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    // noProperty LTV=0.4: maxLoanByLtv = 50000 * 0.4 / 0.6 = 33333
    // DSR: amortization(9600*0.4, 4.5%, 30yr) ≈ 63155 (> LTV)
    // maxLoan = 33333 (LTV binds)
    // maxPrice = 83333
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

    expect(result.maxPrice).toBe(30000);
    expect(result.maxLoan).toBe(0);
    expect(result.estimatedMonthlyCost).toBe(0);
  });

  // B-4: No existing loans — jeonse max headroom
  it("B-4: maximizes loan when no existing loans", () => {
    const result = calculateBudget({
      cash: 20000,
      income: 6000,
      loans: 0,
      monthlyBudget: 200,
      tradeType: "jeonse",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    // DTI(interest-only): 6000*0.4/0.035 = 68571
    // Guarantee: 20000*0.8/0.2 = 80000
    // maxLoan = min(80000, 68571) = 68571
    expect(result.maxLoan).toBe(68571);
    expect(result.maxPrice).toBe(88571);
  });

  // B-5: DSR exceeded — high loans relative to income
  it("B-5: returns cash-only when DTI is exceeded", () => {
    const result = calculateBudget({
      cash: 50000,
      income: 1200,
      loans: 1000,
      monthlyBudget: 300,
      tradeType: "sale",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    // annualAvailable = max(0, 1200*0.4 - 1000*12) = max(0, -11520) = 0
    expect(result.maxLoan).toBe(0);
    expect(result.maxPrice).toBe(50000);
  });

  // B-6: Cash=0, sale -> returns 0
  it("B-6: returns 0 for sale with zero cash", () => {
    const result = calculateBudget({
      cash: 0,
      income: 6000,
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
      income: 6000,
      loans: 0,
      monthlyBudget: 200,
      tradeType: "jeonse",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    // maxLoanByRatio = 0 (guarantee requires cash)
    expect(result.maxPrice).toBe(0);
  });

  // B-8: firstTime + bankMortgage — DSR with amortization
  it("B-8: firstTime profile calculates DSR correctly", () => {
    const result = calculateBudget({
      cash: 55000,
      income: 6000,
      loans: 0,
      monthlyBudget: 0,
      tradeType: "sale",
      budgetProfile: "firstTime",
      loanProgram: "bankMortgage",
    });

    // DSR: monthly=200, amortization(4.5%, 30yr) ≈ 200 × 197.3 ≈ 39,468
    // LTV: 55000*0.7/0.3 = 128,333
    // Tier: ≤15억 → cap 60,000
    // maxLoan ≈ 39,468 (DSR binds, not LTV or tier)
    expect(result.maxLoan).toBeGreaterThan(39000);
    expect(result.maxLoan).toBeLessThan(40000);
    expect(result.maxPrice).toBeGreaterThan(94000);
    expect(result.maxPrice).toBeLessThan(95000);
    // Monthly cost ≈ 200 (= DSR capacity)
    expect(result.estimatedMonthlyCost).toBeCloseTo(200, 0);
  });

  // B-9: homeowner profile (LTV 0%)
  it("B-9: homeowner gets no mortgage in regulated area", () => {
    const result = calculateBudget({
      cash: 55000,
      income: 6000,
      loans: 0,
      monthlyBudget: 0,
      tradeType: "sale",
      budgetProfile: "homeowner",
      loanProgram: "bankMortgage",
    });

    expect(result.maxPrice).toBe(55000);
    expect(result.maxLoan).toBe(0);
  });

  // B-10: bogeumjari loan program — LTV/cap binds
  it("B-10: bogeumjari caps at 6억 house price", () => {
    const result = calculateBudget({
      cash: 20000,
      income: 6000,
      loans: 0,
      monthlyBudget: 0,
      tradeType: "sale",
      budgetProfile: "firstTime",
      loanProgram: "bogeumjari",
    });

    // 신DTI: amortization(6000*0.6, 4.0%, 30yr) ≈ 300 × 209.5 ≈ 62,838
    // LTV: min(46667, 42000) = 42000
    // Cap: 42000
    // maxLoan = min(42000, 62838, 42000) = 42000
    // maxPrice = min(62000, 60000) = 60000
    // actualLoan = 40000
    expect(result.maxPrice).toBe(60000);
    expect(result.maxLoan).toBe(40000);
  });

  // B-11: homeowner jeonse — homeowner cap now binds (not DTI)
  it("B-11: homeowner jeonse capped at 2억", () => {
    const result = calculateBudget({
      cash: 10000,
      income: 6000,
      loans: 0,
      monthlyBudget: 0,
      tradeType: "jeonse",
      budgetProfile: "homeowner",
      loanProgram: "bankMortgage",
    });

    // guarantee: 10000*0.8/0.2 = 40000
    // DTI(interest-only): 6000*0.4/0.035 = 68571
    // maxLoan = min(40000, 68571) = 40000
    // homeowner cap: min(40000, 20000) = 20000
    expect(result.maxLoan).toBe(20000);
    expect(result.maxPrice).toBe(30000);
  });

  // B-12: effectiveMonthlyBudget
  it("B-12: effectiveMonthlyBudget uses min(estimated, input) or estimated when 0", () => {
    const resultWithBudget = calculateBudget({
      cash: 55000,
      income: 6000,
      loans: 0,
      monthlyBudget: 100,
      tradeType: "sale",
      budgetProfile: "firstTime",
      loanProgram: "bankMortgage",
    });

    // DSR-based monthly ≈ 200, monthlyBudget=100
    // effectiveMonthlyBudget = min(200, 100) = 100
    expect(resultWithBudget.effectiveMonthlyBudget).toBe(100);

    const resultNoBudget = calculateBudget({
      cash: 55000,
      income: 6000,
      loans: 0,
      monthlyBudget: 0,
      tradeType: "sale",
      budgetProfile: "firstTime",
      loanProgram: "bankMortgage",
    });

    expect(resultNoBudget.effectiveMonthlyBudget).toBeGreaterThan(0);
  });

  // B-13: Jeonse vs old formula — dramatic improvement
  it("B-13: jeonse gives realistic budget (not 2-year principal repayment)", () => {
    const result = calculateBudget({
      cash: 15000,
      income: 7000,
      loans: 0,
      monthlyBudget: 0,
      tradeType: "jeonse",
      budgetProfile: "noProperty",
      loanProgram: "bankMortgage",
    });

    // guarantee: 15000*0.8/0.2 = 60000
    // DTI(interest-only): 7000*0.4/0.035 = 80000
    // maxLoan = min(60000, 80000) = 60000
    // maxPrice = 75000 (7.5억)
    // monthly = 60000*0.035/12 = 175
    expect(result.maxPrice).toBe(75000);
    expect(result.maxLoan).toBe(60000);
    expect(result.estimatedMonthlyCost).toBe(175);
  });

  // B-14: DSR binds with high cash (cash=3억, income=7천만)
  it("B-14: DSR binds when cash is high", () => {
    const result = calculateBudget({
      cash: 30000,
      income: 7000,
      loans: 0,
      monthlyBudget: 0,
      tradeType: "sale",
      budgetProfile: "firstTime",
      loanProgram: "bankMortgage",
    });

    // DSR: 7000*0.4/12 = 233.3, amortization ≈ 233.3 × 197.3 ≈ 46,038
    // LTV: 30000*0.7/0.3 = 70000
    // Tier: ≤15억 → cap 60000
    // maxLoan ≈ 46,038 (DSR binds)
    // maxPrice ≈ 76,038
    expect(result.maxLoan).toBeGreaterThan(45500);
    expect(result.maxLoan).toBeLessThan(47000);
    expect(result.maxPrice).toBeGreaterThan(75500);
    expect(result.maxPrice).toBeLessThan(77000);
  });
});

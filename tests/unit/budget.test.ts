import { describe, it, expect } from "vitest";
import { calculateBudget } from "@/lib/engines/budget";

/**
 * Budget calculator unit tests (B-1 ~ B-7).
 * Source of Truth: M2 spec Section 8.1.1, PHASE1 S4
 *
 * Constants: SALE_LTV=0.5, JEONSE_LTV=0.8, DTI=0.4
 * SALE_LOAN_TERM=30yr, JEONSE_LOAN_TERM=2yr
 */

describe("calculateBudget", () => {
  // B-1: Jeonse normal
  it("B-1: calculates jeonse budget correctly", () => {
    const result = calculateBudget({
      cash: 30000,
      income: 500,
      loans: 0,
      monthlyBudget: 200,
      tradeType: "jeonse",
    });

    // Jeonse: maxPrice = cash / (1 - 0.8) = 30000 / 0.2 = 150000
    // maxLoanByLtv = 150000 * 0.8 = 120000
    // annualAvailableRepayment = 500*12*0.4 - 0 = 2400
    // maxLoanByDti = 2400 * 2 = 4800
    // maxLoan = min(120000, 4800) = 4800
    // maxPrice = 30000 + 4800 = 34800
    expect(result.maxPrice).toBe(34800);
    expect(result.maxLoan).toBe(4800);
    expect(result.estimatedMonthlyCost).toBeGreaterThan(0);
  });

  // B-2: Sale normal
  it("B-2: calculates sale budget correctly", () => {
    const result = calculateBudget({
      cash: 50000,
      income: 800,
      loans: 0,
      monthlyBudget: 300,
      tradeType: "sale",
    });

    // Sale: maxPriceByLtv = 50000 / (1 - 0.5) = 100000
    // maxLoanByLtv = 100000 * 0.5 = 50000
    // annualAvailableRepayment = 800*12*0.4 = 3840
    // maxLoanByDti = 3840 * 30 = 115200
    // maxLoan = min(50000, 115200) = 50000
    // maxPrice = 50000 + 50000 = 100000
    expect(result.maxPrice).toBe(100000);
    expect(result.maxLoan).toBe(50000);
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
    });

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
    });

    // annualAvailableRepayment = 100*12*0.4 - 1000*12 = 480 - 12000 = max(0, -11520) = 0
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
    });

    // maxPrice = cash / (1-0.8) = 0 / 0.2 = 0
    // but maxLoanByDti = 500*12*0.4*2 = 4800
    // maxLoanByLtv = 0 * 0.8 = 0
    // maxLoan = min(0, 4800) = 0
    // Wait: maxPrice is 0 so maxLoanByLtv is 0
    expect(result.maxPrice).toBe(0);
  });
});

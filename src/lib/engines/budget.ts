import type { BudgetInput, BudgetOutput } from "@/types/engine";

/**
 * LTV/DTI-based budget calculator.
 * No PII stored — all computation is in-memory.
 *
 * Source of Truth: PHASE1 S4, M2 spec Section 5.1
 */

const BUDGET_CONSTANTS = {
  SALE_LTV_RATIO: 0.5,
  JEONSE_LTV_RATIO: 0.8,
  DTI_RATIO: 0.4,
  SALE_LOAN_TERM_YEARS: 30,
  JEONSE_LOAN_TERM_YEARS: 2,
} as const;

export function calculateBudget(input: BudgetInput): BudgetOutput {
  const { cash, income, loans, monthlyBudget, tradeType } = input;

  if (income <= 0) {
    return {
      maxPrice: cash,
      maxLoan: 0,
      estimatedMonthlyCost: 0,
      effectiveMonthlyBudget: monthlyBudget,
    };
  }

  if (cash <= 0 && tradeType === "sale") {
    return {
      maxPrice: 0,
      maxLoan: 0,
      estimatedMonthlyCost: 0,
      effectiveMonthlyBudget: monthlyBudget,
    };
  }

  if (tradeType === "sale") {
    return calculateSaleBudget(cash, income, loans, monthlyBudget);
  }
  return calculateJeonseBudget(cash, income, loans, monthlyBudget);
}

function calculateSaleBudget(
  cash: number,
  income: number,
  loans: number,
  monthlyBudget: number,
): BudgetOutput {
  const { SALE_LTV_RATIO, DTI_RATIO, SALE_LOAN_TERM_YEARS } =
    BUDGET_CONSTANTS;

  const annualIncome = income * 12;
  const annualExistingLoans = loans * 12;
  const annualAvailableRepayment = Math.max(
    0,
    annualIncome * DTI_RATIO - annualExistingLoans,
  );

  const maxLoanByDti = annualAvailableRepayment * SALE_LOAN_TERM_YEARS;
  const maxPriceByLtv = cash / (1 - SALE_LTV_RATIO);
  const maxLoanByLtv = maxPriceByLtv * SALE_LTV_RATIO;

  const maxLoan = Math.min(maxLoanByLtv, maxLoanByDti);
  const maxPrice = cash + maxLoan;

  const estimatedMonthlyCost =
    maxLoan > 0 ? maxLoan / (SALE_LOAN_TERM_YEARS * 12) : 0;

  return {
    maxPrice: Math.round(maxPrice),
    maxLoan: Math.round(maxLoan),
    estimatedMonthlyCost: Math.round(estimatedMonthlyCost * 10) / 10,
    effectiveMonthlyBudget: Math.min(estimatedMonthlyCost, monthlyBudget),
  };
}

/**
 * Per-apartment monthly cost estimate.
 * Unlike estimatedMonthlyCost (user-level max), this reflects
 * the actual loan needed for a specific apartment price.
 */
export function estimateApartmentMonthlyCost(
  apartmentPrice: number,
  cash: number,
  tradeType: "sale" | "jeonse",
): number {
  const loanNeeded = Math.max(0, apartmentPrice - cash);
  if (loanNeeded <= 0) return 0;
  const termMonths =
    tradeType === "sale"
      ? BUDGET_CONSTANTS.SALE_LOAN_TERM_YEARS * 12
      : BUDGET_CONSTANTS.JEONSE_LOAN_TERM_YEARS * 12;
  return Math.round((loanNeeded / termMonths) * 10) / 10;
}

function calculateJeonseBudget(
  cash: number,
  income: number,
  loans: number,
  monthlyBudget: number,
): BudgetOutput {
  const { JEONSE_LTV_RATIO, DTI_RATIO, JEONSE_LOAN_TERM_YEARS } =
    BUDGET_CONSTANTS;

  const annualIncome = income * 12;
  const annualExistingLoans = loans * 12;
  const annualAvailableRepayment = Math.max(
    0,
    annualIncome * DTI_RATIO - annualExistingLoans,
  );

  const maxLoanByDti = annualAvailableRepayment * JEONSE_LOAN_TERM_YEARS;
  const maxPrice = cash / (1 - JEONSE_LTV_RATIO);
  const maxLoanByLtv = maxPrice * JEONSE_LTV_RATIO;

  const maxLoan = Math.min(maxLoanByLtv, maxLoanByDti);
  const actualMaxPrice = cash + maxLoan;

  const estimatedMonthlyCost =
    maxLoan > 0 ? maxLoan / (JEONSE_LOAN_TERM_YEARS * 12) : 0;

  return {
    maxPrice: Math.round(actualMaxPrice),
    maxLoan: Math.round(maxLoan),
    estimatedMonthlyCost: Math.round(estimatedMonthlyCost * 10) / 10,
    effectiveMonthlyBudget: Math.min(estimatedMonthlyCost, monthlyBudget),
  };
}

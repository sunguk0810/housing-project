import type { BudgetInput, BudgetOutput, BudgetProfileKey } from "@/types/engine";

/**
 * Policy-based budget calculator — 2-axis matrix.
 * Axis 1: budgetProfile (housing ownership status)
 * Axis 2: loanProgram (bank mortgage vs bogeumjari)
 *
 * No PII stored — all computation is in-memory.
 *
 * Source of Truth: 2025.10.15 주택시장 안정화 대책 (국토교통부)
 * V1: 항상 규제지역 가정
 * TODO V2: 매물 regionCode 기반 규제지역 자동 판정
 */

// =============================================================
// Constants — Bank Mortgage (은행 주담대, 2025.10.15 규제지역)
// =============================================================

const BANK_MORTGAGE: Record<BudgetProfileKey, { ltv: number; dti: number; loanTermYears: number }> = {
  firstTime:  { ltv: 0.7, dti: 0.4, loanTermYears: 30 },
  noProperty: { ltv: 0.4, dti: 0.4, loanTermYears: 30 },
  homeowner:  { ltv: 0.0, dti: 0.0, loanTermYears: 30 },
} as const;

/** Loan cap tiers by house price (regulated area) */
const BANK_LOAN_CAP_TIERS: ReadonlyArray<{ maxPrice: number; cap: number }> = [
  { maxPrice: 150_000, cap: 60_000 },   // ≤15억 → 6억
  { maxPrice: 250_000, cap: 40_000 },   // ≤25억 → 4억
  { maxPrice: Infinity, cap: 20_000 },  // >25억 → 2억
];

// =============================================================
// Constants — Bogeumjari (보금자리론, 한국주택금융공사)
// =============================================================

interface BogeumjariConfig {
  ltv: number;
  dti: number;
  maxLoanCap: number;
  loanTermYears: number;
}

const BOGEUMJARI: Record<BudgetProfileKey, BogeumjariConfig | null> = {
  firstTime:  { ltv: 0.7, dti: 0.6, maxLoanCap: 42_000, loanTermYears: 30 },
  noProperty: { ltv: 0.7, dti: 0.6, maxLoanCap: 36_000, loanTermYears: 30 },
  homeowner:  null, // not eligible
} as const;

const BOGEUMJARI_MAX_HOUSE_PRICE = 60_000; // 6억

// =============================================================
// Constants — Jeonse (전세)
// =============================================================

const JEONSE_GUARANTEE_RATIO = 0.8;
const JEONSE_DTI_RATIO = 0.4;
const JEONSE_LOAN_TERM_YEARS = 2;
const HOMEOWNER_JEONSE_CAP = 20_000; // 1주택자 전세대출 한도 2억

// =============================================================
// Main dispatcher
// =============================================================

export function calculateBudget(input: BudgetInput): BudgetOutput {
  if (input.tradeType !== "sale") {
    return calculateJeonseBudget(input);
  }
  if (input.loanProgram === "bogeumjari") {
    return calculateBogeumjariBudget(input);
  }
  return calculateBankMortgageBudget(input);
}

// =============================================================
// Bank Mortgage — Sale (매매, 은행 주담대)
// =============================================================

function calculateBankMortgageBudget(input: BudgetInput): BudgetOutput {
  const { cash, income, loans, monthlyBudget, budgetProfile } = input;
  const config = BANK_MORTGAGE[budgetProfile];

  // homeowner: LTV 0% in regulated area — cash only
  if (config.ltv === 0) {
    return buildOutput(cash, 0, config.loanTermYears, monthlyBudget);
  }

  // DTI-based max loan
  const annualAvailable = Math.max(0, income * 12 * config.dti - loans * 12);
  const maxLoanByDti = annualAvailable * config.loanTermYears;

  // LTV-based max loan: cash / (1 - ltv) * ltv
  const maxLoanByLtv = cash > 0 ? cash * config.ltv / (1 - config.ltv) : 0;

  const uncappedMaxLoan = Math.min(maxLoanByLtv, maxLoanByDti);

  // Tier-based feasibility check: evaluate each tier independently
  let bestPrice = cash; // minimum: no loan
  let bestLoan = 0;

  for (let i = 0; i < BANK_LOAN_CAP_TIERS.length; i++) {
    const tier = BANK_LOAN_CAP_TIERS[i];
    const cappedLoan = Math.min(uncappedMaxLoan, tier.cap);
    const candidatePrice = cash + cappedLoan;

    // Check if candidatePrice falls within this tier's range
    const prevTierMax = i === 0 ? 0 : BANK_LOAN_CAP_TIERS[i - 1].maxPrice;
    if (candidatePrice > prevTierMax && candidatePrice <= tier.maxPrice) {
      if (candidatePrice > bestPrice) {
        bestPrice = candidatePrice;
        bestLoan = cappedLoan;
      }
    }
  }

  return buildOutput(bestPrice, bestLoan, config.loanTermYears, monthlyBudget);
}

// =============================================================
// Bogeumjari — Sale (매매, 보금자리론)
// =============================================================

function calculateBogeumjariBudget(input: BudgetInput): BudgetOutput {
  const { cash, income, loans, monthlyBudget, budgetProfile } = input;
  const config = BOGEUMJARI[budgetProfile];

  // homeowner → not eligible
  if (!config) {
    return buildOutput(cash, 0, 30, monthlyBudget);
  }

  const priceLimit = BOGEUMJARI_MAX_HOUSE_PRICE;

  // LTV-based: min of LTV on cash, LTV on price limit
  const maxLoanByLtv = cash > 0
    ? Math.min(cash * config.ltv / (1 - config.ltv), priceLimit * config.ltv)
    : 0;

  // DTI-based
  const annualAvailable = Math.max(0, income * 12 * config.dti - loans * 12);
  const maxLoanByDti = annualAvailable * config.loanTermYears;

  // Bogeumjari cap
  const maxLoan = Math.min(maxLoanByLtv, maxLoanByDti, config.maxLoanCap);
  const maxPrice = Math.min(cash + maxLoan, priceLimit);

  // Readjust if maxPrice cap reduces needed loan
  const actualLoan = Math.max(0, Math.min(maxLoan, maxPrice - cash));

  return buildOutput(maxPrice, actualLoan, config.loanTermYears, monthlyBudget);
}

// =============================================================
// Jeonse (전세)
// =============================================================

function calculateJeonseBudget(input: BudgetInput): BudgetOutput {
  const { cash, income, loans, monthlyBudget, budgetProfile } = input;

  // Guarantee ratio 80%: maxLoanByRatio = cash * 0.8 / 0.2 = 4 * cash
  const maxLoanByRatio = cash > 0
    ? cash * JEONSE_GUARANTEE_RATIO / (1 - JEONSE_GUARANTEE_RATIO)
    : 0;

  // DTI-based
  const annualAvailable = Math.max(0, income * 12 * JEONSE_DTI_RATIO - loans * 12);
  const maxLoanByDti = annualAvailable * JEONSE_LOAN_TERM_YEARS;

  let maxLoan = Math.min(maxLoanByRatio, maxLoanByDti);

  // homeowner: 2억 cap
  if (budgetProfile === "homeowner") {
    maxLoan = Math.min(maxLoan, HOMEOWNER_JEONSE_CAP);
  }

  const maxPrice = cash + maxLoan;

  return buildOutput(maxPrice, maxLoan, JEONSE_LOAN_TERM_YEARS, monthlyBudget);
}

// =============================================================
// Per-apartment monthly cost estimate (used in scoring)
// =============================================================

/**
 * Per-apartment monthly cost estimate.
 * Unlike estimatedMonthlyCost (user-level max), this reflects
 * the actual loan needed for a specific apartment price.
 */
export function estimateApartmentMonthlyCost(
  apartmentPrice: number,
  cash: number,
  tradeType: "sale" | "jeonse" | "monthly",
  opts?: { monthlyRent?: number | null },
): number {
  const loanNeeded = Math.max(0, apartmentPrice - cash);
  const jeonseTermMonths = JEONSE_LOAN_TERM_YEARS * 12;

  // Monthly: include monthly rent + financed deposit cost (24 months)
  if (tradeType === "monthly") {
    const rent = Math.max(0, Number(opts?.monthlyRent ?? 0));
    const financedDepositCost = loanNeeded > 0 ? loanNeeded / jeonseTermMonths : 0;
    return Math.round((rent + financedDepositCost) * 10) / 10;
  }

  if (loanNeeded <= 0) return 0;

  const termMonths =
    tradeType === "sale"
      ? 30 * 12 // SALE_LOAN_TERM_YEARS
      : jeonseTermMonths;
  return Math.round((loanNeeded / termMonths) * 10) / 10;
}

// =============================================================
// Helpers
// =============================================================

function buildOutput(
  maxPrice: number,
  maxLoan: number,
  loanTermYears: number,
  monthlyBudget: number,
): BudgetOutput {
  const roundedPrice = Math.round(Math.max(0, maxPrice));
  const roundedLoan = Math.round(Math.max(0, maxLoan));
  const estimatedMonthlyCost = roundedLoan > 0
    ? roundedLoan / (loanTermYears * 12)
    : 0;

  return {
    maxPrice: roundedPrice,
    maxLoan: roundedLoan,
    estimatedMonthlyCost: Math.round(estimatedMonthlyCost * 10) / 10,
    effectiveMonthlyBudget: monthlyBudget > 0
      ? Math.min(estimatedMonthlyCost, monthlyBudget)
      : estimatedMonthlyCost,
  };
}

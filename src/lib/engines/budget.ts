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
 * V2: 원리금균등상환 기반 DSR/DTI 계산 (금리 반영)
 *
 * Regulation paths:
 *   Bank mortgage → DSR 40% (모든 부채 원리금)
 *   Bogeumjari   → 신DTI 60% (주담대 원리금 + 기타부채 이자)
 *   Jeonse       → DTI 40% (만기일시상환, 이자만 납부)
 */

// =============================================================
// Interest Rates (annual, program-specific)
// =============================================================

const BANK_MORTGAGE_RATE = 0.045; // 은행 주담대 4.5%
const BOGEUMJARI_RATE = 0.04;    // 보금자리론 4.0%
const JEONSE_RATE = 0.035;        // 전세대출 3.5%

// =============================================================
// Constants — Bank Mortgage (은행 주담대, DSR 40%, 2025.10.15 규제지역)
// =============================================================

const BANK_MORTGAGE: Record<BudgetProfileKey, { ltv: number; dsr: number; loanTermYears: number }> = {
  firstTime:  { ltv: 0.7, dsr: 0.4, loanTermYears: 30 },
  noProperty: { ltv: 0.4, dsr: 0.4, loanTermYears: 30 },
  homeowner:  { ltv: 0.0, dsr: 0.0, loanTermYears: 30 },
} as const;

/** Loan cap tiers by house price (regulated area) */
const BANK_LOAN_CAP_TIERS: ReadonlyArray<{ maxPrice: number; cap: number }> = [
  { maxPrice: 150_000, cap: 60_000 },   // ≤15억 → 6억
  { maxPrice: 250_000, cap: 40_000 },   // ≤25억 → 4억
  { maxPrice: Infinity, cap: 20_000 },  // >25억 → 2억
];

// =============================================================
// Constants — Bogeumjari (보금자리론, 신DTI 60%, 한국주택금융공사)
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
// Constants — Jeonse (전세, DTI 40%, 만기일시상환)
// =============================================================

const JEONSE_GUARANTEE_RATIO = 0.8;
const JEONSE_DTI_RATIO = 0.4;
const JEONSE_LOAN_TERM_YEARS = 2;
const HOMEOWNER_JEONSE_CAP = 20_000; // 1주택자 전세대출 한도 2억

// =============================================================
// Amortization helpers
// =============================================================

/**
 * Max loan by amortization (원리금균등상환 PVAF 역산).
 * Given annual available payment, interest rate, and term,
 * returns maximum loan amount that can be serviced.
 */
function amortizationMaxLoan(
  annualAvailable: number,
  annualRate: number,
  termYears: number,
): number {
  if (annualAvailable <= 0) return 0;
  const monthlyPayment = annualAvailable / 12;
  const r = annualRate / 12;
  const n = termYears * 12;
  if (r <= 0) return monthlyPayment * n;
  return monthlyPayment * (1 - Math.pow(1 + r, -n)) / r;
}

/**
 * Monthly payment for amortizing loan (원리금균등 PMT).
 */
function amortizationMonthly(
  loan: number,
  annualRate: number,
  termYears: number,
): number {
  if (loan <= 0) return 0;
  const r = annualRate / 12;
  const n = termYears * 12;
  if (r <= 0) return loan / n;
  return loan * r / (1 - Math.pow(1 + r, -n));
}

/**
 * Monthly interest-only payment (만기일시상환, 전세용).
 */
function interestOnlyMonthly(loan: number, annualRate: number): number {
  if (loan <= 0) return 0;
  return loan * annualRate / 12;
}

/**
 * Max loan by interest-only DTI (전세: 만기일시상환).
 * Annual interest = loan × rate ≤ annualAvailable
 * → loan ≤ annualAvailable / rate
 */
function interestOnlyMaxLoan(
  annualAvailable: number,
  annualRate: number,
): number {
  if (annualAvailable <= 0 || annualRate <= 0) return 0;
  return annualAvailable / annualRate;
}

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
// Bank Mortgage — Sale (매매, 은행 주담대, DSR 40%)
// =============================================================

function calculateBankMortgageBudget(input: BudgetInput): BudgetOutput {
  const { cash, income, loans, monthlyBudget, budgetProfile } = input;
  const config = BANK_MORTGAGE[budgetProfile];

  // homeowner: LTV 0% in regulated area — cash only
  if (config.ltv === 0) {
    return buildOutput(cash, 0, BANK_MORTGAGE_RATE, config.loanTermYears, false, monthlyBudget);
  }

  // DSR-based max loan (amortization with interest)
  // DSR: all debt principal+interest included
  const annualAvailable = Math.max(0, income * config.dsr - loans * 12);
  const maxLoanByDsr = amortizationMaxLoan(annualAvailable, BANK_MORTGAGE_RATE, config.loanTermYears);

  // LTV-based max loan: cash / (1 - ltv) * ltv
  const maxLoanByLtv = cash > 0 ? cash * config.ltv / (1 - config.ltv) : 0;

  const uncappedMaxLoan = Math.min(maxLoanByLtv, maxLoanByDsr);

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

  return buildOutput(bestPrice, bestLoan, BANK_MORTGAGE_RATE, config.loanTermYears, false, monthlyBudget);
}

// =============================================================
// Bogeumjari — Sale (매매, 보금자리론, 신DTI 60%)
// =============================================================

function calculateBogeumjariBudget(input: BudgetInput): BudgetOutput {
  const { cash, income, loans, monthlyBudget, budgetProfile } = input;
  const config = BOGEUMJARI[budgetProfile];

  // homeowner → not eligible
  if (!config) {
    return buildOutput(cash, 0, BOGEUMJARI_RATE, 30, false, monthlyBudget);
  }

  const priceLimit = BOGEUMJARI_MAX_HOUSE_PRICE;

  // LTV-based: min of LTV on cash, LTV on price limit
  const maxLoanByLtv = cash > 0
    ? Math.min(cash * config.ltv / (1 - config.ltv), priceLimit * config.ltv)
    : 0;

  // 신DTI-based (amortization with interest)
  // 신DTI: mortgage PI + other debt interest only
  // Currently loans=0 (removed from form); future: split into mortgage PI + other interest
  const annualAvailable = Math.max(0, income * config.dti - loans * 12);
  const maxLoanByDti = amortizationMaxLoan(annualAvailable, BOGEUMJARI_RATE, config.loanTermYears);

  // Bogeumjari cap
  const maxLoan = Math.min(maxLoanByLtv, maxLoanByDti, config.maxLoanCap);
  const maxPrice = Math.min(cash + maxLoan, priceLimit);

  // Readjust if maxPrice cap reduces needed loan
  const actualLoan = Math.max(0, Math.min(maxLoan, maxPrice - cash));

  return buildOutput(maxPrice, actualLoan, BOGEUMJARI_RATE, config.loanTermYears, false, monthlyBudget);
}

// =============================================================
// Jeonse (전세, DTI 40%, 만기일시상환)
// =============================================================

function calculateJeonseBudget(input: BudgetInput): BudgetOutput {
  const { cash, income, loans, monthlyBudget, budgetProfile } = input;

  // Guarantee ratio 80%: maxLoanByRatio = cash * 0.8 / 0.2 = 4 * cash
  const maxLoanByRatio = cash > 0
    ? cash * JEONSE_GUARANTEE_RATIO / (1 - JEONSE_GUARANTEE_RATIO)
    : 0;

  // DTI-based (interest-only: loan ≤ annualAvailable / rate)
  const annualAvailable = Math.max(0, income * JEONSE_DTI_RATIO - loans * 12);
  const maxLoanByDti = interestOnlyMaxLoan(annualAvailable, JEONSE_RATE);

  let maxLoan = Math.min(maxLoanByRatio, maxLoanByDti);

  // homeowner: 2억 cap
  if (budgetProfile === "homeowner") {
    maxLoan = Math.min(maxLoan, HOMEOWNER_JEONSE_CAP);
  }

  const maxPrice = cash + maxLoan;

  return buildOutput(maxPrice, maxLoan, JEONSE_RATE, JEONSE_LOAN_TERM_YEARS, true, monthlyBudget);
}

// =============================================================
// Per-apartment monthly cost estimate (used in scoring/API)
// =============================================================

/**
 * Per-apartment monthly cost estimate with interest.
 * Sale: 원리금균등상환 (PMT), Jeonse: 이자만 (만기일시상환)
 */
export function estimateApartmentMonthlyCost(
  apartmentPrice: number,
  cash: number,
  tradeType: "sale" | "jeonse" | "monthly",
  opts?: { monthlyRent?: number | null; loanProgram?: string },
): number {
  const loanNeeded = Math.max(0, apartmentPrice - cash);

  // Monthly: rent + interest on financed deposit
  if (tradeType === "monthly") {
    const rent = Math.max(0, Number(opts?.monthlyRent ?? 0));
    const depositInterest = interestOnlyMonthly(loanNeeded, JEONSE_RATE);
    return Math.round((rent + depositInterest) * 10) / 10;
  }

  if (loanNeeded <= 0) return 0;

  if (tradeType === "sale") {
    const rate = opts?.loanProgram === "bogeumjari" ? BOGEUMJARI_RATE : BANK_MORTGAGE_RATE;
    return Math.round(amortizationMonthly(loanNeeded, rate, 30) * 10) / 10;
  }

  // Jeonse: interest-only
  return Math.round(interestOnlyMonthly(loanNeeded, JEONSE_RATE) * 10) / 10;
}

// =============================================================
// Helpers
// =============================================================

function buildOutput(
  maxPrice: number,
  maxLoan: number,
  annualRate: number,
  loanTermYears: number,
  isInterestOnly: boolean,
  monthlyBudget: number,
): BudgetOutput {
  const roundedPrice = Math.round(Math.max(0, maxPrice));
  const roundedLoan = Math.round(Math.max(0, maxLoan));

  const estimatedMonthlyCost = isInterestOnly
    ? interestOnlyMonthly(roundedLoan, annualRate)
    : amortizationMonthly(roundedLoan, annualRate, loanTermYears);

  return {
    maxPrice: roundedPrice,
    maxLoan: roundedLoan,
    estimatedMonthlyCost: Math.round(estimatedMonthlyCost * 10) / 10,
    effectiveMonthlyBudget: monthlyBudget > 0
      ? Math.min(estimatedMonthlyCost, monthlyBudget)
      : estimatedMonthlyCost,
  };
}

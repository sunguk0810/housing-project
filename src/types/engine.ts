// Engine input/output types
// Source of Truth: docs/PHASE1_design.md > S4

export interface BudgetInput {
  /** Cash on hand (만원) */
  cash: number;
  /** Monthly household income (만원) */
  income: number;
  /** Existing monthly loan payments (만원) */
  loans: number;
  /** Monthly budget upper limit set by user (만원) */
  monthlyBudget: number;
  /** Trade type */
  tradeType: "sale" | "jeonse";
}

export interface BudgetOutput {
  /** Maximum affordable housing price or jeonse deposit (만원) */
  maxPrice: number;
  /** Maximum loan amount (만원) */
  maxLoan: number;
  /** Estimated monthly payment (만원) */
  estimatedMonthlyCost: number;
  /** Effective monthly budget for scoring */
  effectiveMonthlyBudget: number;
}

export interface CommuteInput {
  aptId: number;
  aptLon: number;
  aptLat: number;
  destLon: number;
  destLat: number;
  destLabel: string;
}

export interface CommuteResult {
  timeMinutes: number;
  source: "grid" | "redis" | "odsay" | "mock";
}

export interface ScoringInput {
  maxBudget: number;
  monthlyCost: number;
  commuteTime1: number;
  commuteTime2: number;
  childcareCount800m: number;
  crimeLevel: number;
  cctvDensity: number;
  shelterCount: number;
  achievementScore: number;
}

export interface DimensionScores {
  budget: number;
  commute: number;
  childcare: number;
  safety: number;
  school: number;
}

export interface FinalScoreResult {
  finalScore: number;
  dimensions: DimensionScores;
  reason: string;
  whyNot: string;
}

export type WeightProfileKey = "balanced" | "budget_focused" | "commute_focused";

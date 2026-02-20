// Engine input/output types
// Source of Truth: docs/PHASE1_design.md > S4

/** Housing ownership status (self-declared) */
export type BudgetProfileKey = "firstTime" | "noProperty" | "homeowner";

/** Loan program selection */
export type LoanProgramKey = "bankMortgage" | "bogeumjari";

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
  tradeType: "sale" | "jeonse" | "monthly";
  /** Budget profile — housing ownership status */
  budgetProfile: BudgetProfileKey;
  /** Loan program — bank mortgage or bogeumjari */
  loanProgram: LoanProgramKey;
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

export interface CommuteRouteSegment {
  /** 1=subway, 2=bus, 3=walk */
  trafficType: 1 | 2 | 3;
  /** Line/route name (e.g. "2호선", "350번") */
  lineName: string;
  /** Number of stations/stops for this segment */
  stationCount: number;
  /** Estimated section duration (minutes) */
  sectionTime?: number;
  /** Estimated section distance (meters) */
  distance?: number;
}

export interface CommuteRouteInfo {
  /** Public transit path type (1=subway, 2=bus, 3=walk) */
  pathType?: number | null;
  /** Total walking distance (minutes) */
  totalWalk?: number | null;
  /** Number of bus transfer segments */
  busTransitCount?: number | null;
  /** Number of subway transfer segments */
  subwayTransitCount?: number | null;
  /** Total station count */
  totalStationCount?: number | null;
  /** Total route distance (meters) */
  totalDistance?: number | null;
  segments: ReadonlyArray<CommuteRouteSegment>;
  transferCount: number;
  summary: string;
}

export interface CommuteResult {
  timeMinutes: number;
  source: "grid" | "mock";
  routes?: CommuteRouteInfo;
}

export interface ScoringInput {
  /** Apartment price (만원) */
  apartmentPrice: number;
  /** User's maximum affordable price from budget calc (만원) */
  maxPrice: number;
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

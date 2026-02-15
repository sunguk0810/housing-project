import type {
  ScoringInput,
  DimensionScores,
  FinalScoreResult,
  WeightProfileKey,
} from "@/types/engine";

/**
 * 5-dimension scoring engine.
 * All formulas are 100% transcribed from PHASE1 S4.
 *
 * Source of Truth: PHASE1 S4
 */

export const WEIGHT_PROFILES: Record<
  WeightProfileKey,
  Record<keyof DimensionScores, number>
> = {
  balanced: {
    budget: 0.3,
    commute: 0.25,
    childcare: 0.15,
    safety: 0.15,
    school: 0.15,
  },
  budget_focused: {
    budget: 0.4,
    commute: 0.2,
    childcare: 0.15,
    safety: 0.15,
    school: 0.1,
  },
  commute_focused: {
    budget: 0.2,
    commute: 0.4,
    childcare: 0.15,
    safety: 0.15,
    school: 0.1,
  },
};

// --- Normalization functions (PHASE1 S4) ---

/** Budget: max(0, (max_budget - monthly_cost) / max_budget) */
function normalizeBudget(maxBudget: number, monthlyCost: number): number {
  if (maxBudget <= 0) return 0;
  return Math.max(0, (maxBudget - monthlyCost) / maxBudget);
}

/** Commute: max(0, (60 - max(commute1, commute2)) / 60) */
function normalizeCommute(
  commuteTime1: number,
  commuteTime2: number,
): number {
  const maxCommute = Math.max(commuteTime1, commuteTime2);
  return Math.max(0, (60 - maxCommute) / 60);
}

/** Childcare: min(childcare_count_800m, 10) / 10 */
function normalizeChildcare(childcareCount800m: number): number {
  return Math.min(childcareCount800m, 10) / 10;
}

/**
 * Safety: composite of 3 sub-dimensions
 *   crime_norm   = (10 - crime_level) / 9
 *   cctv_norm    = clamp(cctv_density / 5, 0, 1)
 *   shelter_norm = min(shelter_count, 10) / 10
 *   safety       = 0.5 * crime_norm + 0.3 * cctv_norm + 0.2 * shelter_norm
 */
function normalizeSafety(
  crimeLevel: number,
  cctvDensity: number,
  shelterCount: number,
): number {
  const crimeNorm = (10 - crimeLevel) / 9;
  const cctvNorm = Math.min(Math.max(cctvDensity / 5, 0), 1);
  const shelterNorm = Math.min(shelterCount, 10) / 10;
  return 0.5 * crimeNorm + 0.3 * cctvNorm + 0.2 * shelterNorm;
}

/** School: achievement_score / 100 */
function normalizeSchool(achievementScore: number): number {
  return achievementScore / 100;
}

export function normalizeScore(input: ScoringInput): DimensionScores {
  return {
    budget: normalizeBudget(input.maxBudget, input.monthlyCost),
    commute: normalizeCommute(input.commuteTime1, input.commuteTime2),
    childcare: normalizeChildcare(input.childcareCount800m),
    safety: normalizeSafety(
      input.crimeLevel,
      input.cctvDensity,
      input.shelterCount,
    ),
    school: normalizeSchool(input.achievementScore),
  };
}

// --- Reason/WhyNot generation ---

const DIMENSION_LABELS: Record<keyof DimensionScores, string> = {
  budget: "예산 여유",
  commute: "통근시간",
  childcare: "보육시설",
  safety: "안전 환경",
  school: "학군 수준",
};

const DIMENSION_WHY_NOT: Record<keyof DimensionScores, string> = {
  budget: "월 고정비가 예산 상한에 근접",
  commute: "통근시간이 비교적 길 수 있음",
  childcare: "반경 800m 내 보육시설이 적은 편",
  safety: "안전 지표가 평균 이하",
  school: "학군 성취도가 평균 이하",
};

function generateReason(
  dimensions: DimensionScores,
  weights: Record<keyof DimensionScores, number>,
): string {
  const contributions = (
    Object.entries(dimensions) as Array<[keyof DimensionScores, number]>
  ).map(([dim, score]) => ({
    dim,
    contribution: weights[dim] * score,
    score,
  }));

  contributions.sort((a, b) => b.contribution - a.contribution);

  const top = contributions.slice(0, 3);
  const threshold = top[1].contribution * 0.7;
  const included = top.filter((c) => c.contribution >= threshold);

  const parts = included.map((c) => {
    const label = DIMENSION_LABELS[c.dim];
    switch (c.dim) {
      case "budget":
        return `${label} ${Math.round(c.score * 100)}%`;
      case "commute":
        return `${label} 양호`;
      case "childcare":
        return `보육시설 ${Math.round(c.score * 10)}곳`;
      case "safety":
        return `${label} 양호`;
      case "school":
        return `${label} ${Math.round(c.score * 100)}점`;
      default:
        return label;
    }
  });

  return parts.join(" + ");
}

function generateWhyNot(dimensions: DimensionScores): string {
  const entries = Object.entries(dimensions) as Array<
    [keyof DimensionScores, number]
  >;
  entries.sort((a, b) => a[1] - b[1]);
  const [lowestDim, lowestScore] = entries[0];

  if (lowestScore >= 0.5) return "";

  return DIMENSION_WHY_NOT[lowestDim];
}

// --- Main scoring function ---

/**
 * Calculate final weighted score.
 * Formula (PHASE1 S4):
 *   final_score = round(100 * Σ(W_dim * dim_norm), 1)
 */
export function calculateFinalScore(
  input: ScoringInput,
  weightProfile: WeightProfileKey,
): FinalScoreResult {
  const dimensions = normalizeScore(input);
  const weights = WEIGHT_PROFILES[weightProfile];

  const rawScore =
    weights.budget * dimensions.budget +
    weights.commute * dimensions.commute +
    weights.childcare * dimensions.childcare +
    weights.safety * dimensions.safety +
    weights.school * dimensions.school;

  const finalScore = Math.round(rawScore * 100 * 10) / 10;

  const reason = generateReason(dimensions, weights);
  const whyNot = generateWhyNot(dimensions);

  return { finalScore, dimensions, reason, whyNot };
}

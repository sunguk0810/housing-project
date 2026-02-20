import type {
  ScoringInput,
  DimensionScores,
  FinalScoreResult,
  WeightProfileKey,
} from "@/types/engine";

/**
 * 5-dimension scoring engine.
 *
 * Source of Truth: PHASE1 S4 (normalization formulas updated for V2)
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

// --- Normalization functions ---

/**
 * Budget: Price utilization curve.
 * Rewards apartments that make good use of the budget capacity,
 * not just the cheapest ones.
 *
 * - 0-50% utilization:  0.3 → 0.85 (underutilizing — could get better)
 * - 50-85% utilization: 0.85 → 1.0 (sweet spot)
 * - 85-100% utilization: 1.0 → 0.7 (tight budget)
 */
function normalizeBudget(
  apartmentPrice: number,
  maxPrice: number,
): number {
  if (maxPrice <= 0) return 0;
  const ratio = Math.min(apartmentPrice / maxPrice, 1.0);

  if (ratio <= 0.5) {
    // Linear ramp: 0.3 at 0% → 0.85 at 50%
    return 0.3 + ratio * 1.1;
  }
  if (ratio <= 0.85) {
    // Linear ramp: 0.85 at 50% → 1.0 at 85%
    return 0.85 + ((ratio - 0.5) / 0.35) * 0.15;
  }
  // Linear ramp down: 1.0 at 85% → 0.7 at 100%
  return 1.0 - ((ratio - 0.85) / 0.15) * 0.3;
}

/** Commute: max(0, (60 - max(commute1, commute2)) / 60) */
function normalizeCommute(
  commuteTime1: number,
  commuteTime2: number,
): number {
  const maxCommute = Math.max(commuteTime1, commuteTime2);
  return Math.max(0, (60 - maxCommute) / 60);
}

/**
 * Childcare: diminishing returns via square root.
 * sqrt(count / 30) — 30 centers = 1.0, natural diminishing returns.
 *
 * Examples: 0→0, 5→0.41, 8→0.52, 10→0.58, 15→0.71, 20→0.82, 30→1.0
 */
function normalizeChildcare(childcareCount800m: number): number {
  if (childcareCount800m <= 0) return 0;
  return Math.min(Math.sqrt(childcareCount800m / 30), 1);
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
    budget: normalizeBudget(input.apartmentPrice, input.maxPrice),
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
  budget: "예산 적합도",
  commute: "통근시간",
  childcare: "보육시설",
  safety: "안전 환경",
  school: "학군 수준",
};

const DIMENSION_WHY_NOT: Record<keyof DimensionScores, string> = {
  budget: "예산 대비 가격이 다소 낮거나 높음",
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
        return `보육시설 ${Math.round(c.score * 30)}곳`;
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

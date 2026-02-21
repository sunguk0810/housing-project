import type {
  ScoringInput,
  DimensionScores,
  FinalScoreResult,
  WeightProfileKey,
} from "@/types/engine";

/**
 * 6-dimension scoring engine.
 *
 * Source of Truth: PHASE1 S4 (normalization formulas updated for V2)
 */

export const WEIGHT_PROFILES: Record<
  WeightProfileKey,
  Record<keyof DimensionScores, number>
> = {
  balanced: {
    budget: 0.28,
    commute: 0.24,
    childcare: 0.14,
    safety: 0.14,
    school: 0.12,
    complexScale: 0.08,
  },
  budget_focused: {
    budget: 0.38,
    commute: 0.20,
    childcare: 0.12,
    safety: 0.12,
    school: 0.10,
    complexScale: 0.08,
  },
  commute_focused: {
    budget: 0.20,
    commute: 0.38,
    childcare: 0.12,
    safety: 0.12,
    school: 0.10,
    complexScale: 0.08,
  },
  complex_focused: {
    budget: 0.20,
    commute: 0.18,
    childcare: 0.12,
    safety: 0.12,
    school: 0.13,
    complexScale: 0.25,
  },
  value_maximized: {
    budget: 0.00,
    commute: 0.30,
    childcare: 0.18,
    safety: 0.18,
    school: 0.15,
    complexScale: 0.19,
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

/**
 * Complex scale: log-interpolation hybrid based on R114 market tiers.
 * Hedonic model ln(price)~ln(count), beta 0.03~0.08.
 * Regulatory anchors: 150/300/500/1000 households.
 */
const COMPLEX_SCALE_TIERS = [
  { units: 50,   score: 0.05 },   // KB price minimum threshold
  { units: 150,  score: 0.15 },   // Mandatory management boundary
  { units: 300,  score: 0.30 },   // Mandatory management (daycare required)
  { units: 500,  score: 0.45 },   // Community facilities (gym, library)
  { units: 1000, score: 0.70 },   // Large complex entry (R114: +58%)
  { units: 1500, score: 0.85 },   // Large complex (R114: +89%, top 2%)
  { units: 5000, score: 1.00 },   // Saturation cap (diminishing returns)
] as const;

function normalizeComplexScale(householdCount: number | null): number {
  if (householdCount == null) return 0.35; // Neutral for non-random missing data
  if (householdCount <= 0) return 0;

  const firstTier = COMPLEX_SCALE_TIERS[0];
  const lastTier = COMPLEX_SCALE_TIERS[COMPLEX_SCALE_TIERS.length - 1];

  // 1~49: linear ramp (officetel/villa grade)
  if (householdCount < firstTier.units) {
    return firstTier.score * (householdCount / firstTier.units);
  }
  // 5000+: saturation cap
  if (householdCount >= lastTier.units) return 1.0;

  // Log-space interpolation between tiers
  for (let i = 1; i < COMPLEX_SCALE_TIERS.length; i++) {
    if (householdCount <= COMPLEX_SCALE_TIERS[i].units) {
      const prev = COMPLEX_SCALE_TIERS[i - 1];
      const curr = COMPLEX_SCALE_TIERS[i];
      const t =
        (Math.log(householdCount) - Math.log(prev.units)) /
        (Math.log(curr.units) - Math.log(prev.units));
      return prev.score + t * (curr.score - prev.score);
    }
  }
  return 1.0;
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
    complexScale: normalizeComplexScale(input.householdCount),
  };
}

// --- Reason/WhyNot generation ---

const DIMENSION_LABELS: Record<keyof DimensionScores, string> = {
  budget: "예산 적합도",
  commute: "통근시간",
  childcare: "보육시설",
  safety: "안전 환경",
  school: "학군 수준",
  complexScale: "단지 규모",
};

const DIMENSION_WHY_NOT: Record<keyof DimensionScores, string> = {
  budget: "예산 대비 가격이 다소 낮거나 높음",
  commute: "통근시간이 비교적 길 수 있음",
  childcare: "반경 800m 내 보육시설이 적은 편",
  safety: "안전 지표가 평균 이하",
  school: "학군 성취도가 평균 이하",
  complexScale: "소규모 단지로 관리/인프라가 제한적",
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
      case "complexScale":
        return `대단지 ${Math.round(c.score * 1500)}세대`;
      default:
        return label;
    }
  });

  return parts.join(" + ");
}

function generateWhyNot(
  dimensions: DimensionScores,
  weights: Record<keyof DimensionScores, number>,
): string {
  const entries = (Object.entries(dimensions) as Array<[keyof DimensionScores, number]>)
    .filter(([dim]) => weights[dim] > 0);
  if (entries.length === 0) return "";
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
    weights.school * dimensions.school +
    weights.complexScale * dimensions.complexScale;

  const finalScore = Math.round(rawScore * 100 * 10) / 10;

  const reason = generateReason(dimensions, weights);
  const whyNot = generateWhyNot(dimensions, weights);

  return { finalScore, dimensions, reason, whyNot };
}

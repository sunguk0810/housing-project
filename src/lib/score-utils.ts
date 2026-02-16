/**
 * Score utility functions.
 * Source of Truth: M3 spec Section 4
 */

import type { ScoreGrade } from "@/types/ui";

/**
 * 5-grade score classification.
 * Uses design tokens: --color-score-{grade}
 */
export function getScoreGrade(score: number): ScoreGrade {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "average";
  if (score >= 20) return "below";
  return "poor";
}

export const GRADE_LABELS: Record<ScoreGrade, string> = {
  excellent: "A+",
  good: "A",
  average: "B",
  below: "C",
  poor: "D",
};

export const GRADE_DESCRIPTIONS: Record<ScoreGrade, string> = {
  excellent: "매우 우수",
  good: "우수",
  average: "보통",
  below: "다소 부족",
  poor: "부족",
};

/**
 * Budget 3-bucket classification for Detail page.
 */
export function getBudgetLabel(budgetScore: number): {
  label: string;
  level: "comfortable" | "moderate" | "tight";
} {
  const percent = budgetScore * 100;
  if (percent >= 60) return { label: "참고 범위 이내", level: "comfortable" };
  if (percent >= 30) return { label: "다소 부담", level: "moderate" };
  return { label: "적극적 재무 계획 필요", level: "tight" };
}

/**
 * Shared utilities for the compare page components.
 */
import type { RecommendationItem } from "@/types/api";

// Design token colors matching tokens.css --color-compare-1/2/3
export const COMPARE_COLORS = ["#0891B2", "#F97316", "#8B5CF6"] as const;

/**
 * Identify best aptId(s) for a given score dimension.
 * Used for best-in-row highlighting.
 */
export function getBestAptIds(
  items: ReadonlyArray<RecommendationItem>,
  getValue: (item: RecommendationItem) => number,
): Set<number> {
  if (items.length <= 1) return new Set();
  const values = items.map(getValue);
  const max = Math.max(...values);
  return new Set(
    items.filter((_, i) => values[i] === max).map((item) => item.aptId),
  );
}

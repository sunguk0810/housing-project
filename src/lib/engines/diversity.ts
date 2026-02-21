/**
 * Price-tier diversity re-ranking for value_maximized profile.
 *
 * Source of Truth: PHASE1 S4 — diversity reranking specification
 */

// --- Types ---

export type PriceTier = 'premium' | 'mid' | 'value';

export interface DiversityCandidate<T> {
  readonly score: number;
  readonly price: number;
  readonly item: T;
}

// --- Constants ---

export const DEFAULT_LAMBDA = 0.30;
export const DEFAULT_TOP_K = 10;

const TIER_RATIOS: Readonly<Record<PriceTier, number>> = {
  premium: 0.3,
  mid: 0.4,
  value: 0.3,
};

// --- Tier classification ---

export function classifyPriceTier(price: number, maxPrice: number): PriceTier {
  if (maxPrice <= 0) return 'value';
  const ratio = price / maxPrice;
  if (ratio >= 0.85) return 'premium';
  if (ratio >= 0.70) return 'mid';
  return 'value';
}

// --- Internal helpers ---

/**
 * Min-max normalize scores to [0, 1] within the candidate set.
 *
 * Edge cases:
 * - range=0 (all same score): return 0.5 — tier deficit decides
 * - single candidate: return 1.0
 */
function normalizeScores<T>(candidates: ReadonlyArray<DiversityCandidate<T>>): number[] {
  if (candidates.length <= 1) return candidates.map(() => 1.0);
  const scores = candidates.map((c) => c.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min;
  if (range === 0) return candidates.map(() => 0.5);
  return scores.map((s) => (s - min) / range);
}

/**
 * Compute tier targets scaled to topK using TIER_RATIOS.
 * Adjusts mid tier to ensure sum === topK.
 */
export function computeTierTargets(topK: number): Record<PriceTier, number> {
  const raw = {
    premium: Math.round(topK * TIER_RATIOS.premium),
    mid: Math.round(topK * TIER_RATIOS.mid),
    value: Math.round(topK * TIER_RATIOS.value),
  };
  const sum = raw.premium + raw.mid + raw.value;
  if (sum < topK) raw.mid += topK - sum;
  else if (sum > topK) raw.mid -= sum - topK;
  return raw;
}

// --- Main reranking ---

/**
 * Greedy diversity re-ranking with remaining-slots deficit scaling.
 *
 * When candidates.length <= topK, returns all candidates sorted by score descending.
 * Otherwise, selects topK candidates balancing score quality and price tier diversity.
 */
export function diversityRerank<T>(
  candidates: ReadonlyArray<DiversityCandidate<T>>,
  maxPrice: number,
  topK: number = DEFAULT_TOP_K,
  lambda: number = DEFAULT_LAMBDA,
): DiversityCandidate<T>[] {
  if (candidates.length <= topK) {
    return [...candidates].sort((a, b) => b.score - a.score);
  }

  const normalized = normalizeScores(candidates);
  const targets = computeTierTargets(topK);
  const selected: DiversityCandidate<T>[] = [];

  // Preserve original index for deterministic tiebreak
  const remaining = candidates.map((c, i) => ({
    candidate: c,
    norm: normalized[i],
    origIdx: i,
  }));

  const tierCounts: Record<PriceTier, number> = { premium: 0, mid: 0, value: 0 };

  // First pick: highest normalized score (tiebreak by original index)
  remaining.sort((a, b) => b.norm - a.norm || a.origIdx - b.origIdx);
  const first = remaining.shift()!;
  selected.push(first.candidate);
  tierCounts[classifyPriceTier(first.candidate.price, maxPrice)]++;

  // Greedy selection for remaining slots
  while (selected.length < topK && remaining.length > 0) {
    let bestIdx = 0;
    let bestCombined = -Infinity;
    let bestOrigIdx = Infinity;
    const remainingSlots = Math.max(1, topK - selected.length);

    for (let i = 0; i < remaining.length; i++) {
      const { candidate, norm, origIdx } = remaining[i];
      const tier = classifyPriceTier(candidate.price, maxPrice);
      const deficit = Math.min(1.0, Math.max(0, targets[tier] - tierCounts[tier]) / remainingSlots);
      const combined = (1 - lambda) * norm + lambda * deficit;

      if (combined > bestCombined || (combined === bestCombined && origIdx < bestOrigIdx)) {
        bestCombined = combined;
        bestIdx = i;
        bestOrigIdx = origIdx;
      }
    }

    const picked = remaining.splice(bestIdx, 1)[0];
    selected.push(picked.candidate);
    tierCounts[classifyPriceTier(picked.candidate.price, maxPrice)]++;
  }

  return selected;
}

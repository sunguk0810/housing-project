/**
 * Priorities → WeightProfile mapping utility.
 *
 * API still expects WeightProfile (backward compat).
 * Frontend collects PriorityKey[] and maps the first priority to WeightProfile.
 */

import type { WeightProfile } from '@/types/api';
import type { PriorityKey, PriorityWeights } from '@/types/ui';

export function prioritiesToPriorityWeights(priorities: readonly PriorityKey[]): PriorityWeights {
  const defaultWeights: PriorityWeights = {
    commute: 25,
    childcare: 25,
    safety: 25,
    budget: 25,
  };

  const topPriority = priorities[0];
  if (!topPriority) return defaultWeights;

  if (topPriority === 'commute') {
    return { commute: 60, budget: 20, childcare: 10, safety: 10 };
  }

  if (topPriority === 'budget') {
    return { budget: 60, commute: 20, childcare: 10, safety: 10 };
  }

  return defaultWeights;
}

export function normalizePriorityWeights(weights: PriorityWeights): PriorityWeights {
  const sum = Object.values(weights).reduce((acc, value) => acc + value, 0);
  if (sum <= 0) {
    return { commute: 25, childcare: 25, safety: 25, budget: 25 };
  }

  // Largest remainder method: guarantees exact sum of 100
  const keys: (keyof PriorityWeights)[] = ['commute', 'childcare', 'safety', 'budget'];
  const exact = keys.map((k) => (weights[k] / sum) * 100);
  const floored = exact.map((v) => Math.floor(v));
  const remainder = 100 - floored.reduce((a, b) => a + b, 0);

  exact
    .map((v, i) => ({ i, frac: v - floored[i] }))
    .sort((a, b) => b.frac - a.frac)
    .slice(0, remainder)
    .forEach(({ i }) => { floored[i]++; });

  return {
    commute: floored[0],
    childcare: floored[1],
    safety: floored[2],
    budget: floored[3],
  };
}

export function priorityWeightsToWeightProfile(weights: PriorityWeights): WeightProfile {
  const normalized = normalizePriorityWeights(weights);

  if (
    normalized.budget > normalized.commute &&
    normalized.budget > normalized.childcare &&
    normalized.budget > normalized.safety
  ) {
    return 'budget_focused';
  }

  if (
    normalized.commute > normalized.budget &&
    normalized.commute > normalized.childcare &&
    normalized.commute > normalized.safety
  ) {
    return 'commute_focused';
  }

  return 'balanced';
}

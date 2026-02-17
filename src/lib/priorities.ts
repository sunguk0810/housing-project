/**
 * Priorities → WeightProfile mapping utility.
 *
 * API still expects WeightProfile (backward compat).
 * Frontend collects PriorityKey[] and maps the first priority to WeightProfile.
 */

import type { WeightProfile } from '@/types/api';
import type { PriorityKey, PriorityWeights } from '@/types/ui';

const PRIORITY_TO_WEIGHT: Record<PriorityKey, WeightProfile> = {
  commute: 'commute_focused',
  budget: 'budget_focused',
  childcare: 'balanced',
  safety: 'balanced',
};

export function prioritiesToWeightProfile(priorities: readonly PriorityKey[]): WeightProfile {
  if (priorities.length === 0) return 'balanced';
  return PRIORITY_TO_WEIGHT[priorities[0]];
}

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
    return {
      commute: 25,
      childcare: 25,
      safety: 25,
      budget: 25,
    };
  }

  return {
    commute: Math.round((weights.commute / sum) * 100),
    childcare: Math.round((weights.childcare / sum) * 100),
    safety: Math.round((weights.safety / sum) * 100),
    budget: Math.round((weights.budget / sum) * 100),
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

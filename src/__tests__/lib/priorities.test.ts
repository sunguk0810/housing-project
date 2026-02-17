import {
  normalizePriorityWeights,
  priorityWeightsToWeightProfile,
  prioritiesToPriorityWeights,
} from '@/lib/priorities';

describe('priorities utils', () => {
  it('normalizes weights to 100 sum', () => {
    const normalized = normalizePriorityWeights({
      commute: 50,
      childcare: 25,
      safety: 25,
      budget: 50,
    });

    const sum = normalized.commute + normalized.childcare + normalized.safety + normalized.budget;

    expect(sum).toBeGreaterThanOrEqual(99);
    expect(sum).toBeLessThanOrEqual(101);
  });

  it('returns budget_focused when budget is top priority', () => {
    const profile = priorityWeightsToWeightProfile({
      commute: 10,
      childcare: 10,
      safety: 10,
      budget: 70,
    });
    expect(profile).toBe('budget_focused');
  });

  it('migrates legacy priorities list to priority weights', () => {
    const migrated = prioritiesToPriorityWeights(['commute']);
    expect(migrated.commute).toBe(60);
    expect(migrated.budget).toBe(20);
  });
});

/**
 * Frontend UI types for M3.
 * Source of Truth: M3 spec Section 2
 */

export type ScoreGrade = 'excellent' | 'good' | 'average' | 'below' | 'poor';

export type ChildPlan = 'yes' | 'maybe' | 'no';
export type MarriagePlannedAt = 'within_6m' | 'within_1y' | 'undecided';

export interface StepDefinition {
  readonly step: number;
  readonly title: string;
  readonly description: string;
}

export interface ConsentState {
  readonly terms: boolean;
  readonly privacy: boolean;
  readonly marketing: boolean;
}

export type SortOption = 'score' | 'budget' | 'commute';

export type MapMarkerState = 'default' | 'selected' | 'visited';

export type PriorityKey = 'commute' | 'childcare' | 'safety' | 'budget';
export type PriorityWeightKey = PriorityKey;
export type LivingAreaKey = 'gangnam' | 'yeouido' | 'pangyo' | 'magok' | 'gwanghwamun' | 'jamsil';

export interface PriorityWeights {
  readonly commute: number;
  readonly childcare: number;
  readonly safety: number;
  readonly budget: number;
}

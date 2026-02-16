/**
 * Frontend UI types for M3.
 * Source of Truth: M3 spec Section 2
 */

export type ScoreGrade = "excellent" | "good" | "average" | "below" | "poor";

export type ChildPlan = "yes" | "maybe" | "no";

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

export type SortOption = "score" | "budget" | "commute";

export type MapMarkerState = "default" | "selected" | "visited";

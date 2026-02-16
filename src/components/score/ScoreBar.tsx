"use client";

import { cn } from "@/lib/utils";
import { getScoreGrade } from "@/lib/score-utils";
import type { ScoreGrade } from "@/types/ui";

interface ScoreBarProps {
  label: string;
  score: number;
  compact?: boolean;
  className?: string;
}

const GRADE_COLORS: Record<ScoreGrade, string> = {
  excellent: "var(--color-score-excellent)",
  good: "var(--color-score-good)",
  average: "var(--color-score-average)",
  below: "var(--color-score-below)",
  poor: "var(--color-score-poor)",
};

export function ScoreBar({ label, score, compact = false, className }: ScoreBarProps) {
  const grade = getScoreGrade(score);
  const percentage = Math.min(Math.max(score, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1 flex items-center justify-between">
        <span
          className="text-[length:var(--text-caption)] font-[var(--text-caption-weight)] text-[var(--color-on-surface-muted)]"
        >
          {label}
        </span>
        <span
          className="text-[length:var(--text-caption)] font-semibold tabular-nums"
          style={{ color: GRADE_COLORS[grade] }}
        >
          {Math.round(score)}
        </span>
      </div>
      <div
        className="w-full overflow-hidden rounded-full bg-[var(--color-neutral-200)]"
        style={{ height: compact ? 6 : 8 }}
        role="progressbar"
        aria-valuenow={Math.round(score)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} ${Math.round(score)}점`}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: GRADE_COLORS[grade],
          }}
          data-testid="score-bar-fill"
        />
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { getScoreGrade, GRADE_LABELS, GRADE_DESCRIPTIONS } from "@/lib/score-utils";
import type { ScoreGrade } from "@/types/ui";

type BadgeSize = "sm" | "md" | "lg";

interface ScoreBadgeProps {
  score: number;
  size?: BadgeSize;
  className?: string;
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-[var(--space-2)] py-0.5 text-[length:var(--text-caption)]",
  md: "px-[var(--space-3)] py-1 text-[length:var(--text-body-sm)]",
  lg: "px-[var(--space-4)] py-1.5 text-[length:var(--text-body)]",
};

const GRADE_STYLES: Record<ScoreGrade, string> = {
  excellent: "bg-[var(--color-score-excellent-subtle)] text-[var(--color-score-excellent-fg)] border-[var(--color-score-excellent-border)]",
  good: "bg-[var(--color-score-good-subtle)] text-[var(--color-score-good-fg)] border-[var(--color-score-good-border)]",
  average: "bg-[var(--color-score-average-subtle)] text-[var(--color-score-average-fg)] border-[var(--color-score-average-border)]",
  below: "bg-[var(--color-score-below-subtle)] text-[var(--color-score-below-fg)] border-[var(--color-score-below-border)]",
  poor: "bg-[var(--color-score-poor-subtle)] text-[var(--color-score-poor-fg)] border-[var(--color-score-poor-border)]",
};

export function ScoreBadge({ score, size = "md", className }: ScoreBadgeProps) {
  const grade = getScoreGrade(score);
  const label = GRADE_LABELS[grade];
  const description = GRADE_DESCRIPTIONS[grade];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        SIZE_CLASSES[size],
        GRADE_STYLES[grade],
        className,
      )}
      aria-label={`등급 ${label} (${description})`}
    >
      {label}
      <span className="font-normal">{description}</span>
    </span>
  );
}

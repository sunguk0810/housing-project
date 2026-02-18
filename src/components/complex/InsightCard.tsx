"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoreGrade } from "@/types/ui";

interface InsightCardProps {
  icon: LucideIcon;
  insight: string;
  value: string;
  valueLabel?: string;
  grade: ScoreGrade;
  children?: React.ReactNode;
  className?: string;
}

const GRADE_VALUE_COLORS: Record<ScoreGrade, string> = {
  excellent: "text-[var(--color-score-excellent)]",
  good: "text-[var(--color-score-good)]",
  average: "text-[var(--color-score-average)]",
  below: "text-[var(--color-score-below)]",
  poor: "text-[var(--color-score-poor)]",
};

const GRADE_ICON_BG: Record<ScoreGrade, string> = {
  excellent: "bg-[var(--color-score-excellent-subtle)]",
  good: "bg-[var(--color-score-good-subtle)]",
  average: "bg-[var(--color-score-average-subtle)]",
  below: "bg-[var(--color-score-below-subtle)]",
  poor: "bg-[var(--color-score-poor-subtle)]",
};

const GRADE_ICON_COLORS: Record<ScoreGrade, string> = {
  excellent: "text-[var(--color-score-excellent)]",
  good: "text-[var(--color-score-good)]",
  average: "text-[var(--color-score-average)]",
  below: "text-[var(--color-score-below)]",
  poor: "text-[var(--color-score-poor)]",
};

export function InsightCard({
  icon: Icon,
  insight,
  value,
  valueLabel,
  grade,
  children,
  className,
}: InsightCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-[var(--space-4)] shadow-sm border border-[var(--color-border)]",
        className,
      )}
    >
      {/* Top row: grade-tinted icon + insight text */}
      <div className="flex items-start gap-[var(--space-3)]">
        <div
          className={cn(
            "shrink-0 rounded-xl p-[var(--space-2)]",
            GRADE_ICON_BG[grade],
          )}
        >
          <Icon size={20} className={GRADE_ICON_COLORS[grade]} />
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-[length:var(--text-body-sm)] leading-snug text-[var(--color-on-surface)]">
            {insight}
          </p>
        </div>
      </div>

      {/* Grade value display */}
      <div className="mt-[var(--space-3)] flex items-baseline gap-[var(--space-2)]">
        <span
          className={cn(
            "text-[length:var(--text-heading)] font-bold",
            GRADE_VALUE_COLORS[grade],
          )}
        >
          {value}
        </span>
        {valueLabel && (
          <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            {valueLabel}
          </span>
        )}
      </div>

      {/* Optional children slot (ScoreBar, chart, etc.) */}
      {children && <div className="mt-[var(--space-3)]">{children}</div>}
    </div>
  );
}

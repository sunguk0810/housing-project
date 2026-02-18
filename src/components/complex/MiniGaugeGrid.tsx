"use client";

import { CircularGauge } from "@/components/score/CircularGauge";
import { GRADE_LABELS, getScoreGrade } from "@/lib/score-utils";
import type { ScoreGrade } from "@/types/ui";

interface MiniGaugeItem {
  readonly key: string;
  readonly label: string;
  readonly score: number;
}

interface MiniGaugeGridProps {
  items: ReadonlyArray<MiniGaugeItem>;
  className?: string;
}

const GRADE_TEXT_COLORS: Record<ScoreGrade, string> = {
  excellent: "text-[var(--color-score-excellent)]",
  good: "text-[var(--color-score-good)]",
  average: "text-[var(--color-score-average)]",
  below: "text-[var(--color-score-below)]",
  poor: "text-[var(--color-score-poor)]",
};

export function MiniGaugeGrid({ items, className }: MiniGaugeGridProps) {
  return (
    <div className={className}>
      <div className="mx-auto max-w-sm rounded-2xl bg-white px-[var(--space-4)] py-[var(--space-3)] shadow-lg">
        <div className="grid grid-cols-4 gap-[var(--space-3)]">
          {items.map((item) => {
            const score = Math.round(item.score * 100);
            const grade = getScoreGrade(score);
            return (
              <div key={item.key} className="flex flex-col items-center gap-0.5">
                <CircularGauge
                  score={score}
                  size="mini"
                  animated={false}
                />
                <span className={`mt-0.5 text-[length:var(--text-caption)] font-semibold ${GRADE_TEXT_COLORS[grade]}`}>
                  {GRADE_LABELS[grade]}
                </span>
                <span className="text-[11px] leading-none text-[var(--color-on-surface-muted)]">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

const LEGEND_ITEMS = [
  { label: "80+", color: "var(--color-score-excellent)" },
  { label: "60~79", color: "var(--color-score-good)" },
  { label: "40~59", color: "var(--color-score-average)" },
  { label: "20~39", color: "var(--color-score-below)" },
  { label: "<20", color: "var(--color-score-poor)" },
] as const;

interface MapScoreLegendProps {
  className?: string;
}

export function MapScoreLegend({ className }: MapScoreLegendProps) {
  return (
    <div
      className={cn(
        "z-2 rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-2)] px-[var(--space-3)] shadow-[var(--shadow-s7-md)]",
        className,
      )}
    >
      <p className="mb-1 text-[10px] font-bold">Score</p>
      <div className="flex flex-col gap-0.5">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1 text-[10px]">
            <span
              className="inline-block h-[10px] w-[10px] shrink-0 rounded-full"
              style={{ background: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

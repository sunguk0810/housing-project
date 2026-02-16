"use client";

import { cn } from "@/lib/utils";
import { getScoreGrade, GRADE_LABELS } from "@/lib/score-utils";
import type { ScoreGrade } from "@/types/ui";

type GaugeSize = "card" | "hero" | "mini";

interface CircularGaugeProps {
  score: number;
  size?: GaugeSize;
  animated?: boolean;
  className?: string;
}

const SIZE_CONFIG: Record<GaugeSize, { dimension: number; stroke: number; fontSize: string }> = {
  mini: { dimension: 48, stroke: 4, fontSize: "var(--text-body-sm)" },
  card: { dimension: 64, stroke: 5, fontSize: "var(--text-subtitle)" },
  hero: { dimension: 96, stroke: 6, fontSize: "var(--text-heading)" },
};

const GRADE_COLORS: Record<ScoreGrade, string> = {
  excellent: "var(--color-score-excellent)",
  good: "var(--color-score-good)",
  average: "var(--color-score-average)",
  below: "var(--color-score-below)",
  poor: "var(--color-score-poor)",
};

export function CircularGauge({
  score,
  size = "card",
  animated = true,
  className,
}: CircularGaugeProps) {
  const grade = getScoreGrade(score);
  const config = SIZE_CONFIG[size];
  const radius = (config.dimension - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const dashOffset = circumference * (1 - progress);
  const color = GRADE_COLORS[grade];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: config.dimension, height: config.dimension }}
      role="img"
      aria-label={`종합 점수 ${score}점, 등급 ${GRADE_LABELS[grade]}`}
    >
      <svg
        width={config.dimension}
        height={config.dimension}
        viewBox={`0 0 ${config.dimension} ${config.dimension}`}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          stroke="var(--color-neutral-200)"
          strokeWidth={config.stroke}
        />
        {/* Progress circle */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={
            animated
              ? {
                  "--gauge-circumference": `${circumference}`,
                  "--gauge-target": `${dashOffset}`,
                  animation: "countUp var(--duration-countup) var(--ease-out-expo) forwards",
                } as React.CSSProperties
              : undefined
          }
          data-testid="gauge-progress"
        />
      </svg>
      <span
        className="absolute font-bold tabular-nums"
        style={{
          fontSize: config.fontSize,
          color,
        }}
      >
        {Math.round(score)}
      </span>
    </div>
  );
}

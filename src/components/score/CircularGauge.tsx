"use client";

import { cn } from "@/lib/utils";
import { getScoreGrade, GRADE_LABELS } from "@/lib/score-utils";
import type { ScoreGrade } from "@/types/ui";

type GaugeSize = "card" | "hero" | "mini";

interface CircularGaugeProps {
  score: number;
  size?: GaugeSize;
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

const SIZE_CONFIG: Record<
  GaugeSize,
  { dimension: number; stroke: number; fontSize: string; labelSize: string | null }
> = {
  mini: { dimension: 48, stroke: 4, fontSize: "var(--text-body-sm)", labelSize: null },
  card: { dimension: 64, stroke: 5, fontSize: "var(--text-subtitle)", labelSize: "var(--text-caption)" },
  hero: { dimension: 96, stroke: 6, fontSize: "var(--text-heading)", labelSize: "var(--text-body-sm)" },
};

const GRADE_COLORS: Record<ScoreGrade, string> = {
  excellent: "var(--color-score-excellent)",
  good: "var(--color-score-good)",
  average: "var(--color-score-average)",
  below: "var(--color-score-below)",
  poor: "var(--color-score-poor)",
};

// 270° arc: starts at 7:30 position (225° from 3 o'clock = -135° rotation)
const ARC_FRACTION = 0.75; // 270° / 360°
const ROTATION_DEG = 135; // rotate so gap is at bottom center

export function CircularGauge({
  score,
  size = "card",
  animated = true,
  showLabel,
  className,
}: CircularGaugeProps) {
  const grade = getScoreGrade(score);
  const config = SIZE_CONFIG[size];
  const radius = (config.dimension - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * ARC_FRACTION;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const dashOffset = arcLength * (1 - progress);
  const color = GRADE_COLORS[grade];

  const shouldShowLabel = showLabel ?? config.labelSize !== null;

  return (
    <div
      className={cn("inline-flex flex-col items-center", className)}
      role="img"
      aria-label={`종합 점수 ${Math.round(score)}점, 등급 ${GRADE_LABELS[grade]}`}
    >
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: config.dimension, height: config.dimension }}
      >
        <svg
          width={config.dimension}
          height={config.dimension}
          viewBox={`0 0 ${config.dimension} ${config.dimension}`}
          style={{ transform: `rotate(${ROTATION_DEG}deg)` }}
        >
          {/* Background arc (270°) */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="none"
            stroke="var(--color-neutral-200)"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          />
          {/* Progress arc */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={dashOffset}
            style={
              animated && size !== "mini"
                ? {
                    "--gauge-circumference": `${arcLength}`,
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
      {shouldShowLabel && config.labelSize && (
        <span
          className="font-semibold"
          style={{ fontSize: config.labelSize, color }}
        >
          {GRADE_LABELS[grade]}
        </span>
      )}
    </div>
  );
}

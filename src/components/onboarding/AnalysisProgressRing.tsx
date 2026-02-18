"use client";

import { Progress } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisProgressRingProps {
  percent: number;
  isComplete?: boolean;
  className?: string;
}

const DIMENSION = 120;
const STROKE = 8;
const RADIUS = (DIMENSION - STROKE) / 2; // 56
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function AnalysisProgressRing({
  percent,
  isComplete = false,
  className,
}: AnalysisProgressRingProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const dashOffset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <Progress.Root
      value={clamped}
      max={100}
      className={cn(
        "inline-flex items-center justify-center w-[clamp(100px,30vw,140px)]",
        className,
      )}
    >
      <div
        className="relative inline-flex items-center justify-center w-full aspect-square"
        style={
          isComplete
            ? { animation: "ringCompletePop 600ms cubic-bezier(0.16, 1, 0.3, 1)" }
            : undefined
        }
      >
        <svg
          viewBox={`0 0 ${DIMENSION} ${DIMENSION}`}
          className="w-full h-full"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background track */}
          <circle
            cx={DIMENSION / 2}
            cy={DIMENSION / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-neutral-200)"
            strokeWidth={STROKE}
          />
          {/* Progress stroke */}
          <Progress.Indicator asChild>
            <circle
              cx={DIMENSION / 2}
              cy={DIMENSION / 2}
              r={RADIUS}
              fill="none"
              stroke={isComplete ? "var(--color-success)" : "var(--color-brand-500)"}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{
                transition:
                  "stroke-dashoffset 600ms var(--ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1)), stroke 400ms ease-out",
              }}
            />
          </Progress.Indicator>
        </svg>

        {isComplete && clamped === 100 ? (
          <span
            className="absolute flex items-center justify-center"
            style={{ animation: "checkmark-pop 400ms ease-out" }}
          >
            <Check size={36} strokeWidth={3} className="text-[var(--color-success)]" />
          </span>
        ) : (
          <span className="absolute text-[length:var(--text-heading)] font-bold tabular-nums text-[var(--color-neutral-800)]">
            {Math.round(clamped)}%
          </span>
        )}
      </div>
    </Progress.Root>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  className,
}: ProgressBarProps) {
  const percent = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`${totalSteps}단계 중 ${currentStep}단계`}
      className={cn("h-1 w-full overflow-hidden rounded-full bg-[var(--color-neutral-200)]", className)}
    >
      <div
        className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

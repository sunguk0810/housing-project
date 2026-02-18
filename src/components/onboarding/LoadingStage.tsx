"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface LoadingStageItem {
  readonly label: string;
  readonly subLabel?: string;
  readonly icon: LucideIcon;
  readonly iconBg?: string;
  readonly iconColor?: string;
}

interface LoadingStageProps {
  stages: readonly LoadingStageItem[];
  activeIndex: number;
  className?: string;
}

export function LoadingStage({
  stages,
  activeIndex,
  className,
}: LoadingStageProps) {
  return (
    <div
      role="status"
      className={cn("w-full max-w-sm space-y-[var(--space-2)]", className)}
    >
      {stages.map(({ label, subLabel, icon: Icon }, i) => {
        const isCompleted = i < activeIndex;
        const isCurrent = i === activeIndex;
        const isPending = i > activeIndex;

        return (
          <div
            key={label}
            className={cn(
              "flex items-center gap-[var(--space-3)] rounded-[var(--radius-s7-md)] p-[var(--space-3)]",
              "transition-all duration-500",
              isCompleted && "opacity-60",
              isCurrent && "bg-[var(--color-brand-50)]",
            )}
            style={{ opacity: isPending ? 0.3 : undefined }}
          >
            <span className="relative flex shrink-0 items-center justify-center">
              {isCompleted ? (
                <span
                  className="flex h-8 w-8 items-center justify-center"
                  style={{
                    animation: "checkmark-pop 300ms ease-out",
                  }}
                >
                  <Check size={20} className="text-[var(--color-brand-500)]" />
                </span>
              ) : (
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center",
                    isCurrent && "animate-[pulse_1.5s_ease-in-out_infinite]",
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      isCurrent
                        ? "text-[var(--color-neutral-700)]"
                        : "text-[var(--color-neutral-500)]",
                    )}
                  />
                </span>
              )}
            </span>

            <div className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-[length:var(--text-body-sm)] font-medium",
                  isCompleted && "text-[var(--color-on-surface-muted)]",
                  isCurrent && "text-[var(--color-neutral-800)]",
                  isPending && "text-[var(--color-on-surface-muted)]",
                )}
              >
                {label}
              </span>

              {isCurrent && subLabel && (
                <Badge
                  variant="secondary"
                  className="animate-[fadeIn_300ms_ease-out] text-[10px] text-[var(--color-neutral-500)]"
                >
                  {subLabel}
                </Badge>
              )}
            </div>

            {isCurrent && !subLabel && (
              <span className="ml-auto text-[length:var(--text-caption)] text-[var(--color-neutral-500)]">
                진행 중...
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

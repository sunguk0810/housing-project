"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStageItem {
  readonly label: string;
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
    <div className={cn("w-full max-w-sm space-y-[var(--space-4)]", className)}>
      {stages.map(({ label, icon: Icon }, i) => {
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
                  <Check size={20} className="text-[var(--color-success)]" />
                </span>
              ) : (
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center",
                    isCurrent && "animate-pulse",
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      isCurrent
                        ? "text-[var(--color-brand-700)]"
                        : "text-[var(--color-neutral-500)]",
                    )}
                  />
                </span>
              )}
            </span>

            <span
              className={cn(
                "text-[length:var(--text-body-sm)] font-medium",
                isCompleted && "text-[var(--color-on-surface-muted)]",
                isCurrent && "text-[var(--color-brand-700)]",
                isPending && "text-[var(--color-on-surface-muted)]",
              )}
            >
              {label}
            </span>

            {isCurrent && (
              <span className="ml-auto text-[length:var(--text-caption)] text-[var(--color-brand-700)]">
                진행 중...
              </span>
            )}
          </div>
        );
      })}

      {/* Checkmark pop animation */}
      <style jsx>{`
        @keyframes checkmark-pop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          60% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

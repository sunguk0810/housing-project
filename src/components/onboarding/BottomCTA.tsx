"use client";

import { cn } from "@/lib/utils";

interface BottomCTAProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
  /** Show back button */
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
}

export function BottomCTA({
  label,
  disabled,
  onClick,
  showBack,
  onBack,
  className,
}: BottomCTAProps) {
  return (
    <div
      className={cn(
        "fixed bottom-14 left-0 right-0 z-20",
        "border-t border-[var(--color-border)] bg-[var(--color-surface)]",
        "px-[var(--space-4)] py-[var(--space-3)]",
        "lg:bottom-0",
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg items-center gap-[var(--space-3)]">
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="이전 단계로"
            className={cn(
              "min-h-[44px] rounded-[var(--radius-s7-md)]",
              "px-[var(--space-4)] py-[var(--space-3)]",
              "text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]",
              "hover:bg-[var(--color-surface-sunken)]",
            )}
          >
            이전
          </button>
        )}
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "ml-auto min-h-[44px] flex-1 rounded-[var(--radius-s7-md)]",
            "px-[var(--space-6)] py-[var(--space-3)] font-medium",
            "transition-colors",
            disabled
              ? "cursor-not-allowed bg-[var(--color-neutral-200)] text-[var(--color-neutral-400)]"
              : "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)]",
          )}
        >
          {label}
        </button>
      </div>
    </div>
  );
}

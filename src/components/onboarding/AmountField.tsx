"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/format";
import { QUICK_AMOUNT_BUTTONS } from "@/lib/constants";

interface AmountFieldProps {
  label: string;
  value: number;
  active: boolean;
  onFocus: () => void;
  /** Exception text like "소득 없어요" */
  exceptionLabel?: string;
  onException?: () => void;
  isException?: boolean;
  /** Compact mode: inactive fields show inline layout at 20px */
  compact?: boolean;
  className?: string;
}

const quickButtons = [
  QUICK_AMOUNT_BUTTONS.small,
  QUICK_AMOUNT_BUTTONS.medium,
  QUICK_AMOUNT_BUTTONS.large,
] as const;

export function AmountField({
  label,
  value,
  active,
  onFocus,
  exceptionLabel,
  onException,
  isException,
  compact,
  className,
}: AmountFieldProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const displayValue = value > 0 ? value.toLocaleString("ko-KR") : "0";
  const converted = value > 0 ? formatAmount(value) : "";

  // Auto-scroll active field into view in compact mode
  useEffect(() => {
    if (compact && active && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [compact, active]);

  const isCompactInactive = compact && !active;

  return (
    <div className={cn("transition-all duration-200 ease-out", className)}>
      <button
        ref={ref}
        type="button"
        onClick={onFocus}
        className={cn(
          "w-full text-left transition-all duration-200 ease-out",
          "pb-[var(--space-2)] pt-[var(--space-1)]",
          isCompactInactive
            ? "flex items-center justify-between border-b border-[var(--color-neutral-200)]"
            : "border-b-2",
          !isCompactInactive &&
            (active
              ? "border-[var(--color-primary)]"
              : "border-[var(--color-neutral-300)]"),
        )}
      >
        <span
          className={cn(
            "font-medium transition-all duration-200 ease-out",
            isCompactInactive
              ? "text-[14px] text-[var(--color-on-surface-muted)]"
              : "block text-[length:var(--text-caption)]",
            !isCompactInactive &&
              (active
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-on-surface-muted)]"),
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "tabular-nums transition-all duration-200 ease-out",
            isCompactInactive
              ? "text-[20px] font-normal text-[var(--color-on-surface)]"
              : "block font-bold",
            !isCompactInactive &&
              (isException
                ? "text-[24px] text-[var(--color-on-surface-muted)]"
                : "text-[36px] text-[var(--color-on-surface)]"),
          )}
        >
          {isException ? exceptionLabel : displayValue}
          {!isException && (
            <span
              className={cn(
                "font-normal text-[var(--color-on-surface-muted)]",
                isCompactInactive ? "ml-0.5 text-[14px]" : "ml-1 text-[18px]",
              )}
            >
              만원
            </span>
          )}
        </span>
      </button>

      {/* Unit conversion display — hidden in compact inactive mode */}
      {converted && !isException && !isCompactInactive && (
        <p className="mt-[var(--space-1)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          = {converted}
        </p>
      )}

      {/* Exception button — hidden in compact inactive mode */}
      {exceptionLabel && onException && !isException && !isCompactInactive && (
        <button
          type="button"
          onClick={onException}
          className="mt-[var(--space-1)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)] underline underline-offset-2"
        >
          {exceptionLabel}
        </button>
      )}
    </div>
  );
}

export { quickButtons as QUICK_BUTTONS };

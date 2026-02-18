"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/format";
import { Switch } from "@/components/ui/switch";

interface AmountFieldProps {
  label: string;
  value: number;
  active: boolean;
  onFocus: () => void;
  /** Exception text like "소득 없어요" */
  exceptionLabel?: string;
  /** Bidirectional toggle: checked=true → exception ON, checked=false → OFF */
  onExceptionToggle?: (checked: boolean) => void;
  isException?: boolean;
  className?: string;
}

export function AmountField({
  label,
  value,
  active,
  onFocus,
  exceptionLabel,
  onExceptionToggle,
  isException,
  className,
}: AmountFieldProps) {
  const ref = useRef<HTMLDivElement>(null);
  const displayValue = value > 0 ? value.toLocaleString("ko-KR") : "0";
  const converted = value > 0 ? formatAmount(value) : "";

  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [active]);

  const ariaLabel = `${label}, 현재 값: ${isException ? exceptionLabel : displayValue + "만원"}`;

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden rounded-[var(--radius-s7-lg)] border transition-all duration-150",
        isException
          ? "border-[var(--color-neutral-200)] bg-[var(--color-surface-sunken)]"
          : active
            ? "border-[var(--color-brand-400)] bg-[var(--color-surface)] shadow-[var(--shadow-s7-base)]"
            : "border-[var(--color-border)] bg-[var(--color-surface)]",
        className,
      )}
    >
      {/* Value area — tap to open keypad */}
      <div
        role="button"
        tabIndex={0}
        onClick={onFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onFocus();
          }
        }}
        aria-label={ariaLabel}
        className="flex w-full cursor-pointer items-baseline justify-between px-[var(--space-4)] py-[var(--space-3)] text-left"
      >
        {/* Label */}
        <span
          className={cn(
            "shrink-0 text-[length:var(--text-caption)] font-medium",
            isException
              ? "text-[var(--color-neutral-400)]"
              : active
                ? "text-[var(--color-brand-500)]"
                : "text-[var(--color-on-surface-muted)]",
          )}
        >
          {label}
        </span>

        {/* Value */}
        <span className="text-right">
          {isException ? (
            <span className="text-[length:var(--text-body-sm)] text-[var(--color-neutral-400)]">
              {exceptionLabel}
            </span>
          ) : (
            <>
              <span className="text-[length:var(--text-title)] font-bold tabular-nums text-[var(--color-on-surface)]">
                {displayValue}
              </span>
              <span className="ml-0.5 text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                만원
              </span>
              {converted && (
                <span className="ml-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-neutral-400)]">
                  ({converted})
                </span>
              )}
            </>
          )}
        </span>
      </div>

      {/* Switch row — only for exception-capable fields */}
      {exceptionLabel && onExceptionToggle && (
        <div className="border-t border-[var(--color-border)] px-[var(--space-4)] py-[var(--space-2)]">
          <label className="flex cursor-pointer items-center gap-[var(--space-2)]">
            <Switch
              checked={!!isException}
              onCheckedChange={onExceptionToggle}
            />
            <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
              {exceptionLabel}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback } from "react";
import { Info } from "lucide-react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";
import { QUICK_AMOUNT_BUTTONS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

interface AmountInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  unit?: string;
  tooltip?: string;
  className?: string;
}

export function AmountInput({
  label,
  value,
  onChange,
  error,
  unit = "만원",
  tooltip,
  className,
}: AmountInputProps) {
  const handleDirectInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      const num = raw === "" ? 0 : parseInt(raw, 10);
      if (num >= 0) onChange(num);
    },
    [onChange],
  );

  const handleQuickAdd = useCallback(
    (amount: number) => {
      onChange(Math.max(0, value + amount));
    },
    [value, onChange],
  );

  const displayValue = value === 0 ? "" : value.toLocaleString("ko-KR");

  return (
    <div className={cn("w-full", className)}>
      <label className="mb-1 flex items-center gap-1 text-[length:var(--text-body-sm)] font-medium text-[var(--color-on-surface)]">
        {label}
        {tooltip && (
          <Popover.Root>
            <Popover.Trigger asChild>
              <button type="button" className="text-[var(--color-on-surface-muted)] hover:text-[var(--color-primary)]">
                <Info size={14} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                sideOffset={4}
                className="z-50 max-w-[200px] rounded-[var(--radius-s7-md)] bg-[var(--color-surface-sunken)] p-[var(--space-3)] text-[length:var(--text-caption)] shadow-[var(--shadow-s7-md)]"
              >
                {tooltip}
                <Popover.Arrow className="fill-[var(--color-surface-sunken)]" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        )}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleDirectInput}
          placeholder="0"
          className={cn(
            "w-full rounded-[var(--radius-s7-md)] border px-[var(--space-4)] py-[var(--space-3)] pr-12 tabular-nums",
            "text-[length:var(--text-body)] text-[var(--color-on-surface)]",
            "bg-[var(--color-surface)] placeholder:text-[var(--color-neutral-400)]",
            error
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)] focus:border-[var(--color-primary)]",
            "outline-none transition-colors",
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${label}-error` : undefined}
        />
        <span className="absolute right-[var(--space-4)] top-1/2 -translate-y-1/2 text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          {unit}
        </span>
      </div>

      <div className="mt-[var(--space-2)] flex gap-[var(--space-2)]">
        {Object.values(QUICK_AMOUNT_BUTTONS).map((btn) => (
          <button
            key={btn.value}
            type="button"
            onClick={() => handleQuickAdd(btn.value)}
            className={cn(
              "rounded-[var(--radius-s7-full)] border border-[var(--color-border)]",
              "px-[var(--space-3)] py-1 text-[length:var(--text-caption)]",
              "text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-sunken)]",
              "transition-colors",
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {value > 0 && (
        <p className="mt-1 text-[length:var(--text-caption)] text-[var(--color-brand-600)]">
          {formatPrice(value)}원
        </p>
      )}

      {error && (
        <p
          id={`${label}-error`}
          className="mt-1 text-[length:var(--text-caption)] text-[var(--color-error)]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

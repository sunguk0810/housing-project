"use client";

import { cn } from "@/lib/utils";

interface CustomKeypadProps {
  onDigit: (digit: string) => void;
  onDoubleZero: () => void;
  onBackspace: () => void;
  className?: string;
}

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["00", "0", "⌫"],
] as const;

export function CustomKeypad({
  onDigit,
  onDoubleZero,
  onBackspace,
  className,
}: CustomKeypadProps) {
  function handleKey(key: string) {
    if (key === "⌫") {
      onBackspace();
    } else if (key === "00") {
      onDoubleZero();
    } else {
      onDigit(key);
    }
  }

  return (
    <div
      className={cn("grid grid-cols-3 gap-[6px]", className)}
      role="group"
      aria-label="숫자 키패드"
    >
      {KEYS.flat().map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => handleKey(key)}
          aria-label={key === "⌫" ? "지우기" : key}
          className={cn(
            "flex min-h-[48px] min-w-[44px] items-center justify-center",
            "rounded-[var(--radius-s7-md)] text-[length:var(--text-subtitle)] font-medium",
            "transition-all active:scale-95",
            key === "⌫"
              ? "bg-transparent text-[var(--color-on-surface-muted)] active:bg-[var(--color-neutral-200)]"
              : "border border-[var(--color-neutral-200)] bg-[var(--color-surface)] text-[var(--color-on-surface)] active:bg-[var(--color-neutral-200)]",
          )}
        >
          {key}
        </button>
      ))}
    </div>
  );
}

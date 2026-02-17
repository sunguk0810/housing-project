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
      className={cn("grid grid-cols-3 gap-[var(--space-1)]", className)}
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
            "flex min-h-[44px] min-w-[44px] items-center justify-center",
            "rounded-[var(--radius-s7-md)] text-[length:var(--text-subtitle)] font-medium",
            "transition-colors active:bg-[var(--color-neutral-200)]",
            key === "⌫"
              ? "text-[var(--color-on-surface-muted)]"
              : "text-[var(--color-on-surface)]",
          )}
        >
          {key}
        </button>
      ))}
    </div>
  );
}

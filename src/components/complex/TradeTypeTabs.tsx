"use client";

import { useCallback, useRef } from "react";
import { Building2, KeyRound, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

type TradeTypeValue = "sale" | "jeonse" | "monthly";

interface TradeTypeTabsProps {
  selected: TradeTypeValue;
  onSelect: (value: TradeTypeValue) => void;
  saleCnt: number;
  jeonseCnt: number;
  monthlyCnt: number;
  className?: string;
}

const OPTIONS: ReadonlyArray<{
  value: TradeTypeValue;
  label: string;
  color: string;
  icon: typeof Building2;
}> = [
  { value: "sale", label: "매매", color: "var(--color-compare-1)", icon: Building2 },
  { value: "jeonse", label: "전세", color: "var(--color-compare-2)", icon: KeyRound },
  { value: "monthly", label: "월세", color: "var(--color-brand-500)", icon: Coins },
];

export function TradeTypeTabs({
  selected,
  onSelect,
  saleCnt,
  jeonseCnt,
  monthlyCnt,
  className,
}: TradeTypeTabsProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  const countFor = (value: TradeTypeValue) =>
    value === "sale" ? saleCnt : value === "jeonse" ? jeonseCnt : monthlyCnt;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const selectedIndex = OPTIONS.findIndex((option) => option.value === selected);
      if (selectedIndex === -1) return;

      const direction = e.key === "ArrowRight" ? 1 : -1;
      const candidateIndex =
        (selectedIndex + direction + OPTIONS.length) % OPTIONS.length;
      const next = OPTIONS[candidateIndex]!.value;
      if (countFor(next) > 0) onSelect(next);

      const btns = groupRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="radio"]',
      );
      btns?.forEach((btn) => {
        if (btn.dataset.value === next) btn.focus();
      });
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, onSelect, saleCnt, jeonseCnt, monthlyCnt],
  );

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="거래 유형 선택"
      className={cn(
        "inline-flex rounded-[var(--radius-s7-full)] bg-[var(--color-neutral-100)] p-0.5",
        className,
      )}
      onKeyDown={handleKeyDown}
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isSelected = selected === opt.value;
        const disabled = countFor(opt.value) === 0;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-disabled={disabled || undefined}
            data-value={opt.value}
            tabIndex={isSelected ? 0 : -1}
            disabled={disabled}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "inline-flex items-center gap-1 rounded-[var(--radius-s7-full)] px-[var(--space-3)] py-1 text-[length:var(--text-body-sm)] font-medium transition-colors",
              isSelected
                ? "text-white shadow-sm"
                : "text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]",
              disabled && "cursor-not-allowed opacity-40",
            )}
            style={isSelected ? { backgroundColor: opt.color } : undefined}
          >
            <Icon size={14} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

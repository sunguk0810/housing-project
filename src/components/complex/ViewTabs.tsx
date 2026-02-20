"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ViewTabOption, ViewTabValue } from "@/lib/price-utils";

interface ViewTabsProps {
  tabs: ReadonlyArray<ViewTabOption>;
  selected: ViewTabValue;
  onSelect: (value: ViewTabValue) => void;
  className?: string;
}

export function ViewTabs({ tabs, selected, onSelect, className }: ViewTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const enabledTabs = tabs.filter((t) => !t.disabled);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIdx = enabledTabs.findIndex((t) => t.value === selected);
      let nextIdx = currentIdx;

      switch (e.key) {
        case "ArrowRight":
          nextIdx = (currentIdx + 1) % enabledTabs.length;
          break;
        case "ArrowLeft":
          nextIdx = (currentIdx - 1 + enabledTabs.length) % enabledTabs.length;
          break;
        case "Home":
          nextIdx = 0;
          break;
        case "End":
          nextIdx = enabledTabs.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      const next = enabledTabs[nextIdx];
      onSelect(next.value);

      const btns = listRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([disabled])',
      );
      btns?.[nextIdx]?.focus();
    },
    [enabledTabs, selected, onSelect],
  );

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="기간 선택"
      className={cn("flex border-b border-[var(--color-border)]", className)}
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const isSelected = selected === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => onSelect(tab.value)}
            className={cn(
              "flex-1 py-[var(--space-2)] text-center text-[length:var(--text-caption)] font-medium transition-colors",
              isSelected
                ? "border-b-2 border-[var(--color-brand-500)] text-[var(--color-brand-500)]"
                : "text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]",
              tab.disabled && "cursor-not-allowed opacity-40",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getBestAptIds } from "./compareUtils";
import type { RecommendationItem } from "@/types/api";

interface CompareRowProps {
  label: string;
  items: ReadonlyArray<RecommendationItem>;
  render: (item: RecommendationItem, index: number) => ReactNode;
  highlight?: boolean;
  getValue?: (item: RecommendationItem) => number;
}

export function CompareRow({
  label,
  items,
  render,
  highlight = false,
  getValue,
}: CompareRowProps) {
  const bestIds =
    highlight && getValue ? getBestAptIds(items, getValue) : new Set<number>();

  return (
    <div className="flex border-t border-[var(--color-border)]">
      <div className="flex w-[72px] shrink-0 items-center bg-[var(--color-surface-sunken)] px-[var(--space-2)] py-[var(--space-3)] text-[10px] font-medium text-[var(--color-on-surface-muted)] lg:w-[160px] lg:px-[var(--space-3)] lg:text-[length:var(--text-caption)]">
        {label}
      </div>
      {items.map((item, i) => (
        <div
          key={item.aptId}
          className={cn(
            "flex flex-1 items-center justify-center px-[var(--space-1)] py-[var(--space-3)] text-center lg:px-[var(--space-3)]",
            bestIds.has(item.aptId) && "bg-[rgb(8_145_178_/_0.12)] ring-1 ring-inset ring-[var(--color-brand-300)]/30",
          )}
        >
          {render(item, i)}
        </div>
      ))}
    </div>
  );
}

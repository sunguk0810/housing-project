"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCompare } from "@/contexts/CompareContext";

interface CompareBarProps {
  className?: string;
}

export function CompareBar({ className }: CompareBarProps) {
  const { items, removeItem } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className={cn("sticky bottom-14 z-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-3)]", className)}>
      <div className="flex items-center gap-[var(--space-2)]">
        <div className="flex flex-1 gap-[var(--space-1)] overflow-x-auto">
          {items.map((item) => (
            <span
              key={item.aptId}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-[var(--radius-s7-full)] border border-[var(--color-brand-200)] bg-[var(--color-brand-50)] px-[10px] py-1 text-[11px] font-semibold"
            >
              {item.aptName}
              <button
                type="button"
                onClick={() => removeItem(item.aptId)}
                className="text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)]"
                aria-label={`${item.aptName} 비교 제거`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <Link
          href="/compare"
          className="whitespace-nowrap rounded-[var(--radius-s7-md)] bg-[var(--color-brand-500)] px-[14px] py-2 text-[12px] font-semibold text-white no-underline"
        >
          비교하기 ({items.length}/3)
        </Link>
      </div>
    </div>
  );
}

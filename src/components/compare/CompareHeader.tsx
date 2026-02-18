"use client";

import Link from "next/link";
import { X, Plus } from "lucide-react";
import { CircularGauge } from "@/components/score/CircularGauge";
import { ScoreBadge } from "@/components/score/ScoreBadge";
import { formatShortAddress } from "@/lib/format";
import { COMPARE_COLORS } from "./compareUtils";
import type { RecommendationItem } from "@/types/api";

interface CompareHeaderProps {
  items: ReadonlyArray<RecommendationItem>;
  canAdd: boolean;
  onRemove: (aptId: number) => void;
  onOpenAdd: () => void;
}

export function CompareHeader({
  items,
  canAdd,
  onRemove,
  onOpenAdd,
}: CompareHeaderProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 shadow-[var(--shadow-s7-sm)] backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-[var(--space-4)]">
        {/* grid: equal columns for items + optional add slot, no overflow */}
        <div
          className="grid gap-[var(--space-2)] py-[var(--space-3)]"
          style={{
            gridTemplateColumns: `repeat(${items.length + (canAdd ? 1 : 0)}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.aptId}
              className="flex flex-col items-center gap-[var(--space-1)] overflow-hidden rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-2)] py-[var(--space-2)] lg:gap-[var(--space-2)] lg:px-[var(--space-4)] lg:py-[var(--space-3)]"
            >
              <div className="flex items-center gap-[var(--space-1)]">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: COMPARE_COLORS[i % COMPARE_COLORS.length] }}
                  aria-hidden="true"
                />
                <CircularGauge score={item.finalScore} size="mini" animated={false} />
              </div>
              <ScoreBadge score={item.finalScore} size="sm" />
              <Link
                href={`/complex/${item.aptId}`}
                className="line-clamp-1 w-full text-center text-[length:var(--text-caption)] font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline"
                aria-label={`${item.aptName} 상세 보기`}
              >
                {item.aptName}
              </Link>
              <span className="line-clamp-1 w-full text-center text-[10px] text-[var(--color-on-surface-muted)] lg:text-[length:var(--text-caption)]">
                {formatShortAddress(item.address)}
              </span>
              <button
                onClick={() => onRemove(item.aptId)}
                className="mt-auto flex min-h-[32px] items-center gap-0.5 rounded-[var(--radius-s7-full)] px-[var(--space-2)] py-0.5 text-[10px] text-[var(--color-on-surface-muted)] transition-colors hover:bg-[var(--color-surface-sunken)] lg:min-h-[36px] lg:text-[length:var(--text-caption)]"
                aria-label={`${item.aptName} 비교에서 제거`}
              >
                <X size={10} aria-hidden="true" />
                제거
              </button>
            </div>
          ))}
          {canAdd && (
            <div className="flex items-center justify-center">
              <button
                onClick={onOpenAdd}
                className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-[var(--space-1)] rounded-[var(--radius-s7-lg)] border-2 border-dashed border-[var(--color-border)] px-[var(--space-3)] py-[var(--space-3)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                aria-label="단지 추가"
              >
                <Plus size={18} aria-hidden="true" />
                추가
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

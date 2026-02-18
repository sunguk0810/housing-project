"use client";

import { memo, useCallback, type KeyboardEvent } from "react";
import Link from "next/link";
import { Check, GitCompareArrows } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CircularGauge } from "@/components/score/CircularGauge";
import { formatPrice, formatTradeTypeLabel, formatCommuteTime } from "@/lib/format";
import { useCompare } from "@/contexts/CompareContext";
import type { RecommendationItem } from "@/types/api";

interface PropertyCardProps {
  item: RecommendationItem;
  isSelected: boolean;
  /** Called with aptId so parent can use a stable useCallback without wrapping per-item */
  onHover: (aptId: number) => void;
  onClick: (aptId: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Card shows 4 dimensions inline
const DIMENSION_KEYS = ["budget", "commute", "childcare", "safety"] as const;

const DIMENSION_LABELS: Record<(typeof DIMENSION_KEYS)[number], string> = {
  budget: "\uC608\uC0B0",
  commute: "\uD1B5\uADFC",
  childcare: "\uBCF4\uC721",
  safety: "\uC548\uC804",
};

export const PropertyCard = memo(function PropertyCard({
  item,
  isSelected,
  onHover,
  onClick,
  className,
  style,
}: PropertyCardProps) {
  const isTop3 = item.rank <= 3;
  const { addItem, removeItem, isComparing, canAdd } = useCompare();
  const comparing = isComparing(item.aptId);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (comparing) {
      removeItem(item.aptId);
    } else {
      addItem({ aptId: item.aptId, aptName: item.aptName, finalScore: item.finalScore });
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(item.aptId);
      }
    },
    [onClick, item.aptId],
  );

  return (
    <div
      className={cn(
        "flex flex-col rounded-[var(--radius-s7-xl)] border bg-[var(--color-surface)] px-4 py-3.5 cursor-pointer",
        "transition-[transform,box-shadow,border-color]",
        "lg:hover:-translate-y-0.5 lg:hover:shadow-[var(--shadow-s7-md)] lg:hover:border-[var(--color-neutral-300)]",
        "active:translate-y-0 active:scale-[0.98]",
        "focus-visible:ring-[var(--color-brand-400)]/50 focus-visible:ring-2 focus-visible:outline-none",
        isSelected
          ? "border-[var(--color-brand-500)] border-[1.5px] shadow-[var(--shadow-s7-md)] bg-[var(--color-brand-50)]/30"
          : "border-[var(--color-border)] shadow-[var(--shadow-s7-sm)]",
        className,
      )}
      role="article"
      tabIndex={0}
      aria-label={`${item.rank}위 ${item.aptName}, 종합점수 ${Math.round(item.finalScore)}점`}
      onMouseEnter={() => onHover(item.aptId)}
      onClick={() => onClick(item.aptId)}
      onKeyDown={handleKeyDown}
      data-testid={`property-card-${item.aptId}`}
      style={style}
    >
      {/* Row 1: Rank badge + name + compare button */}
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-[var(--space-1)]">
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-s7-sm)] text-[11px] font-bold text-white",
              isTop3
                ? "bg-[var(--color-accent)]"
                : "bg-[var(--color-neutral-500)]",
            )}
            data-testid="rank-badge"
          >
            {item.rank}
          </span>
          <Link
            href={`/complex/${item.aptId}`}
            className="line-clamp-1 text-[length:var(--text-body-sm)] font-bold text-[var(--color-on-surface)] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {item.aptName}
          </Link>
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={handleCompareToggle}
          disabled={!comparing && !canAdd}
          aria-pressed={comparing}
          className={cn(
            "rounded-[var(--radius-s7-full)]",
            comparing
              ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-500)]/90"
              : canAdd
                ? "border-[var(--color-brand-500)] text-[var(--color-brand-500)] hover:bg-[var(--color-brand-50)]"
                : "",
          )}
        >
          {comparing ? (
            <>
              <Check />
              비교중
            </>
          ) : (
            <>
              <GitCompareArrows />
              비교
            </>
          )}
        </Button>
      </div>

      {/* Rows 2-3: Left info + Right gauge */}
      <div className="mt-2 flex items-center justify-between gap-[var(--space-2)]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            {item.address}
            {item.householdCount != null && ` \u00B7 ${item.householdCount.toLocaleString()}\uC138\uB300`}
            {item.commuteTime1 != null && ` \u00B7 \u{1F687}${formatCommuteTime(item.commuteTime1)}`}
          </p>
          <p className="mt-0.5 text-[length:var(--text-body-sm)] font-bold tabular-nums">
            {formatTradeTypeLabel(item.tradeType)} {formatPrice(item.averagePrice)}
          </p>
        </div>
        <CircularGauge score={item.finalScore} size="compact" />
      </div>

      {/* Row 4: Dimension scores inline */}
      <p className="mt-1 text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
        {DIMENSION_KEYS.map((dim, i) => {
          const dimScore = Math.round((item.dimensions[dim] ?? 0) * 100);
          return (
            <span key={dim}>
              {i > 0 && " \u00B7 "}
              <span>{DIMENSION_LABELS[dim]}</span>{" "}
              <span className="font-semibold tabular-nums text-[var(--color-on-surface)]">{dimScore}</span>
            </span>
          );
        })}
      </p>
    </div>
  );
});

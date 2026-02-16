"use client";

import { memo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CircularGauge } from "@/components/score/CircularGauge";
import { formatPrice, formatTradeTypeLabel, formatCommuteTime } from "@/lib/format";
import { getScoreGrade } from "@/lib/score-utils";
import { DataSourceTag } from "@/components/trust/DataSourceTag";
import { useCompare } from "@/contexts/CompareContext";
import type { RecommendationItem } from "@/types/api";

interface PropertyCardProps {
  item: RecommendationItem;
  isSelected: boolean;
  onHover: () => void;
  onClick: () => void;
  className?: string;
}

const DIMENSION_KEYS = ["budget", "commute", "childcare", "safety", "school"] as const;

const DIMENSION_LABELS: Record<(typeof DIMENSION_KEYS)[number], { emoji: string; label: string }> = {
  budget: { emoji: "\u{1F4B0}", label: "\uC608\uC0B0" },
  commute: { emoji: "\u{1F687}", label: "\uD1B5\uADFC" },
  childcare: { emoji: "\u{1F3EB}", label: "\uBCF4\uC721" },
  safety: { emoji: "\u{1F6E1}\uFE0F", label: "\uC548\uC804" },
  school: { emoji: "\u{1F4DA}", label: "\uD559\uAD70" },
};

export const PropertyCard = memo(function PropertyCard({
  item,
  isSelected,
  onHover,
  onClick,
  className,
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

  return (
    <div
      className={cn(
        "rounded-[var(--radius-s7-lg)] border p-[var(--space-4)] transition-all cursor-pointer",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-s7-md)] hover:border-[var(--color-brand-200)] active:translate-y-0 active:scale-[0.98]",
        isSelected
          ? "border-[var(--color-accent)] shadow-[var(--shadow-s7-md)]"
          : "border-[var(--color-border)]",
        className,
      )}
      onMouseEnter={onHover}
      onClick={onClick}
      data-testid={`property-card-${item.aptId}`}
    >
      {/* Row 1: Rank badge + name + gauge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-[var(--space-2)]">
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-[var(--radius-s7-sm)] text-[length:var(--text-caption)] font-bold text-white",
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
            className="text-[length:var(--text-body)] font-bold text-[var(--color-on-surface)] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {item.aptName}
          </Link>
        </div>
        <CircularGauge score={item.finalScore} size="mini" />
      </div>

      {/* Row 2: Address + householdCount + areaMin */}
      <p className="mt-[var(--space-1)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
        {item.address}
        {item.householdCount != null && ` \u00B7 ${item.householdCount.toLocaleString()}\uC138\uB300`}
        {item.areaMin != null && ` \u00B7 ${item.areaMin}\u33A1`}
      </p>

      {/* Row 3: TradeType + price + source date */}
      <div className="mt-[var(--space-2)] flex items-center gap-[var(--space-2)]">
        <span className="text-[length:var(--text-body-sm)] font-bold tabular-nums">
          {formatTradeTypeLabel(item.tradeType)} {formatPrice(item.averagePrice)}
        </span>
        <DataSourceTag type="date" label={item.sources.priceDate} />
      </div>

      {/* Row 4: 5-dimension score grid (2-col) */}
      <div className="mt-[var(--space-2)] grid grid-cols-2 gap-1">
        {DIMENSION_KEYS.map((dim) => {
          const score = Math.round((item.dimensions[dim] ?? 0) * 100);
          const grade = getScoreGrade(score);
          const { emoji, label } = DIMENSION_LABELS[dim];
          return (
            <span
              key={dim}
              className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]"
            >
              {emoji} {label}{" "}
              <b
                className="font-semibold tabular-nums"
                style={{ color: `var(--color-score-${grade})` }}
              >
                {score}
              </b>
            </span>
          );
        })}
      </div>

      {/* Row 5: Commute time + compare toggle */}
      <div className="mt-[var(--space-2)] border-t border-[var(--color-border)] pt-[var(--space-2)] flex items-center justify-between">
        <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          {item.commuteTime2 != null
            ? `\u{1F687} \uC9C1\uC7A51 ${formatCommuteTime(item.commuteTime1)} \u00B7 \uC9C1\uC7A52 ${formatCommuteTime(item.commuteTime2)}`
            : `\u{1F687} \uD1B5\uADFC ${formatCommuteTime(item.commuteTime1)}`}
        </p>
        <button
          type="button"
          onClick={handleCompareToggle}
          disabled={!comparing && !canAdd}
          className={cn(
            "rounded-[var(--radius-s7-full)] px-[var(--space-3)] py-1 text-[length:var(--text-caption)] font-medium transition-colors",
            comparing
              ? "bg-[var(--color-brand-500)] text-white"
              : canAdd
                ? "border border-[var(--color-brand-500)] text-[var(--color-brand-500)] hover:bg-[var(--color-brand-50)]"
                : "border border-[var(--color-border)] text-[var(--color-on-surface-muted)] opacity-50 cursor-not-allowed",
          )}
        >
          {comparing ? "\u2705 \uBE44\uAD50\uC911" : "\uBE44\uAD50 \uCD94\uAC00"}
        </button>
      </div>
    </div>
  );
});

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CircularGauge } from "@/components/score/CircularGauge";
import { formatPrice, formatTradeTypeLabel, formatCommuteTime } from "@/lib/format";
import { getScoreGrade } from "@/lib/score-utils";
import { DataSourceTag } from "@/components/trust/DataSourceTag";
import type { RecommendationItem } from "@/types/api";

interface PropertyCardProps {
  item: RecommendationItem;
  isSelected: boolean;
  onHover: () => void;
  onClick: () => void;
  className?: string;
}

const DIMENSION_KEYS = ["budget", "commute", "childcare", "safety", "school"] as const;

const DIMENSION_LABELS: Record<(typeof DIMENSION_KEYS)[number], string> = {
  budget: "예산",
  commute: "통근",
  childcare: "보육",
  safety: "안전",
  school: "학군",
};

export function PropertyCard({
  item,
  isSelected,
  onHover,
  onClick,
  className,
}: PropertyCardProps) {
  const isTop3 = item.rank <= 3;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-s7-lg)] border p-[var(--space-4)] transition-all cursor-pointer",
        isSelected
          ? "border-[var(--color-primary)] shadow-[var(--shadow-s7-md)]"
          : "border-[var(--color-border)] hover:shadow-[var(--shadow-s7-sm)]",
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
        {item.householdCount != null && ` · ${item.householdCount.toLocaleString()}세대`}
        {item.areaMin != null && ` · ${item.areaMin}㎡`}
      </p>

      {/* Row 3: TradeType + price + source date */}
      <div className="mt-[var(--space-2)] flex items-center gap-[var(--space-2)]">
        <span className="text-[length:var(--text-body-sm)] font-bold tabular-nums">
          {formatTradeTypeLabel(item.tradeType)} {formatPrice(item.averagePrice)}
        </span>
        <DataSourceTag type="date" label={item.sources.priceDate} />
      </div>

      {/* Row 4: 5-dimension score grid */}
      <div className="mt-[var(--space-2)] flex flex-wrap gap-x-[var(--space-3)] gap-y-[var(--space-1)]">
        {DIMENSION_KEYS.map((dim) => {
          const score = Math.round((item.dimensions[dim] ?? 0) * 100);
          const grade = getScoreGrade(score);
          return (
            <span
              key={dim}
              className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]"
            >
              {DIMENSION_LABELS[dim]}{" "}
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

      {/* Row 5: Commute time — with border-top divider */}
      <div className="mt-[var(--space-2)] border-t border-[var(--color-border)] pt-[var(--space-2)]">
        <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          {item.commuteTime2 != null
            ? `직장1 ${formatCommuteTime(item.commuteTime1)} · 직장2 ${formatCommuteTime(item.commuteTime2)}`
            : `통근 ${formatCommuteTime(item.commuteTime1)}`}
        </p>
      </div>
    </div>
  );
}

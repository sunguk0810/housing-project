"use client";

import { formatAmount } from "@/lib/format";
import { safeTradeTypeLabel } from "@/lib/price-utils";
import type { PriceHistoryItem } from "@/types/api";

interface LatestPriceDisplayProps {
  latest: PriceHistoryItem;
  tradeType: PriceHistoryItem["tradeType"];
  totalDeals: number;
  className?: string;
}

export function LatestPriceDisplay({
  latest,
  tradeType,
  totalDeals,
  className,
}: LatestPriceDisplayProps) {
  const dateLabel = `${latest.year}.${String(latest.month).padStart(2, "0")}`;
  const isMonthly = tradeType === "monthly";
  const monthlyRent = latest.monthlyRentAvg;

  const headline = isMonthly
    ? `보증금 ${formatAmount(latest.averagePrice)}`
    : formatAmount(latest.averagePrice);

  return (
    <div className={className}>
      <p className="text-[length:var(--text-heading)] font-bold tabular-nums text-[var(--color-on-surface)]">
        {headline}
      </p>
      <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
        {isMonthly
          ? `최근 실거래 기준 (${dateLabel}) ${safeTradeTypeLabel(tradeType)} 보증금 ${formatAmount(latest.averagePrice)}` +
            (monthlyRent != null ? ` / 월세 ${formatAmount(monthlyRent)}` : "")
          : `최근 실거래 기준 (${dateLabel}) ${safeTradeTypeLabel(tradeType)} 평균`}
        {totalDeals > 0 && ` · 실거래 ${totalDeals}건`}
      </p>
    </div>
  );
}

"use client";

import { formatAmount } from "@/lib/format";
import { safeTradeTypeLabel } from "@/lib/price-utils";
import type { PriceTradeItem } from "@/types/api";

interface LatestPriceDisplayProps {
  latest: PriceTradeItem;
  tradeType: PriceTradeItem["tradeType"];
  totalDeals: number;
  className?: string;
}

export function LatestPriceDisplay({
  latest,
  tradeType,
  totalDeals,
  className,
}: LatestPriceDisplayProps) {
  if (latest.price == null) return null;

  const dateLabel = `${latest.year}.${String(latest.month).padStart(2, "0")}`;
  const isMonthly = tradeType === "monthly";
  const monthlyRent = latest?.monthlyRent || 0;

  const headline = isMonthly
    ? `보증금 ${formatAmount(latest?.price || 0)}`
    : formatAmount(latest?.price || 0);

  return (
    <div className={className}>
      <p className="text-[length:var(--text-heading)] font-bold tabular-nums text-[var(--color-on-surface)]">
        {headline}
      </p>
      <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
        {isMonthly
          ? `최근 실거래 기준 (${dateLabel}) ${safeTradeTypeLabel(tradeType)} 보증금 ${formatAmount(latest?.price || 0)}` +
            (monthlyRent != null ? ` / 월세 ${formatAmount(monthlyRent)}` : "")
          : `최근 실거래 기준 (${dateLabel}) ${safeTradeTypeLabel(tradeType)}`}
        {totalDeals > 0 && ` · 실거래 ${totalDeals}건`}
      </p>
    </div>
  );
}

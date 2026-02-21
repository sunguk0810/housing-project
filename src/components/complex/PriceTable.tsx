"use client";

import { formatAmount } from "@/lib/format";
import { findHighestPriceIndex, safeTradeTypeLabel } from "@/lib/price-utils";
import type { PriceTradeItem } from "@/types/api";

interface PriceTableProps {
  prices: ReadonlyArray<PriceTradeItem>;
  className?: string;
}

export function PriceTable({ prices, className }: PriceTableProps) {
  if (prices.length === 0) return null;

  // Display newest first (descending)
  const descPrices = [...prices].reverse();

  // Find highest price index in the ORIGINAL ascending array, then map to desc index
  const ascHighestIdx = findHighestPriceIndex(prices);
  const descHighestIdx =
    ascHighestIdx >= 0 ? prices.length - 1 - ascHighestIdx : -1;

  return (
    <div className={className}>
      <table className="w-full border-collapse text-[length:var(--text-caption)]">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th scope="col" className="py-1 pr-2 text-left font-semibold text-[var(--color-on-surface-muted)]">
              거래일
            </th>
            <th scope="col" className="py-1 pr-2 text-left font-semibold text-[var(--color-on-surface-muted)]">
              유형
            </th>
            <th scope="col" className="py-1 pr-2 text-right font-semibold text-[var(--color-on-surface-muted)]">
              가격
            </th>
            <th scope="col" className="py-1 pr-2 text-right font-semibold text-[var(--color-on-surface-muted)]">
              면적(㎡)
            </th>
            <th scope="col" className="py-1 text-right font-semibold text-[var(--color-on-surface-muted)]">
              층
            </th>
          </tr>
        </thead>
        <tbody>
          {descPrices.map((p, i) => (
            <tr key={p.id} className="border-b border-[var(--color-neutral-100)]">
              <td className="py-1 pr-2 tabular-nums">
                {p.year}.{String(p.month).padStart(2, "0")}
              </td>
              <td className="py-1 pr-2">{safeTradeTypeLabel(p.tradeType)}</td>
              <td className="py-1 pr-2 text-right tabular-nums font-medium">
                <span className="inline-flex items-center gap-1">
                  {formatAmount(p.price)}
                  {i === descHighestIdx && (
                    <span className="inline-block rounded-[var(--radius-s7-full)] bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      신고가
                    </span>
                  )}
                </span>
              </td>
              <td className="py-1 pr-2 text-right tabular-nums">
                {p.exclusiveArea != null ? `${p.exclusiveArea}` : "-"}
              </td>
              <td className="py-1 text-right tabular-nums">
                {p.floor != null ? `${p.floor}층` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
        참고용 시뮬레이션이며 실제 거래가를 보장하지 않습니다
      </p>
    </div>
  );
}

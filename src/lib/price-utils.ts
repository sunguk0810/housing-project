/**
 * Price data preprocessing utilities for the BudgetPanel.
 * Handles sorting, filtering, period tabs, and display formatting.
 */

import type { PriceHistoryItem } from "@/types/api";

/** Sort prices ascending by year/month (API returns desc, chart needs asc) */
export function sortPricesAsc(
  prices: ReadonlyArray<PriceHistoryItem>,
): ReadonlyArray<PriceHistoryItem> {
  return [...prices].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

/** Filter prices to the most recent N months from the latest data point */
export function filterByPeriod(
  prices: ReadonlyArray<PriceHistoryItem>,
  months: number | null,
): ReadonlyArray<PriceHistoryItem> {
  if (months === null || prices.length === 0) return prices;

  const latest = prices[prices.length - 1];
  const latestTotal = latest.year * 12 + latest.month;
  return prices.filter((p) => {
    const total = p.year * 12 + p.month;
    return latestTotal - total < months;
  });
}

export interface PeriodOption {
  readonly label: string;
  readonly months: number | null;
  readonly disabled: boolean;
}

/** Determine which period tabs should be active based on data range */
export function getAvailablePeriods(
  prices: ReadonlyArray<PriceHistoryItem>,
): ReadonlyArray<PeriodOption> {
  if (prices.length < 2) {
    return [
      { label: "1년", months: 12, disabled: true },
      { label: "3년", months: 36, disabled: true },
      { label: "5년", months: 60, disabled: true },
      { label: "전체", months: null, disabled: true },
    ];
  }

  const sorted = sortPricesAsc(prices);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const spanMonths = (last.year - first.year) * 12 + (last.month - first.month);

  function isEnabled(requiredMonths: number): boolean {
    const withinPeriod = sorted.filter((p) => {
      const lastTotal = last.year * 12 + last.month;
      const pTotal = p.year * 12 + p.month;
      return lastTotal - pTotal < requiredMonths;
    });
    return spanMonths >= requiredMonths && withinPeriod.length >= 2;
  }

  return [
    { label: "1년", months: 12, disabled: !isEnabled(12) },
    { label: "3년", months: 36, disabled: !isEnabled(36) },
    { label: "5년", months: 60, disabled: !isEnabled(60) },
    { label: "전체", months: null, disabled: prices.length < 2 },
  ];
}

/** Find the index of the highest averagePrice in the array */
export function findHighestPriceIndex(
  prices: ReadonlyArray<PriceHistoryItem>,
): number {
  if (prices.length === 0) return -1;
  let maxIdx = 0;
  let maxPrice = prices[0].averagePrice;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i].averagePrice > maxPrice) {
      maxPrice = prices[i].averagePrice;
      maxIdx = i;
    }
  }
  return maxIdx;
}

/** Format price in 만원 for Y-axis (compact: "3.2억", "5억") */
export function formatPriceAxis(manwon: number): string {
  if (manwon <= 0) return "0";
  const eok = manwon / 10000;
  if (eok >= 1) {
    const rounded = Math.round(eok * 10) / 10;
    return rounded % 1 === 0 ? `${rounded}억` : `${rounded}억`;
  }
  return `${Math.round(manwon / 1000) * 1000 / 10000}억`;
}

/** Safe trade type label with unknown fallback */
export function safeTradeTypeLabel(tradeType: string): string {
  if (tradeType === "sale") return "매매";
  if (tradeType === "jeonse") return "전세";
  if (tradeType === "monthly") return "월세";
  return "기타";
}

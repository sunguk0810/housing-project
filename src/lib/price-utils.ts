/**
 * Price data preprocessing utilities for the BudgetPanel.
 * Handles sorting, filtering, period tabs, and display formatting.
 */

import type { PriceTradeItem } from "@/types/api";

/** Sort prices ascending by year/month (API returns desc, chart needs asc) */
export function sortPricesAsc(
  prices: ReadonlyArray<PriceTradeItem>,
): ReadonlyArray<PriceTradeItem> {
  return [...prices].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

/** Filter prices to the most recent N months from the latest data point */
export function filterByPeriod(
  prices: ReadonlyArray<PriceTradeItem>,
  months: number | null,
): ReadonlyArray<PriceTradeItem> {
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
  prices: ReadonlyArray<PriceTradeItem>,
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

/** Find the index of the highest price in the array */
export function findHighestPriceIndex(
  prices: ReadonlyArray<PriceTradeItem>,
): number {
  if (prices.length === 0) return -1;
  let maxIdx = 0;
  let maxPrice = prices[0].price;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i].price > maxPrice) {
      maxPrice = prices[i].price;
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

/** Filter prices by trade type */
export function filterByTradeType(
  prices: ReadonlyArray<PriceTradeItem>,
  tradeType: PriceTradeItem["tradeType"],
): ReadonlyArray<PriceTradeItem> {
  return prices.filter((p) => p.tradeType === tradeType);
}

/** Count available items per trade type (for tab disabled state) */
export function getAvailableTradeTypes(
  prices: ReadonlyArray<PriceTradeItem>,
): { sale: number; jeonse: number; monthly: number } {
  let sale = 0;
  let jeonse = 0;
  let monthly = 0;
  for (const p of prices) {
    if (p.tradeType === "sale") sale++;
    else if (p.tradeType === "jeonse") jeonse++;
    else if (p.tradeType === "monthly") monthly++;
  }
  return { sale, jeonse, monthly };
}

/** Safe trade type label with unknown fallback */
export function safeTradeTypeLabel(tradeType: string): string {
  if (tradeType === "sale") return "매매";
  if (tradeType === "jeonse") return "전세";
  if (tradeType === "monthly") return "월세";
  return "기타";
}

/* ------------------------------------------------------------------ */
/*  ViewTabs — unified period + dual-mode tab system                  */
/* ------------------------------------------------------------------ */

export type ViewTabValue = "1y" | "3y" | "all" | "dual";

export interface ViewTabOption {
  readonly value: ViewTabValue;
  readonly label: string;
  readonly disabled: boolean;
}

/** Map a ViewTabValue to the corresponding month count (null = all) */
export function viewTabToMonths(tab: ViewTabValue): number | null {
  if (tab === "1y") return 12;
  if (tab === "3y") return 36;
  return null; // "all" and "dual" show full range
}

/** Determine which view tabs should be enabled based on data range */
export function getAvailableViewTabs(
  prices: ReadonlyArray<PriceTradeItem>,
  hasBothTypes: boolean,
): ReadonlyArray<ViewTabOption> {
  if (prices.length < 2) {
    return [
      { value: "1y", label: "1년", disabled: true },
      { value: "3y", label: "3년", disabled: true },
      { value: "all", label: "전체", disabled: true },
      { value: "dual", label: "매매/전세", disabled: true },
    ];
  }

  const sorted = sortPricesAsc(prices);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const spanMonths = (last.year - first.year) * 12 + (last.month - first.month);

  function hasEnoughData(requiredMonths: number): boolean {
    const withinPeriod = sorted.filter((p) => {
      const lastTotal = last.year * 12 + last.month;
      const pTotal = p.year * 12 + p.month;
      return lastTotal - pTotal < requiredMonths;
    });
    return spanMonths >= requiredMonths && withinPeriod.length >= 2;
  }

  return [
    { value: "1y", label: "1년", disabled: !hasEnoughData(12) },
    { value: "3y", label: "3년", disabled: !hasEnoughData(36) },
    { value: "all", label: "전체", disabled: false },
    { value: "dual", label: "매매/전세", disabled: !hasBothTypes },
  ];
}

/** Find the highest and lowest priced items in the array */
export function findPriceExtremes(
  prices: ReadonlyArray<PriceTradeItem>,
): { highest: PriceTradeItem | null; lowest: PriceTradeItem | null } {
  if (prices.length === 0) return { highest: null, lowest: null };
  if (prices.length === 1) return { highest: prices[0], lowest: null };

  let highest = prices[0];
  let lowest = prices[0];

  for (let i = 1; i < prices.length; i++) {
    if (prices[i].price > highest.price) highest = prices[i];
    if (prices[i].price < lowest.price) lowest = prices[i];
  }

  // If highest and lowest are the same item, only return highest
  if (highest === lowest) return { highest, lowest: null };

  return { highest, lowest };
}

/* ------------------------------------------------------------------ */
/*  Pyeong (평수) — area-based filtering                              */
/* ------------------------------------------------------------------ */

const SQM_PER_PYEONG = 3.3058;

/** Convert ㎡ to 평 (rounded to nearest integer) */
export function sqmToPyeong(sqm: number): number {
  return Math.round(sqm / SQM_PER_PYEONG);
}

/**
 * Standard Korean apartment pyeong brackets.
 * Each bracket is defined by [minSqm, maxSqm) and a display label.
 */
const PYEONG_BRACKETS: ReadonlyArray<{
  label: string;
  value: number;
  minSqm: number;
  maxSqm: number;
}> = [
  { label: "15평", value: 15, minSqm: 0, maxSqm: 56 },
  { label: "18평", value: 18, minSqm: 56, maxSqm: 66 },
  { label: "24평", value: 24, minSqm: 66, maxSqm: 86 },
  { label: "32평", value: 32, minSqm: 86, maxSqm: 115 },
  { label: "43평", value: 43, minSqm: 115, maxSqm: 150 },
  { label: "50평+", value: 50, minSqm: 150, maxSqm: Infinity },
];

/** Map ㎡ to the standard pyeong bracket value */
function sqmToBracket(sqm: number): number | null {
  for (const b of PYEONG_BRACKETS) {
    if (sqm >= b.minSqm && sqm < b.maxSqm) return b.value;
  }
  return null;
}

export interface PyeongOption {
  readonly value: number | null; // null = "전체"
  readonly label: string;
}

/** Extract available pyeong brackets from price data */
export function getAvailablePyeongOptions(
  prices: ReadonlyArray<PriceTradeItem>,
): ReadonlyArray<PyeongOption> {
  const found = new Set<number>();

  for (const p of prices) {
    if (p.exclusiveArea == null) continue;
    const bracket = sqmToBracket(p.exclusiveArea);
    if (bracket !== null) found.add(bracket);
  }

  if (found.size <= 1) return [];

  const options: PyeongOption[] = [{ value: null, label: "전체" }];

  for (const b of PYEONG_BRACKETS) {
    if (found.has(b.value)) {
      options.push({ value: b.value, label: b.label });
    }
  }

  return options;
}

/** Filter prices by pyeong bracket */
export function filterByPyeong(
  prices: ReadonlyArray<PriceTradeItem>,
  bracketValue: number | null,
): ReadonlyArray<PriceTradeItem> {
  if (bracketValue === null) return prices;
  const bracket = PYEONG_BRACKETS.find((b) => b.value === bracketValue);
  if (!bracket) return prices;
  return prices.filter((p) => {
    if (p.exclusiveArea == null) return false;
    return p.exclusiveArea >= bracket.minSqm && p.exclusiveArea < bracket.maxSqm;
  });
}

/** Summary data for a pyeong bracket row in the drawer */
export interface PyeongBracketSummary {
  readonly value: number;
  readonly label: string;
  readonly areaMin: number;
  readonly areaMax: number;
  readonly latestSalePrice: number | null;
  readonly latestJeonsePrice: number | null;
  readonly latestMonthlyPrice: number | null;
  readonly dealCount: number;
}

/** Compute summary per pyeong bracket for the area drawer */
export function getPyeongBracketSummaries(
  prices: ReadonlyArray<PriceTradeItem>,
): ReadonlyArray<PyeongBracketSummary> {
  const buckets = new Map<
    number,
    {
      areas: number[];
      salePrices: PriceTradeItem[];
      jeonsePrices: PriceTradeItem[];
      monthlyPrices: PriceTradeItem[];
      totalDeals: number;
    }
  >();

  for (const p of prices) {
    if (p.exclusiveArea == null) continue;
    const bv = sqmToBracket(p.exclusiveArea);
    if (bv === null) continue;

    let bucket = buckets.get(bv);
    if (!bucket) {
      bucket = {
        areas: [],
        salePrices: [],
        jeonsePrices: [],
        monthlyPrices: [],
        totalDeals: 0,
      };
      buckets.set(bv, bucket);
    }

    bucket.areas.push(p.exclusiveArea);
    bucket.totalDeals += 1;

    if (p.tradeType === "sale") bucket.salePrices.push(p);
    else if (p.tradeType === "jeonse") bucket.jeonsePrices.push(p);
    else if (p.tradeType === "monthly") bucket.monthlyPrices.push(p);
  }

  const results: PyeongBracketSummary[] = [];

  for (const b of PYEONG_BRACKETS) {
    const bucket = buckets.get(b.value);
    if (!bucket) continue;

    const latestSale = bucket.salePrices
      .sort((a, c) => c.year * 100 + c.month - (a.year * 100 + a.month))[0];
    const latestJeonse = bucket.jeonsePrices
      .sort((a, c) => c.year * 100 + c.month - (a.year * 100 + a.month))[0];
    const latestMonthly = bucket.monthlyPrices
      .sort((a, c) => c.year * 100 + c.month - (a.year * 100 + a.month))[0];

    results.push({
      value: b.value,
      label: b.label,
      areaMin: Math.round(Math.min(...bucket.areas)),
      areaMax: Math.round(Math.max(...bucket.areas)),
      latestSalePrice: latestSale?.price ?? null,
      latestJeonsePrice: latestJeonse?.price ?? null,
      latestMonthlyPrice:
        latestMonthly?.monthlyRent ?? latestMonthly?.price ?? null,
      dealCount: bucket.totalDeals,
    });
  }

  return results;
}

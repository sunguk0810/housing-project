"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import { formatAmount } from "@/lib/format";
import { formatPriceAxis } from "@/lib/price-utils";
import type { PriceHistoryItem } from "@/types/api";

const COLOR_SALE = "var(--color-compare-1)";
const COLOR_JEONSE = "var(--color-compare-2)";
const COLOR_MONTHLY = "var(--color-compare-3)";

interface PriceChartProps {
  prices: ReadonlyArray<PriceHistoryItem>;
  className?: string;
  annotations?: {
    highest?: { name: string; price: number };
    lowest?: { name: string; price: number };
  };
}

export interface DualChartDatum {
  name: string;
  salePrice?: number;
  jeonsePrice?: number;
  monthlyRent?: number;
  saleDealCount?: number;
  jeonseDealCount?: number;
  monthlyDealCount?: number;
  saleArea?: number | null;
  jeonseArea?: number | null;
  monthlyArea?: number | null;
  monthlyDeposit?: number | null;
}

export function mergePricesByMonth(
  prices: ReadonlyArray<PriceHistoryItem>,
): ReadonlyArray<DualChartDatum> {
  const map = new Map<string, DualChartDatum>();

  for (const p of prices) {
    const key = `${p.year}.${String(p.month).padStart(2, "0")}`;
    const existing = map.get(key) ?? { name: key };

    if (p.tradeType === "sale") {
      existing.salePrice = p.averagePrice;
      existing.saleDealCount = p.dealCount;
      existing.saleArea = p.areaAvg;
    } else if (p.tradeType === "jeonse") {
      existing.jeonsePrice = p.averagePrice;
      existing.jeonseDealCount = p.dealCount;
      existing.jeonseArea = p.areaAvg;
    } else if (p.tradeType === "monthly") {
      existing.monthlyRent = p.monthlyRentAvg ?? p.averagePrice;
      existing.monthlyDealCount = p.dealCount;
      existing.monthlyArea = p.areaAvg;
      existing.monthlyDeposit = p.averagePrice;
    }

    map.set(key, existing);
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Threshold: hide dots when too many data points for performance + clarity
const DOT_THRESHOLD = 24;

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  payload: DualChartDatum;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipPayloadItem>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload;

  const gap =
    datum.salePrice != null && datum.jeonsePrice != null
      ? datum.salePrice - datum.jeonsePrice
      : null;

  return (
    <div className="rounded-[var(--radius-s7-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-3)] py-[var(--space-2)] shadow-sm">
      <p className="mb-1 text-[length:var(--text-caption)] font-medium text-[var(--color-on-surface-muted)]">
        {datum.name}
      </p>

      {datum.salePrice != null && (
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: COLOR_SALE }}
          />
          <span className="text-[length:var(--text-caption)] tabular-nums">
            매매 {formatAmount(datum.salePrice)}
            <span className="ml-1 text-[var(--color-on-surface-muted)]">
              {datum.saleDealCount}건
              {datum.saleArea != null && ` · ${datum.saleArea}㎡`}
            </span>
          </span>
        </div>
      )}

      {datum.jeonsePrice != null && (
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: COLOR_JEONSE }}
          />
          <span className="text-[length:var(--text-caption)] tabular-nums">
            전세 {formatAmount(datum.jeonsePrice)}
            <span className="ml-1 text-[var(--color-on-surface-muted)]">
              {datum.jeonseDealCount}건
              {datum.jeonseArea != null && ` · ${datum.jeonseArea}㎡`}
            </span>
          </span>
        </div>
      )}

      {datum.monthlyRent != null && (
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: COLOR_MONTHLY }}
          />
          <span className="text-[length:var(--text-caption)] tabular-nums">
            월세 {formatAmount(datum.monthlyRent)}
            <span className="ml-1 text-[var(--color-on-surface-muted)]">
              {datum.monthlyDealCount}건
              {datum.monthlyDeposit != null && ` · 보증금 ${formatAmount(datum.monthlyDeposit)}`}
              {datum.monthlyArea != null && ` · ${datum.monthlyArea}㎡`}
            </span>
          </span>
        </div>
      )}

      {gap != null && (
        <div className="mt-1 border-t border-[var(--color-neutral-100)] pt-1">
          <span className="text-[length:var(--text-caption)] font-medium tabular-nums text-[var(--color-on-surface-muted)]">
            갭 {formatAmount(gap)}
          </span>
        </div>
      )}
    </div>
  );
}

export function PriceChart({ prices, className, annotations }: PriceChartProps) {
  const merged = useMemo(() => mergePricesByMonth(prices), [prices]);

  if (merged.length < 2) return null;

  const hasSale = merged.some((d) => d.salePrice != null);
  const hasJeonse = merged.some((d) => d.jeonsePrice != null);
  const hasMonthly = merged.some((d) => d.monthlyRent != null);
  const showDots = merged.length <= DOT_THRESHOLD;

  return (
    <div className={className} aria-hidden="true">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={[...merged]}
          margin={{ top: 20, right: 8, bottom: 0, left: -8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-neutral-200)"
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "var(--color-on-surface-muted)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatPriceAxis}
            tick={{ fontSize: 11, fill: "var(--color-on-surface-muted)" }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          {hasSale && (
            <Line
              type="monotone"
              dataKey="salePrice"
              stroke={COLOR_SALE}
              strokeWidth={2}
              dot={showDots ? { r: 3, fill: COLOR_SALE } : false}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive={false}
            />
          )}
          {hasJeonse && (
            <Line
              type="monotone"
              dataKey="jeonsePrice"
              stroke={COLOR_JEONSE}
              strokeWidth={2}
              dot={showDots ? { r: 3, fill: COLOR_JEONSE } : false}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive={false}
            />
          )}
          {hasMonthly && (
            <Line
              type="monotone"
              dataKey="monthlyRent"
              stroke={COLOR_MONTHLY}
              strokeWidth={2}
              dot={showDots ? { r: 3, fill: COLOR_MONTHLY } : false}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive={false}
            />
          )}
          {annotations?.highest && (
            <ReferenceDot
              x={annotations.highest.name}
              y={annotations.highest.price}
              r={6}
              fill="var(--color-error)"
              stroke="white"
              strokeWidth={2}
              ifOverflow="extendDomain"
              label={{
                value: "최고",
                position: "top",
                fill: "var(--color-error)",
                fontSize: 11,
                fontWeight: 600,
                offset: 8,
              }}
            />
          )}
          {annotations?.lowest && (
            <ReferenceDot
              x={annotations.lowest.name}
              y={annotations.lowest.price}
              r={6}
              fill="var(--color-brand-500)"
              stroke="white"
              strokeWidth={2}
              ifOverflow="extendDomain"
              label={{
                value: "최저",
                position: "bottom",
                fill: "var(--color-brand-500)",
                fontSize: 11,
                fontWeight: 600,
                offset: 8,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

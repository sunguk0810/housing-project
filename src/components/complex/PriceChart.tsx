"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatAmount } from "@/lib/format";
import { formatPriceAxis, safeTradeTypeLabel } from "@/lib/price-utils";
import type { PriceHistoryItem } from "@/types/api";

interface PriceChartProps {
  prices: ReadonlyArray<PriceHistoryItem>;
  className?: string;
}

interface ChartDatum {
  name: string;
  price: number;
  tradeType: string;
}

interface TooltipPayloadItem {
  value: number;
  payload: ChartDatum;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipPayloadItem>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="rounded-[var(--radius-s7-md)] border border-[var(--color-border)] bg-white px-[var(--space-3)] py-[var(--space-2)] shadow-sm">
      <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
        {item.payload.name} · {safeTradeTypeLabel(item.payload.tradeType)}
      </p>
      <p className="text-[length:var(--text-body-sm)] font-semibold tabular-nums">
        {formatAmount(item.value)}
      </p>
    </div>
  );
}

export function PriceChart({ prices, className }: PriceChartProps) {
  if (prices.length < 2) return null;

  const data: ReadonlyArray<ChartDatum> = prices.map((p) => ({
    name: `${p.year}.${String(p.month).padStart(2, "0")}`,
    price: p.averagePrice,
    tradeType: p.tradeType,
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={[...data]} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
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
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--color-brand-500)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-brand-500)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

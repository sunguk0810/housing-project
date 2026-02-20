"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { DualChartDatum } from "@/components/complex/PriceChart";

const COLOR_SALE = "var(--color-compare-1)";
const COLOR_JEONSE = "var(--color-compare-2)";
const COLOR_MONTHLY = "var(--color-compare-3)";

interface VolumeBarChartProps {
  data: ReadonlyArray<DualChartDatum>;
  showDual: boolean;
  className?: string;
}

interface VolTooltipPayloadItem {
  value: number;
  dataKey: string;
  payload: DualChartDatum;
}

function VolumeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<VolTooltipPayloadItem>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload;

  return (
    <div className="rounded-[var(--radius-s7-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-2)] py-1 shadow-sm">
      <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
        {datum.name}
      </p>
      {datum.saleDealCount != null && datum.saleDealCount > 0 && (
        <p className="text-[length:var(--text-caption)] tabular-nums">
          매매 {datum.saleDealCount}건
        </p>
      )}
      {datum.jeonseDealCount != null && datum.jeonseDealCount > 0 && (
        <p className="text-[length:var(--text-caption)] tabular-nums">
          전세 {datum.jeonseDealCount}건
        </p>
      )}
      {datum.monthlyDealCount != null && datum.monthlyDealCount > 0 && (
        <p className="text-[length:var(--text-caption)] tabular-nums">
          월세 {datum.monthlyDealCount}건
        </p>
      )}
    </div>
  );
}

export function VolumeBarChart({ data, showDual, className }: VolumeBarChartProps) {
  if (data.length < 2) return null;

  const hasSale = data.some((d) => d.saleDealCount != null && d.saleDealCount > 0);
  const hasJeonse = data.some((d) => d.jeonseDealCount != null && d.jeonseDealCount > 0);
  const hasMonthly = data.some((d) => d.monthlyDealCount != null && d.monthlyDealCount > 0);

  return (
    <div className={className} aria-hidden="true">
      <ResponsiveContainer width="100%" height={60}>
        <BarChart
          data={[...data]}
          margin={{ top: 0, right: 8, bottom: 0, left: -8 }}
        >
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip content={<VolumeTooltip />} />
          {hasSale && (
            <Bar
              dataKey="saleDealCount"
              fill={COLOR_SALE}
              opacity={0.6}
              isAnimationActive={false}
              radius={[2, 2, 0, 0]}
            />
          )}
          {showDual && hasJeonse && (
            <Bar
              dataKey="jeonseDealCount"
              fill={COLOR_JEONSE}
              opacity={0.6}
              isAnimationActive={false}
              radius={[2, 2, 0, 0]}
            />
          )}
          {!showDual && hasMonthly && (
            <Bar
              dataKey="monthlyDealCount"
              fill={COLOR_MONTHLY}
              opacity={0.6}
              isAnimationActive={false}
              radius={[2, 2, 0, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

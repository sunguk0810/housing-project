"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { RecommendationItem } from "@/types/api";

interface CompareRadarChartProps {
  items: ReadonlyArray<RecommendationItem>;
}

// Recharts SVG does not support CSS var() — use hex constants (review I4)
// Matches tokens.css --color-compare-1/2/3
export const COMPARE_COLORS = ["#0891B2", "#F97316", "#8B5CF6"] as const;

const DIMENSION_LABELS: Record<string, string> = {
  budget: "예산",
  commute: "통근",
  childcare: "보육",
  safety: "안전",
  complexScale: "규모",
};

function truncateName(name: string, max = 12): string {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

export function CompareRadarChart({ items }: CompareRadarChartProps) {
  if (items.length < 2) return null;

  const dimensions = ["budget", "commute", "childcare", "safety", "complexScale"] as const;

  const chartData = dimensions.map((dim) => {
    const entry: Record<string, string | number> = {
      dimension: DIMENSION_LABELS[dim],
    };
    items.forEach((item) => {
      entry[String(item.aptId)] = Math.round(item.dimensions[dim] * 100);
    });
    return entry;
  });

  return (
    <div className="w-full" data-testid="compare-radar-chart">
      {/* Chart — Legend removed to prevent overlap with axis labels */}
      <ResponsiveContainer width="100%" height={220} minWidth={200} minHeight={200}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="#e7e5e4" />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          {items.map((item, i) => (
            <Radar
              key={item.aptId}
              name={truncateName(item.aptName)}
              dataKey={String(item.aptId)}
              stroke={COMPARE_COLORS[i % COMPARE_COLORS.length]}
              fill={COMPARE_COLORS[i % COMPARE_COLORS.length]}
              fillOpacity={0.1}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>

      {/* Custom HTML legend — separated from chart to avoid axis label overlap */}
      <div className="mt-[var(--space-2)] flex flex-wrap items-center justify-center gap-x-[var(--space-4)] gap-y-[var(--space-1)]">
        {items.map((item, i) => (
          <div key={item.aptId} className="flex items-center gap-[var(--space-1)]">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: COMPARE_COLORS[i % COMPARE_COLORS.length] }}
              aria-hidden="true"
            />
            <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
              {truncateName(item.aptName)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

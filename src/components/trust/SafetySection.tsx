"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SafetyDetail } from "@/types/api";
import { DataSourceTag } from "./DataSourceTag";

interface SafetySectionProps {
  safety: SafetyDetail | null;
  className?: string;
}

type SafetyLevel = "sufficient" | "moderate" | "lacking";

const LEVEL_LABELS: Record<SafetyLevel, string> = {
  sufficient: "상위",
  moderate: "보통",
  lacking: "부족",
};

const LEVEL_BAR_COLORS: Record<SafetyLevel, string> = {
  sufficient: "bg-[var(--color-safety-sufficient)]",
  moderate: "bg-[var(--color-safety-moderate)]",
  lacking: "bg-[var(--color-safety-lacking)]",
};

const LEVEL_TEXT_COLORS: Record<SafetyLevel, string> = {
  sufficient: "text-[var(--color-safety-sufficient)]",
  moderate: "text-[var(--color-safety-moderate)]",
  lacking: "text-[var(--color-safety-lacking)]",
};

function getLevel(value: number | null, high: number, low: number): SafetyLevel {
  if (value === null) return "lacking";
  if (value >= high) return "sufficient";
  if (value >= low) return "moderate";
  return "lacking";
}

function getPercentage(value: number | null, max: number): number {
  if (value === null) return 0;
  return Math.min(Math.max(Math.round((value / max) * 100), 5), 100);
}

export function SafetySection({ safety, className }: SafetySectionProps) {
  if (!safety) {
    return (
      <div className={cn("rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]", className)}>
        <h3 className="mb-[var(--space-2)] flex items-center gap-[var(--space-2)] text-[length:var(--text-subtitle)] font-semibold">
          <Shield size={18} />
          안전 편의시설 현황
        </h3>
        <p className="text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          해당 지역의 안전 데이터가 아직 제공되지 않습니다.
        </p>
      </div>
    );
  }

  const cctvLevel = getLevel(safety.cctvDensity, 3, 1);
  const shelterLevel = getLevel(safety.shelterCount, 5, 2);

  const bars = [
    { label: "CCTV", level: cctvLevel, pct: getPercentage(safety.cctvDensity, 5) },
    { label: "민방위 대피소", level: shelterLevel, pct: getPercentage(safety.shelterCount, 10) },
  ];

  return (
    <div className={cn("rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]", className)}>
      <div className="mb-[var(--space-3)] flex items-center justify-between">
        <h3 className="flex items-center gap-[var(--space-2)] text-[length:var(--text-subtitle)] font-semibold">
          <Shield size={18} />
          안전 편의시설 현황
        </h3>
        {safety.dataDate && (
          <DataSourceTag type="date" label={safety.dataDate} />
        )}
      </div>

      {safety.regionName && (
        <p className="mb-[var(--space-3)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          {safety.regionName} 기준
        </p>
      )}

      <div className="space-y-[var(--space-2)]">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-[var(--space-3)]">
            <span className="w-24 shrink-0 text-[length:var(--text-caption)]">{bar.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-neutral-200)]">
              <div
                className={cn("h-full rounded-full transition-all duration-500 ease-out", LEVEL_BAR_COLORS[bar.level])}
                style={{ width: `${bar.pct}%` }}
              />
            </div>
            <span className={cn("w-10 shrink-0 text-right text-[length:var(--text-caption)] font-semibold", LEVEL_TEXT_COLORS[bar.level])}>
              {LEVEL_LABELS[bar.level]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

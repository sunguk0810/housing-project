"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CircularGauge } from "@/components/score/CircularGauge";
import { ScoreBadge } from "@/components/score/ScoreBadge";
import { MiniGaugeGrid } from "@/components/complex/MiniGaugeGrid";
import type { DetailSessionData } from "@/lib/detail-session";

interface DetailHeroProps {
  aptName: string;
  address: string;
  householdCount: number | null;
  builtYear: number | null;
  areaMin?: number | null;
  areaMax?: number | null;
  session: DetailSessionData;
}

const MINI_GAUGE_CATEGORIES = [
  { key: "budget", label: "예산" },
  { key: "commute", label: "통근" },
  { key: "childcare", label: "보육" },
  { key: "safety", label: "안전" },
] as const;

function formatArea(areaMin?: number | null, areaMax?: number | null): string | null {
  if (areaMin != null && areaMax != null && areaMin !== areaMax) {
    return `${areaMin}~${areaMax}㎡`;
  }
  if (areaMin != null) return `${areaMin}㎡`;
  if (areaMax != null) return `${areaMax}㎡`;
  return null;
}

export function DetailHero({
  aptName,
  address,
  householdCount,
  builtYear,
  areaMin,
  areaMax,
  session,
}: DetailHeroProps) {
  const { dimensions, finalScore } = session;
  const areaText = formatArea(areaMin, areaMax);

  const miniGaugeItems = dimensions
    ? MINI_GAUGE_CATEGORIES.map((cat) => ({
        key: cat.key,
        label: cat.label,
        score: dimensions[cat.key],
      }))
    : null;

  return (
    <div
      className="mb-[var(--space-6)] -mx-[var(--space-4)] -mt-[var(--space-6)] rounded-b-[var(--radius-s7-xl)] px-[var(--space-4)] py-[var(--space-6)] lg:py-[var(--space-10)]"
      style={{
        background: "linear-gradient(160deg, #111827 0%, #1e3a5f 100%)",
      }}
    >
      <Link
        href="/results"
        className="mb-[var(--space-3)] inline-flex items-center gap-1 text-[length:var(--text-body-sm)] text-white/70 hover:text-white"
      >
        <ChevronLeft size={16} />
        결과 목록으로
      </Link>
      <div className="text-center">
        {dimensions && (
          <div className="mx-auto mb-[var(--space-3)]">
            <CircularGauge score={finalScore} size="hero" />
          </div>
        )}
        <h1 className="text-[length:var(--text-heading)] font-bold text-white">
          {aptName}
        </h1>
        <p className="mt-1 text-[length:var(--text-caption)] text-white/80">
          {address}
          {householdCount != null && ` · ${householdCount}세대`}
          {builtYear != null && ` · ${builtYear}년`}
          {areaText && ` · ${areaText}`}
        </p>
        {dimensions && (
          <div className="mt-[var(--space-2)]">
            <ScoreBadge score={finalScore} size="md" className="inline-flex" />
          </div>
        )}
        {miniGaugeItems && (
          <MiniGaugeGrid items={miniGaugeItems} className="mt-[var(--space-4)]" />
        )}
      </div>
    </div>
  );
}

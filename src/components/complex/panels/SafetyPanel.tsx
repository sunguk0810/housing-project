"use client";

import { Shield } from "lucide-react";
import { SafetySection } from "@/components/trust/SafetySection";
import { ProgressiveDisclosure } from "@/components/complex/ProgressiveDisclosure";
import { InsightCard } from "@/components/complex/InsightCard";
import { DataSourceTag } from "@/components/trust/DataSourceTag";
import { getScoreGrade, GRADE_LABELS } from "@/lib/score-utils";
import type { SafetyDetail } from "@/types/api";

interface SafetyPanelProps {
  safety: SafetyDetail | null;
  safetyScore?: number | null;
}

function getSafetyContext(score: number): string {
  if (score >= 60) return "안전 인프라 상위 수준";
  if (score >= 30) return "안전 인프라 보통 수준";
  return "안전 인프라 보강 여지 있음";
}

export function SafetyPanel({ safety, safetyScore }: SafetyPanelProps) {
  // Fallback chain: session safetyScore → API calculatedScore
  const rawScore = safetyScore ?? safety?.calculatedScore ?? null;
  const score = rawScore != null ? Math.round(rawScore * 100) : null;
  const grade = score !== null ? getScoreGrade(score) : null;

  return (
    <section className="space-y-[var(--space-4)]">
      {/* Safety insight card */}
      {grade !== null && score !== null && (
        <InsightCard
          icon={Shield}
          insight={
            score >= 60
              ? "안전 편의시설이 잘 갖춰져 있어요"
              : score >= 30
                ? "안전 편의시설이 보통 수준이에요"
                : "안전 편의시설이 부족한 편이에요"
          }
          value={GRADE_LABELS[grade]}
          valueLabel="안전 편의시설 현황"
          grade={grade}
        />
      )}

      {/* Existing SafetySection component (handles null safety internally) */}
      <SafetySection safety={safety} />

      {/* Comparison context */}
      {score !== null && (
        <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          {getSafetyContext(score)}
        </p>
      )}

      {safety && (
        <DataSourceTag
          type="public"
          label="경찰청 범죄통계, 행정안전부"
        />
      )}

      <ProgressiveDisclosure
        summary="안전 점수는 어떻게 산출되나요?"
        detail="CCTV 밀도, 민방위 대피소 수 등 공공 안전 인프라 데이터를 기반으로 산출합니다."
      />
    </section>
  );
}

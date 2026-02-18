"use client";

import { Wallet, Train, Building2, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScoreBar } from "@/components/score/ScoreBar";
import { InsightCard } from "@/components/complex/InsightCard";
import { ProgressiveDisclosure } from "@/components/complex/ProgressiveDisclosure";
import { getScoreGrade, GRADE_LABELS } from "@/lib/score-utils";

interface DimensionScores {
  readonly budget: number;
  readonly commute: number;
  readonly childcare: number;
  readonly safety: number;
  readonly school: number;
}

interface OverviewPanelProps {
  dimensions: DimensionScores | null;
}

interface InsightConfig {
  key: "budget" | "commute" | "childcare" | "safety";
  label: string;
  icon: LucideIcon;
  getInsight: (score: number) => string;
}

const INSIGHT_CONFIGS: ReadonlyArray<InsightConfig> = [
  {
    key: "budget",
    label: "예산 적합도",
    icon: Wallet,
    getInsight: (score) =>
      score >= 60 ? "예산 범위에 잘 맞아요" : score >= 30 ? "다소 부담이 있어요" : "적극적 재무 계획이 필요해요",
  },
  {
    key: "commute",
    label: "통근 편의",
    icon: Train,
    getInsight: (score) =>
      score >= 60 ? "통근이 편리한 위치예요" : score >= 30 ? "통근에 다소 시간이 걸려요" : "통근 거리가 먼 편이에요",
  },
  {
    key: "childcare",
    label: "보육 환경",
    icon: Building2,
    getInsight: (score) =>
      score >= 60 ? "보육 환경이 잘 갖춰져 있어요" : score >= 30 ? "보육 시설이 보통 수준이에요" : "보육 시설이 부족한 편이에요",
  },
  {
    key: "safety",
    label: "안전 편의시설",
    icon: Shield,
    getInsight: (score) =>
      score >= 60 ? "안전 편의시설이 잘 갖춰져 있어요" : score >= 30 ? "안전 편의시설이 보통 수준이에요" : "안전 편의시설이 부족한 편이에요",
  },
];

export function OverviewPanel({ dimensions }: OverviewPanelProps) {
  if (!dimensions) {
    return (
      <section className="rounded-[var(--radius-s7-lg)] border border-dashed border-[var(--color-border)] p-[var(--space-4)]">
        <p className="text-center text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          분석 결과 페이지를 통해 접근하면 상세 점수를 확인할 수 있습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-[var(--space-4)]">
      {/* Insight Cards — 2 columns on all sizes for compact display */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--space-3)]">
        {INSIGHT_CONFIGS.map((config) => {
          const rawScore = Math.round(dimensions[config.key] * 100);
          const grade = getScoreGrade(rawScore);
          return (
            <InsightCard
              key={config.key}
              icon={config.icon}
              insight={config.getInsight(rawScore)}
              value={GRADE_LABELS[grade]}
              valueLabel={`${rawScore}점`}
              grade={grade}
            >
              <ScoreBar
                label={config.label}
                score={rawScore}
                compact
              />
            </InsightCard>
          );
        })}
      </div>

      {/* Progressive Disclosure */}
      <ProgressiveDisclosure
        summary="점수는 어떻게 산출되나요?"
        detail="예산 적합도, 통근 편의, 보육 환경, 안전 편의시설 4개 카테고리를 공공데이터 기반으로 분석하여 종합 점수를 산출합니다. 각 카테고리는 사용자가 설정한 우선순위 가중치에 따라 반영됩니다."
      />
    </section>
  );
}

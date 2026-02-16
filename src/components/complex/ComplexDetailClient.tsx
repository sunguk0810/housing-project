"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Wallet, Train, Building2, Shield, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTracking } from "@/hooks/useTracking";
import { CircularGauge } from "@/components/score/CircularGauge";
import { ScoreBadge } from "@/components/score/ScoreBadge";
import { ScoreBar } from "@/components/score/ScoreBar";
import { SafetySection } from "@/components/trust/SafetySection";
import { ExternalLinkCTA } from "@/components/trust/ExternalLinkCTA";
import { DataSourceTag } from "@/components/trust/DataSourceTag";
import { SESSION_KEYS } from "@/lib/constants";
import { DISCLAIMER_TEXTS } from "@/lib/constants";
import { formatAmount, formatCommuteTime, formatDate } from "@/lib/format";
import { getBudgetLabel } from "@/lib/score-utils";
import { StickyCTA } from "@/components/complex/StickyCTA";
import type { ApartmentDetailResponse, RecommendResponse } from "@/types/api";

interface ComplexDetailClientProps {
  data: ApartmentDetailResponse;
}

interface DimensionScores {
  budget: number;
  commute: number;
  childcare: number;
  safety: number;
  school: number;
}

const SCORE_DIMENSIONS = [
  { key: "budget" as const, label: "예산 적합도", Icon: Wallet },
  { key: "commute" as const, label: "통근 편의", Icon: Train },
  { key: "childcare" as const, label: "보육 환경", Icon: Building2 },
  { key: "safety" as const, label: "안전 편의시설", Icon: Shield },
  { key: "school" as const, label: "학군", Icon: BookOpen },
];

export function ComplexDetailClient({ data }: ComplexDetailClientProps) {
  const { apartment, nearby, commute, sources } = data;

  useTracking({ name: "concierge_unique_view", aptId: apartment.id });

  // Read dimensions from sessionStorage once — useState lazy init guarantees single execution
  const [{ dimensions, finalScore }] = useState(() => {
    if (typeof window === "undefined") {
      return { dimensions: null as DimensionScores | null, finalScore: 0 };
    }
    try {
      const stored = sessionStorage.getItem(SESSION_KEYS.results);
      if (!stored) return { dimensions: null as DimensionScores | null, finalScore: 0 };
      const raw: unknown = JSON.parse(stored);
      if (
        !raw ||
        typeof raw !== "object" ||
        !("recommendations" in raw) ||
        !Array.isArray((raw as Record<string, unknown>).recommendations)
      ) {
        return { dimensions: null as DimensionScores | null, finalScore: 0 };
      }
      const results = raw as RecommendResponse;
      const match = results.recommendations.find((r) => r.aptId === apartment.id);
      if (match) {
        return {
          dimensions: match.dimensions as DimensionScores,
          finalScore: match.finalScore,
        };
      }
    } catch {
      // Ignore
    }
    return { dimensions: null as DimensionScores | null, finalScore: 0 };
  });

  const budgetInfo = dimensions ? getBudgetLabel(dimensions.budget) : null;

  return (
    <div className="mx-auto max-w-3xl px-[var(--space-4)] pb-28 py-[var(--space-6)]">
      {/* D3: Gradient hero section */}
      <div
        className="mb-[var(--space-6)] -mx-[var(--space-4)] -mt-[var(--space-6)] rounded-b-[var(--radius-s7-xl)] px-[var(--space-4)] py-[var(--space-6)]"
        style={{ background: "linear-gradient(135deg, var(--color-brand-700), var(--color-brand-500))" }}
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
            {apartment.aptName}
          </h1>
          <p className="mt-1 text-[length:var(--text-caption)] text-white/80">
            {apartment.address}
            {apartment.householdCount && ` · ${apartment.householdCount}세대`}
            {apartment.builtYear && ` · ${apartment.builtYear}년`}
          </p>
          {dimensions && (
            <div className="mt-[var(--space-2)]">
              <ScoreBadge score={finalScore} size="md" className="inline-flex" />
            </div>
          )}
        </div>
      </div>

      {/* Score bars */}
      {dimensions ? (
        <section className="mb-[var(--space-6)] rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]">
          <h2 className="mb-[var(--space-4)] text-[length:var(--text-subtitle)] font-semibold">
            카테고리별 분석
          </h2>
          <div className="space-y-[var(--space-3)]">
            {SCORE_DIMENSIONS.map(({ key, label, Icon }) => (
              <div key={key} className="flex items-center gap-[var(--space-2)]">
                <Icon size={14} className="shrink-0 text-[var(--color-on-surface-muted)]" />
                <ScoreBar
                  label={label}
                  score={Math.round(dimensions[key] * 100)}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-[var(--space-6)] rounded-[var(--radius-s7-lg)] border border-dashed border-[var(--color-border)] p-[var(--space-4)]">
          <p className="text-center text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
            분석 결과 페이지를 통해 접근하면 상세 점수를 확인할 수 있습니다.
          </p>
        </section>
      )}

      {/* Commute info — card style matching showcase */}
      {commute.toGbd !== null || commute.toYbd !== null || commute.toCbd !== null || commute.toPangyo !== null ? (
        <section className="mb-[var(--space-6)] rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]">
          <h2 className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)] text-[length:var(--text-subtitle)] font-semibold">
            <Train size={18} />
            통근 시간
          </h2>
          <div className="flex gap-[var(--space-3)]">
            {([
              { label: "강남", value: commute.toGbd },
              { label: "여의도", value: commute.toYbd },
              { label: "종로", value: commute.toCbd },
              { label: "판교", value: commute.toPangyo },
            ] as const).filter((c) => c.value !== null).map((c) => (
              <div key={c.label} className="flex-1 rounded-[var(--radius-s7-md)] bg-[var(--color-surface-elevated)] p-[var(--space-3)] text-center">
                <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">{c.label}</p>
                <p className="text-[length:var(--text-title)] font-bold text-[var(--color-brand-500)]">{formatCommuteTime(c.value!)}</p>
              </div>
            ))}
          </div>
          <DataSourceTag type="transit" label="ODsay 대중교통 경로 기준" className="mt-[var(--space-2)]" />
        </section>
      ) : (
        <section className="mb-[var(--space-6)] rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]">
          <h2 className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)] text-[length:var(--text-subtitle)] font-semibold">
            <Train size={18} />
            통근 시간
          </h2>
          <p className="text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
            통근 시간 데이터가 아직 수집되지 않았습니다.
          </p>
        </section>
      )}

      {/* Price history — mini table */}
      {apartment.prices.length > 0 && (
        <section className="mb-[var(--space-6)] rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]">
          <div className="mb-[var(--space-3)] flex items-center justify-between">
            <h2 className="text-[length:var(--text-subtitle)] font-semibold">실거래가 정보</h2>
            <DataSourceTag type="date" label={formatDate(sources.priceDate)} />
          </div>
          <div className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)]">
            <span className="text-[length:var(--text-body-sm)] font-bold tabular-nums">
              {apartment.prices[0].tradeType === "sale" ? "매매" : "전세"} {formatAmount(apartment.prices[0].averagePrice)}
            </span>
            <DataSourceTag type="info" label="국토교통부 실거래가" />
          </div>
          <table className="w-full border-collapse text-[length:var(--text-caption)]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="py-1 pr-2 text-left font-semibold text-[var(--color-on-surface-muted)]">거래일</th>
                <th className="py-1 pr-2 text-left font-semibold text-[var(--color-on-surface-muted)]">유형</th>
                <th className="py-1 pr-2 text-right font-semibold text-[var(--color-on-surface-muted)]">가격</th>
                <th className="py-1 text-right font-semibold text-[var(--color-on-surface-muted)]">건수</th>
              </tr>
            </thead>
            <tbody>
              {apartment.prices.slice(0, 6).map((p, i) => (
                <tr key={i} className="border-b border-[var(--color-neutral-100)]">
                  <td className="py-1 pr-2 tabular-nums">{p.year}.{String(p.month).padStart(2, "0")}</td>
                  <td className="py-1 pr-2">{p.tradeType === "sale" ? "매매" : "전세"}</td>
                  <td className="py-1 pr-2 text-right tabular-nums font-medium">{formatAmount(p.averagePrice)}</td>
                  <td className="py-1 text-right tabular-nums">{p.dealCount}건</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            참고용 시뮬레이션이며 실제 거래가를 보장하지 않습니다
          </p>
        </section>
      )}

      {/* Education — facility grid */}
      {nearby.schools.length > 0 && (
        <section className="mb-[var(--space-6)] rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]">
          <h2 className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)] text-[length:var(--text-subtitle)] font-semibold">
            <BookOpen size={18} />
            교육 환경
          </h2>
          <div className="grid grid-cols-3 gap-[var(--space-3)]">
            {(() => {
              const elementary = nearby.schools.filter((s) => s.schoolLevel === "elementary");
              const middle = nearby.schools.filter((s) => s.schoolLevel === "middle");
              const high = nearby.schools.filter((s) => s.schoolLevel === "high");
              return [
                { label: "초등학교", count: elementary.length },
                { label: "중학교", count: middle.length },
                { label: "고등학교", count: high.length },
              ].filter((g) => g.count > 0).map((g) => (
                <div key={g.label} className="rounded-[var(--radius-s7-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-[var(--space-3)] text-center">
                  <Building2 size={14} className="mx-auto mb-1 text-[var(--color-on-surface-muted)]" />
                  <p className="text-[length:var(--text-title)] font-bold text-[var(--color-brand-500)]">{g.count}</p>
                  <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">{g.label}</p>
                </div>
              ));
            })()}
          </div>
          <p className="mt-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            반경 1.5km 이내 시설 수
          </p>
          <DataSourceTag type="public" label="교육부 학교정보" className="mt-[var(--space-1)]" />
        </section>
      )}

      {/* Childcare — facility grid */}
      {nearby.childcare.count > 0 && (
        <section className="mb-[var(--space-6)] rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]">
          <h2 className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)] text-[length:var(--text-subtitle)] font-semibold">
            <Building2 size={18} />
            보육 환경
          </h2>
          <div className="grid grid-cols-3 gap-[var(--space-3)]">
            <div className="rounded-[var(--radius-s7-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-[var(--space-3)] text-center">
              <p className="text-[length:var(--text-title)] font-bold text-[var(--color-brand-500)]">{nearby.childcare.count}</p>
              <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">보육시설</p>
            </div>
          </div>
          <div className="mt-[var(--space-3)] space-y-[var(--space-2)]">
            {nearby.childcare.items.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-[length:var(--text-caption)]">
                <span>{item.name}</span>
                <span className="text-[var(--color-on-surface-muted)]">
                  {item.distanceMeters}m
                  {item.evaluationGrade && ` (${item.evaluationGrade})`}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            반경 800m 이내 시설
          </p>
          <DataSourceTag type="childcare" label="사회보장정보원 보육시설" className="mt-[var(--space-1)]" />
        </section>
      )}

      {/* Safety */}
      <SafetySection safety={nearby.safety} className="mb-[var(--space-6)]" />

      {/* Budget disclaimer */}
      {budgetInfo && (
        <div
          className={cn(
            "mb-[var(--space-6)] rounded-[var(--radius-s7-md)] border p-[var(--space-4)]",
            budgetInfo.level === "comfortable"
              ? "border-[var(--color-score-good-border)] bg-[var(--color-score-good-subtle)]"
              : budgetInfo.level === "moderate"
                ? "border-[var(--color-score-below-border)] bg-[var(--color-score-below-subtle)]"
                : "border-[var(--color-score-poor-border)] bg-[var(--color-score-poor-subtle)]",
          )}
        >
          <p className="text-[length:var(--text-body-sm)] font-medium">{budgetInfo.label}</p>
          <p className="mt-1 text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            본 분석은 참고용이며, 실제 대출 심사와 다를 수 있습니다.
          </p>
        </div>
      )}

      {/* External link CTA */}
      <div className="mb-[var(--space-6)] flex flex-wrap gap-[var(--space-3)]">
        <ExternalLinkCTA
          href={`https://new.land.naver.com/complexes/${apartment.aptCode}`}
          label="네이버 부동산에서 보기"
          aptId={apartment.id}
        />
      </div>

      {/* Footer disclaimer */}
      <div
        className="rounded-[var(--radius-s7-md)] bg-[var(--color-surface-elevated)] p-[var(--space-3)] text-center text-[11px] leading-relaxed text-[var(--color-on-surface-muted)]"
      >
        {DISCLAIMER_TEXTS.footer}
      </div>

      {/* Sticky CTA */}
      <StickyCTA item={{ aptId: apartment.id, aptName: apartment.aptName, finalScore }} />
    </div>
  );
}

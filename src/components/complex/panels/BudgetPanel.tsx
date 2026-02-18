"use client";

import { useState, useMemo } from "react";
import { Wallet, Ruler, Layers } from "lucide-react";
import dynamic from "next/dynamic";
import { DataSourceTag } from "@/components/trust/DataSourceTag";
import { ProgressiveDisclosure } from "@/components/complex/ProgressiveDisclosure";
import { InsightCard } from "@/components/complex/InsightCard";
import { PeriodTabs } from "@/components/complex/PeriodTabs";

const PriceChart = dynamic(() => import("@/components/complex/PriceChart").then((m) => ({ default: m.PriceChart })), { ssr: false });
import { PriceTable } from "@/components/complex/PriceTable";
import { formatAmount, formatDate } from "@/lib/format";
import { getBudgetLabel, getScoreGrade, GRADE_LABELS } from "@/lib/score-utils";
import {
  sortPricesAsc,
  filterByPeriod,
  getAvailablePeriods,
  safeTradeTypeLabel,
} from "@/lib/price-utils";
import type { PriceHistoryItem } from "@/types/api";

interface DimensionScores {
  readonly budget: number;
  readonly commute: number;
  readonly childcare: number;
  readonly safety: number;
  readonly school: number;
}

interface BudgetPanelProps {
  prices: ReadonlyArray<PriceHistoryItem>;
  dimensions: DimensionScores | null;
  priceDate: string;
}

function computeAreaFloorSummary(prices: ReadonlyArray<PriceHistoryItem>) {
  const withArea = prices.filter((p) => p.areaAvg != null);
  const withFloor = prices.filter((p) => p.floorAvg != null);

  if (withArea.length === 0 && withFloor.length === 0) return null;

  const areaMin = withArea.length > 0
    ? Math.min(...withArea.map((p) => p.areaMin ?? Infinity))
    : null;
  const areaMax = withArea.length > 0
    ? Math.max(...withArea.map((p) => p.areaMax ?? -Infinity))
    : null;
  const areaAvg = withArea.length > 0
    ? Math.round(withArea.reduce((sum, p) => sum + (p.areaAvg ?? 0), 0) / withArea.length)
    : null;

  const floorMin = withFloor.length > 0
    ? Math.min(...withFloor.map((p) => p.floorMin ?? Infinity))
    : null;
  const floorMax = withFloor.length > 0
    ? Math.max(...withFloor.map((p) => p.floorMax ?? -Infinity))
    : null;
  const floorAvg = withFloor.length > 0
    ? Math.round(withFloor.reduce((sum, p) => sum + (p.floorAvg ?? 0), 0) / withFloor.length)
    : null;

  return { areaMin, areaMax, areaAvg, floorMin, floorMax, floorAvg };
}

export function BudgetPanel({ prices, dimensions, priceDate }: BudgetPanelProps) {
  const sortedPrices = useMemo(() => sortPricesAsc(prices), [prices]);
  const periods = useMemo(() => getAvailablePeriods(sortedPrices), [sortedPrices]);

  // Default to first enabled period, or "전체"
  const defaultPeriod = periods.find((p) => !p.disabled)?.months ?? null;
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(defaultPeriod);

  const filteredPrices = useMemo(
    () => filterByPeriod(sortedPrices, selectedPeriod),
    [sortedPrices, selectedPeriod],
  );

  const areaFloor = useMemo(() => computeAreaFloorSummary(prices), [prices]);

  const budgetInfo = dimensions ? getBudgetLabel(dimensions.budget) : null;
  const budgetScore = dimensions ? Math.round(dimensions.budget * 100) : null;
  const budgetGrade = budgetScore !== null ? getScoreGrade(budgetScore) : null;

  return (
    <section className="space-y-[var(--space-4)]">
      {/* Budget insight card */}
      {budgetInfo && budgetGrade !== null && budgetScore !== null && (
        <InsightCard
          icon={Wallet}
          insight={
            budgetScore >= 60
              ? "예산 범위에 잘 맞아요"
              : budgetScore >= 30
                ? "다소 부담이 있어요"
                : "적극적 재무 계획이 필요해요"
          }
          value={GRADE_LABELS[budgetGrade]}
          valueLabel={budgetInfo.label}
          grade={budgetGrade}
        />
      )}

      {/* Area/Floor summary cards */}
      {areaFloor && (
        <div className="grid grid-cols-2 gap-[var(--space-3)]">
          {areaFloor.areaAvg != null && (
            <div className="rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-3)]">
              <div className="mb-1 flex items-center gap-[var(--space-1)] text-[var(--color-on-surface-muted)]">
                <Ruler size={14} />
                <span className="text-[length:var(--text-caption)] font-medium">전용면적</span>
              </div>
              <p className="text-[length:var(--text-title)] font-bold tabular-nums text-[var(--color-brand-500)]">
                {areaFloor.areaAvg}㎡
              </p>
              <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)] tabular-nums">
                {areaFloor.areaMin}~{areaFloor.areaMax}㎡
              </p>
            </div>
          )}
          {areaFloor.floorAvg != null && (
            <div className="rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-3)]">
              <div className="mb-1 flex items-center gap-[var(--space-1)] text-[var(--color-on-surface-muted)]">
                <Layers size={14} />
                <span className="text-[length:var(--text-caption)] font-medium">거래층수</span>
              </div>
              <p className="text-[length:var(--text-title)] font-bold tabular-nums text-[var(--color-brand-500)]">
                {areaFloor.floorAvg}층
              </p>
              <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)] tabular-nums">
                {areaFloor.floorMin}~{areaFloor.floorMax}층
              </p>
            </div>
          )}
        </div>
      )}

      {/* Price data section */}
      {prices.length > 0 ? (
        <div className="rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] p-[var(--space-4)]">
          <div className="mb-[var(--space-3)] flex items-center justify-between">
            <h2 className="text-[length:var(--text-subtitle)] font-semibold">
              실거래가 정보
            </h2>
            <DataSourceTag type="date" label={formatDate(priceDate)} />
          </div>

          {/* Latest price summary (sortedPrices is ascending, last = newest) */}
          <div className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)]">
            <span className="text-[length:var(--text-body-sm)] font-bold tabular-nums">
              {safeTradeTypeLabel(sortedPrices[sortedPrices.length - 1].tradeType)}{" "}
              {formatAmount(sortedPrices[sortedPrices.length - 1].averagePrice)}
            </span>
            <DataSourceTag type="info" label="국토교통부 실거래가" />
          </div>

          {/* Period tabs + chart */}
          {sortedPrices.length >= 2 && (
            <>
              <PeriodTabs
                periods={periods}
                selectedMonths={selectedPeriod}
                onSelect={setSelectedPeriod}
                className="mb-[var(--space-3)]"
              />
              <PriceChart prices={filteredPrices} className="mb-[var(--space-4)]" />
            </>
          )}

          {/* Price table */}
          <PriceTable prices={filteredPrices} />
        </div>
      ) : (
        <div className="rounded-[var(--radius-s7-lg)] border border-dashed border-[var(--color-border)] p-[var(--space-4)]">
          <p className="text-center text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
            실거래가 정보가 아직 수집되지 않았습니다.
          </p>
        </div>
      )}
      <ProgressiveDisclosure
        summary="예산 점수는 어떻게 산출되나요?"
        detail="보유 현금, 연소득, 기존 대출 잔액을 기반으로 실거래가 대비 예산 적합도를 산출합니다."
      />
    </section>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Wallet, Ruler, Layers } from "lucide-react";
import dynamic from "next/dynamic";
import { DataSourceTag } from "@/components/trust/DataSourceTag";
import { ProgressiveDisclosure } from "@/components/complex/ProgressiveDisclosure";
import { InsightCard } from "@/components/complex/InsightCard";
import { TradeTypeTabs } from "@/components/complex/TradeTypeTabs";
import { ViewTabs } from "@/components/complex/ViewTabs";
import { LatestPriceDisplay } from "@/components/complex/LatestPriceDisplay";
import { AreaDrawer } from "@/components/complex/AreaDrawer";

const PriceChart = dynamic(
  () =>
    import("@/components/complex/PriceChart").then((m) => ({
      default: m.PriceChart,
    })),
  { ssr: false },
);
const VolumeBarChart = dynamic(
  () =>
    import("@/components/complex/VolumeBarChart").then((m) => ({
      default: m.VolumeBarChart,
    })),
  { ssr: false },
);

import { PriceTable } from "@/components/complex/PriceTable";
import { formatDate } from "@/lib/format";
import { getBudgetLabel, getScoreGrade, GRADE_LABELS } from "@/lib/score-utils";
import {
  sortPricesAsc,
  filterByPeriod,
  filterByTradeType,
  getAvailableTradeTypes,
  safeTradeTypeLabel,
  getAvailableViewTabs,
  viewTabToMonths,
  totalDealCount,
  filterByPyeong,
  getPyeongBracketSummaries,
} from "@/lib/price-utils";
import { mergePricesByMonth } from "@/components/complex/PriceChart";
import type { ViewTabValue } from "@/lib/price-utils";
import type { TradeType, PriceHistoryItem } from "@/types/api";

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

  const areaMin =
    withArea.length > 0
      ? Math.min(...withArea.map((p) => p.areaMin ?? Infinity))
      : null;
  const areaMax =
    withArea.length > 0
      ? Math.max(...withArea.map((p) => p.areaMax ?? -Infinity))
      : null;
  const areaAvg =
    withArea.length > 0
      ? Math.round(
          withArea.reduce((sum, p) => sum + (p.areaAvg ?? 0), 0) /
            withArea.length,
        )
      : null;

  const floorMin =
    withFloor.length > 0
      ? Math.min(...withFloor.map((p) => p.floorMin ?? Infinity))
      : null;
  const floorMax =
    withFloor.length > 0
      ? Math.max(...withFloor.map((p) => p.floorMax ?? -Infinity))
      : null;
  const floorAvg =
    withFloor.length > 0
      ? Math.round(
          withFloor.reduce((sum, p) => sum + (p.floorAvg ?? 0), 0) /
            withFloor.length,
        )
      : null;

  return { areaMin, areaMax, areaAvg, floorMin, floorMax, floorAvg };
}

export function BudgetPanel({
  prices,
  dimensions,
  priceDate,
}: BudgetPanelProps) {
  const sortedPrices = useMemo(() => sortPricesAsc(prices), [prices]);
  const tradeTypeCounts = useMemo(
    () => getAvailableTradeTypes(sortedPrices),
    [sortedPrices],
  );
  const hasBothTypes =
    tradeTypeCounts.sale > 0 && tradeTypeCounts.jeonse > 0;

  // Default trade type
  const defaultTradeType: TradeType = tradeTypeCounts.sale > 0
    ? "sale"
    : tradeTypeCounts.jeonse > 0
      ? "jeonse"
      : tradeTypeCounts.monthly > 0
        ? "monthly"
        : "sale";
  const [selectedTradeType, setSelectedTradeType] =
    useState<TradeType>(defaultTradeType);

  // Pyeong (area) filter
  const [selectedPyeong, setSelectedPyeong] = useState<number | null>(null);

  // ViewTabs replaces PeriodTabs + showGap checkbox
  const viewTabs = useMemo(() => {
    const base = getAvailableViewTabs(sortedPrices, hasBothTypes);
    if (selectedTradeType !== "monthly") return base;

    return base.map((tab) =>
      tab.value === "dual" ? { ...tab, disabled: true } : tab,
    );
  }, [selectedTradeType, sortedPrices, hasBothTypes]);
  const defaultViewTab =
    viewTabs.find((t) => !t.disabled)?.value ?? "all";
  const [activeViewTab, setActiveViewTab] =
    useState<ViewTabValue>(defaultViewTab);
  const isDual =
    activeViewTab === "dual" && selectedTradeType !== "monthly" && hasBothTypes;
  const months = viewTabToMonths(activeViewTab);

  // Reset view tab when dual is no longer valid
  const shouldResetDual = (selectedTradeType === "monthly" || !hasBothTypes) && activeViewTab === "dual";
  if (shouldResetDual) {
    setActiveViewTab("all");
  }

  // Filtered prices by selected trade type
  const typedPrices = useMemo(
    () => filterByTradeType(sortedPrices, selectedTradeType),
    [sortedPrices, selectedTradeType],
  );

  // Pyeong options + bracket summaries (computed from ALL sorted prices for drawer)
  const bracketSummaries = useMemo(
    () => getPyeongBracketSummaries(sortedPrices),
    [sortedPrices],
  );

  // Apply pyeong filter
  const pyeongFiltered = useMemo(
    () => filterByPyeong(typedPrices, selectedPyeong),
    [typedPrices, selectedPyeong],
  );

  // Chart data: dual mode shows both types (full range), otherwise single type filtered by period + pyeong
  const chartPrices = useMemo(
    () =>
      isDual
        ? filterByPeriod(
            sortedPrices.filter((p) => p.tradeType !== "monthly"),
            null,
          )
        : filterByPeriod(pyeongFiltered, months),
    [isDual, sortedPrices, pyeongFiltered, months],
  );

  // Merged data for chart + volume bar
  const mergedData = useMemo(() => mergePricesByMonth(chartPrices), [chartPrices]);

  // Table data: always filtered by selected type + pyeong + period
  const tablePrices = useMemo(
    () => filterByPeriod(pyeongFiltered, months),
    [pyeongFiltered, months],
  );

  // Area/floor for selected type (unfiltered by pyeong for full summary)
  const areaFloor = useMemo(
    () => computeAreaFloorSummary(typedPrices),
    [typedPrices],
  );

  // Latest price + deal count (from pyeong-filtered data)
  const latestSelected = pyeongFiltered.at(-1);
  const deals = useMemo(() => totalDealCount(pyeongFiltered), [pyeongFiltered]);

  // Annotations: only in single-type mode
  const annotations = useMemo(() => {
    if (isDual || chartPrices.length < 2) return undefined;

    const priceFor = (p: PriceHistoryItem) =>
      p.tradeType === "monthly" ? (p.monthlyRentAvg ?? p.averagePrice) : p.averagePrice;
    const comparable = chartPrices.map((p) => ({ item: p, price: priceFor(p) }));

    let highest: PriceHistoryItem | null = null;
    let lowest: PriceHistoryItem | null = null;
    let highestPrice = Number.NEGATIVE_INFINITY;
    let lowestPrice = Number.POSITIVE_INFINITY;

    for (const candidate of comparable) {
      if (candidate.price > highestPrice) {
        highestPrice = candidate.price;
        highest = candidate.item;
      }
      if (candidate.price < lowestPrice) {
        lowestPrice = candidate.price;
        lowest = candidate.item;
      }
    }

    if (!highest) return undefined;

    const toAnnotation = (p: PriceHistoryItem) => ({
      name: `${p.year}.${String(p.month).padStart(2, "0")}`,
      price:
        p.tradeType === "monthly" ? (p.monthlyRentAvg ?? p.averagePrice) : p.averagePrice,
    });

    return {
      highest: highest ? toAnnotation(highest) : undefined,
      lowest: lowest ? toAnnotation(lowest) : undefined,
    } as const;
  }, [isDual, chartPrices]);

  const handleTradeTypeChange = (type: TradeType) => {
    setSelectedTradeType(type);
    if (type === "monthly") {
      setActiveViewTab("all");
    }
    // Reset pyeong filter when trade type changes (different types may have different areas)
    setSelectedPyeong(null);
  };

  const handleViewTabChange = (tab: ViewTabValue) => {
    setActiveViewTab(tab);
  };

  const budgetInfo = dimensions ? getBudgetLabel(dimensions.budget) : null;
  const budgetScore = dimensions
    ? Math.round(dimensions.budget * 100)
    : null;
  const budgetGrade =
    budgetScore !== null ? getScoreGrade(budgetScore) : null;

  const showChart = mergedData.length >= 2;

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
                <span className="text-[length:var(--text-caption)] font-medium">
                  전용면적
                </span>
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
                <span className="text-[length:var(--text-caption)] font-medium">
                  거래층수
                </span>
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

          {/* Trade type tabs + area drawer */}
          <div className="mb-[var(--space-2)] flex items-center justify-between">
            <TradeTypeTabs
              selected={selectedTradeType}
              onSelect={handleTradeTypeChange}
              saleCnt={tradeTypeCounts.sale}
              jeonseCnt={tradeTypeCounts.jeonse}
              monthlyCnt={tradeTypeCounts.monthly}
            />
            <AreaDrawer
              summaries={bracketSummaries}
              selected={selectedPyeong}
              onSelect={setSelectedPyeong}
            />
          </div>

          {/* Latest price display */}
          {latestSelected && (
            <LatestPriceDisplay
              latest={latestSelected}
              tradeType={selectedTradeType}
              totalDeals={deals}
              className="mb-[var(--space-3)]"
            />
          )}

          {/* View tabs + chart */}
          {showChart && (
            <>
              <ViewTabs
                tabs={viewTabs}
                selected={activeViewTab}
                onSelect={handleViewTabChange}
                className="mb-[var(--space-3)]"
              />
              <PriceChart
                prices={chartPrices}
                annotations={annotations}
                className="mb-0"
              />
              <VolumeBarChart
                data={mergedData}
                showDual={isDual}
                className="mb-[var(--space-4)]"
              />
            </>
          )}

          {/* Empty state */}
          {tablePrices.length === 0 && (
            <p className="py-[var(--space-4)] text-center text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
              {safeTradeTypeLabel(selectedTradeType)} 거래 데이터가 없습니다.
            </p>
          )}

          {/* Price table (filtered by selected type) */}
          <PriceTable prices={tablePrices} />
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

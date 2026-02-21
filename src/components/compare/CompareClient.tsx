"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, Wallet, Train, Baby, Shield, Scale, Clock, AlertCircle, BarChart3, RotateCcw, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useCompare } from "@/contexts/CompareContext";
import { trackEvent } from "@/lib/tracking";
import { ScoreBar } from "@/components/score/ScoreBar";
import { formatPrice, formatTradeTypeLabel, formatCommuteTime } from "@/lib/format";
import { useSessionPageData } from "./useSessionPageData";
import { useCompareSync } from "./useCompareSync";
import { CompareHeader } from "./CompareHeader";
import { AtAGlanceSection } from "./AtAGlanceSection";
import { CategorySection } from "./CategorySection";
import type { CompareRowConfig } from "./CategorySection";
import { CompareFooter } from "./CompareFooter";
import { AddUnitDrawer } from "./AddUnitDrawer";

// Re-export for test backward-compat
export { getBestAptIds } from "./compareUtils";

const CompareRadarChart = dynamic(
  () =>
    import("@/components/compare/CompareRadarChart").then((m) => ({
      default: m.CompareRadarChart,
    })),
  { ssr: false },
);

export function CompareClient() {
  const router = useRouter();
  const { items: compareItems, removeItem, canAdd } = useCompare();
  const pageData = useSessionPageData();

  useCompareSync(pageData);

  const resolvedItems = pageData.items.filter((r) =>
    compareItems.some((c) => c.aptId === r.aptId),
  );

  const tracked = useRef(false);
  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      trackEvent({ name: "compare_view", count: resolvedItems.length });
    }
  }, [resolvedItems.length]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // ─── Empty states ─────────────────────────────────────────────────────────
  if (resolvedItems.length === 0) {
    const isSessionExpired = compareItems.length > 0 && !pageData.hasResults;
    const isMismatch = compareItems.length > 0 && pageData.hasResults;

    if (isSessionExpired) {
      return (
        <EmptyState
          icon={Clock}
          iconVariant="warning"
          title="분석 결과가 만료되었습니다"
          description="시간이 지나 분석 결과가 사라졌어요. 다시 시작해볼까요?"
          primaryAction={{ label: "다시 분석하기", icon: RotateCcw, href: "/search" }}
        />
      );
    }

    if (isMismatch) {
      return (
        <EmptyState
          icon={AlertCircle}
          iconVariant="warning"
          title="선택한 단지를 찾을 수 없습니다"
          description="새로운 분석을 실행하거나 다른 단지를 선택해주세요"
          primaryAction={{ label: "분석 결과 보기", icon: BarChart3, href: "/results" }}
        />
      );
    }

    return (
      <EmptyState
        icon={Scale}
        iconVariant="info"
        title="비교할 단지를 선택해주세요"
        description="분석 결과에서 마음에 드는 단지를 골라보세요"
        primaryAction={{ label: "분석 결과 보기", icon: BarChart3, href: "/results" }}
      />
    );
  }

  // ─── Category row configs ─────────────────────────────────────────────────

  const budgetRows: CompareRowConfig[] = [
    {
      label: "예산 점수",
      render: (item) => <ScoreBar label="" score={item.dimensions.budget * 100} compact />,
      highlight: true,
      getValue: (item) => item.dimensions.budget,
    },
    {
      label: "가격",
      render: (item) => (
        <div className="flex flex-col items-center gap-[2px]">
          <span className="inline-block rounded-[var(--radius-s7-full)] bg-[var(--color-surface-sunken)] px-[var(--space-2)] py-[1px] text-[10px] font-medium text-[var(--color-on-surface-muted)]">
            {formatTradeTypeLabel(item.tradeType)}
          </span>
          <span className="whitespace-nowrap text-[length:var(--text-body-sm)] font-bold tabular-nums text-[var(--color-on-surface)]">
            {formatPrice(item.averagePrice)}
          </span>
          <span className="text-[9px] text-[var(--color-on-surface-muted)]">
            {item.sources.priceDate}
          </span>
        </div>
      ),
      highlight: false,
    },
  ];

  const commuteRows: CompareRowConfig[] = [
    {
      label: "통근 점수",
      render: (item) => <ScoreBar label="" score={item.dimensions.commute * 100} compact />,
      highlight: true,
      getValue: (item) => item.dimensions.commute,
    },
    {
      label: "직장1 통근",
      render: (item) => (
        <div className="text-[length:var(--text-body-sm)] font-semibold">
          {formatCommuteTime(item.commuteTime1)}
        </div>
      ),
      highlight: true,
      getValue: (item) => -(item.commuteTime1 ?? 999),
    },
    {
      label: "직장2 통근",
      render: (item) =>
        item.commuteTime2 !== null ? (
          <div className="text-[length:var(--text-body-sm)]">
            {formatCommuteTime(item.commuteTime2)}
          </div>
        ) : (
          <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">—</span>
        ),
      highlight: true,
      getValue: (item) => (item.commuteTime2 !== null ? -(item.commuteTime2) : -Infinity),
    },
  ];

  const childcareRows: CompareRowConfig[] = [
    {
      label: "보육 점수",
      render: (item) => <ScoreBar label="" score={item.dimensions.childcare * 100} compact />,
      highlight: true,
      getValue: (item) => item.dimensions.childcare,
    },
    {
      label: "보육시설 수",
      render: (item) => (
        <div className="text-[length:var(--text-body-sm)] font-semibold">{item.childcareCount}개소</div>
      ),
      highlight: true,
      getValue: (item) => item.childcareCount,
    },
    {
      label: "학군 점수",
      render: (item) => <ScoreBar label="" score={item.schoolScore} compact />,
      highlight: true,
      getValue: (item) => item.schoolScore,
    },
  ];

  const safetyRows: CompareRowConfig[] = [
    {
      label: "안전 점수",
      render: (item) => <ScoreBar label="" score={item.dimensions.safety * 100} compact />,
      highlight: true,
      getValue: (item) => item.dimensions.safety,
    },
    {
      label: "기준일",
      render: (item) => (
        <span className="text-[10px] text-[var(--color-on-surface-muted)]">
          {item.sources.safetyDate}
        </span>
      ),
      highlight: false,
    },
  ];

  const complexScaleRows: CompareRowConfig[] = [
    {
      label: "단지 규모 점수",
      render: (item) => <ScoreBar label="" score={item.dimensions.complexScale * 100} compact />,
      highlight: true,
      getValue: (item) => item.dimensions.complexScale,
    },
    {
      label: "세대수",
      render: (item) => (
        <div className="text-[length:var(--text-body-sm)] font-semibold">
          {item.householdCount != null ? `${item.householdCount.toLocaleString()}세대` : "정보 없음"}
        </div>
      ),
      highlight: true,
      getValue: (item) => item.householdCount ?? 0,
    },
  ];

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="pb-[var(--space-12)]">
      {/* Page heading */}
      <div className="mx-auto max-w-4xl px-[var(--space-4)] pb-[var(--space-4)] pt-[var(--space-8)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="이전 페이지로 이동"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-[length:var(--text-title)] font-bold text-[var(--color-on-surface)]">
            단지 비교 분석
          </h1>
        </div>
      </div>

      {/* Sticky compare header — unit cards */}
      <CompareHeader
        items={resolvedItems}
        canAdd={canAdd}
        onRemove={removeItem}
        onOpenAdd={() => setDrawerOpen(true)}
      />

      {/* Main content — fluid layout, centered */}
      <div className="mx-auto max-w-4xl px-[var(--space-4)]" data-testid="compare-table">
        {/* Radar chart — centered, constrained width */}
        <div className="mx-auto max-w-sm py-[var(--space-6)] lg:max-w-lg">
          <CompareRadarChart items={resolvedItems} />
        </div>

        {/* "한눈에 비교" */}
        <AtAGlanceSection items={resolvedItems} />

        {/* 예산 분석 */}
        <CategorySection title="예산 분석" icon={Wallet} items={resolvedItems} rows={budgetRows} />

        {/* 통근 분석 */}
        <CategorySection title="통근 분석" icon={Train} items={resolvedItems} rows={commuteRows} />

        {/* 보육 환경 */}
        <CategorySection title="보육 환경" icon={Baby} items={resolvedItems} rows={childcareRows} />

        {/* 안전 편의시설 현황 */}
        <CategorySection title="안전 편의시설 현황" icon={Shield} items={resolvedItems} rows={safetyRows} />

        {/* 단지 규모 */}
        <CategorySection title="단지 규모" icon={Building2} items={resolvedItems} rows={complexScaleRows} />

        {/* Footer */}
        <CompareFooter />
      </div>

      {/* Add unit drawer */}
      <AddUnitDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}

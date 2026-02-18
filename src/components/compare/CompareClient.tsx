"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Wallet, Train, Baby, Shield } from "lucide-react";
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

    let title: string;
    let description: string;
    let linkHref: string;
    let linkLabel: string;

    if (isSessionExpired) {
      title = "분석 결과가 만료되었습니다";
      description = "다시 분석을 실행해주세요.";
      linkHref = "/search";
      linkLabel = "다시 분석하기";
    } else if (isMismatch) {
      title = "선택한 단지를 분석 결과에서 찾을 수 없습니다";
      description = "새로운 분석을 실행하거나 다른 단지를 선택해주세요.";
      linkHref = "/results";
      linkLabel = "분석 결과로 돌아가기";
    } else {
      title = "비교할 단지를 선택해주세요";
      description = "분석 결과에서 비교할 단지를 추가할 수 있습니다.";
      linkHref = "/results";
      linkLabel = "분석 결과로 돌아가기";
    }

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-[var(--space-4)]">
        <p className="text-[length:var(--text-title)] font-semibold">{title}</p>
        <p className="mt-[var(--space-2)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          {description}
        </p>
        <Link
          href={linkHref}
          className="mt-[var(--space-6)] rounded-[var(--radius-s7-md)] bg-[var(--color-primary)] px-[var(--space-6)] py-[var(--space-3)] text-[var(--color-on-primary)] no-underline"
        >
          {linkLabel}
        </Link>
      </div>
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
      getValue: (item) => (item.commuteTime2 !== null ? -(item.commuteTime2) : 0),
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

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="pb-[var(--space-12)]">
      {/* Page heading */}
      <div className="mx-auto max-w-4xl px-[var(--space-4)] pb-[var(--space-4)] pt-[var(--space-8)]">
        <h1 className="text-[length:var(--text-title)] font-bold text-[var(--color-on-surface)]">
          단지 비교 분석
        </h1>
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

        {/* Footer */}
        <CompareFooter />
      </div>

      {/* Add unit drawer */}
      <AddUnitDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}

"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompare } from "@/contexts/CompareContext";
import { trackEvent } from "@/lib/tracking";
import { CircularGauge } from "@/components/score/CircularGauge";
import { ScoreBar } from "@/components/score/ScoreBar";
import { DataSourceTag } from "@/components/trust/DataSourceTag";
import { CompareRadarChart, COMPARE_COLORS } from "@/components/compare/CompareRadarChart";
import { SESSION_KEYS, DISCLAIMER_TEXTS } from "@/lib/constants";
import { formatPrice, formatTradeTypeLabel, formatCommuteTime } from "@/lib/format";
import type { RecommendResponse, RecommendationItem } from "@/types/api";

interface ComparePageData {
  readonly items: ReadonlyArray<RecommendationItem>;
  readonly hasResults: boolean;
}

const EMPTY_PAGE_DATA: ComparePageData = { items: [], hasResults: false };

function parseSessionResults(): ComparePageData {
  try {
    const stored = sessionStorage.getItem(SESSION_KEYS.results);
    if (!stored) return EMPTY_PAGE_DATA;
    const raw: unknown = JSON.parse(stored);
    if (
      !raw ||
      typeof raw !== "object" ||
      !("recommendations" in raw) ||
      !Array.isArray((raw as Record<string, unknown>).recommendations)
    ) {
      return EMPTY_PAGE_DATA;
    }
    return {
      items: (raw as RecommendResponse).recommendations,
      hasResults: true,
    };
  } catch {
    return EMPTY_PAGE_DATA;
  }
}

// useSyncExternalStore: SSR returns EMPTY, client reads sessionStorage (no hydration mismatch)
const noop = () => () => {};

function useSessionPageData(): ComparePageData {
  return useSyncExternalStore(noop, parseSessionResults, () => EMPTY_PAGE_DATA);
}

/**
 * Identify best aptId(s) for a given score dimension.
 * Used for best-in-row highlighting.
 */
export function getBestAptIds(
  items: ReadonlyArray<RecommendationItem>,
  getValue: (item: RecommendationItem) => number,
): Set<number> {
  if (items.length <= 1) return new Set();
  const values = items.map(getValue);
  const max = Math.max(...values);
  return new Set(
    items.filter((_, i) => values[i] === max).map((item) => item.aptId),
  );
}

interface RowConfig {
  label: string;
  render: (item: RecommendationItem, index: number) => ReactNode;
  highlight: boolean;
  getValue?: (item: RecommendationItem) => number;
}

export function CompareClient() {
  const { items: compareItems, removeItem } = useCompare();

  // useSyncExternalStore: SSR returns empty, client reads sessionStorage (no hydration mismatch)
  const pageData = useSessionPageData();

  // Join: filter sessionStorage results to only those in compare list
  const resolvedItems = pageData.items.filter((r) =>
    compareItems.some((c) => c.aptId === r.aptId),
  );

  // Track once after mount — include count: 0 for empty states (PR #10 review)
  const tracked = useRef(false);
  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      trackEvent({ name: "compare_view", count: resolvedItems.length });
    }
  }, [resolvedItems.length]);

  // Empty states (3 cases per plan)
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
        <p className="text-[length:var(--text-title)] font-semibold">
          {title}
        </p>
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

  // Score dimension rows with highlight
  const SCORE_ROWS: ReadonlyArray<RowConfig> = [
    {
      label: "종합 점수",
      render: (item) => (
        <div className="flex justify-center">
          <CircularGauge score={item.finalScore} size="mini" animated={false} />
        </div>
      ),
      highlight: true,
      getValue: (item) => item.finalScore,
    },
    {
      label: "예산 적합도",
      render: (item) => <ScoreBar label="" score={item.dimensions.budget * 100} compact />,
      highlight: true,
      getValue: (item) => item.dimensions.budget,
    },
    {
      label: "통근 편의",
      render: (item) => <ScoreBar label="" score={item.dimensions.commute * 100} compact />,
      highlight: true,
      getValue: (item) => item.dimensions.commute,
    },
    {
      label: "보육 환경",
      render: (item) => <ScoreBar label="" score={item.dimensions.childcare * 100} compact />,
      highlight: true,
      getValue: (item) => item.dimensions.childcare,
    },
    {
      label: "안전 편의시설",
      render: (item) => <ScoreBar label="" score={item.dimensions.safety * 100} compact />,
      highlight: true,
      getValue: (item) => item.dimensions.safety,
    },
    {
      label: "학군",
      render: (item) => <ScoreBar label="" score={item.dimensions.school * 100} compact />,
      highlight: true,
      getValue: (item) => item.dimensions.school,
    },
    {
      label: "가격",
      render: (item) => (
        <div className="space-y-1">
          <div className="text-[length:var(--text-body-sm)] font-semibold">
            {formatTradeTypeLabel(item.tradeType)} {formatPrice(item.averagePrice)}
          </div>
          <DataSourceTag type="date" label={item.sources.priceDate} />
        </div>
      ),
      highlight: false,
    },
    {
      label: "통근 시간",
      render: (item) => (
        <div className="text-[length:var(--text-body-sm)]">
          <div>직장1: {formatCommuteTime(item.commuteTime1)}</div>
          {item.commuteTime2 !== null && (
            <div>직장2: {formatCommuteTime(item.commuteTime2)}</div>
          )}
        </div>
      ),
      highlight: false,
    },
    {
      label: "보육시설",
      render: (item) => (
        <div className="text-[length:var(--text-body-sm)] font-semibold">
          {item.childcareCount}개소
        </div>
      ),
      highlight: true,
      getValue: (item) => item.childcareCount,
    },
    {
      label: "분석 요약",
      render: (item) => (
        <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          {item.reason}
        </p>
      ),
      highlight: false,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-[var(--space-4)] py-[var(--space-6)]">
      {/* Page header */}
      <h1 className="mb-[var(--space-6)] text-[length:var(--text-title)] font-bold">
        단지 비교 분석
      </h1>

      {/* Radar chart — only show for 2+ items */}
      <CompareRadarChart items={resolvedItems} />

      {/* Compare table */}
      <div className="mt-[var(--space-6)] overflow-x-auto" data-testid="compare-table">
        <table className="w-full border-collapse" aria-label="선택 단지 비교표">
          <thead>
            <tr>
              {/* Sticky label column header */}
              <th scope="col" className="sticky left-0 z-1 min-w-[100px] bg-[var(--color-surface)] p-[var(--space-2)] text-left text-[length:var(--text-caption)] font-medium text-[var(--color-on-surface-muted)]" />
              {resolvedItems.map((item, i) => (
                <th
                  scope="col"
                  key={item.aptId}
                  className="min-w-[120px] p-[var(--space-2)] text-center lg:min-w-[160px]"
                >
                  <div className="flex flex-col items-center gap-[var(--space-1)]">
                    {/* Color dot */}
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: COMPARE_COLORS[i % COMPARE_COLORS.length] }}
                    />
                    {/* Name with link */}
                    <Link
                      href={`/complex/${item.aptId}`}
                      className="text-[length:var(--text-body-sm)] font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline"
                    >
                      {item.aptName}
                    </Link>
                    {/* Address */}
                    <span className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                      {item.address}
                    </span>
                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.aptId)}
                      className="mt-[var(--space-1)] flex items-center gap-0.5 rounded-[var(--radius-s7-full)] border border-[var(--color-border)] px-[var(--space-2)] py-0.5 text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)] transition-colors hover:bg-[var(--color-surface-sunken)]"
                      aria-label={`${item.aptName} 비교에서 제거`}
                    >
                      <X size={12} />
                      제거
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCORE_ROWS.map((row) => {
              const bestIds =
                row.highlight && row.getValue
                  ? getBestAptIds(resolvedItems, row.getValue)
                  : new Set<number>();

              return (
                <tr
                  key={row.label}
                  className="border-t border-[var(--color-border)]"
                >
                  <th scope="row" className="sticky left-0 z-1 bg-[var(--color-surface)] p-[var(--space-2)] text-left text-[length:var(--text-caption)] font-medium text-[var(--color-on-surface-muted)]">
                    {row.label}
                  </th>
                  {resolvedItems.map((item, i) => (
                    <td
                      key={item.aptId}
                      className={cn(
                        "p-[var(--space-2)] text-center",
                        bestIds.has(item.aptId) && "bg-[var(--color-highlight-row)]",
                      )}
                    >
                      {row.render(item, i)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Disclaimer — touch-point */}
      <p
        className="mt-[var(--space-6)] text-center text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]"
        data-disclaimer="compare-footer"
      >
        {DISCLAIMER_TEXTS.footer}
      </p>
    </div>
  );
}

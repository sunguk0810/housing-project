"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

import { SESSION_KEYS } from "@/lib/constants";
import { useTracking } from "@/hooks/useTracking";
import { PropertyCard } from "@/components/card/PropertyCard";
import { CardSelector } from "@/components/card/CardSelector";
import { KakaoMap } from "@/components/map/KakaoMap";
import { DataSourceTag } from "@/components/trust/DataSourceTag";
import { Skeleton } from "@/components/feedback/Skeleton";
import type { RecommendResponse, RecommendationItem } from "@/types/api";
import type { SortOption } from "@/types/ui";

function sortItems(
  items: ReadonlyArray<RecommendationItem>,
  sortBy: SortOption,
): ReadonlyArray<RecommendationItem> {
  const sorted = [...items];
  switch (sortBy) {
    case "budget":
      sorted.sort((a, b) => (b.dimensions?.budget ?? 0) - (a.dimensions?.budget ?? 0));
      break;
    case "commute":
      sorted.sort((a, b) => (b.dimensions?.commute ?? 0) - (a.dimensions?.commute ?? 0));
      break;
    case "score":
    default:
      sorted.sort((a, b) => b.finalScore - a.finalScore);
      break;
  }
  return sorted;
}

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAptId, setSelectedAptId] = useState<number | null>(null);
  const [visitedIds, setVisitedIds] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("score");

  useTracking({ name: "result_view", count: data?.recommendations.length ?? 0 });

  // Load results from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEYS.results);
      if (!stored) {
        router.replace("/search");
        return;
      }
      const parsed: RecommendResponse = JSON.parse(stored);
      setData(parsed);

      // Load visited IDs
      const visitedStored = sessionStorage.getItem(SESSION_KEYS.visitedApts);
      if (visitedStored) {
        setVisitedIds(new Set(JSON.parse(visitedStored) as number[]));
      }
    } catch {
      router.replace("/search");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const sortedItems = useMemo(() => {
    if (!data) return [];
    return sortItems(data.recommendations, sortBy);
  }, [data, sortBy]);

  const handleCardClick = useCallback((aptId: number) => {
    setSelectedAptId(aptId);
    setVisitedIds((prev) => {
      const next = new Set(prev);
      next.add(aptId);
      sessionStorage.setItem(SESSION_KEYS.visitedApts, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const handleMarkerClick = useCallback((aptId: number) => {
    setSelectedAptId(aptId);
    // Scroll card into view
    const el = document.querySelector(`[data-testid="property-card-${aptId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-[var(--space-4)] py-[var(--space-6)]">
        <div className="space-y-[var(--space-4)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.recommendations.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-[var(--space-4)]">
        <p className="text-[length:var(--text-title)] font-semibold">분석 결과가 없습니다</p>
        <p className="mt-[var(--space-2)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          검색 조건을 변경해 다시 시도해주세요.
        </p>
        <button
          onClick={() => router.push("/search")}
          className="mt-[var(--space-6)] rounded-[var(--radius-s7-md)] bg-[var(--color-primary)] px-[var(--space-6)] py-[var(--space-3)] text-[var(--color-on-primary)]"
        >
          다시 분석하기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-[var(--space-4)] py-[var(--space-6)]">
      {/* Header with back button */}
      <div className="mb-[var(--space-3)] flex items-center gap-[var(--space-3)]">
        <button
          onClick={() => router.push("/search")}
          className="text-[length:var(--text-subtitle)] text-[var(--color-on-surface)]"
          aria-label="뒤로가기"
        >
          &larr;
        </button>
        <h1 className="flex-1 text-[length:var(--text-subtitle)] font-semibold">
          분석 결과 <span className="text-[var(--color-brand-500)]">{data.recommendations.length}</span>개
        </h1>
      </div>

      {/* Data source tags — Disclaimer touch-point 3 */}
      <div className="mb-[var(--space-3)] flex flex-wrap gap-[var(--space-1)]" data-disclaimer="data-source-results">
        <DataSourceTag type="public" label="공공데이터 기반 분석 결과" />
        {data.recommendations[0]?.sources && (
          <DataSourceTag type="date" label={`기준일 ${data.recommendations[0].sources.priceDate}`} />
        )}
        <DataSourceTag type="info" label="참고용 정보" />
      </div>

      {/* Sort chips */}
      <div className="mb-[var(--space-3)]">
        <CardSelector value={sortBy} onChange={setSortBy} />
      </div>

      {/* Responsive layout: mobile=vertical, desktop=side-by-side */}
      <div className="grid gap-[var(--space-4)] lg:grid-cols-[minmax(480px,2fr)_3fr]">
        {/* Card list */}
        <div className="order-2 space-y-[var(--space-3)] lg:order-1 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto">
          {sortedItems.map((item) => (
            <PropertyCard
              key={item.aptId}
              item={item}
              isSelected={selectedAptId === item.aptId}
              onHover={() => setSelectedAptId(item.aptId)}
              onClick={() => handleCardClick(item.aptId)}
            />
          ))}
          {/* Disclaimer */}
          <p className="mt-[var(--space-4)] text-center text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            공공데이터 기반 참고용 분석이며 실거래를 보장하지 않습니다
          </p>
        </div>

        {/* Map */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100vh-12rem)]">
          <KakaoMap
            items={data.recommendations}
            selectedId={selectedAptId}
            visitedIds={visitedIds}
            onMarkerClick={handleMarkerClick}
            className="h-[300px] w-full lg:h-full"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Map } from "lucide-react";
import dynamic from "next/dynamic";

import { SESSION_KEYS } from "@/lib/constants";
import { useTracking } from "@/hooks/useTracking";
import { PropertyCard } from "@/components/card/PropertyCard";
import { CardSelector } from "@/components/card/CardSelector";
import { CompareBar } from "@/components/layout/CompareBar";

const KakaoMap = dynamic(() => import("@/components/map/KakaoMap").then((m) => ({ default: m.KakaoMap })), { ssr: false });
import { MapBottomSheet } from "@/components/map/MapBottomSheet";
import { MapScoreLegend } from "@/components/map/MapScoreLegend";
import { MapSortOverlay } from "@/components/map/MapSortOverlay";
import { RefreshPill } from "@/components/map/RefreshPill";
import { DataSourceTag } from "@/components/trust/DataSourceTag";
import { PropertyCardSkeleton } from "@/components/feedback/Skeleton";
import { LoadMoreButton } from "@/components/results/LoadMoreButton";
import type { RecommendResponse, RecommendationItem } from "@/types/api";
import type { SortOption } from "@/types/ui";

const PAGE_SIZE = 10;

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
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const [boundsChanged, setBoundsChanged] = useState(false);
  const cardListRef = useRef<HTMLDivElement>(null);

  useTracking({ name: "result_view", count: data?.recommendations.length ?? 0 });

  // Mobile defaults to map+bottom sheet view (design spec: map-first mobile UX)
  useEffect(() => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setShowMap(true);
    }
  }, []);

  // Load results from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEYS.results);
      if (!stored) {
        router.replace("/search");
        return;
      }
      const parsed: unknown = JSON.parse(stored);
      if (
        !parsed ||
        typeof parsed !== "object" ||
        !("recommendations" in parsed) ||
        !Array.isArray((parsed as Record<string, unknown>).recommendations)
      ) {
        router.replace("/search");
        return;
      }
      setData(parsed as RecommendResponse);

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

  // Paginated items for desktop card list
  const visibleItems = useMemo(
    () => sortedItems.slice(0, page * PAGE_SIZE),
    [sortedItems, page],
  );

  // Reset page when sort changes
  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
    setPage(1);
    if (cardListRef.current && window.matchMedia("(min-width: 1024px)").matches) {
      cardListRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

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
    // Scroll card into view (desktop)
    const el = document.querySelector(`[data-testid="property-card-${aptId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handleBoundsChange = useCallback(() => {
    setBoundsChanged(true);
  }, []);

  const handleRefresh = useCallback(() => {
    setBoundsChanged(false);
    // Future: re-filter list based on current map bounds
  }, []);

  const handleCardHover = useCallback((aptId: number) => {
    setSelectedAptId(aptId);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-[var(--space-4)] py-[var(--space-6)]">
        <div className="space-y-[var(--space-3)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.recommendations.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-[var(--space-4)]">
        <p className="text-[length:var(--text-title)] font-semibold">분석 결과가 없습니다</p>
        <p className="mt-[var(--space-2)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
          조건을 변경해 다시 시도해주세요.
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

  // Mobile fullscreen map mode
  if (showMap && data) {
    return (
      <div className="relative lg:hidden" style={{ height: "calc(100vh - 56px)" }}>
        {/* Fullscreen map */}
        <KakaoMap
          items={data.recommendations}
          selectedId={selectedAptId}
          visitedIds={visitedIds}
          onMarkerClick={handleMarkerClick}
          onBoundsChange={handleBoundsChange}
          className="h-full w-full"
        />

        {/* Score legend overlay — top right (per design reference) */}
        <MapScoreLegend className="absolute top-[50px] right-3" />

        {/* Sort chip overlay — top left */}
        <MapSortOverlay value={sortBy} onChange={handleSortChange} className="absolute left-3 top-[50px]" />

        {/* Back to list button */}
        <button
          onClick={() => setShowMap(false)}
          className="absolute left-3 top-3 z-2 flex items-center gap-1 rounded-[var(--radius-s7-md)] bg-[var(--color-surface)] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--text-caption)] font-medium shadow-[var(--shadow-s7-md)]"
        >
          <Map size={14} /> 목록으로
        </button>

        {/* RefreshPill — top center */}
        <RefreshPill
          visible={boundsChanged}
          onClick={handleRefresh}
          className="absolute left-1/2 top-3 z-2 -translate-x-1/2"
        />

        {/* Bottom sheet (CompareBar is rendered inside the sheet) */}
        <MapBottomSheet
          items={sortedItems}
          totalCount={data.recommendations.length}
          sourceDate={data.recommendations[0]?.sources.priceDate}
          selectedId={selectedAptId}
          onItemClick={handleMarkerClick}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      </div>
    );
  }

  // Default: responsive layout
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
          분석 결과 <span className="text-[var(--color-brand-500)]">{data.recommendations.length}</span>건
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
        <CardSelector value={sortBy} onChange={handleSortChange} />
      </div>

      {/* Mobile map/list toggle */}
      <button
        onClick={() => setShowMap(true)}
        className="mb-[var(--space-3)] flex items-center gap-1 text-[length:var(--text-body-sm)] text-[var(--color-primary)] lg:hidden"
      >
        <Map size={16} /> 지도로 보기
      </button>

      {/* Responsive layout: mobile=vertical, desktop=40:60 side-by-side */}
      <div className="grid gap-[var(--space-4)] lg:grid-cols-[40%_60%]">
        {/* Card list — left panel */}
        <div
          ref={cardListRef}
          className="space-y-[var(--space-3)] lg:order-1 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto"
        >
          {visibleItems.map((item, index) => (
            <PropertyCard
              key={item.aptId}
              item={item}
              isSelected={selectedAptId === item.aptId}
              onHover={handleCardHover}
              onClick={handleCardClick}
              style={{
                animation: `fadeIn 300ms var(--ease-out-default) ${index * 100}ms both`,
              }}
            />
          ))}

          {/* Load more button */}
          <LoadMoreButton
            currentCount={visibleItems.length}
            totalCount={sortedItems.length}
            onClick={handleLoadMore}
          />

          {/* Disclaimer */}
          <p className="mt-[var(--space-4)] text-center text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
            공공데이터 기반 참고용 분석이며 실거래를 보장하지 않습니다
          </p>
        </div>

        {/* Map — desktop only, right panel */}
        <div className="relative hidden lg:order-2 lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-12rem)]">
          <KakaoMap
            items={data.recommendations}
            selectedId={selectedAptId}
            visitedIds={visitedIds}
            onMarkerClick={handleMarkerClick}
            onBoundsChange={handleBoundsChange}
            className="h-full w-full"
          />
          <MapScoreLegend className="absolute bottom-3 right-3" />
          <RefreshPill
            visible={boundsChanged}
            onClick={handleRefresh}
            className="absolute left-1/2 top-3 -translate-x-1/2"
          />
        </div>
      </div>

      {/* Compare bar */}
      <CompareBar />
    </div>
  );
}

"use client";

import { useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKakaoMap } from "@/hooks/useKakaoMap";
import { createMarkerContent } from "./MapMarker";
import { createMiniPreviewContent } from "./MiniPreview";
import type { RecommendationItem } from "@/types/api";
import type { MapMarkerState } from "@/types/ui";

interface KakaoMapProps {
  items: ReadonlyArray<RecommendationItem>;
  selectedId: number | null;
  visitedIds: Set<number>;
  onMarkerClick: (aptId: number) => void;
  className?: string;
}

// Default center: Seoul
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export function KakaoMap({
  items,
  selectedId,
  visitedIds,
  onMarkerClick,
  className,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const center = items.length > 0
    ? { lat: items[0].lat, lng: items[0].lng }
    : DEFAULT_CENTER;

  const { isReady, error, addMarkers, selectMarker, showOverlay, hideOverlay, relayout } = useKakaoMap(containerRef, { center });

  // Add markers when ready
  useEffect(() => {
    if (!isReady || items.length === 0) return;

    const markers = items.map((item) => {
      const state: MapMarkerState = item.aptId === selectedId
        ? "selected"
        : visitedIds.has(item.aptId)
          ? "visited"
          : "default";

      return {
        id: item.aptId,
        lat: item.lat,
        lng: item.lng,
        content: createMarkerContent(item.rank, item.finalScore, state),
        onClick: () => onMarkerClick(item.aptId),
      };
    });

    addMarkers(markers);
  }, [isReady, items, selectedId, visitedIds, addMarkers, onMarkerClick]);

  // Show MiniPreview overlay on selected marker
  useEffect(() => {
    if (!isReady || selectedId === null) {
      hideOverlay();
      return;
    }
    const item = items.find((i) => i.aptId === selectedId);
    if (item) {
      showOverlay(
        item.aptId,
        createMiniPreviewContent(item.aptName, item.finalScore, item.tradeType, item.averagePrice),
      );
    }
  }, [isReady, selectedId, items, showOverlay, hideOverlay]);

  // Relayout when container becomes visible (e.g. mobile map toggle)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isReady) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => relayout());
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isReady, relayout]);

  // Center on selected marker
  useEffect(() => {
    if (selectedId !== null) {
      selectMarker(selectedId);
    }
  }, [selectedId, selectMarker]);

  // Fallback UI if SDK not loaded
  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-[var(--space-3)]",
          "rounded-[var(--radius-s7-lg)] bg-[var(--color-surface-sunken)]",
          "text-[var(--color-on-surface-muted)]",
          className,
        )}
      >
        <MapPin size={32} />
        <p className="text-[length:var(--text-body-sm)]">
          지도를 불러올 수 없습니다.
        </p>
        <p className="text-[length:var(--text-caption)]">
          카카오맵 SDK 로드에 실패했습니다.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("rounded-[var(--radius-s7-lg)]", className)}
      style={{ minHeight: 400 }}
    />
  );
}

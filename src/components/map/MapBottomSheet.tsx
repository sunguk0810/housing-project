"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getScoreGrade } from "@/lib/score-utils";
import { formatPrice, formatTradeTypeLabel } from "@/lib/format";
import { DataSourceTag } from "@/components/trust/DataSourceTag";
import type { RecommendationItem } from "@/types/api";

type SheetState = "peek" | "half" | "expanded";

const SHEET_HEIGHTS: Record<SheetState, string> = {
  peek: "17%",
  half: "40%",
  expanded: "72%",
};

interface MapBottomSheetProps {
  items: ReadonlyArray<RecommendationItem>;
  totalCount: number;
  sourceDate?: string;
  selectedId: number | null;
  onItemClick: (aptId: number) => void;
}

export function MapBottomSheet({
  items,
  totalCount,
  sourceDate,
  selectedId,
  onItemClick,
}: MapBottomSheetProps) {
  const [state, setState] = useState<SheetState>("peek");
  const dragStartY = useRef<number | null>(null);

  const handleDragEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (dragStartY.current === null) return;
    const deltaY = dragStartY.current - touch.clientY;
    dragStartY.current = null;
    if (deltaY > 40) {
      // Swipe up
      setState((prev) =>
        prev === "peek" ? "half" : prev === "half" ? "expanded" : prev,
      );
    } else if (deltaY < -40) {
      // Swipe down
      setState((prev) =>
        prev === "expanded" ? "half" : prev === "half" ? "peek" : prev,
      );
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-3 bg-[var(--color-surface)] transition-[height] duration-300 ease-out"
      style={{
        height: SHEET_HEIGHTS[state],
        borderRadius: "16px 16px 0 0",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
      }}
    >
      {/* Handle bar */}
      <div
        className="flex justify-center py-[10px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleDragEnd}
      >
        <div className="h-1 w-10 rounded-[var(--radius-s7-full)] bg-[var(--color-neutral-400)]" />
      </div>

      {/* Content */}
      <div
        className="overflow-y-auto px-[var(--space-4)]"
        style={{ maxHeight: "calc(100% - 24px)" }}
      >
        {/* Header */}
        <div className="mb-[var(--space-3)] flex items-center justify-between">
          <p className="text-[length:var(--text-body-sm)] font-bold">
            분석 결과 <span className="text-[var(--color-brand-500)]">{totalCount}</span>개
          </p>
          {sourceDate && (
            <DataSourceTag type="public" label={`공공데이터 기반 · ${sourceDate} 기준`} />
          )}
        </div>

        {/* Mini card list */}
        <div className="flex flex-col gap-[var(--space-3)]">
          {items.map((item) => {
            const grade = getScoreGrade(item.finalScore);
            return (
              <button
                key={item.aptId}
                type="button"
                onClick={() => onItemClick(item.aptId)}
                className={cn(
                  "flex items-center justify-between rounded-[var(--radius-s7-lg)] border p-[var(--space-3)] text-left transition-colors",
                  selectedId === item.aptId
                    ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]",
                )}
              >
                <div>
                  <p className="text-[13px] font-bold">{item.aptName}</p>
                  <p className="text-[11px] text-[var(--color-on-surface-muted)]">
                    {formatTradeTypeLabel(item.tradeType)} {formatPrice(item.averagePrice)}
                    {item.areaMin != null && ` · ${item.areaMin}㎡`}
                  </p>
                </div>
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                  style={{ background: `var(--color-score-${grade})` }}
                >
                  {Math.round(item.finalScore)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="py-[var(--space-3)] text-[10px] leading-relaxed text-[var(--color-on-surface-muted)]">
          분석 결과는 참고용이며 실거래를 보장하지 않습니다
        </p>
      </div>
    </div>
  );
}

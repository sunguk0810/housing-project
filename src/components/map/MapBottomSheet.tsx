"use client";

import { useRef, useEffect, useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";
import { PropertyCard } from "@/components/card/PropertyCard";
import { CardSelector } from "@/components/card/CardSelector";
import { CompareBar } from "@/components/layout/CompareBar";
import type { RecommendationItem } from "@/types/api";
import type { SortOption } from "@/types/ui";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {DialogTitle} from "@/components/ui/dialog";

interface MapBottomSheetProps {
  items: ReadonlyArray<RecommendationItem>;
  totalCount: number;
  sourceDate?: string;
  selectedId: number | null;
  onItemClick: (aptId: number) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SNAP_POINTS = [0.25, 0.5, 0.9] as const;

export function MapBottomSheet({
  items,
  totalCount,
  selectedId,
  onItemClick,
  sortBy,
  onSortChange,
}: MapBottomSheetProps) {
  const [activeSnap, setActiveSnap] = useState<number | string>(SNAP_POINTS[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll selected card into view
  useEffect(() => {
    if (selectedId === null || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-testid="property-card-${selectedId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  const handleClose = () => {
    setActiveSnap(SNAP_POINTS[0]);
  };

  return (
    <DrawerPrimitive.Root
      open
      modal={false}
      snapPoints={[...SNAP_POINTS]}
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={(snap) => {
        if (snap != null) setActiveSnap(snap);
      }}
    >
      <DrawerPrimitive.Portal>
        {/* No Overlay — non-modal for map touch passthrough */}
        <DrawerPrimitive.Content
          aria-label="분석 결과 목록"
          aria-describedby={undefined}
          className={cn(
            "fixed inset-x-0 bottom-14 z-30 flex flex-col",
            "rounded-t-[var(--radius-s7-xl)] bg-[var(--color-surface)]",
            "shadow-[0_-4px_20px_rgb(0_0_0/0.1)]",
          )}
          style={{ maxHeight: "calc(100dvh - 7rem)" }}
        >
          <DialogTitle>
            <VisuallyHidden/>
          </DialogTitle>
          {/* Drag handle */}
          <div className="flex justify-center py-[var(--space-3)]">
            <div
              className="h-1 w-10 rounded-[var(--radius-s7-full)] bg-[var(--color-neutral-400)]"
              aria-hidden="true"
            />
          </div>

          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-[var(--color-surface)] px-[var(--space-4)] pb-[var(--space-3)]">
            <div className="flex items-center justify-between">
              <p className="text-[length:var(--text-body-sm)] font-bold">
                분석 결과{" "}
                <span className="text-[var(--color-brand-500)]">{totalCount}</span>건
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-on-surface-muted)] hover:bg-[var(--color-neutral-100)]"
                aria-label="시트 접기"
              >
                &times;
              </button>
            </div>
            <div className="mt-[var(--space-2)]">
              <CardSelector value={sortBy} onChange={onSortChange} />
            </div>
          </div>

          {/* Scrollable card list — only scrollable when expanded */}
          <div
            ref={scrollRef}
            className={cn(
              "flex-1 px-[var(--space-4)]",
              activeSnap === SNAP_POINTS[2] ? "overflow-y-auto" : "overflow-hidden",
            )}
          >
            <div className="flex flex-col gap-3.5">
              {items.map((item) => (
                <PropertyCard
                  key={item.aptId}
                  item={item}
                  isSelected={selectedId === item.aptId}
                  onHover={onItemClick}
                  onClick={onItemClick}
                />
              ))}
            </div>

            {/* Disclaimer */}
            <p className="py-[var(--space-3)] text-center text-[10px] leading-relaxed text-[var(--color-on-surface-muted)]">
              공공데이터 기반 참고용 분석이며 실거래를 보장하지 않습니다
            </p>
          </div>

          {/* CompareBar — drawer footer, moves with the sheet */}
          <CompareBar className="relative bottom-auto z-auto" />
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}

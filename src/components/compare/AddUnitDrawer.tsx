"use client";

import { CircularGauge } from "@/components/score/CircularGauge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { useCompare } from "@/contexts/CompareContext";
import { useSessionPageData } from "./useSessionPageData";
import type { RecommendationItem } from "@/types/api";

interface AddUnitDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Drawer for adding a unit to the comparison.
 * Shows all session results excluding currently compared units.
 * Auto-closes when max units (3) is reached.
 */
export function AddUnitDrawer({ open, onOpenChange }: AddUnitDrawerProps) {
  const { items: compareItems, addItem, canAdd } = useCompare();
  const pageData = useSessionPageData();

  const availableItems = pageData.items.filter(
    (r) => !compareItems.some((c) => c.aptId === r.aptId),
  );

  function handleAdd(item: RecommendationItem) {
    addItem({ aptId: item.aptId, aptName: item.aptName, finalScore: item.finalScore });
    // Auto-close when max is reached after adding
    if (compareItems.length + 1 >= 3) {
      onOpenChange(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>단지 추가</DrawerTitle>
          <DrawerClose asChild>
            <button
              className="absolute right-[var(--space-4)] top-[var(--space-4)] min-h-[44px] min-w-[44px] rounded-[var(--radius-s7-full)] text-[var(--color-on-surface-muted)] hover:bg-[var(--color-surface-sunken)]"
              aria-label="닫기"
            >
              ✕
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="overflow-y-auto px-[var(--space-4)] pb-[var(--space-8)]">
          {!pageData.hasResults && (
            <p className="py-[var(--space-6)] text-center text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
              분석 결과가 없습니다. 먼저 분석을 실행해주세요.
            </p>
          )}

          {pageData.hasResults && availableItems.length === 0 && (
            <p className="py-[var(--space-6)] text-center text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
              추가할 수 있는 단지가 없습니다.
            </p>
          )}

          <ul className="space-y-[var(--space-3)]" role="list">
            {availableItems.map((item) => (
              <li
                key={item.aptId}
                className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-s7-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-3)]"
              >
                <CircularGauge score={item.finalScore} size="mini" animated={false} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[length:var(--text-body-sm)] font-semibold text-[var(--color-on-surface)]">
                    {item.aptName}
                  </p>
                  <p className="truncate text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                    {item.address}
                  </p>
                </div>
                <button
                  onClick={() => handleAdd(item)}
                  disabled={!canAdd}
                  className="min-h-[44px] min-w-[44px] shrink-0 rounded-[var(--radius-s7-md)] bg-[var(--color-primary)] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--text-caption)] font-medium text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`${item.aptName} 비교에 추가`}
                >
                  추가
                </button>
              </li>
            ))}
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

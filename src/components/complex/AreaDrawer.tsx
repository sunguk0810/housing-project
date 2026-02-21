"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/format";
import type { PyeongBracketSummary } from "@/lib/price-utils";

interface AreaDrawerProps {
  summaries: ReadonlyArray<PyeongBracketSummary>;
  selected: number | null;
  onSelect: (pyeong: number | null) => void;
  className?: string;
}

export function AreaDrawer({
  summaries,
  selected,
  onSelect,
  className,
}: AreaDrawerProps) {
  const [open, setOpen] = useState(false);

  if (summaries.length === 0) return null;

  const selectedLabel =
    selected === null
      ? "전체"
      : summaries.find((s) => s.value === selected)?.label ?? "전체";

  const handleSelect = (value: number | null) => {
    onSelect(value);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-[var(--radius-s7-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-3)] py-[var(--space-1)] text-[length:var(--text-body-sm)] font-medium text-[var(--color-on-surface)] transition-colors hover:border-[var(--color-brand-500)]",
            className,
          )}
          aria-label="평형 선택"
        >
          {selectedLabel}
          <ChevronDown size={14} className="text-[var(--color-on-surface-muted)]" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-lg">
        <DrawerHeader className="flex-row items-center justify-between text-left">
          <DrawerTitle className="text-[length:var(--text-subtitle)]">
            평형 선택
          </DrawerTitle>
          <DrawerClose asChild>
            <button
              type="button"
              className="rounded-[var(--radius-s7-md)] p-[var(--space-1)] text-[var(--color-on-surface-muted)] transition-colors hover:bg-[var(--color-neutral-100)]"
              aria-label="닫기"
            >
              <X size={20} />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="overflow-y-auto px-[var(--space-4)] pb-[var(--space-6)]">
          {/* "전체" option */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              "w-full rounded-[var(--radius-s7-lg)] border-l-[3px] px-[var(--space-4)] py-[var(--space-3)] text-left transition-colors",
              selected === null
                ? "border-l-[var(--color-brand-500)] bg-[var(--color-brand-500)]/5"
                : "border-l-transparent hover:bg-[var(--color-neutral-100)]",
            )}
          >
            <span className="text-[length:var(--text-body-sm)] font-semibold">
              전체
            </span>
          </button>

          {/* Bracket rows */}
          {summaries.map((s) => {
            const isSelected = selected === s.value;
            const areaText =
              s.areaMin === s.areaMax
                ? `전용 ${s.areaMin}㎡`
                : `전용 ${s.areaMin}~${s.areaMax}㎡`;

            return (
              <button
                key={s.value}
                type="button"
                onClick={() => handleSelect(s.value)}
                className={cn(
                  "mt-[var(--space-1)] flex w-full items-center gap-[var(--space-3)] rounded-[var(--radius-s7-lg)] border-l-[3px] px-[var(--space-4)] py-[var(--space-3)] text-left transition-colors",
                  isSelected
                    ? "border-l-[var(--color-brand-500)] bg-[var(--color-brand-500)]/5"
                    : "border-l-transparent hover:bg-[var(--color-neutral-100)]",
                )}
              >
                {/* Left: pyeong label */}
                <div className="w-[52px] shrink-0">
                  <p className="text-[length:var(--text-title)] font-bold tabular-nums">
                    {s.label}
                  </p>
                </div>

                {/* Center: area info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
                    {areaText}
                  </p>
                </div>

                {/* Right: prices */}
                <div className="shrink-0 text-right">
                  <p className="text-[length:var(--text-caption)] tabular-nums">
                    <span className="text-[var(--color-on-surface-muted)]">매매 </span>
                    <span className="font-medium">
                      {s.latestSalePrice != null
                        ? formatAmount(s.latestSalePrice)
                        : "-"}
                    </span>
                  </p>
                  <p className="text-[length:var(--text-caption)] tabular-nums">
                    <span className="text-[var(--color-on-surface-muted)]">전세 </span>
                    <span className="font-medium">
                      {s.latestJeonsePrice != null
                        ? formatAmount(s.latestJeonsePrice)
                        : "-"}
                    </span>
                  </p>
                  <p className="text-[length:var(--text-caption)] tabular-nums">
                    <span className="text-[var(--color-on-surface-muted)]">월세 </span>
                    <span className="font-medium">
                      {s.latestMonthlyPrice != null
                        ? formatAmount(s.latestMonthlyPrice)
                        : "-"}
                    </span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

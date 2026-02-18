"use client";

import { CircularGauge } from "@/components/score/CircularGauge";
import { ScoreBadge } from "@/components/score/ScoreBadge";
import { getBestAptIds } from "./compareUtils";
import { formatPrice, formatTradeTypeLabel, formatCommuteTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RecommendationItem } from "@/types/api";

interface AtAGlanceSectionProps {
  items: ReadonlyArray<RecommendationItem>;
}

const LABEL_CELL =
  "flex w-[72px] shrink-0 items-center bg-[var(--color-surface-sunken)] px-[var(--space-2)] py-[var(--space-3)] text-[10px] font-medium text-[var(--color-on-surface-muted)] lg:w-[160px] lg:px-[var(--space-3)] lg:py-[var(--space-4)] lg:text-[length:var(--text-caption)]";

export function AtAGlanceSection({ items }: AtAGlanceSectionProps) {
  const bestScoreIds = getBestAptIds(items, (item) => item.finalScore);
  const bestCommuteIds = getBestAptIds(items, (item) => -(item.commuteTime1 ?? 999));

  return (
    <section className="mt-[var(--space-8)]">
      <h2 className="mb-[var(--space-4)] text-[length:var(--text-subtitle)] font-bold text-[var(--color-on-surface)]">
        한눈에 비교
      </h2>

      <div className="overflow-hidden rounded-[var(--radius-s7-lg)] border border-[var(--color-border)]">
        {/* Row 1: 종합 등급 — gauge prominent, badge small */}
        <div className="flex">
          <div className={LABEL_CELL}>종합 등급</div>
          {items.map((item) => (
            <div
              key={`score-${item.aptId}`}
              className={cn(
                "flex flex-1 flex-col items-center gap-[var(--space-1)] px-[var(--space-1)] py-[var(--space-3)] lg:px-[var(--space-3)] lg:py-[var(--space-4)]",
                bestScoreIds.has(item.aptId) && "bg-[rgb(8_145_178_/_0.12)] ring-1 ring-inset ring-[var(--color-brand-300)]/30",
              )}
            >
              <CircularGauge score={item.finalScore} size="card" animated={false} showLabel={false} />
              <ScoreBadge score={item.finalScore} size="sm" className="scale-90" />
            </div>
          ))}
        </div>

        {/* Row 2: 가격 — smaller text, compact date badge */}
        <div className="flex border-t border-[var(--color-border)]">
          <div className={LABEL_CELL}>가격</div>
          {items.map((item) => (
            <div
              key={`price-${item.aptId}`}
              className="flex flex-1 flex-col items-center gap-[2px] px-[var(--space-1)] py-[var(--space-3)] lg:px-[var(--space-3)] lg:py-[var(--space-4)]"
            >
              <span className="inline-block rounded-[var(--radius-s7-full)] bg-[var(--color-surface-sunken)] px-[var(--space-2)] py-[1px] text-[10px] font-medium text-[var(--color-on-surface-muted)]">
                {formatTradeTypeLabel(item.tradeType)}
              </span>
              <span className="whitespace-nowrap text-[length:var(--text-body-sm)] font-bold tabular-nums leading-tight text-[var(--color-on-surface)] lg:text-[length:var(--text-body)]">
                {formatPrice(item.averagePrice)}
              </span>
              <span className="text-[9px] text-[var(--color-on-surface-muted)]">
                {item.sources.priceDate}
              </span>
            </div>
          ))}
        </div>

        {/* Row 3: 직장1 통근 시간 — matching reduced size */}
        <div className="flex border-t border-[var(--color-border)]">
          <div className={LABEL_CELL}>직장1 통근</div>
          {items.map((item) => (
            <div
              key={`commute-${item.aptId}`}
              className={cn(
                "flex flex-1 flex-col items-center gap-[2px] px-[var(--space-1)] py-[var(--space-3)] lg:px-[var(--space-3)] lg:py-[var(--space-4)]",
                bestCommuteIds.has(item.aptId) && "bg-[rgb(8_145_178_/_0.12)] ring-1 ring-inset ring-[var(--color-brand-300)]/30",
              )}
            >
              <span className="whitespace-nowrap text-[length:var(--text-body-sm)] font-bold tabular-nums leading-tight text-[var(--color-on-surface)] lg:text-[length:var(--text-body)]">
                {formatCommuteTime(item.commuteTime1)}
              </span>
              <span className="text-[10px] text-[var(--color-on-surface-muted)]">
                통근 시간
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

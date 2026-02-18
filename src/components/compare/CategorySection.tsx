"use client";

import type { ReactNode, ElementType } from "react";
import { CompareRow } from "./CompareRow";
import type { RecommendationItem } from "@/types/api";

export interface CompareRowConfig {
  label: string;
  render: (item: RecommendationItem, index: number) => ReactNode;
  highlight?: boolean;
  getValue?: (item: RecommendationItem) => number;
}

interface CategorySectionProps {
  title: string;
  icon?: ElementType;
  items: ReadonlyArray<RecommendationItem>;
  rows: CompareRowConfig[];
}

export function CategorySection({ title, icon: Icon, items, rows }: CategorySectionProps) {
  return (
    <section className="mt-[var(--space-8)]">
      <h2 className="mb-[var(--space-4)] flex items-center gap-[var(--space-2)] text-[length:var(--text-body-sm)] font-bold text-[var(--color-on-surface)] lg:text-[length:var(--text-subtitle)]">
        {Icon && <Icon size={18} aria-hidden="true" className="shrink-0 text-[var(--color-primary)]" />}
        {title}
      </h2>

      <div className="overflow-hidden rounded-[var(--radius-s7-lg)] border border-[var(--color-border)]">
        {rows.map((row) => (
          <CompareRow
            key={row.label}
            label={row.label}
            items={items}
            render={row.render}
            highlight={row.highlight}
            getValue={row.getValue}
          />
        ))}
      </div>
    </section>
  );
}

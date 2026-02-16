"use client";

import { BarChart3, Train, Building2, Calendar, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type SourceType = "public" | "transit" | "childcare" | "date" | "info";

interface DataSourceTagProps {
  type: SourceType;
  label: string;
  className?: string;
}

const ICON_MAP: Record<SourceType, React.ElementType> = {
  public: BarChart3,
  transit: Train,
  childcare: Building2,
  date: Calendar,
  info: Info,
};

const LABELS: Record<SourceType, string> = {
  public: "공공데이터",
  transit: "교통데이터",
  childcare: "보육데이터",
  date: "기준일",
  info: "참고 정보",
};

export function DataSourceTag({ type, label, className }: DataSourceTagProps) {
  const Icon = ICON_MAP[type];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-s7-full)]",
        "border border-[var(--color-border)] bg-[var(--color-surface-sunken)]",
        "px-[var(--space-2)] py-0.5 text-[length:var(--text-caption)]",
        "text-[var(--color-on-surface-muted)]",
        className,
      )}
      data-disclaimer="data-source"
    >
      <Icon size={12} />
      {label || LABELS[type]}
    </span>
  );
}

"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  variant?: "full" | "mini";
  className?: string;
}

export function TrustBadge({ variant = "full", className }: TrustBadgeProps) {
  if (variant === "mini") {
    return (
      <p
        className={cn(
          "flex items-center gap-1 text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]",
          className,
        )}
      >
        <Lock size={12} />
        입력 정보는 저장되지 않으며, 분석 후 즉시 폐기됩니다.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-[var(--space-3)] rounded-[var(--radius-s7-md)]",
        "bg-[var(--color-brand-50)] px-[var(--space-4)] py-[var(--space-3)]",
        className,
      )}
    >
      <Lock size={16} className="mt-0.5 shrink-0 text-[var(--color-brand-600)]" />
      <p className="text-[length:var(--text-caption)] leading-[var(--text-caption-lh)] text-[var(--color-brand-800)]">
        입력하신 정보는 분석 용도로만 사용되며, 서버에 저장되지 않습니다.
        세션 종료 시 모든 데이터가 자동으로 폐기됩니다.
      </p>
    </div>
  );
}

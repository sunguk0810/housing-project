"use client";

import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshPillProps {
  visible: boolean;
  onClick: () => void;
  className?: string;
}

export function RefreshPill({ visible, onClick, className }: RefreshPillProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-[var(--space-1)] rounded-[var(--radius-s7-full)]",
        "bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-2)]",
        "text-[length:var(--text-caption)] font-medium text-[var(--color-brand-500)]",
        "shadow-[var(--shadow-s7-md)]",
        "transition-opacity duration-200",
        "hover:bg-[var(--color-neutral-50)] active:scale-95",
        "animate-[fadeIn_200ms_var(--ease-out-default)]",
        className,
      )}
    >
      <RotateCw size={14} />
      이 지역 다시 분석
    </button>
  );
}

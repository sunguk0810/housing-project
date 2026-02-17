"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  className?: string;
}

export function Tooltip({ content, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={cn("relative inline-flex", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] transition-colors"
        aria-label="추가 정보"
        aria-expanded={open}
      >
        <Info size={14} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2",
            "w-max max-w-[240px] rounded-[var(--radius-s7-md)]",
            "bg-[var(--color-neutral-800)] px-[var(--space-3)] py-[var(--space-2)]",
            "text-[length:var(--text-caption)] leading-[var(--text-caption-lh)] text-white",
            "shadow-[var(--shadow-s7-md)]",
          )}
          style={{ animation: "fadeIn var(--duration-fast) ease" }}
          role="tooltip"
        >
          {content}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[var(--color-neutral-800)]" />
        </div>
      )}
    </div>
  );
}

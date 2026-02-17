"use client";

import { useState } from "react";
import { Info, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressiveDisclosureProps {
  summary: string;
  detail?: string;
  methodologyHref?: string;
}

export function ProgressiveDisclosure({
  summary,
  detail,
  methodologyHref,
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-[var(--radius-s7-md)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] p-[var(--space-3)]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-[var(--space-2)] text-left"
        aria-expanded={isOpen}
      >
        <Info size={14} className="shrink-0 text-[var(--color-on-surface-muted)]" />
        <span className="flex-1 text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          {summary}
        </span>
        {detail && (
          <ChevronDown
            size={14}
            className={cn(
              "shrink-0 text-[var(--color-on-surface-muted)] transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        )}
      </button>
      {detail && isOpen && (
        <div className="mt-[var(--space-2)] border-t border-[var(--color-border)] pt-[var(--space-2)]">
          <p className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)] leading-relaxed">
            {detail}
          </p>
          {methodologyHref && (
            <a
              href={methodologyHref}
              className="mt-[var(--space-1)] inline-block text-[length:var(--text-caption)] text-[var(--color-brand-500)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              방법론 보기
            </a>
          )}
        </div>
      )}
    </div>
  );
}

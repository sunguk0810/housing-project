"use client";

import Link from "next/link";
import { DISCLAIMER_TEXTS } from "@/lib/constants";

/**
 * Compare page footer: disclaimer text + navigation CTAs.
 */
export function CompareFooter() {
  return (
    <div className="mt-[var(--space-12)] border-t border-[var(--color-border)] px-[var(--space-4)] py-[var(--space-8)]">
      <p
        className="text-center text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]"
        data-disclaimer="compare-footer"
      >
        {DISCLAIMER_TEXTS.footer}
      </p>
      <div className="mt-[var(--space-6)] flex flex-wrap justify-center gap-[var(--space-3)]">
        <Link
          href="/results"
          className="rounded-[var(--radius-s7-md)] border border-[var(--color-border)] px-[var(--space-5)] py-[var(--space-3)] text-[length:var(--text-body-sm)] font-medium text-[var(--color-on-surface)] no-underline transition-colors hover:bg-[var(--color-surface-sunken)]"
          aria-label="분석 결과 페이지로 이동"
        >
          분석 결과로 돌아가기
        </Link>
        <Link
          href="/search"
          className="rounded-[var(--radius-s7-md)] bg-[var(--color-primary)] px-[var(--space-5)] py-[var(--space-3)] text-[length:var(--text-body-sm)] font-medium text-[var(--color-on-primary)] no-underline transition-colors hover:bg-[var(--color-primary-hover)]"
          aria-label="새로운 분석 시작"
        >
          다시 분석하기
        </Link>
      </div>
    </div>
  );
}

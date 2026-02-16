"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";

export function LandingContent() {
  useTracking({ name: "landing_unique_view" });

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-[var(--space-4)]">
      <div className="mx-auto max-w-2xl text-center">
        <h1
          className="mb-[var(--space-4)] tracking-[var(--text-display-ls)]"
          style={{
            fontSize: "var(--text-display)",
            lineHeight: "var(--text-display-lh)",
            fontWeight: "var(--text-display-weight)",
          }}
        >
          신혼부부를 위한
          <br />
          <span className="text-[var(--color-brand-500)]">주거 분석 서비스</span>
        </h1>

        <p className="mb-[var(--space-8)] text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
          소득, 자산, 직장 위치를 기반으로
          <br />
          나에게 맞는 단지를 공공 데이터로 분석합니다.
        </p>

        <Link
          href="/search"
          className="inline-flex items-center gap-[var(--space-2)] rounded-[var(--radius-s7-xl)] bg-[var(--color-primary)] px-[var(--space-8)] py-[var(--space-4)] text-[length:var(--text-subtitle)] font-semibold text-[var(--color-on-primary)] shadow-[var(--shadow-s7-md)] transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          분석 시작하기
          <ArrowRight size={20} />
        </Link>

        <p className="mt-[var(--space-6)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          입력 정보는 저장되지 않으며, 분석 후 즉시 폐기됩니다.
        </p>
      </div>
    </div>
  );
}

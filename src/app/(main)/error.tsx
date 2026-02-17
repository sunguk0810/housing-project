"use client";

import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MainLayoutError({ reset }: ErrorProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-[var(--space-4)]">
      <h2 className="text-[length:var(--text-title)] font-semibold text-[var(--color-on-surface)]">
        오류가 발생했습니다
      </h2>
      <p className="mt-[var(--space-2)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
        페이지를 불러오는 중 문제가 발생했습니다.
      </p>
      <div className="mt-[var(--space-6)] flex gap-[var(--space-3)]">
        <button
          onClick={reset}
          className="rounded-[var(--radius-s7-md)] bg-[var(--color-primary)] px-[var(--space-6)] py-[var(--space-3)] text-[var(--color-on-primary)]"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-[var(--radius-s7-md)] border border-[var(--color-neutral-300)] px-[var(--space-6)] py-[var(--space-3)] text-[var(--color-on-surface)]"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}

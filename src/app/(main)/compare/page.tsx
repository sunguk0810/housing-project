import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "단지 비교 | 집콕신혼",
  description: "선택한 단지들을 상세 비교합니다.",
};

export default function ComparePage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-[var(--space-4)]">
      <p className="text-[length:var(--text-title)] font-semibold">
        비교 기능 준비 중
      </p>
      <p className="mt-[var(--space-2)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
        단지 비교 기능은 곧 제공될 예정입니다.
      </p>
      <Link
        href="/results"
        className="mt-[var(--space-6)] rounded-[var(--radius-s7-md)] bg-[var(--color-primary)] px-[var(--space-6)] py-[var(--space-3)] text-[var(--color-on-primary)] no-underline"
      >
        분석 결과로 돌아가기
      </Link>
    </div>
  );
}

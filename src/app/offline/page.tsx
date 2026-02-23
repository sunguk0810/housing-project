import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오프라인 | 집콕신혼",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-[var(--space-4)] px-[var(--space-4)] text-center">
      <div className="rounded-[var(--radius-s7-lg)] bg-[var(--color-surface-elevated)] p-[var(--space-6)]">
        <p className="text-[length:var(--text-title)] font-bold text-[var(--color-on-surface)]">
          인터넷 연결이 필요합니다
        </p>
        <p className="mt-[var(--space-2)] text-[length:var(--text-body)] text-[var(--color-on-surface-muted)]">
          네트워크에 연결된 후 다시 시도해 주세요.
        </p>
        <p className="mt-[var(--space-2)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
          이전에 조회한 분석 결과는 캐시에서 확인할 수 있습니다.
        </p>
      </div>
    </main>
  );
}

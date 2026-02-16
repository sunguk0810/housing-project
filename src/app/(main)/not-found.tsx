import Link from "next/link";

export default function MainNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-[var(--space-4)]">
      <h1 className="text-[length:var(--text-heading)] font-bold text-[var(--color-on-surface)]">
        404
      </h1>
      <p className="mt-[var(--space-2)] text-[length:var(--text-body)] text-[var(--color-on-surface-muted)]">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
      <Link
        href="/"
        className="mt-[var(--space-6)] rounded-[var(--radius-s7-md)] bg-[var(--color-primary)] px-[var(--space-6)] py-[var(--space-3)] text-[var(--color-on-primary)]"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}

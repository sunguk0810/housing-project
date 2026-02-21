import Link from "next/link";
import { DISCLAIMER_TEXTS } from "@/lib/constants";
import { Logo } from "@/components/common/Logo";

export function Footer() {
  return (
    <footer
      className="border-t border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-[var(--space-4)] pt-[var(--space-8)] pb-20 lg:pb-[var(--space-8)]"
    >
      <div className="mx-auto max-w-5xl">
        <Logo size="md" className="mb-[var(--space-6)]" />
        {/* Disclaimer touch-point 1 */}
        <p
          className="mb-[var(--space-4)] text-[length:var(--text-caption)] leading-[var(--text-caption-lh)] text-[var(--color-on-surface-muted)]"
          data-disclaimer="footer"
        >
          {DISCLAIMER_TEXTS.footer}
        </p>
        <nav className="flex gap-[var(--space-4)]">
          <Link
            href="/terms"
            className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)] underline-offset-2 hover:underline"
          >
            이용약관
          </Link>
          <Link
            href="/privacy"
            className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)] underline-offset-2 hover:underline"
          >
            개인정보처리방침
          </Link>
          <Link
            href="/location-terms"
            className="text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)] underline-offset-2 hover:underline"
          >
            위치정보 이용약관
          </Link>
        </nav>
      </div>
    </footer>
  );
}

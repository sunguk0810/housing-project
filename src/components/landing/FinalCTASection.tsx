import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export function FinalCTASection() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden bg-gradient-to-b from-[var(--color-brand-50)] via-[var(--color-brand-50)] to-white py-16 dark:from-[var(--color-surface-sunken)] dark:via-[var(--color-surface-sunken)] dark:to-[var(--color-surface)] lg:py-24"
    >
      {/* Decorative circles — visible teal glow */}
      <div
        className="pointer-events-none absolute -top-16 -left-16 h-72 w-72 rounded-full opacity-40 blur-[80px] dark:opacity-15"
        style={{ background: "var(--color-brand-200)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full opacity-40 blur-[80px] dark:opacity-15"
        style={{ background: "var(--color-brand-200)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-[var(--space-4)]">
        <ScrollReveal>
          <div className="flex flex-col items-center text-center">
            <h2
              id="final-cta-heading"
              className="mb-[var(--space-3)] tracking-[var(--text-display-ls)]"
              style={{
                fontSize: "var(--text-heading)",
                lineHeight: "var(--text-heading-lh)",
                fontWeight: "var(--text-heading-weight)",
              }}
            >
              우리 부부에게 맞는 동네,
              <br />
              지금 찾아보세요
            </h2>

            <p className="mb-[var(--space-6)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
              3분이면 충분해요
            </p>

            <Link
              href="/search"
              className="group inline-flex min-h-[52px] w-full items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-s7-xl)] bg-[var(--color-brand-500)] px-[var(--space-8)] py-[var(--space-4)] text-[length:var(--text-subtitle)] font-semibold text-white shadow-[0_4px_16px_rgb(8_145_178/0.35)] transition-all duration-300 hover:scale-[1.02] hover:bg-[var(--color-brand-600)] hover:shadow-[0_6px_24px_rgb(8_145_178/0.45)] lg:w-auto lg:px-12"
            >
              무료 분석 시작하기
              <ArrowRight
                size={20}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <p className="mt-[var(--space-4)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)]">
              회원가입 없이 바로 시작
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

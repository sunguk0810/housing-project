import { ScrollReveal } from "./ScrollReveal";
import { CountUp } from "./CountUp";

const DATA_SOURCES = [
  { emoji: "🏛", label: "국토교통부 실거래가" },
  { emoji: "🚇", label: "대중교통 경로 API" },
  { emoji: "📊", label: "공공데이터포털" },
] as const;

export function TrustSection() {
  return (
    <section
      aria-labelledby="trust-heading"
      className="border-t border-[var(--color-border)] bg-white py-[var(--space-12)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] lg:py-20"
    >
      <div className="mx-auto max-w-5xl px-[var(--space-4)]">
        <ScrollReveal>
          <h2
            id="trust-heading"
            className="mb-[var(--space-8)] text-center tracking-[var(--text-heading-ls)]"
            style={{
              fontSize: "var(--text-heading)",
              lineHeight: "var(--text-heading-lh)",
              fontWeight: "var(--text-heading-weight)",
            }}
          >
            공공 데이터 기반, 신뢰할 수 있는 분석
          </h2>
        </ScrollReveal>

        {/* Data sources as horizontal pills */}
        <ScrollReveal>
          <div className="mb-[var(--space-8)] flex flex-wrap justify-center gap-[var(--space-2)]">
            {DATA_SOURCES.map((source) => (
              <div
                key={source.label}
                className="inline-flex items-center gap-[var(--space-2)] rounded-[var(--radius-s7-full)] border border-[var(--color-border)] bg-[var(--color-neutral-50)] px-[var(--space-4)] py-[var(--space-2)] dark:bg-[var(--color-surface-elevated)]"
              >
                <span className="text-lg" role="img" aria-hidden="true">
                  {source.emoji}
                </span>
                <span
                  className="text-[var(--color-on-surface-muted)]"
                  style={{
                    fontSize: "var(--text-caption)",
                    lineHeight: "var(--text-caption-lh)",
                    fontWeight: "var(--text-caption-weight)",
                  }}
                >
                  {source.label}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Counter with decorative frame */}
        <ScrollReveal>
          <div className="mx-auto mb-[var(--space-8)] max-w-sm rounded-[var(--radius-s7-xl)] bg-gradient-to-r from-[var(--color-brand-50)] to-white p-[var(--space-5)] text-center dark:from-[var(--color-surface-elevated)] dark:to-[var(--color-surface)]">
            <p
              className="mb-[var(--space-1)]"
              style={{
                fontSize: "var(--text-heading)",
                lineHeight: "var(--text-heading-lh)",
                fontWeight: "var(--text-heading-weight)",
              }}
            >
              <span className="text-[var(--color-brand-500)]">
                <CountUp target={1847} suffix="쌍" />
              </span>
            </p>
            <p
              className="text-[var(--color-on-surface-muted)]"
              style={{
                fontSize: "var(--text-body-sm)",
                lineHeight: "var(--text-body-sm-lh)",
              }}
            >
              의 신혼부부가 분석을 시작했어요
            </p>
          </div>
        </ScrollReveal>

        {/* Privacy badge */}
        <ScrollReveal>
          <div className="mb-[var(--space-6)] flex justify-center">
            <div className="inline-flex items-center gap-[var(--space-2)] rounded-[var(--radius-s7-full)] bg-[var(--color-neutral-100)] px-[var(--space-4)] py-[var(--space-2)] dark:bg-[var(--color-surface-elevated)]">
              <span role="img" aria-hidden="true">🔒</span>
              <span
                className="text-[var(--color-on-surface-muted)]"
                style={{
                  fontSize: "var(--text-body-sm)",
                  lineHeight: "var(--text-body-sm-lh)",
                }}
              >
                입력 정보는 분석 후 즉시 삭제돼요
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Disclaimer (required - PHASE0 compliance) */}
        <ScrollReveal>
          <p
            data-disclaimer="landing-trust"
            className="text-center text-[var(--color-neutral-400)]"
            style={{
              fontSize: "var(--text-caption)",
              lineHeight: "var(--text-caption-lh)",
            }}
          >
            본 서비스는 정보 제공 목적이며, 투자 판단의 근거로 사용할 수 없습니다.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

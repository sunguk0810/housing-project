import { ScrollReveal } from "./ScrollReveal";

const CATEGORIES = [
  {
    emoji: "💰",
    heading: "대출 부담 분석",
    desc: "소득 대비 대출 상환 비율, 실거래가 추이",
    metric: "DSR 32%",
    accent: "var(--color-warning)",
    emojiBg: "#FEF3C7",
  },
  {
    emoji: "🚇",
    heading: "통근 시간 분석",
    desc: "두 직장까지 대중교통 통근 시간",
    metric: "강남 28분",
    accent: "var(--color-brand-500)",
    emojiBg: "var(--color-brand-50)",
  },
  {
    emoji: "👶",
    heading: "보육 환경 분석",
    desc: "어린이집, 유치원, 초등학교 접근성",
    metric: "반경 500m 12곳",
    accent: "var(--color-success)",
    emojiBg: "#D1FAE5",
  },
  {
    emoji: "🛡",
    heading: "안전 환경 분석",
    desc: "CPTED, 대중교통 야간 접근성",
    metric: "안전 충분",
    accent: "#6366F1",
    emojiBg: "#EEF2FF",
  },
] as const;

export function CategoriesSection() {
  return (
    <section
      aria-labelledby="categories-heading"
      className="border-t border-[var(--color-border)] bg-white py-[var(--space-12)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] lg:py-20"
    >
      <div className="mx-auto max-w-5xl px-[var(--space-4)]">
        <ScrollReveal>
          <h2
            id="categories-heading"
            className="mb-[var(--space-2)] text-center tracking-[var(--text-heading-ls)]"
            style={{
              fontSize: "var(--text-heading)",
              lineHeight: "var(--text-heading-lh)",
              fontWeight: "var(--text-heading-weight)",
            }}
          >
            4가지 관점으로 분석해요
          </h2>
          <p className="mb-[var(--space-8)] text-center text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
            공공 데이터 기반의 객관적인 분석 결과를 제공해요
          </p>
        </ScrollReveal>

        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-[var(--space-3)] lg:gap-[var(--space-5)]">
          {CATEGORIES.map((cat, i) => (
            <ScrollReveal key={cat.heading} delay={i * 100}>
              <div
                className="overflow-hidden rounded-[var(--radius-s7-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-s7-md)] dark:bg-[var(--color-surface-elevated)]"
              >
                {/* Colored top bar */}
                <div className="h-1" style={{ backgroundColor: cat.accent }} />

                <div className="p-[var(--space-3)] lg:p-[var(--space-5)]">
                  {/* Emoji in colored square */}
                  <div
                    className="mb-[var(--space-2)] flex h-9 w-9 items-center justify-center rounded-[var(--radius-s7-md)] text-lg lg:mb-[var(--space-3)] lg:h-10 lg:w-10 lg:text-xl"
                    style={{ backgroundColor: cat.emojiBg }}
                  >
                    <span role="img" aria-hidden="true">{cat.emoji}</span>
                  </div>

                  {/* Heading */}
                  <h3
                    className="mb-[var(--space-1)]"
                    style={{
                      fontSize: "var(--text-body-sm)",
                      lineHeight: "var(--text-body-sm-lh)",
                      fontWeight: "var(--text-subtitle-weight)",
                    }}
                  >
                    {cat.heading}
                  </h3>

                  {/* Description */}
                  <p
                    className="mb-[var(--space-2)] text-[var(--color-on-surface-muted)]"
                    style={{
                      fontSize: "var(--text-caption)",
                      lineHeight: "var(--text-caption-lh)",
                    }}
                  >
                    {cat.desc}
                  </p>

                  {/* Metric badge */}
                  <div
                    className="inline-flex rounded-[var(--radius-s7-full)] px-[var(--space-2)] py-[2px]"
                    style={{ backgroundColor: cat.emojiBg }}
                  >
                    <span
                      className="text-[length:var(--text-caption)] font-semibold"
                      style={{ color: cat.accent }}
                    >
                      {cat.metric}
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

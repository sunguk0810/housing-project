import { ScrollReveal } from "./ScrollReveal";

const STEPS = [
  { num: 1, emoji: "📝", title: "정보 입력", desc: "부부 소득, 통근지, 선호 조건을 입력해요" },
  { num: 2, emoji: "📊", title: "AI 분석", desc: "예산·통근·보육·안전 4가지 관점으로 분석해요" },
  { num: 3, emoji: "🗺️", title: "결과 탐색", desc: "지도에서 우리에게 맞는 동네를 탐색해요" },
] as const;

export function StepsSection() {
  return (
    <section
      aria-labelledby="steps-heading"
      className="bg-[var(--color-neutral-50)] py-[var(--space-12)] dark:bg-[var(--color-surface-sunken)] lg:py-20"
    >
      <div className="mx-auto max-w-5xl px-[var(--space-4)]">
        <ScrollReveal>
          <h2
            id="steps-heading"
            className="mb-[var(--space-2)] text-center tracking-[var(--text-heading-ls)]"
            style={{
              fontSize: "var(--text-heading)",
              lineHeight: "var(--text-heading-lh)",
              fontWeight: "var(--text-heading-weight)",
            }}
          >
            3단계로 간단하게
          </h2>
          <p className="mb-[var(--space-10)] text-center text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
            복잡한 정보 수집, 저희가 대신할게요
          </p>
        </ScrollReveal>

        {/* Mobile: Timeline layout / Desktop: Horizontal cards */}
        <div className="flex flex-col lg:flex-row lg:gap-6">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 120} className="flex-1">
              {/* Mobile: left-aligned timeline */}
              <div className="relative flex gap-[var(--space-4)] pb-[var(--space-8)] lg:flex-col lg:items-center lg:gap-[var(--space-3)] lg:pb-0 lg:text-center">
                {/* Timeline connector line (mobile only, except last) */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute top-11 left-[21px] h-[calc(100%-44px)] w-0.5 bg-[var(--color-brand-100)] lg:hidden dark:bg-[var(--color-brand-800)]"
                    aria-hidden="true"
                  />
                )}

                {/* Number badge */}
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-500)] text-[length:var(--text-body)] font-bold text-white shadow-[0_2px_8px_rgb(8_145_178/0.3)]">
                  {step.num}
                </div>

                {/* Content */}
                <div className="pt-[var(--space-1)] lg:pt-0">
                  {/* Emoji */}
                  <span
                    className="mb-[var(--space-1)] block text-3xl lg:mb-[var(--space-2)] lg:text-4xl"
                    role="img"
                    aria-hidden="true"
                  >
                    {step.emoji}
                  </span>

                  {/* Title */}
                  <h3
                    className="mb-[var(--space-1)]"
                    style={{
                      fontSize: "var(--text-subtitle)",
                      lineHeight: "var(--text-subtitle-lh)",
                      fontWeight: "var(--text-subtitle-weight)",
                    }}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-[var(--color-on-surface-muted)]"
                    style={{
                      fontSize: "var(--text-body-sm)",
                      lineHeight: "var(--text-body-sm-lh)",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>

                {/* Desktop connector (except last) */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute top-5 -right-3 hidden h-0.5 w-6 bg-[var(--color-brand-100)] lg:block dark:bg-[var(--color-brand-800)]"
                    aria-hidden="true"
                  />
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { ScrollReveal } from "./ScrollReveal";

const PROBLEMS = [
  {
    emoji: "💰",
    title: "예산 불확실",
    text: "대출 가능한 집이 어디까지인지 모르겠어요",
    accent: "var(--color-warning)",
    bg: "#FEF3C7",
    darkBg: "rgb(217 119 6 / 0.15)",
  },
  {
    emoji: "🚇",
    title: "통근 양립 난제",
    text: "둘 다 출퇴근 가능한 동네를 찾기 어려워요",
    accent: "var(--color-brand-500)",
    bg: "var(--color-brand-50)",
    darkBg: "rgb(8 145 178 / 0.15)",
  },
  {
    emoji: "👶",
    title: "육아 정보 부족",
    text: "아이 키우기 좋은 동네인지 직접 다 알아봐야 해요",
    accent: "var(--color-success)",
    bg: "#D1FAE5",
    darkBg: "rgb(5 150 105 / 0.15)",
  },
] as const;

export function ProblemSection() {
  return (
    <section
      aria-labelledby="problem-heading"
      className="border-t border-[var(--color-border)] bg-white py-[var(--space-12)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] lg:py-20"
    >
      <div className="mx-auto max-w-5xl px-[var(--space-4)]">
        <ScrollReveal>
          <h2
            id="problem-heading"
            className="mb-[var(--space-2)] text-center tracking-[var(--text-heading-ls)]"
            style={{
              fontSize: "var(--text-heading)",
              lineHeight: "var(--text-heading-lh)",
              fontWeight: "var(--text-heading-weight)",
            }}
          >
            집 구하기, 왜 이렇게 어려울까요?
          </h2>
          <p
            className="mb-[var(--space-8)] text-center text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]"
          >
            신혼부부라면 누구나 겪는 고민이에요
          </p>
        </ScrollReveal>

        <div className="flex flex-col gap-[var(--space-4)] lg:flex-row lg:gap-6">
          {PROBLEMS.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 100} className="flex-1">
              <div
                className="rounded-[var(--radius-s7-xl)] border-l-4 bg-[var(--color-neutral-50)] p-[var(--space-5)] dark:bg-[var(--color-surface-elevated)]"
                style={{ borderLeftColor: item.accent }}
              >
                {/* Emoji in colored circle */}
                <div
                  className="mb-[var(--space-3)] flex h-12 w-12 items-center justify-center rounded-[var(--radius-s7-lg)] text-2xl"
                  style={{ backgroundColor: item.bg }}
                >
                  <span role="img" aria-hidden="true" className="dark:brightness-90">
                    {item.emoji}
                  </span>
                </div>

                {/* Title */}
                <p
                  className="mb-[var(--space-1)]"
                  style={{
                    fontSize: "var(--text-body)",
                    fontWeight: "var(--text-subtitle-weight)",
                    lineHeight: "var(--text-body-lh)",
                  }}
                >
                  {item.title}
                </p>

                {/* Description */}
                <p
                  className="text-[var(--color-on-surface-muted)]"
                  style={{
                    fontSize: "var(--text-body-sm)",
                    lineHeight: "var(--text-body-sm-lh)",
                  }}
                >
                  {item.text}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BARS = [
  { label: "예산", value: 78, color: "var(--color-brand-400)" },
  { label: "통근", value: 92, color: "var(--color-brand-500)" },
  { label: "보육", value: 85, color: "var(--color-brand-400)" },
  { label: "안전", value: 88, color: "var(--color-brand-500)" },
] as const;

function ScoreGauge({ score }: { score: number }) {
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      {/* Background track */}
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="var(--color-neutral-100)"
        strokeWidth="8"
        className="dark:stroke-[var(--color-surface-sunken)]"
      />
      {/* Progress arc */}
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="var(--color-brand-400)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 48 48)"
      />
      {/* Score text */}
      <text
        x="48"
        y="44"
        textAnchor="middle"
        fill="var(--color-brand-500)"
        fontSize="24"
        fontWeight="700"
      >
        {score}
      </text>
      <text
        x="48"
        y="60"
        textAnchor="middle"
        fill="var(--color-on-surface-muted)"
        fontSize="10"
      >
        / 100
      </text>
    </svg>
  );
}

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-[var(--color-brand-50)] via-[var(--color-brand-50)] to-white dark:from-[var(--color-surface-sunken)] dark:via-[var(--color-surface-sunken)] dark:to-[var(--color-surface)]"
    >
      {/* Decorative radial glow — visible teal atmosphere */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 dark:opacity-25"
        style={{
          width: "700px",
          height: "700px",
          background: "radial-gradient(circle, var(--color-brand-100) 0%, var(--color-brand-50) 40%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-[var(--space-4)] pt-[var(--space-10)] pb-[var(--space-12)] lg:flex-row lg:gap-12 lg:pt-16 lg:pb-20">
        {/* Text column */}
        <div className="flex-1 text-center lg:text-left">
          <h1
            id="hero-heading"
            className="mb-[var(--space-4)] tracking-[var(--text-display-ls)] animate-[fadeSlideUp_600ms_var(--ease-out-expo)_0ms_both]"
            style={{
              fontSize: "var(--text-display)",
              lineHeight: "var(--text-display-lh)",
              fontWeight: "var(--text-display-weight)",
            }}
          >
            신혼부부 맞춤 동네,
            <br />
            <span className="text-[var(--color-brand-500)]">데이터로 찾아드려요</span>
          </h1>

          <p
            className="mb-[var(--space-6)] text-[var(--color-on-surface-muted)] animate-[fadeSlideUp_600ms_var(--ease-out-expo)_100ms_both]"
            style={{
              fontSize: "var(--text-body)",
              lineHeight: "var(--text-body-lh)",
            }}
          >
            예산·통근·보육·안전, 4가지 관점으로 분석해요
          </p>

          <div className="animate-[fadeSlideUp_600ms_var(--ease-out-expo)_200ms_both]">
            <Link
              href="/search"
              className="group inline-flex min-h-[52px] w-full items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-s7-xl)] bg-[var(--color-brand-500)] px-[var(--space-8)] py-[var(--space-4)] text-[length:var(--text-subtitle)] font-semibold text-white shadow-[0_4px_16px_rgb(8_145_178/0.35)] transition-all duration-300 hover:scale-[1.02] hover:bg-[var(--color-brand-600)] hover:shadow-[0_6px_24px_rgb(8_145_178/0.45)] lg:w-auto"
            >
              무료 분석 시작하기
              <ArrowRight
                size={20}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <p className="mt-[var(--space-4)] text-[length:var(--text-caption)] text-[var(--color-on-surface-muted)] animate-[fadeSlideUp_600ms_var(--ease-out-expo)_300ms_both]">
            3분이면 충분해요 · 회원가입 없이 시작
          </p>
        </div>

        {/* Visual mockup column */}
        <div className="mt-[var(--space-8)] flex flex-1 justify-center lg:mt-0 animate-[fadeSlideUp_600ms_var(--ease-out-expo)_400ms_both]">
          <div
            className="relative w-full max-w-xs rotate-1 rounded-[20px] bg-white p-[var(--space-6)] shadow-[0_16px_48px_rgb(8_145_178/0.2),0_4px_12px_rgb(0_0_0/0.06)] dark:bg-[var(--color-surface-elevated)]"
            role="img"
            aria-label="분석 결과 미리보기"
          >
            {/* Subtle brand glow behind card */}
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] opacity-50 blur-2xl dark:opacity-20"
              style={{ background: "var(--color-brand-100)" }}
              aria-hidden="true"
            />

            {/* Gauge + label */}
            <div className="mb-[var(--space-5)] flex items-center gap-[var(--space-4)]">
              <ScoreGauge score={85} />
              <div>
                <p
                  style={{
                    fontSize: "var(--text-subtitle)",
                    fontWeight: "var(--text-subtitle-weight)",
                  }}
                >
                  종합 적합도
                </p>
                <span className="mt-[var(--space-1)] inline-block rounded-[var(--radius-s7-full)] bg-[var(--color-score-excellent-subtle)] px-[var(--space-2)] py-[2px] text-[length:var(--text-caption)] font-semibold text-[var(--color-score-excellent-fg)]">
                  우수
                </span>
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-[var(--space-3)]">
              {BARS.map((bar) => (
                <div key={bar.label} className="flex items-center gap-[var(--space-3)]">
                  <span className="w-8 text-[length:var(--text-caption)] font-medium text-[var(--color-on-surface-muted)]">
                    {bar.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-neutral-100)] dark:bg-[var(--color-surface-sunken)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${bar.value}%`,
                        backgroundColor: bar.color,
                      }}
                    />
                  </div>
                  <span className="w-7 text-right text-[length:var(--text-caption)] font-semibold text-[var(--color-on-surface)]">
                    {bar.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

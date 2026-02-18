import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export function PreviewSection() {
  return (
    <section
      aria-labelledby="preview-heading"
      className="bg-[var(--color-neutral-50)] py-[var(--space-12)] dark:bg-[var(--color-surface-sunken)] lg:py-20"
    >
      <div className="mx-auto max-w-5xl px-[var(--space-4)]">
        <ScrollReveal>
          <h2
            id="preview-heading"
            className="mb-[var(--space-2)] text-center tracking-[var(--text-heading-ls)]"
            style={{
              fontSize: "var(--text-heading)",
              lineHeight: "var(--text-heading-lh)",
              fontWeight: "var(--text-heading-weight)",
            }}
          >
            이런 결과를 확인할 수 있어요
          </h2>
          <p className="mb-[var(--space-8)] text-center text-[length:var(--text-body-sm)] text-[var(--color-on-surface-muted)]">
            실제 분석 화면을 미리 살펴보세요
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mx-auto max-w-sm">
            {/* Phone frame */}
            <div className="overflow-hidden rounded-[24px] border-[3px] border-[var(--color-neutral-800)] bg-[var(--color-neutral-800)] shadow-[var(--shadow-s7-lg)] dark:border-[var(--color-neutral-600)]">
              {/* Phone notch */}
              <div className="mx-auto h-[6px] w-24 rounded-b-full bg-[var(--color-neutral-700)]" aria-hidden="true" />

              {/* Screen content */}
              <div
                className="relative bg-white dark:bg-[var(--color-surface-elevated)]"
                role="img"
                aria-label="분석 결과 화면 미리보기"
              >
                {/* Lightly blurred mockup content — visible enough to tease */}
                <div className="p-[var(--space-4)] blur-[0.5px]">
                  {/* Map placeholder */}
                  <div className="mb-[var(--space-3)] h-36 rounded-[var(--radius-s7-lg)] bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-neutral-100)] dark:from-[var(--color-surface-sunken)] dark:to-[var(--color-surface)]">
                    <div className="flex h-full items-center justify-center">
                      <div className="space-y-[var(--space-1)] text-center">
                        <svg className="mx-auto h-6 w-6 text-[var(--color-brand-300)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="text-[10px] text-[var(--color-on-surface-muted)]">지도 영역</span>
                      </div>
                    </div>
                  </div>

                  {/* Score cards row */}
                  <div className="mb-[var(--space-3)] grid grid-cols-4 gap-[var(--space-2)]">
                    {[
                      { label: "예산", score: "78" },
                      { label: "통근", score: "92" },
                      { label: "보육", score: "85" },
                      { label: "안전", score: "88" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[var(--radius-s7-md)] bg-[var(--color-neutral-50)] p-[var(--space-2)] text-center dark:bg-[var(--color-surface-sunken)]"
                      >
                        <p className="text-[10px] text-[var(--color-on-surface-muted)]">{item.label}</p>
                        <p className="text-sm font-bold text-[var(--color-brand-500)]">{item.score}</p>
                      </div>
                    ))}
                  </div>

                  {/* Result list items */}
                  <div className="space-y-[var(--space-2)]">
                    {["성동구 옥수동", "마포구 합정동", "영등포구 여의도동"].map((name) => (
                      <div key={name} className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-s7-md)] bg-[var(--color-neutral-50)] p-[var(--space-2)] dark:bg-[var(--color-surface-sunken)]">
                        <div className="h-8 w-8 rounded-full bg-[var(--color-brand-50)]" />
                        <div className="flex-1">
                          <p className="text-xs font-medium">{name}</p>
                          <p className="text-[10px] text-[var(--color-on-surface-muted)]">종합 85점</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gradient overlay + CTA — bottom-heavy so top content peeks through */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/30 via-white/50 to-white/80 dark:from-[rgb(15_23_42/0.3)] dark:via-[rgb(15_23_42/0.5)] dark:to-[rgb(15_23_42/0.8)]">
                  <p
                    className="mb-[var(--space-3)] text-center"
                    style={{
                      fontSize: "var(--text-subtitle)",
                      fontWeight: "var(--text-subtitle-weight)",
                      lineHeight: "var(--text-subtitle-lh)",
                    }}
                  >
                    분석 결과를
                    <br />
                    직접 확인해보세요
                  </p>
                  <Link
                    href="/search"
                    className="group inline-flex items-center gap-[var(--space-1)] rounded-[var(--radius-s7-full)] bg-[var(--color-brand-500)] px-[var(--space-5)] py-[var(--space-2)] text-[length:var(--text-body-sm)] font-semibold text-white shadow-[0_4px_12px_rgb(8_145_178/0.3)] transition-all duration-300 hover:bg-[var(--color-brand-600)]"
                  >
                    시작하기
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

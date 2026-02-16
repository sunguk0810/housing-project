import type { Metadata } from "next";
import { DISCLAIMER_TEXTS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "이용약관 | 집콕신혼",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-[var(--space-4)] py-[var(--space-10)]">
      <h1 className="mb-[var(--space-8)] text-[length:var(--text-heading)] font-[var(--text-heading-weight)]">
        이용약관
      </h1>

      <section className="space-y-[var(--space-6)]">
        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            제1조 (목적)
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            본 약관은 집콕신혼(이하 &ldquo;서비스&rdquo;)의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
          </p>
        </article>

        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            제2조 (서비스의 성격)
          </h2>
          {/* Disclaimer touch-point 5 */}
          <p
            className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]"
            data-disclaimer="terms-service"
          >
            {DISCLAIMER_TEXTS.termsService}
          </p>
        </article>

        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            제3조 (이용자의 의무)
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            이용자는 본 서비스에서 제공하는 정보를 참고 자료로만 활용하여야 하며,
            실제 부동산 거래 시에는 공인중개사 등 전문가의 조언을 구해야 합니다.
          </p>
        </article>

        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            제4조 (면책)
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            본 서비스는 공공 데이터를 기반으로 분석 결과를 제공하며,
            데이터의 정확성, 완전성, 시의성을 보장하지 않습니다.
            서비스 이용으로 발생하는 손해에 대해 책임지지 않습니다.
          </p>
        </article>

        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            제5조 (데이터 출처)
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            본 서비스는 공공데이터포털, 국토교통부 실거래가 공개시스템,
            KOSIS 등 공공기관에서 제공하는 데이터를 활용합니다.
          </p>
        </article>
      </section>
    </div>
  );
}

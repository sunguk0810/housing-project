import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 집콕신혼",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-[var(--space-4)] py-[var(--space-10)]">
      <h1 className="mb-[var(--space-8)] text-[length:var(--text-heading)] font-[var(--text-heading-weight)]">
        개인정보처리방침
      </h1>

      <section className="space-y-[var(--space-6)]">
        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            1. 개인정보의 수집 및 이용
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            본 서비스는 개인정보를 수집하지 않습니다. 이용자가 입력하는 소득, 자산, 직장 위치 등의 정보는
            분석 용도로만 사용되며, 서버에 저장되지 않습니다.
          </p>
        </article>

        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            2. 개인정보의 저장
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            본 서비스는 PII(개인식별정보)를 데이터베이스, 로그, APM 등 어떠한 파이프라인에도 저장하지 않습니다.
            이용자의 입력 정보는 브라우저의 세션 스토리지에만 임시 보관되며,
            브라우저 탭 종료 시 자동으로 삭제됩니다.
          </p>
        </article>

        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            3. 쿠키 및 추적 기술
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            본 서비스는 서비스 개선을 위해 익명화된 이용 통계를 수집할 수 있습니다.
            이 과정에서 개인을 식별할 수 있는 정보는 수집되지 않습니다.
          </p>
        </article>

        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            4. 제3자 서비스
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            본 서비스는 카카오맵 API를 활용하여 지도 및 주소 검색 기능을 제공합니다.
            카카오맵 이용 시 카카오의 개인정보처리방침이 적용됩니다.
          </p>
        </article>

        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            5. 문의
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            개인정보 관련 문의 사항은 서비스 내 문의 채널을 통해 접수해 주시기 바랍니다.
          </p>
        </article>
      </section>
    </div>
  );
}

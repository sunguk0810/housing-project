import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "위치정보 이용약관 | 집콕신혼",
};

export default function LocationTermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-[var(--space-4)] py-[var(--space-10)]">
      <h1 className="mb-[var(--space-8)] text-[length:var(--text-heading)] font-[var(--text-heading-weight)]">
        위치정보 이용약관
      </h1>

      <section className="space-y-[var(--space-6)]">
        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            1. 위치정보의 수집 및 이용
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            본 서비스는 이용자의 직장 위치를 주소 형태로 입력받아
            통근 시간 분석에 활용합니다. 직접적인 GPS 좌표는 수집하지 않으며,
            입력된 주소의 좌표 변환은 분석 과정에서만 일시적으로 사용됩니다.
          </p>
        </article>

        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            2. 좌표 정보의 비저장
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            이용자가 입력한 주소에서 변환된 좌표 정보는 서버에 저장되지 않습니다.
            분석 요청 처리 후 즉시 폐기되며, 어떠한 형태로도 보관되지 않습니다.
          </p>
        </article>

        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            3. 제3자 제공
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            위치 정보는 카카오맵 API를 통한 좌표 변환 목적으로만 활용되며,
            그 외 제3자에게 제공되지 않습니다.
          </p>
        </article>

        <article>
          <h2 className="mb-[var(--space-3)] text-[length:var(--text-title)] font-[var(--text-title-weight)]">
            4. 이용자의 권리
          </h2>
          <p className="text-[length:var(--text-body)] leading-[var(--text-body-lh)] text-[var(--color-on-surface-muted)]">
            이용자는 언제든지 위치 정보 제공을 거부할 수 있으며,
            이 경우 통근 시간 분석 기능을 이용할 수 없습니다.
          </p>
        </article>
      </section>
    </div>
  );
}

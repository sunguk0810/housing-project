---
plan-id: "2026-02-14_codex_phase2-m1-s7-token-implementation"
status: "partial"
phase: "PHASE2"
template-version: "1.1"
work-type: "feature"
depends-on:
  - plan-id: "2026-02-14_claude-code_phase2-m1-execution"
    condition: "status == done"
---
# Plan Execute: phase2-m1-s7-token-implementation

## 목표

PHASE1 S7 디자인 토큰을 Tailwind v4 CSS-first 구조에 반영하되, shadcn 기본 토큰과 충돌 없이 안전하게 통합한다.

## 범위

- In Scope:
  - `src/styles/tokens.css` 신규 생성 (S7 섹션 1 + 섹션 3 기반)
  - `src/app/globals.css`에 토큰 import 및 `@theme inline` 매핑 추가
  - `src/app/layout.tsx`의 Geist 폰트 의존 제거
  - `pnpm build`, `pnpm lint` 검증
- Out of Scope:
  - SoT 문서 수정 (`docs/PHASE1_design.md`, `docs/design-system/design-tokens.css`)
  - 컴포넌트 UI 리디자인
  - 폰트 self-hosting 최적화
- 참조 SoT:
  - `docs/PHASE1_design.md > S7`
  - `docs/design-system/design-tokens.css`
- 선행 plan:
  - `2026-02-14_claude-code_phase2-m1-execution` (`status == done`)

## 작업 단계

1. Tailwind 버전과 기존 CSS 변수 구조를 확인한다.
2. S7 토큰 파일(`src/styles/tokens.css`)을 생성하고 충돌 토큰을 `-s7-` 네임스페이스로 분리한다.
3. `src/app/globals.css`에서 토큰 import, `@theme inline` 매핑(색상/타이포/radius/breakpoint)을 적용한다.
4. `src/app/layout.tsx`에서 Geist 폰트 로드를 제거하고 기본 레이아웃 클래스만 유지한다.
5. 빌드/린트를 수행하고 결과를 문서에 기록한다.

## 검증 기준

1. `package.json`이 Tailwind `^4`를 유지하고 `tailwind.config.ts` 없이 동작한다.
2. `src/styles/tokens.css`에 S7 토큰이 정의되고 충돌 토큰(`accent`, `primary`, `border`, `radius`)이 네임스페이스 분리된다.
3. `src/app/globals.css`에서 `@theme inline` 매핑으로 S7 토큰이 Tailwind 유틸리티에 노출된다.
4. `src/app/layout.tsx`에서 Geist import/변수가 제거된다.
5. `pnpm build`와 `pnpm lint`가 모두 통과한다.

## 결과/결정

- 상태: `partial`
- 핵심 결과:
  - `src/styles/tokens.css`를 생성하고 S7 토큰(섹션 1 + 섹션 3)을 runtime 변수로 반영했다.
  - 충돌 위험 토큰을 `-s7-` 네임스페이스로 분리했다.
    - `--color-s7-accent`, `--color-s7-accent-dark`
    - `--color-s7-primary`, `--color-on-s7-primary`, `--color-s7-border`
    - `--radius-s7-*`
  - `src/app/globals.css`에 토큰 import를 추가하고 `@theme inline` 매핑(색상/타이포/radius/breakpoint)을 적용했다.
  - `src/app/layout.tsx`에서 Geist 폰트 import/변수를 제거하고 기본 `antialiased`만 유지했다.
  - 검증 결과:
    - `pnpm build`: 통과
    - `pnpm lint`: 실패 (기존 `docs/legacy_docs` JSX 규칙 위반 23 errors, 21 warnings)
- 미해결 이슈:
  - 저장소 전역 lint 기준과 레거시 문서(`docs/legacy_docs`) 간 충돌로 `pnpm lint`를 이번 범위에서 통과시키지 못함
- 다음 액션:
  - `pnpm lint` 범위를 애플리케이션 코드로 제한하거나, `docs/legacy_docs`를 ESLint ignore 대상으로 분리하는 별도 plan 수행

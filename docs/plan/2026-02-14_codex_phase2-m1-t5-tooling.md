---
plan-id: '2026-02-14_codex_phase2-m1-t5-tooling'
status: 'done'
phase: 'PHASE2'
template-version: '1.1'
work-type: 'feature'
depends-on:
  - plan-id: '2026-02-14_claude-code_phase2-m1-execution'
    condition: 'status == done'
---

# Plan Execute: phase2-m1-t5-tooling

## 목표

PHASE2 M1 T5 요구사항에 따라 ESLint/Prettier/.env.example를 정비하고, pnpm 기반 검증 명령이 동작하도록 개발 도구 구성을 확정한다.

## 범위

- In Scope:
  - `eslint.config.mjs` 규칙 강화 및 lint 범위 조정
  - `package.json` 스크립트(`format`, `format:check`) 추가
  - `.prettierrc`, `.prettierignore`, `.env.example` 생성
  - `prettier`, `prettier-plugin-tailwindcss` devDependencies 추가
  - `pnpm build`, `pnpm lint`, `pnpm format:check` 실행
- Out of Scope:
  - SoT 문서 수정 (`docs/PHASE1_design.md`, `docs/PHASE2_build.md`)
  - Husky/pre-commit (`T6`) 구성
- 참조 SoT:
  - `docs/PHASE2_build.md > Section 4`
  - `docs/PHASE1_design.md > S1`
- 선행 plan:
  - `2026-02-14_claude-code_phase2-m1-execution` (`status == done`)

## 작업 단계

1. ESLint Flat Config에 strict 규칙(`no-explicit-any`, `no-unused-vars`)을 `error`로 추가한다.
2. `globalIgnores([...])`에 `docs/**`를 추가해 앱 코드 중심 lint 범위로 정리한다.
3. `pnpm add -D prettier prettier-plugin-tailwindcss`로 개발 의존성을 추가한다.
4. `.prettierrc`, `.prettierignore`를 요구 스펙으로 생성한다.
5. `.env.example`를 PHASE2 Section 4의 10개 키와 주석 포함 형태로 생성한다.
6. `package.json`에 `format`, `format:check` 스크립트를 추가한다.
7. `pnpm build`, `pnpm lint`, `pnpm format:check`를 실행해 검증한다.

## 검증 기준

1. ESLint 설정에 `@typescript-eslint/no-explicit-any: error`, `@typescript-eslint/no-unused-vars: error`가 존재한다.
2. `globalIgnores([...])` 함수 호출 목록에 `docs/**`가 포함된다.
3. `.prettierrc`가 요구 옵션과 `prettier-plugin-tailwindcss`를 포함한다.
4. `.prettierignore`가 `docs/plan/**`, `docs/legacy_docs/**`, `docs/design-system/**`를 포함하고 Markdown 전체 제외(`*.md`)를 사용하지 않는다.
5. `.env.example`가 Section 4 기준 10개 키+주석을 포함한다.
6. `package.json`에 `format`, `format:check` 스크립트가 존재한다.
7. `pnpm build`, `pnpm lint`, `pnpm format:check`가 통과한다.

## 결과/결정

### Run 1 (2026-02-14)

- 상태: `partial`
- 핵심 결과:
  - `eslint.config.mjs`에 strict 규칙을 추가했다.
    - `@typescript-eslint/no-explicit-any: error`
    - `@typescript-eslint/no-unused-vars: error`
  - `globalIgnores([...])`에 `docs/**`를 추가해 문서 영역을 lint 범위에서 제외했다.
  - `prettier`, `prettier-plugin-tailwindcss`를 devDependencies에 추가했다.
  - `.prettierrc`, `.prettierignore`, `.env.example`를 생성했다.
  - `package.json`에 `format`, `format:check` 스크립트를 추가했다.
  - 검증 결과:
    - `pnpm build`: 통과
    - `pnpm lint`: 통과
    - `pnpm format:check`: 실패 (기존 저장소 전반 61개 파일 미포맷)
- 미해결 이슈:
  - 저장소 기존 파일 다수가 Prettier 포맷 규칙과 불일치하여 `format:check` 전체 통과 불가

### Run 2 (2026-02-14)

- 상태: `done`
- 검증 결과:
  - `pnpm build`: 통과
  - `pnpm lint`: 통과
  - `pnpm format:check`: 통과
- 근거: `.prettierignore` 선별 제외(`docs/plan/**`, `docs/legacy_docs/**`, `docs/design-system/**`) + `pnpm format` 일괄 적용
- verdict: go → status done 확정
- 미해결 이슈: 없음

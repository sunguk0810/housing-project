<!-- template v1.1 -->
---
plan-id: "2026-02-14_claude-code_m1-partial-cleanup"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "ops"
depends-on:
  - plan-id: "2026-02-14_codex_phase2-m1-s7-token-implementation"
    condition: "status == done"
  - plan-id: "2026-02-14_codex_phase2-m1-t5-tooling"
    condition: "status == done"
---

# Plan Execute: M1 partial 2건 정리 (#14 S7 토큰, #15 도구 정비)

## 목표

M1 Foundation 9개 항목 중 partial 상태인 2건(#14 S7 토큰, #15 도구 정비)을 정리하여 M1을 완료하고 M2 진입 준비를 마친다.

## 범위

- In Scope:
  - `.prettierignore` 선별 제외 3개 경로 추가 (`docs/plan/**`, `docs/legacy_docs/**`, `docs/design-system/**`)
  - Plan #12 frontmatter 상태 전이 누락 보정 (`in_progress` → `done`)
  - Plan #14 Run 2 누적 + status done 확정
  - Plan #15 검증 기준 #4 반영 + Run 2 누적 + status done 확정
  - Plan 인덱스 갱신 (#14, #15 → done, 본 plan 행 추가)
  - `README.md` 현재 상태 M1 완료 반영
  - `pnpm format` 일괄 포맷팅 + 검증 (`lint`, `format:check`, `build`)
- Out of Scope:
  - SoT 문서 수정 (`docs/PHASE0_ground.md`, `docs/PHASE1_design.md`)
  - 코드 로직 변경
- 참조 SoT:
  - `docs/plan/PLAN_OPERATION_GUIDE.md` (plan 운영 규칙)
  - `docs/PHASE2_build.md` > Section 2 (M1 Foundation 체크리스트)
- 선행 plan:
  - `2026-02-14_codex_phase2-m1-s7-token-implementation` (`status == done` — 본 plan에서 확정)
  - `2026-02-14_codex_phase2-m1-t5-tooling` (`status == done` — 본 plan에서 확정)

## 작업 단계

### Step 1: Plan Execute 산출물 생성 (부트스트랩)

본 문서 생성 (status: `in_progress`).

### Step 2: .prettierignore 수정

선별 제외 3개 경로 추가: `docs/plan/**`, `docs/legacy_docs/**`, `docs/design-system/**`

### Step 3: Plan #12 frontmatter 상태 확정

frontmatter `status: "in_progress"` → `status: "done"` (semantic 상태 전이 누락 보정)

### Step 4: Plan #14 Run 2 누적

기존 결과/결정(Run 1 실패) 보존, Run 2 누적 추가, frontmatter status → done

### Step 5: Plan #15 검증 기준 반영 + Run 2 누적

검증 기준 #4 수정 + Run 2 누적 추가, frontmatter status → done

### Step 6: Plan 인덱스 갱신

#14, #15 → done + 본 plan 행 추가

### Step 7: README.md 현재 상태 갱신

M1 완료 반영, 진행 중 항목 제거

### Step 8: pnpm format + 최종 검증

`pnpm format` → `pnpm lint` → `pnpm format:check` → `pnpm build`

### Step 9: Plan Execute 산출물 확정 + 커밋 제안

결과/결정에 검증 결과 기록, status → done

## 검증 기준

| # | 기준 | 판정 |
|---|------|------|
| 1 | `.prettierignore`에 `docs/plan/**`, `docs/legacy_docs/**`, `docs/design-system/**` 포함 | pass |
| 2 | Plan #12 frontmatter status == done | pass |
| 3 | Plan #14 frontmatter status == done, Run 2 누적 존재 | pass |
| 4 | Plan #15 frontmatter status == done, Run 2 누적 존재, 검증 기준 #4 수정 반영 | pass |
| 5 | Plan 인덱스에 #14, #15 → done, 본 plan 행 존재 | pass |
| 6 | `README.md` 현재 상태에 M1 완료 반영 | pass |
| 7 | `pnpm lint` exit 0 | pass |
| 8 | `pnpm format:check` exit 0 | pass |
| 9 | `pnpm build` exit 0 | pass |

## 결과/결정

- **상태**: `done`
- **핵심 결과**:
  - `.prettierignore` 선별 제외 정책 적용: `docs/plan/**`, `docs/legacy_docs/**`, `docs/design-system/**`
  - Plan #12 frontmatter 상태 전이 누락 보정 완료 (`in_progress` → `done`)
  - Plan #14 (S7 토큰) Run 2 누적 + status done 확정
  - Plan #15 (도구 정비) 검증 기준 #4 반영 + Run 2 누적 + status done 확정
  - Plan 인덱스 갱신 (#14, #15 → done, #19 본 plan 추가)
  - `README.md` 현재 상태 M1 완료 반영, 진행 중 항목 제거
  - `pnpm format` 일괄 포맷팅 적용
  - 검증 결과: `pnpm lint` pass, `pnpm format:check` pass, `pnpm build` pass
- **미해결 이슈**: 없음
- **다음 액션**: M2 (Data + Engine) 진입

## 체크리스트

- [x] 파일명 규칙 충족 (`2026-02-14_claude-code_m1-partial-cleanup.md`)
- [x] 필수 섹션 5개 존재 (목표, 범위, 작업 단계, 검증 기준, 결과/결정)
- [x] SoT 참조 문구 포함 (`docs/plan/PLAN_OPERATION_GUIDE.md`, `docs/PHASE2_build.md`)
- [x] 결과/결정에 상태와 후속 액션 포함
- [x] YAML frontmatter 포함 (plan-id, status, phase, template-version)
- [x] depends-on 참조 plan의 condition 평가 충족 확인

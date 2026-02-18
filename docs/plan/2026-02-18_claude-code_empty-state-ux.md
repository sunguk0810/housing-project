---
plan-id: empty-state-ux
status: done
phase: phase3
depends-on: []
template-version: "1.1"
---

# 빈 결과 페이지 개선 — Empty State UX

> SoT: `docs/PHASE0_ground.md` 참조

## 목표

API 0건 반환 / 세션 만료 등 빈 상태에서 시각적 안내와 다음 행동을 명확히 제시하는 공통 EmptyState 컴포넌트 생성 및 3곳 적용

## 범위

| # | 파일 | 변경 |
|---|------|------|
| 1 | `src/components/feedback/EmptyState.tsx` | **신규** — 공통 빈 상태 컴포넌트 |
| 2 | `src/components/input/steps/Step5Loading.tsx` | error + isEmptyResult 상태 → EmptyState 사용 |
| 3 | `src/app/(main)/results/page.tsx` | empty state → EmptyState 사용 |
| 4 | `src/components/compare/CompareClient.tsx` | 3가지 empty state → EmptyState 사용 |

## 작업 단계

1. EmptyState.tsx 생성 — props, 스타일, staggered fadeSlideUp 애니메이션
2. Step5Loading.tsx — error 상태 EmptyState 적용
3. results/page.tsx — empty state EmptyState 적용
4. CompareClient.tsx — 3가지 시나리오 EmptyState 적용
5. 빌드/린트/테스트 검증

## 검증 기준

- `pnpm run build` — 에러 없음
- `pnpm run lint` — 에러 없음
- `pnpm exec vitest run` — 테스트 통과

## 결과/결정

- 상태: `done`
- 빌드: 성공 (에러 0)
- 린트: 성공 (에러 0, 기존 warning 1 — useStepForm react-hook-form 관련, 미관련)
- 테스트: 관련 테스트 14건 전체 통과 (`results.test.tsx` 5건, `compare.test.tsx` 9건)
  - `search.test.tsx` 2건 실패는 기존 EmojiCard role 변경(button→radio) 관련으로 이번 변경과 무관
- 변경 파일 4건:
  1. `src/components/feedback/EmptyState.tsx` (신규)
  2. `src/components/input/steps/Step5Loading.tsx` (수정)
  3. `src/app/(main)/results/page.tsx` (수정)
  4. `src/components/compare/CompareClient.tsx` (수정)

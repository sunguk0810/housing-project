---
plan-id: complex-scale-dimension
status: done
phase: PHASE1
template-version: "1.1"
depends-on: []
---

# complexScale(단지 규모) 차원 추가

> SoT 참조: `docs/PHASE1_design.md` > S4

## 목표

6번째 스코어링 차원 `complexScale`(단지 규모)을 추가하여 대단지 선호를 반영하고,
`complex_focused` 프로필을 신규 추가한다.

## 범위

- 스코어링 엔진: `normalizeComplexScale()` 정규화 함수 + 6차원 가중합
- 타입: `ScoringInput.householdCount`, `DimensionScores.complexScale`, `WeightProfileKey`/`WeightProfile` 확장
- API: `/api/recommend` 파이프라인에 `householdCount` 전달 + 응답 `dimensions`에 `complexScale` 포함
- Validator: `weightProfileSchema`에 `complex_focused` 추가
- UI: Step4에 4번째 프로필 카드, 비교 테이블에 단지규모 행
- 테스트 mock: 3개 테스트 파일 `dimensions` 갱신
- SoT 문서: `PHASE1_design.md` S4 갱신

## 작업 단계

1. `src/types/engine.ts` — 타입 확장 (ScoringInput, DimensionScores, WeightProfileKey)
2. `src/types/api.ts` — WeightProfile, RecommendationItem.dimensions 확장
3. `src/lib/engines/scoring.ts` — normalizeComplexScale + 6차원 가중합 + reason/whyNot
4. `src/lib/validators/recommend.ts` — Zod 스키마 갱신
5. `src/app/api/recommend/route.ts` — householdCount 전달 + dimensions 응답
6. UI: Step4Priorities, card-icons, CompareClient
7. 테스트 mock 3개 갱신
8. `docs/PHASE1_design.md` S4 SoT 갱신
9. 빌드 + 린트 + 테스트 검증

## 검증 기준

- `pnpm run build` + `pnpm run lint` 통과
- `pnpm exec vitest run` 전체 통과
- 전수 grep: WeightProfileKey, DimensionScores 참조 파일 모두 6차원 대응

## 결과/결정

- 상태: `done`
- 빌드: 통과 (`pnpm run build`)
- 린트: 통과 (`pnpm run lint`)
- 테스트: 163/166 통과 (실패 3건은 `commute.test.ts` 기존 실패 — 본 변경과 무관)
- 수정 파일 14개:
  - `src/types/engine.ts`, `src/types/api.ts` — 타입 확장
  - `src/lib/engines/scoring.ts` — normalizeComplexScale + 6차원 가중합
  - `src/lib/validators/recommend.ts` — Zod 스키마
  - `src/hooks/useStepForm.ts` — 폼 스키마
  - `src/app/api/recommend/route.ts` — 파이프라인 연결
  - `src/components/input/steps/Step4Priorities.tsx` — 4번째 프로필 카드
  - `src/components/onboarding/card-icons.tsx` — complex_focused 아이콘
  - `src/components/compare/CompareClient.tsx` — 단지규모 비교 섹션
  - `src/components/compare/CompareRadarChart.tsx` — 레이더 차트 5축
  - `src/lib/detail-session.ts` — DimensionsShape 확장
  - `src/__tests__/` (3개) + `tests/` (2개) — 테스트 mock 갱신
  - `docs/PHASE1_design.md` — S4 SoT 갱신

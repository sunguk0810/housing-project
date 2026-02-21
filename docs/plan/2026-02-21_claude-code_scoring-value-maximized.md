---
plan-id: "2026-02-21_claude-code_scoring-value-maximized"
status: "done"
phase: "PHASE1"
template-version: "1.1"
work-type: "feature"
---

# 스코어링 알고리즘 개선: value_maximized 프로필 + 다양성 재정렬

## 목표

budget 차원의 가격 활용도 곡선이 예산 상한 근처 아파트에 페널티를 부여하여
사용자 의도("내 예산으로 살 수 있는 가장 좋은 곳")와 충돌하는 문제를 해결한다.

새 `value_maximized` 프로필(budget weight=0) 추가 + 가격 티어 다양성 재정렬 도입.

## 범위

- SoT 수정: `docs/PHASE1_design.md` S4 가중치 프로필 테이블
- 타입 확장: `engine.ts`, `api.ts`
- 스코어링 엔진: `scoring.ts` — 새 프로필 + generateWhyNot 개선
- 다양성 모듈: `diversity.ts` (신규)
- Validator/Form: `recommend.ts`, `useStepForm.ts` — WEIGHT_PROFILE_KEYS 기반 드리프트 방지
- API Route: `route.ts` — 조건부 다양성 재정렬
- UI: `card-icons.tsx`, `Step4Priorities.tsx` — 5번째 옵션 카드
- 테스트: scoring S-32~34, diversity D-1~14, bench 추가

## 작업 단계

1. [x] SoT 업데이트 — PHASE1 S4 가중치 프로필 테이블에 가치 극대화 행 + 다양성 재정렬 사양 추가
2. [x] 타입 확장 — `WEIGHT_PROFILE_KEYS` const 배열 도입, `WeightProfile` = `WeightProfileKey` alias
3. [x] 스코어링 엔진 — `value_maximized` 프로필 추가, `generateWhyNot`에 weights 파라미터로 0-weight 차원 제외
4. [x] 다양성 재정렬 모듈 — `classifyPriceTier`, `normalizeScores`, `computeTierTargets`, `diversityRerank`
5. [x] Validator + Form — `WEIGHT_PROFILE_KEYS` 기반 Zod enum으로 드리프트 방지
6. [x] API Route — `value_maximized`일 때만 `diversityRerank` 적용 + 명시적 `slice(0, 10)`
7. [x] UI — TrendingUp 아이콘 + 5번째 카드 "가치 극대화"
8. [x] 테스트 — S-32~34, D-1~14, 벤치마크 3건
9. [x] 검증 — build, lint, vitest run 전체 PASS

## 검증 기준

| 항목 | 결과 |
|------|------|
| `pnpm exec vitest run tests/unit/scoring.test.ts` — S-32~34 포함 전체 PASS | PASS (35 tests) |
| `pnpm exec vitest run tests/unit/diversity.test.ts` — D-1~14 전체 PASS | PASS (16 tests) |
| `pnpm run build` — 타입 에러 없음 | PASS |
| `pnpm run lint` — lint 에러 없음 | PASS |
| 기존 테스트 회귀 없음 `pnpm exec vitest run` | PASS (22 files, 185 tests) |
| WEIGHT_PROFILES 합계 검증: value_maximized = 1.00 | PASS (기존 "all profiles sum to 1.0" 테스트 자동 검증) |

## 결과/결정

**상태: done**

### 핵심 변경

- `value_maximized` 프로필: budget weight=0, commute 0.30, childcare 0.18, safety 0.18, school 0.15, complexScale 0.19
- 다양성 재정렬: λ=0.30, remaining-slots deficit, premium 30%/mid 40%/value 30% 목표 분포
- 드리프트 방지: `WEIGHT_PROFILE_KEYS` 단일 소스에서 validator, form, icon 모두 파생
- `generateWhyNot`에 weights 파라미터 추가하여 0-weight 차원(budget)을 whyNot 후보에서 제외
- 기존 4개 프로필 동작 변경 없음

### 변경 파일 (13건)

| 파일 | 변경 유형 |
|------|-----------|
| `docs/PHASE1_design.md` | MODIFY — S4 프로필 테이블 + 다양성 재정렬 사양 |
| `src/types/engine.ts` | MODIFY — WEIGHT_PROFILE_KEYS 배열 + WeightProfileKey |
| `src/types/api.ts` | MODIFY — WeightProfile = WeightProfileKey alias |
| `src/lib/engines/scoring.ts` | MODIFY — value_maximized 프로필 + generateWhyNot 개선 |
| `src/lib/engines/diversity.ts` | NEW — 다양성 재정렬 모듈 |
| `src/lib/validators/recommend.ts` | MODIFY — WEIGHT_PROFILE_KEYS 기반 Zod enum |
| `src/hooks/useStepForm.ts` | MODIFY — WEIGHT_PROFILE_KEYS 기반 enum |
| `src/components/onboarding/card-icons.tsx` | MODIFY — TrendingUp 아이콘 |
| `src/components/input/steps/Step4Priorities.tsx` | MODIFY — 5번째 옵션 카드 |
| `src/app/api/recommend/route.ts` | MODIFY — 조건부 diversityRerank |
| `tests/unit/scoring.test.ts` | MODIFY — S-32~34 |
| `tests/unit/diversity.test.ts` | NEW — D-1~14 |
| `tests/bench/recommend.bench.ts` | MODIFY — 벤치마크 3건 |

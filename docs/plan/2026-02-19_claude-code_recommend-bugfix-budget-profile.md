---
plan-id: recommend-bugfix-budget-profile
status: done
phase: M2
template-version: "1.1"
---

# 추천 API 버그 수정 + 2025.10.15 대책 기반 예산 프로필 시스템

## 목표

1. `/api/recommend` 5대 버그 수정 (배포 차단 해제)
2. 고정 LTV 50%/DTI 40% → 2025.10.15 주택시장 안정화 대책 기반 정책 프로필 전환
3. 2축 매트릭스: budgetProfile(생애최초/무주택/1주택자) × loanProgram(은행주담대/보금자리론)

**출처**: 국토교통부 2025.10.15 주택시장 안정화 대책

## 범위

### Part 1: 정책 기반 예산 프로필
- 타입 정의 (`types/engine.ts`, `types/api.ts`)
- Zod 스키마 (`validators/recommend.ts`)
- Budget 엔진 리라이트 (`engines/budget.ts`)
- UI: Step1 프로필/대출상품 선택기, useStepForm v4 마이그레이션

### Part 2: 5대 버그 수정
- Fix 1: budget=0 (maxBudget=effectiveMonthlyBudget)
- Fix 2: 강남만 추천 (LIMIT 50 → 200)
- Fix 3: 2017년 가격 (연도 필터 gte)
- Fix 4: whyNot 동일 (Fix 1로 자동 해결)
- Fix 5: safetyDate "N/A" (배치 조회 + regionCode)

### 설계 결정
- D-1: V1 항상 규제지역 가정 (상수)
- D-5: monthly → jeonse 서버 정규화

## 작업 단계

1. [x] `types/engine.ts` — BudgetProfileKey, LoanProgramKey, BudgetInput 확장
2. [x] `types/api.ts` — BudgetProfile, LoanProgram 타입 추가
3. [x] `validators/recommend.ts` — tradeType에 monthly 허용, budgetProfile/loanProgram 필드
4. [x] `engines/budget.ts` — 2축 상수 테이블, 구간별 feasibility, 전세/보금자리론 분리
5. [x] `route.ts` — Fix 1~5 + effectiveTradeType + budgetProfile 전달
6. [x] `constants.ts` + `card-icons.tsx` — 프로필/대출상품 옵션 아이콘
7. [x] `useStepForm.ts` — v4 스키마, v3→v4 마이그레이션
8. [x] `Step1BasicInfo.tsx` — 프로필 3카드 + 대출상품 2카드 (매매 시)
9. [x] `StepWizard.tsx` — 새 Step1 props 연결
10. [x] `Step5Loading.tsx` — childPlan 제외, budgetProfile/loanProgram 포함
11. [x] 테스트 업데이트 — budget, validator, useStepForm, search 페이지
12. [x] 빌드 + 테스트 통과 검증

## 검증 기준

- [x] `pnpm run build` 타입 에러 없음
- [x] `pnpm exec vitest run` 전체 통과 (21파일, 157테스트)
- [x] 금지 문구 미사용 (compliance 테스트 통과)
- [x] UI에 정책 출처/기준일 + disclaimer 표기
- [x] effectiveMonthlyBudget이 budget 점수에 반영 (Fix 1)
- [x] safety 배치 조회로 N+1 제거 (Fix 5)
- [x] 연도 필터로 오래된 가격 제외 (Fix 3)

## 결과/결정

**상태: done**

### 변경 파일 (12건)
| 파일 | 변경 유형 |
|------|----------|
| `src/types/engine.ts` | BudgetProfileKey, LoanProgramKey 타입 추가 |
| `src/types/api.ts` | BudgetProfile, LoanProgram 타입 추가 |
| `src/lib/validators/recommend.ts` | tradeType monthly 허용, 신규 필드 |
| `src/lib/engines/budget.ts` | 정책 기반 2축 리라이트 |
| `src/app/api/recommend/route.ts` | Fix 1~5 + 정책 연동 |
| `src/lib/constants.ts` | 프로필/대출상품 옵션 상수 |
| `src/components/onboarding/card-icons.tsx` | 프로필/대출상품 아이콘 |
| `src/hooks/useStepForm.ts` | v4 스키마 + 마이그레이션 |
| `src/components/input/steps/Step1BasicInfo.tsx` | 프로필/대출상품 UI |
| `src/components/input/StepWizard.tsx` | 새 props 연결 |
| `src/components/input/steps/Step5Loading.tsx` | API payload 정리 |
| `tests/` (4건) | budget, validator, useStepForm, search 테스트 |

### 후속 액션
- 커밋 제안 대기 (사용자 승인 필요)

# 입력 폼 간소화: 재정 필드 축소 + 미사용 필드 제거

- **plan-id**: form-simplification
- **status**: done
- **phase**: PHASE1

## 목표

입력 폼의 사용성 개선:
1. Step 3 (재정): 4개 필드 → 2개 (자산 + 연소득)
2. Step 4 (조건): livingAreas/childPlan 제거
3. income 단위: 월소득(만원/월) → 연소득(만원/년)
4. 예상 가능 예산 실시간 미리보기 추가

## 범위

- SoT: PHASE1 S4 참조 (budget 로직), PHASE0 참조 (법무/컴플라이언스)
- **변경 파일 14개**: types, engine, validator, form schema, UI 컴포넌트 4개, 테스트 4개

### 변경 요약

| 파일 | 변경 |
|------|------|
| `src/types/engine.ts` | income 주석: monthly → annual |
| `src/types/api.ts` | loans/monthlyBudget optional |
| `src/lib/engines/budget.ts` | income*12 → income (3곳) |
| `src/lib/validators/recommend.ts` | loans/monthlyBudget optional+default(0), income max 1,200,000 |
| `src/hooks/useStepForm.ts` | v5 스키마, 필드 제거, v4→v5 마이그레이션 |
| `src/components/input/steps/Step3Finance.tsx` | 2필드 + 예산 미리보기 |
| `src/components/input/steps/Step4Priorities.tsx` | weightProfile만 |
| `src/components/input/StepWizard.tsx` | props 축소, validation 변경 |
| `src/components/input/steps/Step5Loading.tsx` | 제거된 필드 정리 |
| `tests/unit/budget.test.ts` | income 연소득 반영 (×12) |
| `src/__tests__/hooks/useStepForm.test.ts` | v5 + 마이그레이션 테스트 |
| `tests/unit/validators.test.ts` | optional 필드 + income max 검증 |
| `tests/bench/recommend.bench.ts` | income 연소득 반영 |

## 작업 단계

1. ✅ 타입 변경 — income 연소득, loans/monthlyBudget optional
2. ✅ 예산 엔진 — income*12 → income (3곳)
3. ✅ API Validator — optional+default, income range
4. ✅ Form Schema v5 — 필드 제거 + 마이그레이션 체인
5. ✅ Step3Finance — 2필드 + 예산 미리보기
6. ✅ Step4Priorities — weightProfile만
7. ✅ StepWizard — props 축소, validation 변경
8. ✅ Step5Loading — 변수명 충돌 수정
9. ✅ 테스트 업데이트 (budget, stepForm, validators, bench)
10. ✅ 빌드/린트/테스트 검증

## 검증 기준

- [x] `pnpm run build` — 타입 에러 없음
- [x] `pnpm run lint` — 0 errors
- [x] `pnpm exec vitest run` — 22 files, 189 tests PASS
- [x] Step 3: 자산 + 연소득 2개 필드 + 예상 가능 예산 표시 + 동의 체크박스
- [x] Step 4: 분석 프로필 카드만 표시
- [x] Step 4 validation: weightProfile 선택만으로 진행 가능
- [x] 예산 계산 정합성: 연소득 6,000만원 = 기존 월소득 500만원과 동일한 maxPrice

## 결과/결정

**상태: done**

모든 변경 사항이 구현되고 검증되었습니다.

### 후속 액션
- monthly 타입 사용 시 monthlyBudget 별도 입력 UI (향후)
- livingAreas/childPlan 기반 필터링/가중치 재도입 (향후)

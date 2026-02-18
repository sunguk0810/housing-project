---
plan-id: step4-profile-card-redesign
status: done
phase: phase3
---

# Step 4 디자인 개선: 슬라이더 → 3-프로필 카드 + 시각 폴리시

## 목표

Step4(선호 조건) 페이지의 4개 슬라이더를 제거하고, 백엔드가 실제 사용하는 `balanced` / `budget_focused` / `commute_focused` 3개 프로필 카드 선택 UI로 교체한다.

## 범위

- EmojiCard / EmojiCardSelector: description prop, 선택 톤다운, 접근성
- useStepForm: 스키마 v2 → v3 마이그레이션 (priorityWeights → weightProfile)
- Step4Priorities: 슬라이더 → 3-프로필 카드
- StepWizard: prop/validation 변경
- Step5Loading: 변환 로직 제거
- LivingAreaChipSelector: 선택 톤다운
- 테스트 업데이트

SoT 참조: PHASE1 S4 (스코어링 프로필)

## 작업 단계

1. ✅ EmojiCard에 `description` prop 추가, `bg-brand-50` → `bg-surface-elevated`, `role="radio"` + `aria-checked` + `focus-visible` 추가
2. ✅ EmojiCardSelector CardOption에 `description` 추가, EmojiCard에 전달
3. ✅ useStepForm 스키마 v3: `priorityWeights` → `weightProfile`, v2/v1 마이그레이션 로직
4. ✅ Step4Priorities: PrioritySliderGroup → EmojiCardSelector (3-프로필 카드)
5. ✅ StepWizard: Step4 prop/validation 연결 변경
6. ✅ Step5Loading: `priorityWeightsToWeightProfile()` 변환 제거, `weightProfile` 직접 사용
7. ✅ LivingAreaChipSelector: 선택 상태 `bg-brand-50` → `bg-surface-elevated`, 카운트 텍스트 톤다운
8. ✅ 테스트 업데이트 (11개 통과), 빌드 통과

## 검증 기준

1. ✅ `pnpm run build` — TypeScript 에러 없음
2. ✅ 3-프로필 카드 중 하나 선택 → API에 `weightProfile` 정상 전달 (Step5 변환 제거)
3. ✅ v2 세션 데이터 복원 시 `priorityWeights` → `weightProfile` 자동 마이그레이션 (테스트 검증)
4. ✅ EmojiCard · 생활권 칩 선택 시 `bg-surface-elevated` + border
5. ✅ `pnpm exec vitest run` — 관련 단위 테스트 통과 (6개 사전 실패는 기존 이슈)
6. 360px 뷰포트에서 3컬럼 카드 레이아웃 — 수동 확인 필요

## 결과/결정

- 상태: `done`
- 수정 파일: 8개 (EmojiCard, EmojiCardSelector, useStepForm, Step4Priorities, StepWizard, Step5Loading, LivingAreaChipSelector, card-icons)
- 테스트 파일: 1개 (useStepForm.test.ts — 11개 테스트 모두 통과)
- PrioritySliderGroup.tsx는 더 이상 import되지 않으나, 추후 별도 정리 시 삭제 가능
- 후속 액션: 커밋 승인 후 실행

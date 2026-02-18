---
plan-id: "2026-02-17_claude-code_onboarding-ux-enhancement"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "feature"
---

# /search 온보딩 UX 보강

## 목표

1차 구현 완료 후 확인된 2가지 문제(Step 3 레이아웃 깨짐, 이모지 품질)와 UX 철학 미반영 항목을 해결한다.

- 시스템 이모지 → lucide 아이콘으로 교체 (플랫폼 일관성 + 미니멀 디자인)
- Step 3 키패드 슬라이드업 리디자인 (토스/카카오 패턴 반영)

SoT 참조: 디자인 브리프 (`docs/design-system/design_brief.md`), ref_3-1, ref_3-2, ref_3-3

## 범위

### 수정 대상 파일

| # | 파일 | 변경 내용 |
|---|------|----------|
| 1 | `src/lib/constants.ts` | 옵션 구조 변경 (emoji → lucide icon 매핑) |
| 2 | `src/components/onboarding/EmojiCard.tsx` | lucide 아이콘 (배경 없음) + scale(1.02) |
| 3 | `src/components/onboarding/EmojiCardSelector.tsx` | CardOption 타입 변경 |
| 4 | `src/components/onboarding/PriorityCardGrid.tsx` | 변경 불필요 (타입 호환) |
| 5 | `src/components/onboarding/LoadingStage.tsx` | emoji → lucide 아이콘 (배경 없음) |
| 6 | `src/components/onboarding/AmountField.tsx` | compact prop + 인라인 레이아웃 |
| 7 | `src/components/input/steps/Step1BasicInfo.tsx` | CHILD_OPTIONS → CHILD_PLAN_OPTIONS |
| 8 | `src/components/input/steps/Step3Finance.tsx` | 키패드 슬라이드업 + 동적 pb + "완료" 버튼 |
| 9 | `src/components/input/steps/Step5Loading.tsx` | 변경 불필요 (타입 호환) |
| 10 | `src/components/input/StepWizard.tsx` | Step 3 전용 CTA 제거 + keypadOpen 통합 |

## 작업 단계

1. constants.ts 구조 변경 (emoji → icon/iconBg/iconColor) + CHILD_PLAN_OPTIONS 추가
2. EmojiCard 리라이트: lucide 아이콘 (배경 없음, neutral-500 → brand-500 선택 시)
3. EmojiCardSelector 타입 변경
4. LoadingStage 아이콘 교체 (배경 없음)
5. Step1BasicInfo: CHILD_OPTIONS → CHILD_PLAN_OPTIONS (constants 임포트)
6. AmountField compact 모드 추가
7. Step3Finance 키패드 슬라이드업 리디자인
8. StepWizard Step 3 CTA 통합
9. 타입 체크 및 빌드 검증

### 사용자 피드백 반영

- 초기 계획: 컬러 원형 배경 + lucide 아이콘
- 사용자 피드백: "아이콘에 컬러 넣으니까 촌스러워보여"
- 최종 결정: **배경 제거, lucide 아이콘만 표시** (neutral-500 단색, 선택 시 brand-500)

## 검증 기준

- [x] `npx tsc --noEmit` — 타입 에러 0건 (테스트 파일 제외)
- [x] `npx next build` — 빌드 성공
- [x] 모든 카드 컴포넌트에서 lucide 아이콘 렌더링
- [x] Step 3 키패드 슬라이드업 동작 구조 구현

## 결과/결정

- 상태: `done`
- 타입 체크 통과, 빌드 성공
- 10개 파일 수정 (8개 실제 변경 + 2개 변경 불필요)

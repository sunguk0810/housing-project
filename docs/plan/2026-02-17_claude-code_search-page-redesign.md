---
plan-id: "2026-02-17_claude-code_search-page-redesign"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "feature"
---

# /search 온보딩 페이지 리디자인 구현

## 목표

현재 `/search` 페이지의 5스텝 위저드를 디자인 시스템 리서치(ref_3-1, ref_3-2, ref_3-3) 결과를 반영하여 토스 수준의 프리미엄 온보딩 UX로 전면 업그레이드한다.

## 범위

- SoT 참조: 디자인 브리프 (`docs/design-system/design_brief.md`), PHASE0 컴플라이언스
- 변경 대상: 온보딩 컴포넌트 15개 신규 + 12개 수정
- 비변경: `/search/page.tsx`, 레거시 하위호환 컴포넌트(AddressSearch, AmountInput, ConsentForm)

## 작업 단계

### Phase 0: 기반 코드 (타입, 상수, 훅)
- [x] `src/types/api.ts` — TradeType에 "monthly" 추가
- [x] `src/types/ui.ts` — PriorityKey 타입 추가
- [x] `src/lib/validators/recommend.ts` — tradeTypeSchema 업데이트
- [x] `src/lib/constants.ts` — 상수 업데이트
- [x] `src/lib/format.ts` — formatTradeTypeLabel 업데이트
- [x] `src/lib/priorities.ts` — 매핑 유틸리티 생성
- [x] `src/hooks/useStepForm.ts` — 스키마 업데이트
- [x] `src/hooks/useKakaoLocalSearch.ts` — Kakao Local API 훅 생성

### Phase 1: 원자 컴포넌트
- [x] EmojiCard, EmojiCardSelector
- [x] CustomKeypad, AmountField
- [x] ProgressBar, ExceptionButton, BottomCTA

### Phase 2: 복합 컴포넌트
- [x] FullScreenSearch + SearchResults
- [x] InlineConsent + BlurredPreviewCard
- [x] PriorityCardGrid, LoadingStage

### Phase 3: 스텝 컴포넌트 리라이트
- [x] Step1BasicInfo, Step2Workplace, Step3Finance
- [x] Step4Priorities, Step5Loading

### Phase 4: 오케스트레이터 통합
- [x] StepWizard 리라이트
- [x] 접근성/컴플라이언스 검증

## 검증 기준

- TypeScript strict 컴파일 통과
- 컴플라이언스: "추천" 단독 사용 없음, Trust Badge 배치, 동의 라벨 구분
- 접근성: 44px 터치타겟, ARIA role, 키보드 내비게이션
- 세션 영속성: 새 스키마로 저장/복원

## 결과/결정

- 상태: `done`
- TypeScript strict 컴파일 통과 (src/ 소스코드 에러 0건)
- Next.js production build 성공
- 신규 생성 파일 16개, 수정 파일 10개
- 레거시 컴포넌트(AddressSearch, AmountInput, ConsentForm) 하위호환 보존

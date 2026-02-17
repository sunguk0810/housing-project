# Onboarding E2E / UIUX Audit

## 실행

- 전체: `pnpm test:e2e`
- 온보딩 핵심: `pnpm test:e2e:onboarding`

## 가이드 기준 문서

- `docs/research/design-system/prompt/onboarding_page_implementation_prompt.md`
- `docs/research/design-system/ref_3-1_onboarding_wizard_analysis.md`
- `docs/research/design-system/ref_3-2_address_search_analysis.md`
- `docs/research/design-system/ref_3-3_card_selection_analysis.md`

## 게이트 정책

- Must 항목 실패: CI 실패 처리
- Should 항목 실패: 경고 리포트

## 스펙 파일

- `tests/e2e/onboarding.flow.spec.ts`: Step1~5 플로우, CTA 게이트, /results 라우팅
- `tests/e2e/onboarding.uiux.spec.ts`: UI/UX 패턴(이모지 카드, 주소검색 오버레이, 키패드, 생활권 제한)

## 참고

- `/api/recommend`, `/api/kakao-local`은 테스트에서 route mock으로 고정한다.
- 실패 시 `test-results/`의 screenshot/video artifact를 확인한다.

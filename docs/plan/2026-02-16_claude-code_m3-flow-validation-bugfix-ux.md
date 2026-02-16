---
plan-id: "2026-02-16_claude-code_m3-flow-validation-bugfix-ux"
status: "done"
phase: "PHASE3"
template-version: "1.1"
work-type: "feature"
---

# 실 플로우 검증 + 버그 수정 + UX 보강 (A~L)

## 목표

`USE_MOCK_DATA=false`로 전환하여 실제 DB + Kakao API 기반 전체 플로우 검증. 버그 4건 수정 + UX 보강 12건 = 총 16건 작업.

## 범위

- SoT 참조: PHASE0 S4 (컴플라이언스), PHASE1 S2 (DB 스키마)
- 수정 대상: API 라우트 2건, 엔진 1건, 컴포넌트 9건, 레이아웃 1건, 훅 1건, 신규 파일 5건
- 4 Phase (A~D): 런타임 버그 → 전역 안정성 → 온보딩 UX → 결과/상세 UX

## 작업 단계

### Phase A: 런타임 버그 수정 (4건)
- A1: safety_stats WHERE 절 추가 (recommend + apartments API)
- A2: commute.ts haversine 자기비교 + `||true` dead code 제거
- A3: geocoding 에러 메시지 개선
- A4: Step5Analysis 빈 결과 처리

### Phase B: 전역 안정성 + 접근성 (4건)
- B1: loading/error/not-found 5개 파일 신규 생성
- B2: StepWizard 접근성 개선
- B3: PropertyCard 상세보기 힌트
- B4: ComplexDetailClient 빈 상태 안내

### Phase C: 온보딩 UX (5건)
- C1: AmountInput 한글 금액 피드백
- C2: Step0 동의 화면 분리
- C3: Numbered Step Bar + 스텝 이름
- C4: 툴팁 (Popover)
- C5: CTA bar safe area padding

### Phase D: 결과/상세 UX (3건)
- D1: 정렬 변경 시 스크롤 리셋
- D2: 모바일 지도/카드 토글
- D3: 상세 페이지 gradient hero

## 검증 기준

- `pnpm lint` 0 errors
- `pnpm build` 타입 에러 0
- `pnpm vitest --run` 전체 통과

## 결과/결정

- 상태: `done`
- lint 0 errors, build 성공, vitest 135/135 통과
- Phase A~D 전체 16건 구현 완료

### 변경 파일 요약 (20건)

| Phase | 파일 | 작업 |
|-------|------|------|
| A1 | `src/app/api/recommend/route.ts` | safety WHERE (regionCode) |
| A1 | `src/app/api/apartments/[id]/route.ts` | safety WHERE (regionCode) |
| A2 | `src/lib/engines/commute.ts` | haversine+`||true` dead code 제거 |
| A3 | `src/app/api/recommend/route.ts` | 에러 메시지 구체화 |
| A4 | `src/components/input/steps/Step5Analysis.tsx` | 빈 결과 "조건 변경" CTA |
| B1 | `src/app/not-found.tsx` | **신규** 전역 404 |
| B1 | `src/app/(main)/not-found.tsx` | **신규** (main) 404 |
| B1 | `src/app/(main)/loading.tsx` | **신규** 로딩 Skeleton |
| B1 | `src/app/(main)/complex/[id]/loading.tsx` | **신규** 상세 로딩 |
| B1 | `src/app/(main)/complex/[id]/error.tsx` | **신규** 상세 에러 |
| B2+C2+C3+C5 | `src/components/input/StepWizard.tsx` | 동의 Step0 + numbered bar + a11y + safe area |
| B3 | `src/components/card/PropertyCard.tsx` | "상세 보기" 힌트 |
| B4+D3 | `src/components/complex/ComplexDetailClient.tsx` | 빈상태 + gradient hero |
| C1+C4 | `src/components/input/AmountInput.tsx` | formatPrice + Popover 툴팁 |
| C4 | `src/components/input/steps/Step3Income.tsx` | tooltip prop |
| C2 | `src/components/input/steps/Step4Loans.tsx` | ConsentForm 제거 |
| C5 | `src/app/layout.tsx` | viewport export |
| D1+D2 | `src/app/(main)/results/page.tsx` | scroll reset + map toggle |
| D2 | `src/hooks/useKakaoMap.ts` | relayout 메서드 |
| test | `src/__tests__/pages/search.test.tsx` | consent+duplicate text fix |
| docs | `docs/plan/2026-02-16_claude-code_m3-flow-validation-bugfix-ux.md` | plan 문서 |

---
plan-id: "2026-02-17_claude-code_detail-page-redesign"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "feature"
---

# /complex/[id] 단지 상세 페이지 리디자인 구현

## 목표

프롬프트 요구사항(`detail_page_implementation_prompt.md`)과 현재 MVP 구현 사이의 갭을 해소하여 정합도 100%를 달성한다.
탭 내비게이션, Apple Health 인사이트 카드, Recharts 실거래 차트, Progressive Disclosure 등 상세 UX를 구현한다.

## 범위

- SoT 참조: `docs/PHASE1_design.md` (S4 스코어링 로직), `docs/PHASE0_ground.md` (컴플라이언스 규칙)
- 수정 대상: `src/components/complex/`, `src/lib/`, `src/app/(main)/complex/[id]/page.tsx`
- 신규 컴포넌트: StickyTabs, DetailHero, MiniGaugeGrid, InsightCard, ProgressiveDisclosure, PriceChart, PeriodTabs, PriceTable, 5개 탭 패널
- 신규 유틸: detail-session.ts, price-utils.ts

## 작업 단계

### PR1: 탭 인프라 + Hero 리팩터링 + 세션 유틸
1. StickyTabs 컴포넌트 (5개 탭, ARIA, hash 연동)
2. DetailHero 컴포넌트 (Hero 영역 분리)
3. MiniGaugeGrid 컴포넌트 (2×2 미니 게이지)
4. detail-session.ts 유틸 (세션 데이터 병합)
5. ComplexDetailClient 탭 기반 재구성
6. page.tsx generateMetadata 면책 문구 추가

### PR2: 인사이트 카드 + Progressive Disclosure + 개요 탭
1. InsightCard 컴포넌트 (Apple Health 패턴)
2. ProgressiveDisclosure 컴포넌트
3. OverviewPanel 탭 패널

### PR3: 예산 탭 — 차트 + 테이블 + 신고가 배지
1. price-utils.ts 전처리 유틸
2. PriceChart (Recharts LineChart)
3. PeriodTabs (기간 선택 칩)
4. PriceTable (신고가 배지 포함)
5. BudgetPanel 탭 패널

### PR4: 통근 + 보육 + 안전 탭
1. CommutePanel (직장 기반 + 4지역)
2. ChildcarePanel (시설 목록, 지도 제외)
3. SafetyPanel (SafetySection 재사용)

## 검증 기준

- [x] `pnpm exec tsc --noEmit` 통과 (신규 파일 에러 0건, 기존 test 파일 에러만 존재)
- [x] `pnpm build` 성공
- [x] `pnpm lint` 통과 (신규 파일 에러 0건, 기존 lint 에러만 존재)
- [x] 금지 문구 grep 스캔 통과
- [x] 안전 섹션 빨강 색상 미사용
- [x] 면책 문구 3접점 존재 (메타 태그, 푸터, 외부링크 모달)
- [x] 탭 ARIA 마크업 완비 (tablist, tab, tabpanel, aria-selected, aria-controls)
- [x] TypeScript strict (any 금지)

## 결과/결정

- 상태: `done`
- 핵심 결과:
  - 신규 파일 16건 생성, 기존 파일 2건 수정
  - 단일 스크롤 → 5탭 내비게이션 기반 완전 리디자인
  - InsightCard (Apple Health 패턴), ProgressiveDisclosure, Recharts LineChart, 신고가 배지 등 프롬프트 요구사항 구현 완료
  - 세션 데이터 병합 유틸 (formData + results) 구현
  - 부분 렌더링 안전성: 각 탭 패널이 독립적으로 데이터 유무를 체크하여 폴백 UI 제공
  - 보육 탭 지도 인라인은 API 좌표 확장 후 별도 이슈로 처리 (계획대로)

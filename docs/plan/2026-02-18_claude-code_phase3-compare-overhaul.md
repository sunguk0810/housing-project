---
plan-id: "2026-02-18_claude-code_phase3-compare-overhaul"
status: "done"
phase: "PHASE3"
template-version: "1.1"
work-type: "feature"
---

# /compare 비교 페이지 전면 개편

## 목표

현재 단순 `<table>` 10행 비교를 Apple Mac 비교 패턴 기반 고급 UX로 전면 개편한다.
- sticky 헤더 (단지 카드형 UI)
- "한눈에 비교" 큰 수치 섹션
- 4개 카테고리 상세 비교 (예산/통근/보육/안전)
- 단지 동적 추가/제거 + URL searchParams 관리
- 반응형 레이아웃 (데스크톱 fluid / 모바일 컴팩트)
- 레이더 차트 5축 → 4축 (school 제거)

SoT 참조: `docs/PHASE0_ground.md` (FR/NFR, 컴플라이언스), `docs/PHASE1_design.md` (스코어링 로직)

## 범위

- 신규 파일: `compareUtils.ts`, `useSessionPageData.ts`, `useCompareSync.ts`,
  `CompareRow.tsx`, `CompareHeader.tsx`, `AtAGlanceSection.tsx`,
  `CategorySection.tsx`, `CompareFooter.tsx`, `AddUnitDrawer.tsx`
- 수정 파일: `CompareClient.tsx` (전면), `CompareRadarChart.tsx`, `compare.test.tsx`, `format.ts`
- 불변: `page.tsx` (Server Component, metadata 전용)

## 작업 단계

### Phase 1: 기반 인프라
- [x] Step 1-1: `compareUtils.ts` — getBestAptIds, COMPARE_COLORS 상수
- [x] Step 1-2: `useSessionPageData.ts` — CompareClient에서 추출
- [x] Step 1-3: `useCompareSync.ts` — URL↔Context 양방향 동기화
- [x] Step 1-4: `CompareRow.tsx` — flex 기반 행 컴포넌트

### Phase 2: 섹션 컴포넌트
- [x] Step 2-1: `CompareHeader.tsx` — sticky top-0, CSS Grid 카드형
- [x] Step 2-2: `AtAGlanceSection.tsx` — "한눈에 비교" 3행
- [x] Step 2-3: `CategorySection.tsx` — 카테고리 섹션 (bordered card)
- [x] Step 2-4: `CompareFooter.tsx` — 면책 + CTA
- [x] Step 2-5: `AddUnitDrawer.tsx` — vaul Drawer

### Phase 3: 레이더 차트 수정
- [x] Step 3-1: `CompareRadarChart.tsx` — school 축 제거 (5→4축)
- [x] Step 3-2: Legend를 커스텀 HTML로 분리 (축 라벨 겹침 수정)

### Phase 4: CompareClient 통합
- [x] Step 4-1: `CompareClient.tsx` 전면 개편 — fluid flex 레이아웃

### Phase 5: 테스트 + 빌드
- [x] Step 5-1: `compare.test.tsx` — 신규 테스트 추가 (통근 하이라이트)
- [x] Step 5-2: `vitest run` 9/9 통과, `lint` 0 에러

### Phase 6: 디자인 검증 (스크린샷 기반 반복 개선)
- [x] Step 6-1: 헤더 카드 overflow 수정 (CSS Grid minmax(0,1fr))
- [x] Step 6-2: 주소 축약 (`formatShortAddress`)
- [x] Step 6-3: 레이더 차트 Legend 겹침 수정 (커스텀 HTML)
- [x] Step 6-4: 한눈에 비교 — CircularGauge showLabel 제거, 가격 칩/텍스트 분리
- [x] Step 6-5: 예산 분석 가격 — 매매 칩 + 가격 분리 + 날짜 축소
- [x] Step 6-6: 안전 섹션 "데이터 출처" → "기준일" 라벨 수정
- [x] Step 6-7: 빈 상태 검증 (Playwright 스크린샷 확인)

## 검증 기준

```json
{
  "phase": "PHASE3",
  "verdict": "go",
  "run": 1,
  "score": {
    "completeness": 1.0,
    "consistency": 1.0,
    "compliance": 1.0
  },
  "blockers": [],
  "next_actions": [],
  "timestamp": "2026-02-18"
}
```

### 컴플라이언스 체크
- [x] "추천" 단독 사용 없음
- [x] "치안 점수", "범죄율" 표현 없음
- [x] 면책 data-disclaimer="compare-footer" 유지
- [x] aria-label 모든 인터랙티브 요소
- [x] "안전 편의시설 현황" 사용

## 결과/결정

상태: `done`

주요 성과:
- `<table>` 10행 → 섹션 기반 비교 UX로 전면 개편
- 컴포넌트 9개 분리 (유지보수성 향상)
- 반응형 모바일 대응 (72px/120px 라벨, 컴팩트 텍스트)
- 레이더 차트 4축 + Legend 겹침 해결
- URL searchParams 양방향 동기화
- 빈 상태 3가지 분기 유지
- 테스트 9/9 통과, 린트 0 에러

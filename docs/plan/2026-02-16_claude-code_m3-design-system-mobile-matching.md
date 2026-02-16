---
plan-id: "2026-02-16_claude-code_m3-design-system-mobile-matching"
status: "done"
phase: "PHASE3"
template-version: "1.1"
work-type: "feature"
---

# /results + /complex/[id] 디자인 시스템 모바일 렌더링 전체 매칭

## 목표

디자인 시스템 쇼케이스 3개 페이지(`page-results.html`, `page-map-detail.html`, `page-detail.html`)의 모바일 렌더링을 실제 React 구현 2개 라우트(`/results`, `/complex/[id]`)에 완전히 매칭한다.

**SoT**: 쇼케이스 HTML을 기준으로 하되, API 데이터가 없는 항목은 BLOCKED로 표기. PHASE3 프론트엔드 구현 범위.

## 범위

### 신규 생성 (9개)

| 파일 | Phase | 설명 |
|------|-------|------|
| `src/contexts/CompareContext.tsx` | 0 | 비교 상태 Context + useCompare 훅 |
| `src/components/layout/BottomNav.tsx` | 1 | 모바일 하단 5탭 네비게이션 |
| `src/components/layout/CompareBar.tsx` | 2 | 비교 선택 sticky 바 |
| `src/components/map/MapBottomSheet.tsx` | 3 | 지도 바텀시트 (3단 snap) |
| `src/components/map/MapScoreLegend.tsx` | 3 | 점수 범례 오버레이 |
| `src/components/map/MiniPreview.tsx` | 3 | 마커 프리뷰 카드 (HTML 문자열) |
| `src/components/map/MapSortOverlay.tsx` | 3 | 지도 정렬 칩 오버레이 |
| `src/components/complex/StickyCTA.tsx` | 4 | 상세 페이지 sticky CTA |
| `src/components/ui/drawer.tsx` | 0 | shadcn Drawer (vaul 기반) — 자동 생성 |

### 수정 (11개)

| 파일 | Phase | 변경 내용 |
|------|-------|-----------|
| `package.json` | 0 | vaul 의존성 추가 |
| `src/lib/constants.ts` | 0 | SESSION_KEYS.compareItems 추가 |
| `src/app/(main)/layout.tsx` | 0+1 | CompareProvider + BottomNav + pb-14 패딩 |
| `src/components/card/CardSelector.tsx` | 2 | border-[1.5px] + brand 색상 + transparent 비활성 |
| `src/components/card/PropertyCard.tsx` | 2 | accent border + hover brand-200 + 비교 토글 버튼 |
| `src/components/score/CircularGauge.tsx` | 2 | mini 폰트 caption→body-sm (12px→14px) |
| `src/app/(main)/results/page.tsx` | 2+3 | CompareBar + 풀스크린 지도 모드 |
| `src/hooks/useKakaoMap.ts` | 3 | showOverlay/hideOverlay 메서드 추가 |
| `src/components/map/KakaoMap.tsx` | 3 | MiniPreview 오버레이 연동 |
| `src/components/complex/ComplexDetailClient.tsx` | 4 | 텍스트+스타일+출처태그+StickyCTA |
| `src/__tests__/components/PropertyCard.test.tsx` | — | CompareProvider wrapper 추가 |

## 작업 단계

### Phase 0: 인프라 — ✅ 완료
- [x] vaul 설치 (`pnpm add vaul`)
- [x] shadcn drawer 생성 (`npx shadcn@latest add drawer`)
- [x] CompareContext 생성 (useReducer + sessionStorage 동기화, 최대 3개)
- [x] SESSION_KEYS.compareItems 추가
- [x] layout.tsx에 CompareProvider + BottomNav 통합 + `pb-14` 패딩

### Phase 1: BottomNav — ✅ 완료
- [x] BottomNav 5탭 생성 (홈/검색/지도/비교/MY)
- [x] fixed bottom, h-14, lg:hidden
- [x] 미구현 라우트 disabled 처리

### Phase 2: /results 리스트 뷰 — ✅ 완료
- [x] CardSelector: border-[1.5px], transparent 비활성, brand 색상 활성
- [x] PropertyCard: accent border, hover brand-200, 비교 토글 버튼
- [x] CircularGauge: mini 폰트 14px
- [x] CompareBar 생성 (sticky, bottom-14)
- [x] results page에 CompareBar 배치

### Phase 3: /results 지도 뷰 — ✅ 완료
- [x] MapScoreLegend 생성 (5단계 점수 범례)
- [x] MapSortOverlay 생성 (컴팩트 정렬 칩)
- [x] MiniPreview 생성 (마커 프리뷰 HTML)
- [x] MapBottomSheet 생성 (3단 snap + 미니 카드)
- [x] useKakaoMap: showOverlay/hideOverlay 추가
- [x] KakaoMap: MiniPreview 오버레이 연동
- [x] results page: 모바일 풀스크린 지도 모드

### Phase 4: /complex/[id] — ✅ 완료
- [x] B1: "분석 점수 상세" → "카테고리별 분석"
- [x] B2: "통근 편의성"→"통근 편의", "안전 환경"→"안전 편의시설", "학군 수준"→"학군"
- [x] A5: surface-sunken → surface-elevated
- [x] C1: 교육 그리드에 Building2 아이콘 추가
- [x] C2: 통근 섹션 뒤 transit 출처 태그
- [x] C3: 교육 섹션 뒤 public 출처 태그
- [x] C4: 보육 섹션 뒤 childcare 출처 태그
- [x] StickyCTA 생성 (비교 추가 + 공유) + 배치
- [x] 하단 면책 고지 surface-elevated 스타일

## 검증 기준

| 기준 | 결과 |
|------|------|
| `pnpm build` 성공 | ✅ 통과 |
| `vitest run` 전체 통과 (135 tests) | ✅ 통과 |
| TypeScript strict 모드 에러 없음 | ✅ 통과 |
| 기존 테스트 회귀 없음 | ✅ PropertyCard 테스트 CompareProvider wrapper 추가로 수정 |

### BLOCKED 항목 (API 데이터 부재)

| 항목 | 필요한 API 변경 |
|------|----------------|
| Factor accordion 상세 칩 (PIR +15, DTI -8) | `RecommendationItem.factors` 필드 추가 |
| 편의시설 섹션 (편의점/병원/공원) | `nearby.amenities` 필드 + DB 테이블 |
| Safety 4개 바 (가로등/비상벨) | SafetyDetail에 필드 추가 |
| 보육 카테고리 분류 (어린이집/유치원/소아과) | `NearbyChildcareItem.category` 필드 |

## 결과/결정

**상태: `done`**

5개 Phase 전체 구현 완료. 빌드 + 테스트 통과.

- 신규 컴포넌트 9개 생성, 기존 파일 11개 수정
- CompareContext로 비교 상태 관리 (sessionStorage 동기화)
- BottomNav 5탭 모바일 네비게이션 (lg:hidden)
- 풀스크린 지도 모드 + 바텀시트 + 오버레이 (모바일)
- StickyCTA (비교 + 공유) + 출처 태그 3종 추가
- BLOCKED 4건은 API 데이터 추가 시 별도 작업 예정

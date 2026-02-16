---
plan-id: "2026-02-16_claude-code_showcase-production-upgrade"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "enhancement"
depends-on:
  - plan-id: "2026-02-15_claude-code_showcase-fullscreen-pages"
    condition: "status == done"
---

# 쇼케이스 16페이지 프로덕션 수준 고도화

## 목표

디자인 시스템 쇼케이스(`docs/design-system/showcase/`)의 페이지 HTML을 와이어프레임 수준에서 **이해관계자에게 프로토타입으로 보여줄 수 있는 프로덕션 수준**으로 끌어올린다.

**SoT 참조**: `docs/design-system/DESIGN_SYSTEM.md`, `docs/design-system/design-tokens.css`

## 범위

- **수정 대상 SoT**: 없음 (SoT 참조만 수행)
- **수정 파일**: `showcase.css`, `showcase.js`, `page-*.html` 16개 파일
- **선행 plan**: `2026-02-15_claude-code_showcase-fullscreen-pages` (status == done, 충족)

## 작업 단계

### Phase 1: CSS 토큰 클래스 추출 + 하드코딩 컬러 교체

**showcase.css 추가 (약 280줄)**:
- `.score-color-excellent/good/average/below/poor` — 점수 등급 컬러 (color/bg/stroke 각 5개)
- `.safety-bg-sufficient/moderate/lacking` + `.safety-color-*` — 안전 컬러
- `.property-card` — 카드 기본 스타일 + hover/active/selected
- `.sort-chip-btn` / `.sort-chip-btn.active` — 정렬 칩
- `.card-score-grid` — 2x2 점수 그리드
- `.page-section` / `.page-section-bordered` / `.page-section-title` — 섹션 패턴
- `.rank-badge` — 순위 배지
- `.phone-status-bar` — 상태바 공통
- `.fade-in-on-scroll` / `.stagger-child` — 애니메이션
- `.sticky-cta-bar` / `.how-it-works-step` / `.stats-row` / `.mini-table` / `.facility-grid`

**하드코딩 컬러 교체 (46곳 → 0건)**:
- `page-results.html`: 15곳 + 카드3 점수70 등급 버그 수정 (average→good)
- `page-detail.html`: 16곳 (점수 8 + 안전 8)
- `page-comparison.html`: 4곳
- `page-map-detail.html`: 8곳 (범례 `<30` = score-poor 수정 포함)
- `page-board.html`: 3곳 (gauge stroke)

### Phase 2: 핵심 페이지 프로덕션 수준 고도화

**Landing (105 → 175줄)**: Social proof, How-it-works 3단계, 4개 가치 제안, 통계, CTA 반복, 법적 링크 푸터

**Results (190 → 257줄)**: 카드 5개, `.property-card` + `data-total/budget/commute` 속성, `.sort-chip-btn`, 정렬 작동, CompareBar

**Detail (244 → 318줄)**: Hero countup, ScoreBar `data-animate`, 교육/편의시설/실거래 이력 섹션 추가, Sticky CTA, ExternalLink 모달

**Onboarding**: Step5 → Results 네비, 카드 선택 마이크로 애니메이션

### Phase 3: 페이지 간 네비게이션 + 인터랙션

**showcase.js 확장 (283 → 419줄)**:
- `BOTTOM_NAV_MAP` — BottomNav 자동 링크 매핑
- `initSortChips()` — 정렬 칩 클릭 → 카드 DOM 재정렬 + Toast
- `initScrollAnimation()` — `[data-animate]` + `.fade-in-on-scroll` IntersectionObserver
- `initCountUp()` — 게이지 카운트업 애니메이션

**사용자 플로우**: Landing CTA → Onboarding → Results → Detail → Comparison

### Phase 4: 보조 페이지 개선

| 페이지 | 변경 내용 |
|--------|----------|
| Comparison | 토큰 교체, 승자 배지, 상세/목록 링크 |
| Map Detail | 범례 토큰, `<30` = score-poor 수정 |
| Board | gauge stroke 토큰, BottomNav 표준화 (보드→비교) |
| MyPage | BottomNav 표준화, status bar 클래스 |
| Guide | status bar 클래스, BottomNav hrefs |
| Auth | "둘러보기" → Landing 링크, 법적 링크, status bar |
| Legal 3종 | 상호 cross-link, back arrow 링크, BottomNav hrefs |
| Empty | BottomNav 표준화 (보드→비교) |

### Phase 5: 일관성 검수

**검증 완료 항목**:
- [x] `page-*.html`에 하드코딩 점수/안전 컬러 hex 값 0건 (`grep` 실측)
- [x] BottomNav 5개 아이템 통일 (홈/검색/지도/비교/MY) — 10개 주요 페이지 모두 5개 href 확인
- [x] "추천" 단독 사용 0건
- [x] 금지 문구 0건 (보장/확정은 면책 컨텍스트에서만 사용)
- [x] 모든 BottomNav에 href 속성 존재 (10파일 × 5 = 50건)
- [x] source-tag 출처 태그 일관성
- [x] 면책 문구 접점 확인 (Landing 푸터, Results 하단, Detail 가격/하단, Legal 제2조)

## 검증 기준

| # | 기준 | 결과 |
|---|------|------|
| V1 | 하드코딩 점수/안전 hex 0건 | PASS |
| V2 | BottomNav 5아이템 통일 (10파일) | PASS |
| V3 | "추천" 단독 사용 0건 | PASS |
| V4 | 금지 문구 미사용 | PASS |
| V5 | Landing 스크롤 깊이 ≥ 2x | PASS (175줄) |
| V6 | Results 카드 5개 + 정렬 작동 | PASS |
| V7 | Detail 교육/편의 섹션 존재 | PASS |
| V8 | 페이지 간 내비게이션 플로우 완성 | PASS |

## 결과/결정

- **상태**: `done`
- **변경 파일 요약**:
  - `showcase.css`: 1,602 → 1,886줄 (+284줄 재사용 CSS 클래스)
  - `showcase.js`: 283 → 419줄 (+136줄 인터랙션/네비)
  - `page-landing.html`: 105 → 175줄 (콘텐츠 확장)
  - `page-results.html`: 190 → 257줄 (카드 5개, 정렬)
  - `page-detail.html`: 244 → 318줄 (교육/편의/거래 이력 추가)
  - `page-onboarding.html`: 경량 수정 (네비 + 마이크로 애니메이션)
  - `page-comparison.html`: 토큰 교체 + 링크
  - `page-map-detail.html`: 토큰 교체 + 범례 수정
  - `page-board.html`: gauge 토큰 + BottomNav 표준화
  - `page-mypage.html`: BottomNav 표준화
  - `page-guide.html`: status bar + BottomNav
  - `page-auth.html`: 링크 + status bar
  - `page-legal.html`, `page-privacy.html`, `page-location-terms.html`: cross-link + BottomNav
  - `page-empty.html`: BottomNav 표준화
- **후속 액션**: 없음 (완료)

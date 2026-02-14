---
plan-id: "2026-02-14_claude-code_design-preview-showcase"
status: "done"
phase: "PHASE1"
template-version: "1.1"
work-type: "feature"
depends-on:
  - plan-id: "2026-02-14_claude-code_design-system"
    condition: "status == done"
---

# 디자인 시스템 종합 프리뷰 쇼케이스 구현

> **SoT 참조**: 컴포넌트 명세(25종) → `docs/design-system/DESIGN_SYSTEM.md` §3 | 페이지 패턴(6종) → §4 | 디자인 토큰 → `docs/design-system/design-tokens.css`

## 1. 목표

기존 `design-system-preview.html`(9개 컴포넌트 단순 프리뷰)을 **Storybook 스타일 정적 HTML 종합 쇼케이스**로 확장한다.

- §3 SoT 기준 **25개 컴포넌트** 전수 개별 프리뷰
- §4 기준 **6개 페이지 레이아웃** 390px 모바일 프레임 프리뷰
- Light/Dark 모드 전환
- 사이드바 네비게이션 (768px 미만 반응형)
- 빌드 도구 없이 브라우저에서 바로 열어볼 수 있는 멀티 파일 (showcase/ 디렉토리)

## 2. 범위

### 수정 대상

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `docs/design-system/design-system-preview.html` | 교체 | showcase/ 리다이렉트로 교체 |
| `docs/design-system/showcase/` (18파일) | 신규 | 종합 쇼케이스 (index + CSS + JS + 15 섹션 HTML) |
| `docs/design-system/design-tokens.css` | 사이드 픽스 | 14행 참조 경로 수정 |
| `docs/design-system/DESIGN_SYSTEM.md` | 사이드 픽스 | 48행, 737행 참조 경로 수정 |
| `docs/plan/README.md` | 추가 | #9 행 추가 |

### SoT 보호

- PHASE1 S2(DB 스키마), S4(스코어링 로직) **미변경**
- DESIGN_SYSTEM.md §3/§4 컴포넌트 명세 **미변경** (참조만)

### 선행 plan

- `2026-02-14_claude-code_design-system` (status: done) — 디자인 시스템 명세서 생성 완료

## 3. 작업 단계

| Step | 내용 | 산출물 |
|------|------|--------|
| 1 | Plan 문서 생성 | 본 문서 |
| 2 | HTML 기본 구조 + 사이드바 네비게이션 | design-system-preview.html (shell) |
| 3 | 토큰 섹션 이관 + 개선 | 컬러/타이포/간격/그림자/애니메이션 |
| 4 | 컴포넌트: 스코어 시각화 | CircularGauge, ScoreBar, ScoreBadge, RadarChart |
| 5 | 컴포넌트: 카드 | PropertyCard, ComparisonCard, MiniPreviewCard |
| 6 | 컴포넌트: 네비게이션 | BottomNav, BottomSheet, CompareBar, CardSelector |
| 7 | 컴포넌트: 입력 | AmountInput, AddressSearch, StepWizard, ConsentForm |
| 8 | 컴포넌트: 지도 + 신뢰 + 피드백 | MapMarker, Clustering, Legend, TrustBadge, ExternalLinkCTA, Toast, Tooltip, Skeleton |
| 9 | 보조 UI 패턴 + 페이지 레이아웃 | Button 4변형, 양방향 싱크, 6개 페이지 |
| 10 | 참조 경로 수정 + 검증 + 커밋 제안 | 사이드 픽스 3건 + README 갱신 |

## 4. 검증 기준

- [x] 사이드바 네비게이션으로 모든 섹션 접근 가능
- [x] 토큰 섹션: 컬러(36종), 타이포(6단계+가격), 간격, 그림자 표시
- [x] §3 기준 25개 컴포넌트 전수 프리뷰
- [x] 보조 UI 패턴: Button 4변형 + 양방향 싱크 (별도 섹션)
- [x] 6개 페이지 레이아웃 390px 프레임 프리뷰
- [x] Light/Dark 모드 전환
- [x] 인터랙션: 바텀시트 3단, 모달, 토스트, 스켈레톤 shimmer
- [x] CSS 애니메이션: gauge count-up, bar expand
- [x] 금지 문구 미사용 (가드레일 참조표 제외)
- [x] 외부 의존: Pretendard CDN only
- [x] 768px 미만 반응형
- [x] 참조 경로 3건 수정 완료
- [x] PHASE1 S2/S4 미변경

## 5. 결과/결정

- **상태**: `done`
- **산출물**: `docs/design-system/showcase/` (18파일)
  - `index.html` — 메인 개요 + 컴포넌트 커버리지 25/25
  - `showcase.css` + `showcase.js` — 공유 스타일/JS
  - `tokens.html` — 컬러 36종, 타이포 6단계, 간격, 그림자, 애니메이션
  - `comp-*.html` (8파일) — §3 25개 컴포넌트 + Button 보조 패턴
  - `page-*.html` (6파일) — §4 6개 페이지 레이아웃 390px 프레임
- **사이드 픽스**: 참조 경로 3건 수정 (design-tokens.css 14행, DESIGN_SYSTEM.md 48행/737행)

### Run 1 (2026-02-14)

```json
{
  "phase": "PHASE1",
  "verdict": "go",
  "run": 1,
  "score": { "completeness": 1.0, "consistency": 1.0, "compliance": 1.0 },
  "blockers": [],
  "next_actions": [],
  "timestamp": "2026-02-14"
}
```

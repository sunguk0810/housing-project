---
plan-id: "2026-02-15_claude-code_showcase-enhancement"
status: "done"
phase: "PHASE2"
template-version: "1.1"
depends-on:
  - plan-id: "2026-02-15_claude-code_p0-design-token-implementation"
    condition: "status == done"
---

# Showcase HTML 고도화 — 4변형 토큰 · 다크모드 · Semantic 시각화

## 목표

P0 디자인 토큰 개선(plan #27)에서 추가된 59개 신규 토큰(Score 5등급×4변형, Safety 3등급×4변형, 다크모드 35개, Display 타입, Surface/Primary 시맨틱 토큰)을 Showcase HTML에서 시각적으로 완전히 문서화한다.

## 범위

- **수정 대상**: `docs/design-system/showcase/tokens.html`, `showcase.css`, `index.html`
- **SoT 참조**: `docs/design-system/design-tokens.css` (토큰 값 원본)
- **선행 plan**: #27 `2026-02-15_claude-code_p0-design-token-implementation` (status == done)

## 작업 단계

1. `showcase.css` — 4변형 카드 그리드, Semantic Token 테이블, Surface 데모 스타일 추가
2. `tokens.html` — Score 5등급 × 4변형 variant-card 추가 (20개 토큰)
3. `tokens.html` — Safety 3등급 × 4변형 variant-card 추가 (12개 토큰)
4. `tokens.html` — Semantic Token Light/Dark 비교 테이블 (10개 토큰)
5. `tokens.html` — Surface Elevation Stack 실물 데모
6. `index.html` — 토큰 카드 텍스트 "컬러 69종 · 타이포 7단계"로 갱신

## 검증 기준

1. Score 5개 + Safety 3개 variant-card가 올바르게 렌더링
2. Semantic Token 테이블에 Light/Dark 컬럼별 스워치+HEX 표시
3. Surface Stack 3단계가 라이트/다크 양쪽에서 시각적 계층 차이 명확
4. index.html에 "69종", "7단계" 텍스트 반영
5. 신규 CSS 클래스가 기존 스타일과 충돌 없음

## 결과/결정

- **상태**: `done`
- 모든 작업 단계 완료
- **변경 파일 4건**:
  - `docs/design-system/showcase/showcase.css` — 4변형 카드 그리드, Semantic Token 테이블, Surface 데모 CSS (3개 섹션 추가)
  - `docs/design-system/showcase/tokens.html` — Score 5개 + Safety 3개 variant-card, Semantic Token Light/Dark 비교 테이블(10행), Surface Elevation Stack, Display 타이포 토큰 변수 적용
  - `docs/design-system/showcase/index.html` — "컬러 69종 · 타이포 7단계" 텍스트 갱신
  - `docs/plan/2026-02-15_claude-code_showcase-enhancement.md` — 본 Plan Execute 문서

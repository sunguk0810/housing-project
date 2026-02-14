---
plan-id: "2026-02-14_claude-code_showcase-visual-modernization"
status: "done"
phase: "PHASE1"
template-version: "1.1"
work-type: "feature"
depends-on:
  - plan-id: "2026-02-14_claude-code_design-preview-showcase"
    condition: "status == done"
---

# 디자인 시스템 쇼케이스 시각 품질 현대화

## 목표

현재 쇼케이스(6.5/10)를 2025~2026 Storybook/Radix/shadcn 수준(9/10)으로 시각 품질 현대화.
- 깊이감 있는 표면/그림자 시스템
- 스프링 기반 트랜지션/이징
- 접근성 focus-visible 전수 적용
- 글래스모피즘/블러 효과
- Dark Mode 3단계 표면 고도 구분

## 범위

### 수정 대상

| 파일 | 변경 유형 |
|------|----------|
| `showcase.css` | 대폭 수정 — 핵심 스타일 현대화 |
| `showcase.js` | 부분 수정 — IntersectionObserver, 테마 전환 |
| `index.html` | 부분 수정 — 카드 hover class 적용 |
| `comp-feedback.html` | 부분 수정 — 툴팁 arrow 마크업 |

### SoT 보호 (미변경)

- `design-tokens.css` — 토큰 값 미변경
- `DESIGN_SYSTEM.md` — 명세 미변경
- PHASE1 S2(DB 스키마), S4(스코어링 로직) — 미변경

### 선행 plan

- `2026-02-14_claude-code_design-preview-showcase` (status: done) ✅

## 작업 단계

1. Plan 문서 생성 + README 갱신
2. 기반 — 트랜지션/이징 시스템 + 접근성 (C3, C4)
3. Header 현대화 (C1)
4. Demo Card 인터랙션 + 표면 (C2, C6)
5. 타이포그래피 위계 강화 (C5)
6. Sidebar 정제 (M1)
7. Modal/Overlay 개선 (M2)
8. Phone Frame 리디자인 (M3)
9. Button 상태 완성 + Dark Mode 표면 고도 (M4, M5)
10. Moderate 폴리시 (m1~m9)
11. showcase.js 개선
12. 검증 + Plan 문서 완성 + 커밋 제안

## 검증 기준

- [x] Header: 그라디언트 + 하단 그림자 적용
- [x] Demo Card: hover 시 translateY(-2px) + shadow 증가
- [x] 모든 인터랙티브 요소에 :focus-visible ring 존재 (7개 셀렉터)
- [x] prefers-reduced-motion: reduce 시 애니메이션/트랜지션 비활성화
- [x] Modal: backdrop-filter: blur 동작 + @supports fallback
- [x] Phone Frame: 다이나믹 아일랜드 시뮬레이션 + float shadow
- [x] Button: active scale(0.97) + hover box-shadow
- [x] Dark Mode: 표면 3단계 고도 구분 (content/card/modal)
- [x] Sidebar: 스크롤바 커스텀, 그룹 간 여백 개선
- [x] Tooltip: arrow(caret) CSS ::before 삼각형 표시
- [x] 토큰 swatch: hover scale(1.05) 동작
- [x] 트랜지션: spring easing (--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1))
- [x] Light/Dark 전환 시 body transition 적용
- [x] 기존 25/25 컴포넌트 + 6/6 페이지 정상 표시 유지 (HTML 구조 미변경)
- [x] 768px 미만 반응형 정상 (sidebar 300ms ease-out-expo)
- [x] Pretendard CDN only (추가 의존 없음)
- [x] PHASE1 S2/S4 미변경 (git diff 확인)
- [x] Plan 문서 필수 섹션 5개 존재 + frontmatter 포함
- [x] docs/plan/README.md #11 행 추가 완료
- [x] backdrop-filter 사용 시 @supports fallback 적용 (header, modal 2곳)

## 결과/결정

- **상태**: `done`
- **Verification Run 1**:
  ```json
  {
    "run": 1,
    "date": "2026-02-14",
    "checklist_total": 20,
    "pass": 20,
    "fail": 0,
    "blockers": 0,
    "verdict": "go"
  }
  ```
- **변경 파일 요약**:
  - `showcase.css`: 전면 현대화 (C1~C6, M1~M5, m1~m9 전수 반영)
  - `showcase.js`: IntersectionObserver 도입, 모바일 사이드바 자동 닫기
  - `index.html`: 카드 링크 인라인 스타일 제거 (CSS class로 대체)
  - `comp-feedback.html`: 변경 없음 (tooltip arrow는 CSS ::before로 처리)
- **SoT 보호**: `design-tokens.css`, `DESIGN_SYSTEM.md`, PHASE1 S2/S4 — 모두 미변경 확인
- **후속 액션**: 없음 (완료)

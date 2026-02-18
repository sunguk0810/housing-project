---
plan-id: "2026-02-18_claude-code_landing-page-rebuild"
status: "done"
phase: "PHASE3"
template-version: "1.1"
work-type: "feature"
---

# 랜딩 페이지 7섹션 전면 재구축

## 목표

집콕신혼 `/` 랜딩 페이지를 7개 섹션 구조로 전면 재구축하여, 신규 사용자에게 서비스 가치를 전달하고 `/search` (온보딩)로 전환율을 높인다.

## 범위

- **수정**: `src/app/(main)/page.tsx`, `src/app/globals.css`
- **신규**: `src/components/landing/` 하위 10개 파일 (7섹션 + ScrollReveal + CountUp + TrackingPixel)
- **삭제**: `src/components/layout/LandingContent.tsx`
- **SoT 참조**: PHASE0 컴플라이언스 규칙, PHASE1 디자인 토큰 (수정 없음, 참조만)

## 작업 단계

### Phase 1: 인프라 (Client 컴포넌트 3개)
1. `ScrollReveal.tsx` — Intersection Observer 래퍼
2. `CountUp.tsx` — 카운트업 애니메이션
3. `TrackingPixel.tsx` — useTracking 래퍼

### Phase 2: 정적 섹션 5개 (RSC)
4. `ProblemSection.tsx` — 3장 고민 카드
5. `StepsSection.tsx` — 3스텝 + 번호 배지
6. `CategoriesSection.tsx` — 2×2 카테고리 그리드
7. `PreviewSection.tsx` — 블러 모크업 placeholder
8. `FinalCTASection.tsx` — 최종 CTA

### Phase 3: 복잡 섹션 2개
9. `HeroSection.tsx` — 분할 레이아웃 + 비주얼 모크업 + CSS stagger
10. `TrustSection.tsx` — 데이터 출처 + CountUp + 면책

### Phase 4: 조립 & CSS
11. `page.tsx` 재작성 — 전체 섹션 조립 + ScrollReveal 래핑
12. `globals.css` — fadeSlideUp keyframe 추가
13. `LandingContent.tsx` 삭제

## 검증 기준

- [x] `pnpm run build` 성공 — `/` 정적 페이지 정상 생성
- [x] `pnpm run lint` 통과 — 에러 0건 (기존 warning 1건 유지)
- [x] 컴플라이언스: 금지 문구 미사용, TrustSection 면책 `data-disclaimer` 포함
- [x] 접근성: aria-labelledby + id 매칭, Hero만 h1, S2~S7 h2, CTA 48px
- [x] RSC/Client 분리: 7개 섹션 RSC, 3개 인프라 Client

## 결과/결정

- **상태**: `done`
- **핵심 결과**:
  - 13개 파일 변경 (신규 10, 수정 2, 삭제 1)
  - 추가 수정: `src/types/api.ts`에 기존 `RATE_LIMITED` 타입 누락 수정
  - `globals.css`에 `fadeSlideUp` keyframe + `prefers-reduced-motion` 미디어 쿼리 추가
  - ScrollReveal/CountUp: ref 기반 DOM 조작으로 `react-hooks/set-state-in-effect` 린트 규칙 준수

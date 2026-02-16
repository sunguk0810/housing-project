---
plan-id: "2026-02-16_claude-code_m3-code-review-fixes"
status: "done"
phase: "PHASE3"
template-version: "1.1"
work-type: "feature"
depends-on:
  - plan-id: "2026-02-16_claude-code_m3-design-system-mobile-matching"
    condition: "status == done"
---

# M3 Code Review 조치 플랜

## 목표

M3 프론트엔드 구현 후 전체 코드 리뷰에서 발견된 Critical 9건, Suggestion 15건, Nit 7건 이슈를 6개 배치로 조치한다.

## 범위

- SoT 참조: PHASE0 S4 (컴플라이언스), PHASE1 S2 (스키마)
- 선행 plan: `2026-02-16_claude-code_m3-design-system-mobile-matching` (status == done)
- 수정 대상: 프론트엔드 컴포넌트, 훅, 페이지, 테스트, API 라우트, 미들웨어

## 작업 단계

### Batch 1: Security Hardening (Critical)
- 1a. XSS 방지 — escapeHtml 유틸 + MiniPreview 적용
- 1b. Cache Key Injection 방지 — sanitizeCacheKey
- 1c. Rate Limiting 미들웨어

### Batch 2: Error Handling & Architecture (Critical)
- 2a. 글로벌 Error Boundary
- 2b. Layout 서버 컴포넌트 전환
- 2c. Self-fetch 안티패턴 제거
- 2d. sessionStorage JSON.parse 검증

### Batch 3: Compliance & Legal Safety (Critical)
- 3a. DisclaimerBanner 기본값 수정
- 3b. 컴플라이언스 테스트 확장

### Batch 4: React Patterns & Performance (Suggestion)
- 4a. Step5Analysis exhaustive-deps 개선
- 4b. useStepForm 렌더링 최적화
- 4c. ComplexDetailClient useMemo → useState
- 4d. MapBottomSheet 드래그 개선
- 4e. PropertyCard React.memo
- 4f. StepWizard consent 버튼 type
- 4g. N+1 쿼리 개선

### Batch 5: Test Quality (Suggestion)
- 5a. localStorage 테스트 개선
- 5b. CircularGauge 테스트명 정확도

### Batch 6: Nits & DRY Cleanup
- 6a. MapScoreLegend 임계값 정렬
- 6b. SORT_OPTIONS 중복 제거
- 6c. Import 정리
- 6d. ANALYSIS_STEPS DRY
- 6e. 페이지 metadata 추가

## 검증 기준

- [ ] `vitest run` 전체 통과
- [ ] `pnpm build` 성공
- [ ] 검색 → 결과 → 상세 플로우 정상
- [ ] 면책 배너 기본 표시 정상

## 결과/결정

- 상태: `done`
- 검증 결과:
  - `pnpm build`: 성공
  - `vitest run`: 19개 파일, 136개 테스트 전체 통과
  - TypeScript 타입 체크: 소스 파일 오류 없음

### 변경 요약

| Batch | 수정 파일 | 핵심 변경 |
|-------|----------|----------|
| 1 | 4개 (신규 2 + 수정 2) | escapeHtml, sanitizeCacheKey, rate limit middleware |
| 2 | 7개 (신규 4 + 수정 3) | error boundaries, layout 서버 컴포넌트, self-fetch 제거, JSON 검증 |
| 3 | 2개 (수정 2) | DisclaimerBanner 기본값, 컴플라이언스 테스트 확장 |
| 4 | 7개 (수정 7) | deps ref, useState lazy init, useRef 드래그, React.memo, button type, p-limit N+1 |
| 5 | 2개 (수정 2) | localStorage 테스트, CircularGauge 테스트명 |
| 6 | 8개 (신규 1 + 수정 7) | 범례 임계값, SORT_OPTIONS DRY, import 병합, ANALYSIS_STEPS DRY, 페이지 metadata |

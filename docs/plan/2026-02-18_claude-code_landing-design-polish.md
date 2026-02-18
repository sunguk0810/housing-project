---
plan-id: "2026-02-18_claude-code_landing-design-polish"
status: "done"
phase: "PHASE3"
template-version: "1.1"
work-type: "feature"
depends-on:
  - plan-id: "2026-02-18_claude-code_landing-page-rebuild"
    condition: "status == done"
---

# 랜딩 페이지 디자인 품질 개선

## 목표

스크린샷 디자인 리뷰 결과를 반영하여, 와이어프레임 수준의 현재 랜딩 페이지를 프로덕션급 비주얼 퀄리티로 끌어올린다.

## 범위

- **수정 대상**: `src/components/landing/` 하위 7개 섹션 + `globals.css`
- **SoT 참조**: PHASE0 컴플라이언스 (수정 없음), PHASE1 디자인 토큰 (수정 없음)

## 작업 단계

### 1. Hero — 비주얼 임팩트 강화
- SVG arc 게이지로 교체, 프로그레스 바 두께 증가
- 모크업 카드에 글로우 효과, 배경 그라데이션 강화

### 2. Problem — 카드 개성 부여
- 카드별 고유 컬러 좌측 보더 + 이모지 배경 원
- 볼드 제목 추가, 텍스트 크기 조정

### 3. Steps — 타임라인 레이아웃
- 모바일: 좌측 정렬 타임라인 (세로선 + 번호 배지)
- 번호 배지 크기 44px로 확대

### 4. Categories — 카드 컬러 악센트
- 카드별 고유 컬러 상단 보더
- 이모지를 컬러 원 안에 배치, 메트릭 배지 강화

### 5. Preview — 폰 프레임 모크업
- 폰 프레임 UI + 강한 블러 + 오버레이 CTA

### 6. Trust — 데이터 출처 카드화
- 출처를 카드/배지 형태로, 카운터에 장식 프레임

### 7. FinalCTA — 마무리 임팩트
- 그라데이션 강화, 장식 요소 추가

### 8. Cross-cutting
- 섹션 간 배경 차이 강화
- 섹션 헤더 패턴 다양화

## 검증 기준

- [x] `pnpm run build` 성공 — `/` 정적 페이지 정상 생성
- [x] `pnpm run lint` 통과 — 에러 0건
- [x] 컴플라이언스 유지 — 면책 `data-disclaimer` 속성 유지, 금지 문구 없음

## 결과/결정

- **상태**: `done`
- **핵심 변경 요약**:
  - Hero: SVG arc 게이지, radial glow 배경, 브랜드 컬러 shadow CTA
  - Problem: 카드별 컬러 좌측 보더 + 이모지 배경 원 + 볼드 제목 추가
  - Steps: 모바일 좌측 타임라인 레이아웃 (세로선 연결), 44px 번호 배지
  - Categories: 컬러 상단 바 + 이모지 배경 원 + 보더 카드 + 컬러 메트릭 배지
  - Preview: 폰 프레임 UI + 강한 블러 + 글래스 오버레이 CTA
  - Trust: 출처 3열 카드 그리드 + 그라데이션 카운터 프레임
  - FinalCTA: 더 깊은 그라데이션 + 장식 blur circle

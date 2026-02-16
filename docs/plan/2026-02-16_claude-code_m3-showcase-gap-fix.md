---
plan-id: "2026-02-16_claude-code_m3-showcase-gap-fix"
status: "done"
phase: "PHASE3"
template-version: "1.1"
work-type: "feature"
---

# 쇼케이스 ↔ 구현 갭 수정

## 목표

디자인 시스템 쇼케이스 페이지(page-results.html, page-detail.html)와 실제 구현 컴포넌트 간의 시각적 차이를 해소한다.

## 범위

- SoT 참조: PHASE3 쇼케이스 HTML, 디자인 토큰
- 수정 대상: PropertyCard, ComplexDetailClient, SafetySection, PropertyCard 테스트

## 작업 단계

### 1. PropertyCard 쇼케이스 매칭
- 차원 점수에 이모지 아이콘 추가 (💰🚇🏫🛡️📚)
- 점수 그리드를 2열 grid 레이아웃으로 변경
- hover 시 translateY(-0.5) 애니메이션 추가
- active 시 scale(0.98) 피드백 추가
- 통근 시간 행에 🚇 이모지 추가

### 2. ComplexDetailClient 히어로 중앙 정렬
- CircularGauge를 중앙 상단으로 이동 (쇼케이스 패턴)
- 아파트명, 주소, 세대수, 준공년을 중앙 텍스트로 통합
- ScoreBadge를 중앙에 inline-flex로 배치

### 3. 실거래가 미니 테이블
- 기존 리스트 → table 레이아웃 (거래일, 유형, 가격, 건수)
- 상단에 대표 가격 + 국토교통부 출처 태그
- 하단 참고용 면책 문구

### 4. 통근 섹션 카드 스타일
- 기존 그리드 → 쇼케이스 패턴 (중앙 정렬 카드, 브랜드 컬러 시간)
- `flex-1` 카드로 균등 배분

### 5. 교육/보육 시설 그리드
- 학교 데이터를 초/중/고 facility grid로 표시
- 보육시설 카운트 grid + 상세 리스트 병행

### 6. SafetySection 프로그레스 바
- 기존 카드 레이아웃 → 프로그레스 바 행 (쇼케이스 safety-bar-row 패턴)
- CCTV, 안전시설 각각 수평 바 + 레벨 텍스트 (상위/보통/부족)

### 7. 테스트 수정
- PropertyCard 이모지 반영 (regex 매칭으로 변경)
- 중복 텍스트 매칭 수정 (getAllByText)

## 검증 기준

- `pnpm lint` 0 errors
- `pnpm build` 타입 에러 0
- `pnpm vitest --run` 전체 통과

## 결과/결정

- 상태: `done`
- lint 0 errors, build 성공, vitest 19파일 135/135 통과

### 변경 파일 요약 (4건)

| 파일 | 작업 |
|------|------|
| `src/components/card/PropertyCard.tsx` | 이모지 아이콘, 2열 그리드, hover/active 애니메이션 |
| `src/components/complex/ComplexDetailClient.tsx` | 중앙 히어로, 미니 테이블, 통근 카드, 교육/보육 grid |
| `src/components/trust/SafetySection.tsx` | 프로그레스 바 레이아웃 |
| `src/__tests__/components/PropertyCard.test.tsx` | 이모지 반영 테스트 수정 |

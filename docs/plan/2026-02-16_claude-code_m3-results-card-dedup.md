---
plan-id: "2026-02-16_claude-code_m3-results-card-dedup"
status: "done"
phase: "PHASE3"
template-version: "1.1"
work-type: "feature"
depends-on:
  - plan-id: "2026-02-16_claude-code_m3-implementation-spec"
    condition: "status == done"
---

# /results 페이지 — 쇼케이스 갭 해소 + 데이터 중복 수정

## 목표

PropertyCard를 쇼케이스 디자인(`page-results.html`)에 맞게 재구성하고, API `selectDistinctOn`으로 데이터 중복을 수정하여 결과 페이지 완성도를 높인다.

SoT 참조: PHASE1 S2 (DB 스키마), PHASE1 S4 (스코어링 로직)

## 범위

### In-scope
- API 데이터 중복 수정 (`selectDistinctOn`)
- RecommendationItem 타입 확장 (4필드)
- PropertyCard 수직 스택 레이아웃 재설계
- CardSelector 라벨, DataSourceTag info 타입 추가
- 결과 페이지 헤더/면책조항 보강
- 테스트 업데이트

### Out-of-scope
- CompareBar, BottomNav, /comparison 페이지

## 작업 단계

1. RecommendationItem 타입 확장 (4필드)
2. API `selectDistinctOn` + 새 필드 반환
3. formatPrice, formatTradeTypeLabel 유틸 추가
4. PropertyCard 수직 스택 재설계
5. CardSelector 라벨 + DataSourceTag info 추가
6. 결과 페이지 헤더/태그/면책조항 보강
7. 테스트 mock + assertion 업데이트
8. lint + build + test 검증

## 검증 기준

- `pnpm lint` 0 errors
- `pnpm build` 타입 에러 0
- `pnpm vitest --run` 전체 통과
- PropertyCard에 5차원 점수, 가격, 세대수, 통근시간 표시
- API 응답에 aptId 중복 없음

## 결과/결정

- 상태: `done`
- `pnpm lint`: 0 errors
- `pnpm build`: 타입 에러 0, 정상 빌드
- `pnpm vitest --run`: 135 tests passed (19 suites)

### 변경 파일 요약

| # | 파일 | 변경 |
|---|------|------|
| 1 | `src/types/api.ts` | RecommendationItem에 tradeType, averagePrice, householdCount, areaMin 추가 |
| 2 | `src/app/api/recommend/route.ts` | `selectDistinctOn` 적용 + householdCount/areaMin/tradeType/averagePrice 반환 |
| 3 | `src/lib/format.ts` | formatPrice, formatTradeTypeLabel 추가 |
| 4 | `src/components/card/PropertyCard.tsx` | 수직 스택 레이아웃 재설계 (5차원 점수, 가격, 통근시간) |
| 5 | `src/components/card/CardSelector.tsx` | 라벨에 "순" 추가 |
| 6 | `src/components/trust/DataSourceTag.tsx` | info 타입 + Info 아이콘 추가 |
| 7 | `src/app/(main)/results/page.tsx` | 뒤로가기 버튼, 헤더 포맷 변경, 3번째 소스 태그, 면책조항 |
| 8 | `src/__tests__/components/PropertyCard.test.tsx` | mock 4필드 추가 + 5차원/가격/통근 assertion |
| 9 | `src/__tests__/pages/results.test.tsx` | mock 4필드 추가 |
| 10 | `tests/integration/api.test.ts` | selectDistinctOn mock 추가 + mock data 갱신 |

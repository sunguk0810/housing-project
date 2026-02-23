---
plan-id: recommend-api-enhancement
status: done
phase: M4
template-version: "1.1"
depends-on: []
---

# POST /api/recommend 보강 — 예산 최대화 + 서버 소팅 + 면적별 가격

## 목표

사용자 피드백 3건을 해결하여 분석 결과 품질 향상:
1. **예산 최대화 문제**: `value_maximized` 프로필에서 budget weight=0이라 가격이 랭킹에 반영 안 됨
2. **서버사이드 소팅**: 종합/예산/통근 정렬이 클라이언트 정렬 → 서버 정렬로 전환
3. **면적별 가격 표시**: averagePrice가 모든 평형의 평균이라 기준 불명확

## 범위

| 항목 | 변경 파일 |
|------|----------|
| 스코어링 엔진 | `src/lib/engines/scoring.ts` |
| API 라우트 | `src/app/api/recommend/route.ts` |
| 타입 정의 | `src/types/api.ts` |
| 프론트엔드 결과 페이지 | `src/app/(main)/results/page.tsx` |
| PropertyCard | `src/components/card/PropertyCard.tsx` |
| 테스트 (4개) | `tests/unit/scoring.test.ts`, `src/__tests__/pages/results.test.tsx`, `src/__tests__/components/PropertyCard.test.tsx`, `src/__tests__/components/compare.test.tsx` |

## 작업 단계

### Step 1: value_maximized 예산 스코어링 수정

- `normalizeBudgetLinear()` 함수 추가: `min(price/maxPrice, 1.0)` — 선형, 가격 높을수록 높은 점수
- `calculateFinalScore()` 내부에서 `value_maximized`일 때 budget dimension을 linear로 교체
- 가중치 변경: budget 0→0.25, commute 0.30→0.23, childcare 0.18→0.14, safety 0.18→0.14, school 0.15→0.12, complexScale 0.19→0.12

### Step 2: 면적별 가격 집계

- SQL CTE에 `priceAreaFilterNoAlias`/`priceAreaFilterWithAlias` 추가 (desiredAreas < 3일 때)
- `latest_agg` CTE에 `AVG(p.exclusive_area::numeric) AS representative_area` 추가
- `RecommendationItem`에 `representativeArea?: number | null` optional 필드 추가 (하위 호환)
- PropertyCard 가격 라인에 `(N㎡ 기준)` 표시

### Step 3: 서버사이드 정렬 순서

- `SortOrders` 인터페이스 추가: `score`, `budget`, `commute` 각각 aptId 배열
- `RecommendMeta`에 `sortOrders?: SortOrders` 추가 (optional → 하위 호환)
- route.ts: ranked 배열에서 3개 정렬 순서 계산 (byScore, byBudget, byCommute)
- results/page.tsx: 서버 sortOrders 우선 사용, 없으면 기존 클라이언트 sortItems fallback

### Step 4: 테스트 업데이트

- S-32 재작성: value_maximized에서 높은 가격 → 높은 budget + 높은 finalScore
- S-35 추가: linear(100%→1.0) vs bell curve(100%→0.7) 검증
- results.test.tsx: mockItem에 representativeArea, meta에 sortOrders 추가, 서버 정렬 테스트 추가
- PropertyCard.test.tsx, compare.test.tsx: representativeArea 필드 추가

## 검증 기준

| 검증 항목 | 결과 |
|-----------|------|
| Unit tests: `pnpm exec vitest run tests/unit/scoring.test.ts` | 36 pass |
| Component tests: `pnpm exec vitest run src/__tests__/` | 98 pass (134 total) |
| TypeScript: `pnpm run build` | 성공 |
| 하위 호환: sortOrders/representativeArea optional | 구 캐시 호환 확인 |

## 결과/결정

- **상태**: `done`
- **변경 요약**:
  - value_maximized에서 예산 9억 시 고가 아파트가 상위 랭킹 (linear budget scoring)
  - 서버에서 3개 정렬 순서 사전 계산하여 응답에 포함
  - 면적 필터링된 거래 기준 대표 면적을 가격 옆에 표시
  - 모든 신규 필드 optional → sessionStorage 캐시 하위 호환 유지
- **SoT 참조**: PHASE1 S4 (스코어링 로직)

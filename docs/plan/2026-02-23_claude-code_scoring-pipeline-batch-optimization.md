---
plan-id: scoring-pipeline-batch-optimization
status: done
phase: phase2
template-version: "1.1"
---

# 스코어링 파이프라인 쿼리 성능 최적화

## 목표

`/api/recommend`와 `/api/budget-sensitivity` 공통 스코어링 파이프라인의 N+1 쿼리 패턴을 배치 쿼리로 전환하여 응답 시간을 개선한다.

- recommend: ~1,000 쿼리/요청 → 4 쿼리/요청
- budget-sensitivity: ~5,000 쿼리/요청 → 4 쿼리 + 5회 순수 JS 스코어링

## 범위

| 레이어 | 내용 | 예상 효과 |
|--------|------|-----------|
| L1 | `apartment_prices` 복합 인덱스 추가 | 후보 조회 가속 |
| L2 | 공간 쿼리 배치화 (N+1 제거) | ~1,000 쿼리 → 4 쿼리 |
| L3 | budget-sensitivity enrichment 1회 캐싱 | 5회 enrichment → 1회 + 5회 순수 JS |

SoT 참조: M2 spec Section 6.1 (Steps 6-10), PHASE1 S4

## 작업 단계

### L1: 복합 인덱스 추가
- `drizzle/0002_scoring_pipeline_indexes.sql` 신규 생성 — `(trade_type, year, month, apt_id)` 복합 인덱스
- `db/schema.sql` 인덱스 선언 추가

### L2: 배치 공간 쿼리 (핵심 변경)

1. `spatial.ts`: `parseRouteSnapshot()` export 추가
2. `src/lib/queries/batch-spatial.ts` 신규 — 4개 배치 함수:
   - `batchChildcareCounts()`: LEFT JOIN + ST_DWithin + GROUP BY
   - `batchSchoolScores()`: LEFT JOIN + ST_DWithin + GROUP BY
   - `batchNearestGrids()`: CROSS JOIN LATERAL + KNN `<->`
   - `batchCommuteTimes()`: WHERE IN + destination_key IN
3. `src/lib/engines/enrich-candidates.ts` 신규 — 배치 조합 + enrichment map
4. `src/lib/engines/scoring-pipeline.ts` 리팩터링:
   - N+1 루프 → `enrichCandidates()` 1회 호출
   - `pLimit` 제거, `scoreOneCandidate()` 제거
   - `scoreFromEnrichment()` 함수 추가 (budget-sensitivity용)

### L3: budget-sensitivity enrichment 캐싱
- `route.ts`: `enrichCandidates()` 1회 → `scoreFromEnrichment()` 5회 (순수 JS)
- `scoreAtOffset()` 동기 함수로 전환 (async 불필요)

## 검증 기준

| 항목 | 상태 |
|------|------|
| `pnpm run build` 성공 | ✅ |
| `pnpm run lint` 통과 | ✅ |
| 출력 형태 변경 없음 (ScoredCandidate[], BudgetLevelResult[]) | ✅ |
| 빈 후보 배열 가드 | ✅ (각 배치 함수 초기 반환) |
| PostgreSQL 파라미터 한도 내 | ✅ (300건 × 3 = 900, 한도 65,535) |

## 결과/결정

- **상태:** `done`
- **변경 파일:**
  - `drizzle/0002_scoring_pipeline_indexes.sql` (신규)
  - `db/schema.sql` (인덱스 1줄 추가)
  - `src/lib/queries/batch-spatial.ts` (신규)
  - `src/lib/engines/enrich-candidates.ts` (신규)
  - `src/lib/engines/scoring-pipeline.ts` (리팩터링)
  - `src/lib/engines/spatial.ts` (parseRouteSnapshot export)
  - `src/app/api/budget-sensitivity/route.ts` (enrichment 캐싱)
- **후속 액션:**
  - DB 마이그레이션 적용: `drizzle/0002_scoring_pipeline_indexes.sql` 실행
  - 실제 환경에서 응답 시간 측정 (recommend < 2초, budget-sensitivity < 3초 목표)

---
plan-id: individual-trades-migration
status: done
phase: PHASE1
template-version: "1.1"
---

# apartment_prices 개별 거래 전환 + 빈 테이블 해소

## 목표

MOLIT ETL 첫 실행 후 발견된 2가지 이슈 해결:
1. `apartment_prices`가 월별 집계 행으로 저장되어 면적/층 추적 불가 → **개별 거래 1건 = 1행** 구조로 전환
2. `apartment_unit_types`, `apartment_facility_stats` 비어있음 → 별도 ETL 실행 안내

## 범위

- DB 스키마: `apartment_prices` 집계 컬럼 제거, 개별 거래 컬럼 추가
- ETL: `molit.ts` 집계 로직 제거, 개별 건 INSERT (배치, 검증, ON CONFLICT DO NOTHING)
- 타입: `PriceHistoryItem` → `PriceTradeItem`, `RecommendationItem`에서 `areaAvg`/`floorMin`/`floorMax` 제거
- 유틸: `price-utils.ts` 전체 함수 전환
- API: `apartment.ts` 쿼리 변경, `recommend/route.ts` CTE SQL 전환 (`year*100+month`)
- UI: PriceTable, PriceChart, LatestPriceDisplay, BudgetPanel 등 8개 파일
- Mock/Test: `mock/prices.ts` 개별 거래 전환, 테스트 3개 수정
- SoT: `PHASE1_design.md`, `db/schema.sql` 동기화

총 수정 파일: 20+개

## 작업 단계

1. **Phase 1: DB 스키마** — `prices.ts` 컬럼 교체, 마이그레이션 SQL 수동 작성+적용
2. **Phase 3: API 타입+유틸** — `PriceTradeItem`, barrel export, `price-utils.ts` 전면 전환, `apartment.ts` 쿼리
3. **Phase 2: ETL** — `molit.ts` 집계 제거, `upsertIndividualTrades` 구현 (배치 INSERT, Number.isFinite 검증)
4. **Phase 4: Recommend** — CTE SQL (`year*100+month` 단조증가), `areaAvg`/`floorMin`/`floorMax` 제거
5. **Phase 5: UI** — PriceTable(key=p.id), PriceChart(mergePricesByMonth 리팩터), LatestPriceDisplay, BudgetPanel
6. **Phase 6: Mock+Test+SoT** — mock 개별 거래, 테스트 mock 수정, PHASE1_design.md + db/schema.sql 갱신
7. **Phase 7: 검증** — build + lint + vitest + grep 전수 점검

## 검증 기준

| # | 기준 | 결과 |
|---|------|------|
| 1 | `pnpm run build` 통과 | PASS |
| 2 | `pnpm run lint` 통과 | PASS |
| 3 | `pnpm exec vitest run` — 관련 테스트 전체 통과 | PASS (기존 commute.test.ts 3건 실패는 무관) |
| 4 | 마이그레이션 후 컬럼 확인: `price`, `monthly_rent`, `exclusive_area`, `floor` 존재 | PASS |
| 5 | `PriceHistoryItem` 잔존 참조 0건 | PASS |
| 6 | `RecommendationItem`에서 `areaAvg`, `floorMin`, `floorMax` 완전 제거 | PASS |
| 7 | `docs/PHASE1_design.md` + `db/schema.sql` 실제 스키마와 일치 | PASS |
| 8 | 빈 테이블 해소 ETL 명령어 안내 완료 | PASS (Phase 7 안내) |

## 결과/결정

**상태: `done`**

### 주요 변경 사항

1. **DB**: `apartment_prices` 테이블이 집계형(9 컬럼)에서 개별 거래형(4 컬럼)으로 전환
   - serial PK + UNIQUE dedup 제약 → 멱등 ETL
   - 알려진 한계: 동일 아파트-월에 면적/층/가격/월세가 모두 동일한 2건은 1건만 저장

2. **ETL**: `aggregateTradeRecords()` 삭제, `upsertIndividualTrades()` 신규
   - 배치 INSERT (100건 단위), Number.isFinite 검증, ON CONFLICT DO NOTHING

3. **API**: Recommend 파이프라인이 CTE 기반 최신월 집계로 전환
   - `year*100+month` (역산 불필요), `AVG(price)` 동적 집계

4. **후속 작업**: ETL 재실행 필요 (MOLIT 개별 거래 적재)
   ```bash
   pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --months=6
   ```

SoT 참조: `docs/PHASE1_design.md` S2, `src/db/schema/prices.ts`

---
plan-id: "2026-02-19_codex_phase1-data-coverage"
status: "partial"
phase: "PHASE0-4"
template-version: "1.1"
work-type: "feature"
---

# 단지 데이터 커버리지 확장 — 월세/오피스텔/평형-세대수/시설 POI

## 목표

무료/적법 데이터만으로 부동산 앱에서 필요한 "단지(Complex) 단위" 데이터 커버리지를 확장한다.

- 거래유형: `sale | jeonse | monthly`를 DB/ETL/API까지 일관되게 지원
- 건물유형: `apartment | officetel | other` 분류를 스키마에 반영
- 평형-세대수(Unit mix): 단지 내 전유면적(㎡)별 세대수 집계를 적재
- 시설 POI + 프리컴퓨트: POI 원천을 적재하고 단지별 통계(`apartment_facility_stats`)를 사전 계산

SoT:
- `docs/PHASE0_ground.md` (Non-goals 조정)
- `docs/PHASE1_design.md` > S2(스키마), S4(스코어링) 정합

## 범위

### 포함

- SoT 업데이트
  - `docs/PHASE0_ground.md`: Non-goals에서 월세/오피스텔 제외 문구 제거
  - `docs/PHASE1_design.md`: S2(테이블/컬럼) + S4(월세 비용 정의) 반영
- DB 스키마/마이그레이션
  - `apartments.building_type` 추가
  - `apartment_prices.trade_type`에 `monthly` 추가 + `monthly_rent_avg` 추가
  - 신규 테이블: `apartment_unit_types`, `facility_points`, `apartment_facility_stats`
- ETL
  - MOLIT 전월세 파싱: `monthlyRent > 0`이면 `monthly`로 분류 + 월세 평균 적재
  - 건축물대장 전유부 기반 unit-mix 수집: `BldRgstHubService/getBrExposInfo` (동/호 등 단위 식별자 저장 금지)
  - POI 스냅샷 CSV 적재(필수: regions.ts 기반 동적 BBOX 필터)
  - 단지별 시설 통계 프리컴퓨트(반경 `--radius` 기반)
- API
  - `/api/recommend`: `monthly` 정규화를 제거하고 월세 비용 계산/필터 반영
  - 단지 상세 안전 데이터 조인: `apartments.regionCode` 기반으로 수정
- 데이터 카탈로그
  - 데이터 소스/출처/갱신주기/조인키/PII 금지사항을 1문서로 고정

### 제외 (이번 플랜에서는 구현 범위 밖)

- 매물(동/호) 레벨 데이터 저장/노출
- 웹 크롤링/스크래핑 기반 매물 수집
- 치안/학군 단정형 라벨링 UI

## 작업 단계

1. Plan/SoT 정합
   - superseded 처리: `docs/plan/2026-02-19_claude-code_etl-building-register.md`
   - `docs/plan/README.md` 인덱스 갱신
2. PHASE SoT 업데이트
   - PHASE0 Non-goals 문구 갱신
   - PHASE1 S2/S4에 월세/시설/유닛믹스 스키마 및 비용 정의 반영
3. DB/마이그레이션
   - Drizzle 스키마 업데이트 + `db/schema.sql` 동기화
   - `scripts/migrate-manual.ts`에 신규 컬럼/테이블/제약 반영
4. ETL 구현
   - `src/etl/adapters/molit.ts`: 월세 분류 + `monthly_rent_avg`
   - 신규 어댑터: `unit-mix`, `poi`, `facility-stats`
   - `src/etl/runner.ts`: `--limit`, `--radius` 옵션 추가 및 어댑터 라우팅
5. API 구현
   - `src/app/api/recommend/route.ts`: 월세 후보 필터(보증금 + 월부담) 및 결과 필드 정합
   - `src/lib/data/apartment.ts`: safety 조인 키 수정 + tradeType 캐스팅 정합
6. 데이터 카탈로그 문서화
7. Review/Verification 기록 및 상태 확정

## 검증 기준

- 스키마 정합:
  - `docs/PHASE1_design.md` S2와 Drizzle 스키마, `db/schema.sql`이 같은 구조를 표현
- 월세 처리:
  - `apartment_prices.trade_type='monthly'` 레코드가 생성 가능(제약 통과)
  - `monthly_rent_avg`가 월세 레코드에만 채워짐(jeonse/sale는 NULL)
- PII/NFR:
  - unit-mix 적재 시 동/호 등 호 단위 식별자 DB 저장 없음(집계 테이블만 적재)
  - 크롤링 코드 추가 없음
- 운영 옵션:
  - `--dry-run`, `--limit`, `--radius` 옵션이 신규 어댑터에 적용 가능

## 결과/결정

- 상태: `partial`

### 구현 완료

- 거래유형 3분류: `sale | jeonse | monthly`
- `apartment_prices` 확장: `monthly_rent_avg` 추가 + `trade_type`에 `monthly` 허용
- MOLIT 전월세 파싱: `monthlyRent > 0`이면 `monthly`로 분류
- 건물유형 분류: `apartments.building_type` 추가 (default `apartment`)
- 평형-세대수(unit-mix): `apartment_unit_types` 테이블 + `BldRgstHubService/getBrExposInfo` 집계 적재 어댑터 추가(호별 식별자 저장 금지)
- 시설 POI 원천: `facility_points` 스냅샷 CSV 적재 어댑터 추가(동적 BBOX 필터)
- 시설 통계 프리컴퓨트: `apartment_facility_stats` 적재 어댑터 추가(`--radius` 지원)
- 추천 API: `monthly -> jeonse` 정규화 제거 + 월세 후보 `monthly_cost <= input.monthlyBudget` 사전 필터
- 문서화: `docs/research/data-catalog.md` 추가

### 미완(검증 미수행)

- 실제 실행 검증(ETL 호출/DB 적재/결과 확인)은 아직 수행하지 않음

### 후속 액션

1. 마이그레이션 적용: `pnpm exec tsx scripts/migrate-manual.ts`
2. 월세 포함 실거래 적재: `pnpm exec tsx src/etl/runner.ts --adapter=molit --region=11680 --months=6`
3. unit-mix 수집(쿼터 주의): `pnpm exec tsx src/etl/runner.ts --adapter=unit-mix --region=11680 --limit=50`
4. POI 스냅샷 적재: `data/poi/facility_points.csv` 배치 후 `pnpm exec tsx src/etl/runner.ts --adapter=poi`
5. 시설 통계 프리컴퓨트: `pnpm exec tsx src/etl/runner.ts --adapter=facility-stats --radius=800`

→ `2026-02-20_claude-code_pre-launch-review.md`에서 ETL 실행 및 검증 수행

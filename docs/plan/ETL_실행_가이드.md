# ETL 실 데이터 적재 가이드

## 전체 파이프라인 개요

```
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 0. 스키마 마이그레이션                                        │
│  pnpm exec tsx --env-file=.env scripts/migrate-manual.ts            │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 1. 기초 데이터 (API 불필요, 즉시 실행)                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                             │
│  │  MOHW   │  │  MOIS   │  │  MOE    │  ← 병렬 실행 가능           │
│  │어린이집  │  │CCTV/범죄│  │학교     │                             │
│  └────┬────┘  └────┬────┘  └────┬────┘                             │
│       ▼            ▼            ▼                                   │
│  childcare_   safety_stats   schools                                │
│  centers                                                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 2. MOLIT 실거래가 (일일한도 2,000건, 약 13일)                  │
│  --adapter=molit --region=XXXXX --months=120                        │
│                                                                     │
│  적재 테이블:                                                        │
│    apartments ──────── 아파트 마스터 (지오코딩 포함)                   │
│    apartment_prices ── 개별 거래 (1건=1행)                            │
│    apartment_details ─ K-apt 상세 (CCTV/주차/엘리베이터 등)            │
│    apartments.household_count ─ 건축물대장 세대수                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 3. 부가 데이터 (MOLIT 완료 후 실행)                            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐       ← 순서대로 실행           │
│  │  unit-mix    │  │  poi         │                                 │
│  │면적별 세대수  │  │시설 좌표      │                                 │
│  └──────┬───────┘  └──────┬───────┘                                 │
│         ▼                 ▼                                         │
│  apartment_          facility_                                      │
│  unit_types          points                                         │
│                           │                                         │
│                           ▼                                         │
│                    ┌──────────────┐                                  │
│                    │facility-stats│                                  │
│                    │시설 거리 계산 │                                  │
│                    └──────┬───────┘                                  │
│                           ▼                                         │
│                    apartment_                                       │
│                    facility_stats                                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 4. ODsay 통근 그리드 (Phase 2와 병렬 진행 가능, 약 13일)       │
│  scripts/run-odsay.ts  (하루 125포인트 × 8목적지 = 1,000 API)       │
│                                                                     │
│  적재: commute_grid, commute_destinations, commute_times            │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 5. 검증                                                      │
│  src/etl/validate.ts + src/etl/coverage.ts                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 테이블 → 어댑터 매핑

| 테이블 | 어댑터 | API 키 | 비고 |
|--------|--------|--------|------|
| `apartments` | `molit` | MOLIT_API_KEY + KAKAO_API_KEY | 아파트 마스터 + 지오코딩 |
| `apartment_prices` | `molit` | MOLIT_API_KEY | 개별 거래 (1건=1행) |
| `apartment_details` | `molit` (enrichFromKapt) | MOLIT_API_KEY | K-apt CCTV/주차 등 |
| `apartment_unit_types` | `unit-mix` | MOLIT_API_KEY | 건축물대장 전유부 → 면적별 세대수 |
| `apartment_facility_stats` | `facility-stats` | 없음 (DB 내부 계산) | 아파트×시설 거리 사전계산 |
| `childcare_centers` | `mohw` | 없음 (XLS 파일) | 어린이집 |
| `schools` | `moe` | MOE_API_KEY | NEIS API 학교 |
| `safety_stats` | `mois` | 없음 (CSV 파일) | CCTV/범죄통계 |
| `facility_points` | `poi` | 없음 (스냅샷 파일) | 시설 좌표 |
| `commute_grid` / `commute_times` | ODsay 스크립트 | ODSAY_API_KEY | 통근 그리드 |

---

## Phase 0. 스키마 마이그레이션 (최초 1회)

```bash
pnpm exec tsx --env-file=.env scripts/migrate-manual.ts
```

---

## Phase 1. 기초 데이터 (API 불필요, 즉시 실행)

서로 독립적이므로 병렬 실행 가능.

```bash
# 어린이집 (MOHW) — XLS 파일 기반
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=mohw

# 안전 인프라 + 범죄통계 (MOIS) — CSV 파일 기반
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=mois

# 학교 (MOE) — NEIS API (MOE_API_KEY 필요)
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=moe
```

---

## Phase 2. MOLIT 실거래가 (약 13일)

`--adapter=molit`는 한 번의 실행으로 3가지 테이블을 적재합니다:

1. **apartments** — 아파트 마스터 (이름, 주소, 좌표, 면적 범위)
2. **apartment_prices** — 개별 거래 기록 (1건=1행, 가격/면적/층)
3. **apartment_details** — K-apt 부가정보 (CCTV, 주차, 엘리베이터 등)

추가로 `apartments.household_count`를 건축물대장 API로 채웁니다.

일일한도: 2,000 API 호출 → 하루 2~3개 구 가능
한도 초과 시 자동 종료 → 다음 날 같은 명령어 재실행 (upsert/ON CONFLICT로 중복 방지)

### 서울 25개 자치구

| 일차 | 구 | 명령어 |
|------|------|--------|
| 1일차 | 강남구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11680 --months=120` |
| | 서초구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11650 --months=120` |
| | 송파구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11710 --months=120` |
| 2일차 | 마포구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11440 --months=120` |
| | 영등포구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11560 --months=120` |
| | 용산구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11170 --months=120` |
| 3일차 | 강동구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11740 --months=120` |
| | 성동구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11200 --months=120` |
| | 광진구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11215 --months=120` |
| 4일차 | 종로구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11110 --months=120` |
| | 중구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11140 --months=120` |
| | 동대문구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11230 --months=120` |
| 5일차 | 중랑구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11260 --months=120` |
| | 성북구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11290 --months=120` |
| | 강북구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11305 --months=120` |
| 6일차 | 도봉구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11320 --months=120` |
| | 노원구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11350 --months=120` |
| | 은평구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11380 --months=120` |
| 7일차 | 서대문구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11410 --months=120` |
| | 양천구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11470 --months=120` |
| | 강서구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11500 --months=120` |
| 8일차 | 구로구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11530 --months=120` |
| | 금천구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11545 --months=120` |
| | 동작구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11590 --months=120` |
| 9일차 | 관악구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=11620 --months=120` |

### 경기도 11개 시군구

| 일차 | 구 | 명령어 |
|------|------|--------|
| 10일차 | 수원시 장안구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=41111 --months=120` |
| | 수원시 권선구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=41113 --months=120` |
| | 수원시 팔달구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=41115 --months=120` |
| 11일차 | 수원시 영통구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=41117 --months=120` |
| | 성남시 수정구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=41131 --months=120` |
| | 성남시 중원구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=41133 --months=120` |
| 12일차 | 성남시 분당구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=41135 --months=120` |
| | 하남시 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=41450 --months=120` |
| | 고양시 덕양구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=41281 --months=120` |
| 13일차 | 고양시 일산동구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=41285 --months=120` |
| | 고양시 일산서구 | `pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=molit --region=41287 --months=120` |

---

## Phase 3. 부가 데이터 (MOLIT 완료 후)

Phase 2(MOLIT)가 완료되어 `apartments` 테이블에 데이터가 있어야 실행 가능합니다.
**반드시 아래 순서대로 실행하세요.**

### 3-1. Unit-mix: 면적별 세대수 (`apartment_unit_types`)

건축물대장 전유부(getBrExposInfo) API로 아파트별 전용면적/세대수를 조회합니다.
일일한도를 MOLIT과 공유하므로, MOLIT 실행이 없는 날에 실행하는 것이 효율적입니다.

```bash
# 전체 지역 (일일한도까지 자동 처리 후 종료, 재실행 시 이어서 처리)
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=unit-mix

# 특정 지역만
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=unit-mix --region=11680

# 테스트 (10개 아파트만)
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=unit-mix --region=11680 --limit=10 --dry-run
```

### 3-2. POI: 시설 좌표 스냅샷 (`facility_points`)

지하철역, 버스정류장, 경찰서, 소방서, 대피소, 병원, 약국 좌표를 적재합니다.
스냅샷 파일 기반 — API 호출 없음.

```bash
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=poi
```

### 3-3. Facility-stats: 시설 거리 사전계산 (`apartment_facility_stats`)

`apartments` × `facility_points` 의 거리를 PostGIS로 사전 계산합니다.
**선행 조건**: `apartments`와 `facility_points` 모두 적재되어 있어야 합니다.

```bash
# 기본 반경 800m
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=facility-stats

# 반경 변경
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=facility-stats --radius=1000

# 테스트
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=facility-stats --dry-run
```

---

## Phase 4. ODsay 통근 그리드 (Phase 2와 병렬 진행 가능)

일일한도: 1,000 API 호출, 목적지 8개 → 하루 최대 **125포인트** (1,000 ÷ 8)
총 ~1,575포인트 → **약 13일**
재개(resume) 지원: 이미 처리된 포인트 자동 건너뜀

```bash
# 매일 1회 실행 (자동으로 한도까지 처리 후 종료)
pnpm exec tsx --env-file=.env scripts/run-odsay.ts

# 100개 포인트만 테스트
pnpm exec tsx --env-file=.env scripts/run-odsay.ts --dry-run --max-points 100

# 기존 데이터 전체 갱신(교체)
pnpm exec tsx --env-file=.env scripts/run-odsay.ts --full-refresh

# ODsay 디버그 로그 활성화
ODSAY_DEBUG=true pnpm exec tsx --env-file=.env scripts/run-odsay.ts --full-refresh --max-points 5
```

### commute_grid 레거시 컬럼 정리

`drizzle/0004_cleanup_commute_grid_legacy_columns.sql`은 기존 legacy 컬럼이 남아 있어도 안전하게 제거합니다.

```bash
# 마이그레이션 실행 (2026-02-20 이후 신규 스키마 반영)
pnpm exec tsx --env-file=.env scripts/migrate-manual.ts

# 정리 완료 확인
psql "$DATABASE_URL" -c \
  "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='commute_grid' ORDER BY column_name;"
```

위 쿼리 결과에서 `to_gbd_time`, `to_ybd_time`, `to_cbd_time`, `to_pangyo_time`가 없어야 합니다.

---

## Phase 5. 검증

```bash
# 데이터 건수/무결성
pnpm exec tsx --env-file=.env src/etl/validate.ts

# 공간 교차 검증 (학교/어린이집/그리드 커버리지)
pnpm exec tsx --env-file=.env src/etl/coverage.ts
```

### 테이블별 건수 확인 (수동)

```sql
SELECT 'apartments' AS tbl, COUNT(*) FROM apartments
UNION ALL SELECT 'apartment_prices', COUNT(*) FROM apartment_prices
UNION ALL SELECT 'apartment_details', COUNT(*) FROM apartment_details
UNION ALL SELECT 'apartment_unit_types', COUNT(*) FROM apartment_unit_types
UNION ALL SELECT 'apartment_facility_stats', COUNT(*) FROM apartment_facility_stats
UNION ALL SELECT 'childcare_centers', COUNT(*) FROM childcare_centers
UNION ALL SELECT 'schools', COUNT(*) FROM schools
UNION ALL SELECT 'safety_stats', COUNT(*) FROM safety_stats
UNION ALL SELECT 'facility_points', COUNT(*) FROM facility_points
UNION ALL SELECT 'commute_grid', COUNT(*) FROM commute_grid
UNION ALL SELECT 'commute_times', COUNT(*) FROM commute_times;
```

---

## 멱등성 / 실패 복구

| 어댑터 | 전략 | 재실행 시 |
|--------|------|-----------|
| `molit` | ON CONFLICT DO NOTHING (prices), DO UPDATE (apartments) | 안전 — 기존 건 skip, 미적재 건만 추가 |
| `unit-mix` | DELETE + INSERT (아파트별 전체 교체) | 안전 — 스냅샷 교체 |
| `poi` | TRUNCATE + INSERT | 안전 — 전체 교체 |
| `facility-stats` | ON CONFLICT DO UPDATE | 안전 — 덮어쓰기 |
| `mohw` / `moe` / `mois` | ON CONFLICT DO UPDATE | 안전 |
| ODsay | resume 지원 (처리된 포인트 skip) | 안전 — 이어서 처리 |

API 일일 한도 도달 시 자동 종료 + 로그에 중단 지점 기록.
다음 날 **같은 명령어로 재실행**하면 됩니다.

---

## 진행 체크리스트

### Phase 0. 사전 준비
- [x] 스키마 마이그레이션

### Phase 1. 기초 데이터
- [x] 어린이집 (MOHW)
- [x] 안전 인프라 + 범죄통계 (MOIS)
- [x] 학교 (MOE)

### Phase 2. 서울 실거래가
- [x] 1일차: 강남구, 서초구, 송파구
- [x] 2일차: 마포구, 영등포구, 용산구
- [x] 3일차: 강동구, 성동구, 광진구
- [x] 4일차: 종로구, 중구, 동대문구
- [x] 5일차: 중랑구, 성북구, 강북구
- [ ] **6일차: 도봉구, 노원구, 은평구** ← 429 발생, 여기서부터 재개 (2026-02-20)
- [ ] 7일차: 서대문구, 양천구, 강서구
- [ ] 8일차: 구로구, 금천구, 동작구
- [ ] 9일차: 관악구

### Phase 2. 경기 실거래가
- [ ] 10일차: 수원 장안구, 권선구, 팔달구
- [ ] 11일차: 수원 영통구, 성남 수정구, 중원구
- [ ] 12일차: 성남 분당구, 하남시, 고양 덕양구
- [ ] 13일차: 고양 일산동구, 일산서구

### Phase 3. 부가 데이터 (MOLIT 완료 후)
- [ ] unit-mix (면적별 세대수)
- [ ] poi (시설 좌표 스냅샷)
- [ ] facility-stats (시설 거리 사전계산)

### Phase 4. 통근 그리드 (병렬)
- [ ] 1~13일차: ODsay 매일 실행 (하루 125포인트 × 8목적지)

### Phase 5. 최종 검증
- [ ] validate.ts
- [ ] coverage.ts
- [ ] 테이블별 건수 확인 (빈 테이블 없는지)

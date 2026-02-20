# ETL 실 데이터 적재 가이드

## 사전 준비

```bash
# 1. 스키마 마이그레이션 (최초 1회)
pnpm exec tsx --env-file=.env scripts/migrate-manual.ts

# 2. 로컬 파일 기반 (API 불필요, 즉시 실행)
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=mohw   # 어린이집 XLS
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=mois   # CCTV/가로등/범죄통계
pnpm exec tsx --env-file=.env src/etl/runner.ts --adapter=moe    # 학교 (NEIS API)
```

---

## MOLIT 실거래가 (10년치, 매매+전월세)

일일한도: 2,000 API 호출 → 하루 2~3개 구 가능
한도 초과 시 자동 종료 → 다음 날 같은 명령어 재실행 (upsert로 중복 방지)

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

## ODsay 통근 그리드 (MOLIT과 병렬 진행 가능)

일일한도: 1,000 API 호출 → 하루 ~250포인트
총 1,656포인트 → **약 7일**
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

## 검증

```bash
# 데이터 건수/무결성
pnpm exec tsx --env-file=.env src/etl/validate.ts

# 공간 교차 검증 (학교/어린이집/그리드 커버리지)
pnpm exec tsx --env-file=.env src/etl/coverage.ts
```

---

## 진행 체크리스트

### 사전 준비
- [ ] 스키마 마이그레이션
- [ ] 어린이집 (MOHW)
- [ ] 안전 인프라 + 범죄통계 (MOIS)
- [ ] 학교 (MOE)

### 서울 실거래가
- [ ] 1일차: 강남구, 서초구, 송파구
- [ ] 2일차: 마포구, 영등포구, 용산구
- [ ] 3일차: 강동구, 성동구, 광진구
- [ ] 4일차: 종로구, 중구, 동대문구
- [ ] 5일차: 중랑구, 성북구, 강북구
- [ ] 6일차: 도봉구, 노원구, 은평구
- [ ] 7일차: 서대문구, 양천구, 강서구
- [ ] 8일차: 구로구, 금천구, 동작구
- [ ] 9일차: 관악구

### 경기 실거래가
- [ ] 10일차: 수원 장안구, 권선구, 팔달구
- [ ] 11일차: 수원 영통구, 성남 수정구, 중원구
- [ ] 12일차: 성남 분당구, 하남시, 고양 덕양구
- [ ] 13일차: 고양 일산동구, 일산서구

### 통근 그리드 (병렬)
- [ ] 1~7일차: ODsay 매일 실행

### 최종 검증
- [ ] validate.ts
- [ ] coverage.ts

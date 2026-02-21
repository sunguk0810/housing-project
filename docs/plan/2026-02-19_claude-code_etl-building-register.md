---
plan-id: "2026-02-19_claude-code_etl-building-register"
status: "superseded"
phase: "PHASE1"
template-version: "1.1"
work-type: "feature"
superseded-by: "2026-02-19_codex_phase1-data-coverage"
---

# 아파트 상세정보 ETL 개선 — 건축물대장 API 도입 + K-apt 매칭 개선

## 목표

MOLIT 실거래 아파트의 세대수 커버리지를 55% → 90%+로 향상.
건축물대장 총괄표제부 API로 주소 기반 직접 조회하여 K-apt 매칭 의존도를 제거하고,
K-apt 매칭은 부가정보(CCTV/주차/지하철)용으로만 유지 + 개선.

SoT: docs/PHASE1_design.md > S2 참조 (스키마 변경 사전 반영 필요)

## 범위

### 변경 대상

| 파일 | Chunk | 변경 내용 |
|---|---|---|
| `docs/PHASE1_design.md` | 1 | S2 스키마 변경 반영 (SoT 선행 갱신) |
| `src/db/schema/apartments.ts` | 1 | `officialName` 컬럼 추가 |
| `src/db/schema/apartment-details.ts` | 1 | `kapt_code` UNIQUE 제거, `householdCount` 제거 |
| `docs/plan/README.md` | 1 | 인덱스 갱신 |
| `scripts/migrate-manual.ts` | 2 | 마이그레이션 SQL (백필→검증→제거) |
| `src/etl/adapters/molit.ts` | 3,4,5 | 건축물대장 파서, ETL 분리, N:1 매칭 |
| `src/etl/runner.ts` | 4 | 월별 루프 외부 enrichment 분리 |
| `scripts/check-details.ts` | 5 | 잔존 참조 제거 |
| `scripts/test-*.ts` | 5 | 테스트 스크립트 동기화 |

### 변경하지 않는 파일

- `src/lib/data/apartment.ts` — `apartments.householdCount` 읽기만, 변경 없음
- `src/types/api.ts` — 기존 응답 구조 유지

## 확인된 API 스펙 (2026-02-19 실 테스트)

| 항목 | 값 |
|---|---|
| 엔드포인트 | `https://apis.data.go.kr/1613000/BldRgstHubService/getBrRecapTitleInfo` |
| 인증 | `MOLIT_API_KEY` (data.go.kr 공유, **일일 2000회 공유 한도**) |
| 요청 | `serviceKey`, `sigunguCd`(5), `bjdongCd`(5), `platGbCd`(0), `bun`(4, 0패딩), `ji`(4, 0패딩), `_type=json` |
| 응답 JSON 경로 | `response.body.items.item` (배열 또는 단일 객체) |
| 세대수 | `hhldCnt` (정수, 지번 전체 합산) |
| 건물명 | `bldNm` (복수 단지 시 콤마 구분: `"대치,대청 아파트"`) |
| K-apt bjdCode | 10자리 = `sigunguCd`(5) + `bjdongCd`(5), `as3`=동명 |

**주의**: `getBrExposInfo`는 전유부(호별 개별 레코드)이며 `hhldCnt` 없음. `getBrRecapTitleInfo`(총괄표제부)만 세대수 제공.

## 작업 단계 — 5 Chunk 실행 체크리스트

### Chunk 1: SoT·스키마 정합성 정리

**대상**: `docs/PHASE1_design.md`, `src/db/schema/apartments.ts`, `src/db/schema/apartment-details.ts`, `docs/plan/README.md`

**수행 조건**: 없음 (첫 chunk)

**작업**:
- [ ] `docs/PHASE1_design.md` > S2에 `apartment_details` 현행 스키마 등록 (미등록 시)
- [ ] S2에 변경 반영: `apartments.official_name TEXT` 추가
- [ ] S2에 변경 반영: `apartment_details.household_count` 제거
- [ ] S2에 변경 반영: `apartment_details.kapt_code` UNIQUE 제약 제거
- [ ] `src/db/schema/apartments.ts`: `officialName: text("official_name")` 추가
- [ ] `src/db/schema/apartment-details.ts`: `householdCount` 필드 제거
- [ ] `src/db/schema/apartment-details.ts`: `unique("apartment_details_kapt_code_unique")` 제거
- [ ] `apartment_details.aptId` UNIQUE 유지 확인 (N:1 upsert 키 전제)
- [ ] `docs/plan/README.md` 인덱스에 이 plan 추가
- [ ] `pnpm exec tsc --noEmit` 통과 (스키마만 변경, 코드 참조 에러는 Chunk 5에서 처리)

**완료 기준**: SoT 반영 완료, 스키마 TS 파일 변경 완료, plan 문서 인덱스 갱신

---

### Chunk 2: 마이그레이션 SQL 검증 포함 적용

**대상**: `scripts/migrate-manual.ts`

**수행 조건**: Chunk 1 완료

**작업**:
- [ ] 사전 검증 SQL: 행 수, household_count 채움률 스냅샷
- [ ] `ALTER TABLE apartments ADD COLUMN IF NOT EXISTS official_name TEXT`
- [ ] 백필: `apartment_details.household_count` → `apartments.household_count` (NULL인 건만)
- [ ] 백필 검증: UPDATE 대상 건수, null→non-null 전환 건수 로그
- [ ] data_loss_check: 백필 후에도 apartments에 미반영된 건 = 0 확인
- [ ] `ALTER TABLE apartment_details DROP COLUMN IF EXISTS household_count`
- [ ] `DROP CONSTRAINT IF EXISTS apartment_details_kapt_code_unique` (DO $$ 블록)
- [ ] 사후 검증: 행 수 불일치 0, orphan 0, FK 무결성
- [ ] 실패 시 중단 포인트: 백필 검증 실패 시 DROP 미진행

**완료 기준**: 마이그레이션 정상 실행, 사전/사후 검증 통과, 데이터 손실 0

---

### Chunk 3: 건축물대장 API 연동 골격

**대상**: `src/etl/adapters/molit.ts`

**수행 조건**: Chunk 2 완료

**작업**:
- [ ] `parseBldgRecapResponse(json)` 함수 신설
  - `response.body.items.item` → 배열 정규화 (단일 객체 래핑, 빈 문자열 → 빈 배열)
  - `mainPurpsCdNm === "공동주택"` 필터 후 첫 건 반환
  - 0건이면 null 반환
- [ ] `parseAddress(address)` 함수 신설
  - `"역삼동 722"` → `{ dong: "역삼동", bun: "0722", ji: "0000" }`
  - `"역삼동 831-29"` → `{ dong: "역삼동", bun: "0831", ji: "0029" }`
  - 산번지 → `platGbCd: "1"`
  - 파싱 실패 → null + 로그
- [ ] dong→bjdongCd 맵 구축 로직
  - K-apt list 수집 시 `bjdCode` 필드 추가 (현재 미수집)
  - `as3` → `bjdCode.substring(5, 10)` 맵
  - 매핑 실패 → skip + 로그
- [ ] `fetchBuildingRegister(encodedKey, sigunguCd, bjdongCd, bun, ji)` 함수
  - `BldRgstHubService/getBrRecapTitleInfo` 호출
  - `_type=json` 필수
  - 실패 분류: 네트워크/5xx → 1회 재시도, 파싱 에러 → skip, 스키마 에러 → skip + warn
  - 성공 시 `{ hhldCnt, bldNm }` 반환
- [ ] 에러 카운터: `{ success, retried, skipped, failed }` 집계 로그

**완료 기준**: 파서 + 요청부 구현 완료, edge case 처리 (빈 응답/단일 객체/배열/파싱 실패)

---

### Chunk 4: ETL 흐름 분리 (월별 루프 바깥 enrichment)

**대상**: `src/etl/runner.ts`, `src/etl/adapters/molit.ts`

**수행 조건**: Chunk 3 완료

**작업**:
- [ ] `MolitAdapter`에 퍼블릭 메서드 추가:
  - `enrichFromBuildingRegister(regionCode: string)`: 건축물대장 조회
  - `enrichFromKapt(regionCode: string)`: K-apt 매칭 + 상세 (기존 enrichApartmentDetails 리팩토링)
- [ ] `upsertAggregates()` 내부의 `enrichApartmentDetails()` 호출 제거
- [ ] `runner.ts` 구조 변경:
  ```
  for (region) {
    for (month) { adapter.fetch() }          // Phase A: 실거래
    if (!dryRun) adapter.enrichFromBuildingRegister(region.code)  // Phase B: 건축물대장
    if (!dryRun) adapter.enrichFromKapt(region.code)              // Phase C: K-apt
  }
  ```
- [ ] `enrichFromBuildingRegister` 대상 집합:
  - `SELECT id, address, region_code FROM apartments WHERE region_code = ? AND household_count IS NULL`
  - 이미 처리된 건 자동 스킵 (멱등성)
- [ ] `enrichFromKapt` 대상 집합:
  - 기존 `pendingEntries` 로직 유지 (`apartment_details` 미존재 건)
- [ ] 단계별 격리: Phase B 실패 → Phase C 정상 진행 (try/catch)
- [ ] `DATA_GO_KR_LIMITER.isExhausted` 체크: 각 Phase 시작 전 + 루프 내
- [ ] 로그: Phase별 처리 건수, 스킵 건수, API 잔여 쿼터

**완료 기준**: 월 루프는 trade만 실행, enrichment는 region 단위 1회, 멱등성 확인, 단계 격리 동작

---

### Chunk 5: N:1 매칭 / 잔존 정리 / 검증 통합

**대상**: `src/etl/adapters/molit.ts`, `scripts/check-details.ts`, `scripts/test-*.ts`

**수행 조건**: Chunk 4 완료

**작업**:
- [ ] `matchedKaptCodes` N:1 완화:
  - `mergedKaptCodes` 판별: kaptName 콤마 유무 + 동일 kaptCode 다중 매핑 발생 시 자동 감지
  - Primary 매핑: `fetchAndUpsertKaptDetail()` 전체 저장
  - Secondary 매핑: `kaptCode` 참조만 저장 (aptId 기준 upsert, 상세 필드 없음)
  - `fetchAndUpsertKaptDetail` 내 DELETE 로직: mergedKaptCodes일 때 스킵
- [ ] `fetchAndUpsertKaptDetail` householdCount 경로 완전 제거:
  - values 객체에서 제거
  - `apartments.householdCount` UPDATE 블록 삭제
  - onConflictDoUpdate set에서 제거
  - `grep -rn householdCount src/etl/adapters/molit.ts` → apartment_details 관련 0건 확인
- [ ] K-apt 매칭 개선:
  - kaptList에 `bjdCode` 수집 추가
  - `normalizeAptName()`: `레미안→래미안` 별칭, 콤마/슬래시 제거
  - 동 접두어 제거 매칭 시도
  - `officialName` 활용 매칭
  - 좌표 임계값 100m → 150m (100-150m: bigram >= 3)
- [ ] `scripts/check-details.ts`: `apartment_details.household_count` 참조 → `apartments.household_count` 기반 변경
- [ ] `scripts/test-matching.ts`, `scripts/test-coord-matching.ts` 동기화
- [ ] `pnpm exec tsc --noEmit` 통과
- [ ] 강남구 전체 검증 (apartment_details TRUNCATE 후 ETL 실행):
  - [ ] `household_count` NOT NULL 비율 90%+ (182건 중 163건+)
  - [ ] `official_name` NOT NULL 비율 80%+
  - [ ] `apartment_details` 행 수 110+
  - [ ] 오매칭 수동 검수: 좌표 150m 확장 건 전수, 오탐 임계치 5% 이하 (샘플: 매칭 전건, 신규 매칭 건 전수)
  - [ ] 재실행 멱등성: 동일 ETL 2회 실행 시 중복 insert/API 호출 0
  - [ ] `getApartmentDetail()` UI 정상 동작

**완료 기준**: N:1 동작, 잔존 참조 0, 강남구 검증 기준 달성

## 검증 기준

- household_count 커버리지 90%+ (현재 55%)
- apartment_details 행 110+ (현재 74)
- 오매칭 임계치 5% 이하 (수동 검수)
- 스키마-코드 완전 일치 (tsc + grep 잔존참조 0)
- SoT(PHASE1_design.md) 동기화 완료
- 일일 쿼터 한도 내 실행 (< 600/region)

## 결과/결정

- 상태: `superseded`
- 대체 plan: `docs/plan/2026-02-19_codex_phase1-data-coverage.md`
- 후속: 단지 데이터 커버리지 확장(월세/오피스텔/평형-세대수/POI) 통합 플랜으로 이관

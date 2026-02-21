# 데이터 카탈로그 (무료/적법 소스만)

> 원칙: **크롤링 금지**, **출처/기준일 표기**, **PII 비저장**(동/호 등 매물 단위 식별자 저장 금지).

## 1) 정규화/조인 키

- 단지 기준 PK: `apartments.id`
- 행정구역 조인: `apartments.region_code` ↔ `safety_stats.region_code`
- 공간 조인(반경/최근접): `apartments.location` ↔ `*_centers.location`, `facility_points.location`, `commute_grid.location`

## 2) 소스별 요약

| 분류 | 적재 테이블 | 데이터 소스 | 수집 방식 | 갱신 주기(권장) | 조인/키 | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| 실거래(아파트) | `apartment_prices` | 국토교통부 RTMS (AptTrade/AptRent) | 공공 API | 매월 1회 (공개 1달 지연) | `apt_id + trade_type + year + month` | `monthly`는 `average_price=보증금`, `monthly_rent_avg=월세` |
| 단지 마스터 | `apartments` | RTMS + Kakao 지오코딩 | API | 실거래 갱신 시 | `apt_code`(내부키) | 지오코딩은 주소 → 좌표 |
| 세대수/공식명 | `apartments.household_count`, `apartments.official_name` | 건축물대장(총괄표제부) | 공공 API | 반기 1회(또는 NULL만 보강) | 지번 기반 조회 | `hhldCnt`는 **총 세대수(합계 1개 값)** |
| 평형-세대수 | `apartment_unit_types` | 건축물대장(전유부) | 공공 API | 반기 1회(또는 on-demand) | 지번 기반 조회 | 동/호 레코드는 **집계 후 폐기** |
| 단지 상세 | `apartment_details` | K-apt | 공공 API | 월 1회 또는 변경 감지 | `apt_id` | 부가정보(주차/CCTV/지하철 등) |
| 보육 | `childcare_centers` | 사회보장정보원/공공데이터포털 | 파일 스냅샷(XLS) | 월 1회 | 공간 조인 | `external_id` UNIQUE(가능 시) |
| 학군 | `schools` | NEIS(학교알리미/교육부) | 공공 API | 분기/학기 단위 | 공간 조인 | `school_code` UNIQUE(가능 시) |
| 치안(지표) | `safety_stats` | MOIS/경찰청 등(공식 CSV/API) | 파일 스냅샷 | 연 1~2회 | `region_code + data_date` | 점수는 "단정"이 아니라 지표 기반 |
| 치안(원천 POI) | `safety_infra` | 지자체/공공 CSV | 파일 스냅샷(CSV) | 연 1~2회 | 공간 집계 | CCTV/안심이/가로등 |
| 통근 | `commute_grid` | ODsay (무료 티어) | API + 프리컴퓨트 | 분기(또는 노선 개편 시) | 공간 최근접 | 요청시 캐시 권장 |
| 시설 POI | `facility_points` | TAGO/지자체/HIRA/행안부 등 | 파일 스냅샷(CSV) | 연 1~2회 | 공간 조인 | 대규모(버스정류장)는 **regions.ts 기반 BBOX 필터 필수** |
| 시설 통계 | `apartment_facility_stats` | 내부 프리컴퓨트 | DB 작업 | POI 갱신 후 | `apt_id + type + radius_m` | API 성능을 위한 사전 계산 |

## 3) 라이선스/표기

- 공공데이터는 화면 노출 시 **출처 + 기준일**을 함께 표시한다. (PHASE0 NFR-4 참조)
- 상업 API(예: Kakao/ODsay 무료 티어)는 약관 범위 내에서만 사용하고, 과금/쿼터를 ETL 옵션으로 제어한다.

## 4) 개인정보(PII) 금지

- 저장 금지 예: 동/호, 전화번호, 사용자 입력 주소 원문, 특정 개인을 식별 가능한 조합
- 허용: 단지 단위 집계(예: 평형별 세대수), 행정구역/좌표 기반 통계

## 5) 스냅샷 파일 포맷 (ETL 입력)

### 시설 POI 스냅샷

- 경로: `data/poi/facility_points.csv` (UTF-8, header 포함)
- 최소 컬럼: `type`, `lat`, `lng`
- `type` 허용값: `subway_station|bus_stop|police|fire_station|shelter|hospital|pharmacy`
- `lat`, `lng`: WGS84 decimal
- 권장 컬럼: `name`, `address`, `region_code`, `external_id`, `source`, `data_date(YYYY-MM-DD)`

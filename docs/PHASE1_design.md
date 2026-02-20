# PHASE 1: DESIGN

> 정본(SoT): DB 스키마(S2)와 스코어링 로직(S4)은 이 문서가 유일한 수정 지점입니다.
> 다른 Phase 문서에서는 "PHASE1 S2/S4 참조"로 링크만 합니다.

### 목표

PHASE0에서 확정된 FR/NFR/KPI를 기술 설계로 구체화한다.

### 범위

시스템 아키텍처(S1), DB 스키마(S2 SoT), 데이터 파이프라인(S3), 스코어링 엔진(S4 SoT), API 설계(S5), UI/UX(S6), 디자인 토큰(S7), 포트폴리오 전략(S8)

### 산출물

S1~S8 각 섹션의 설계 명세. db/schema.sql은 S2에서 파생.

### 게이트 기준

PHASE1 Prompt Pack Verification `verdict == "go"` 또는 `verdict == "pending" AND blockers.length == 0` 시 PHASE2(Build) 진입 가능. (PROMPT_PACK_INDEX 확장 규칙과 동일)

## 1. System Architecture

```mermaid
flowchart TD
    subgraph Client
        User[사용자] -->|입력| Form[React 입력폼]
        Form -->|POST /api/recommend| API
        API -->|JSON 결과| ResultPage[지도/카드 UI]
    end

    subgraph Server["Next.js Server"]
        API[API Routes]
        API -->|예산 계산| BudgetCalc[LTV/DTI 엔진]
        API -->|SQL 조회| DB[(PostgreSQL + PostGIS)]
        API -->|통근시간| CommuteSvc[ODsay/Kakao API + Redis 캐시]
        API -->|지표 조회| DB
        DB --> ETL[ETL 스크립트]
    end

    subgraph External["외부 데이터"]
        MOLIT[국토교통부 실거래가 API]
        MOIS[행정안전부 재난안전데이터 API]
        MOHW[사회보장정보원 어린이집 API]
        MOE[교육부 학교알리미 API]
        Kakao[카카오 지도/지오코딩 API]
        ODsay[ODsay 통근 API]
    end

    ETL -->|수집/적재| MOLIT & MOIS & MOHW & MOE
    CommuteSvc --> ODsay & Kakao
    Form --> Kakao
```

**기술 스택**:

- Frontend: Next.js + React + TypeScript (strict 모드) + Tailwind CSS + shadcn/ui
- Backend: Next.js API Routes
- DB: PostgreSQL + PostGIS
- Cache: Redis
- Map: Kakao Maps JS SDK
- Deploy: Vercel + Supabase/AWS RDS

### 보안 설계 (NFR-3)

| 영역        | 설계                               | 구현 기준                                                                  |
| ----------- | ---------------------------------- | -------------------------------------------------------------------------- |
| 전송 암호화 | HTTPS/TLS 1.2+ 강제                | CDN/호스팅 레벨 HTTPS + HSTS 헤더                                          |
| 저장 암호화 | DB 저장 데이터 AES-256 이상 암호화 | 관리형 DB의 encryption at rest 활성화                                      |
| 접근 제어   | 최소 권한 원칙                     | DB 서비스 계정 분리 (read-only ETL / read-write API), API 키 환경변수 관리 |
| API 보안    | 레이트 리미팅 + 입력 검증          | Next.js middleware + S5 입력 검증 규칙 연계                                |
| 환경변수    | 시크릿 관리                        | `.env.local` (로컬) + 호스팅 플랫폼 시크릿 관리 (배포)                     |
| CORS        | 허용 오리진 제한                   | Next.js CORS 설정 (자사 도메인만 허용)                                     |

### 모니터링/APM 정책 (NFR-1 연계)

- APM: PII 미수집 정책. 성능 메트릭만 수집
- 에러 트래킹: 사용자 입력값(cash/income/loans/job1/job2) 미포함
  - 스택 트레이스/에러 메타데이터에 PII가 포함될 수 있는 경우 마스킹 처리 필수
  - 에러 컨텍스트에 요청 파라미터 자동 첨부 비활성화
- 로그: 민감 정보 로그 미기록 (-> S5 입력 검증 규칙 참조)
- 전체 파이프라인(DB/로그/APM) PII 비저장 원칙: PHASE0 NFR-1 참조

## 2. DB Schema (유일한 스키마 정본)

> 다른 문서에서 DB 스키마를 참조할 때는 "PHASE1 S2 참조"로만 기재합니다.
> `db/schema.sql`은 이 정의에서 파생됩니다.

```sql
-- 1. 아파트 단지 기본정보
CREATE TABLE apartments (
  id SERIAL PRIMARY KEY,
  apt_code VARCHAR(60) NOT NULL UNIQUE,
  apt_name TEXT NOT NULL,
  address TEXT NOT NULL,
  region_code VARCHAR(10),
  building_type VARCHAR(20) NOT NULL DEFAULT 'apartment' CHECK (building_type IN ('apartment','officetel','other')),
  location GEOMETRY(Point, 4326) NOT NULL,
  built_year INTEGER,
  household_count INTEGER,           -- 건축물대장 총괄표제부 hhldCnt 기반
  official_name TEXT,                -- 건축물대장 bldNm (K-apt 매칭 보조)
  area_min REAL,
  area_max REAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1-1. 아파트 상세정보 (K-apt 연동, 부가정보)
-- household_count는 apartments 테이블에 일원화 (건축물대장 기반)
CREATE TABLE apartment_details (
  id SERIAL PRIMARY KEY,
  apt_id INTEGER REFERENCES apartments(id) NOT NULL,
  kapt_code VARCHAR(20),             -- K-apt 단지코드 (N:1 허용, UNIQUE 없음)
  dong_count INTEGER,
  doro_juso TEXT,
  use_date VARCHAR(8),
  builder TEXT,
  developer TEXT,
  heat_type VARCHAR(20),
  sale_type VARCHAR(20),
  hall_type VARCHAR(20),
  mgr_type VARCHAR(20),
  total_area NUMERIC,
  private_area NUMERIC,
  parking_ground INTEGER,
  parking_underground INTEGER,
  elevator_count INTEGER,
  cctv_count INTEGER,
  ev_charger_ground INTEGER,
  ev_charger_underground INTEGER,
  subway_line TEXT,
  subway_station TEXT,
  subway_distance TEXT,
  bus_distance TEXT,
  building_structure VARCHAR(30),
  welfare_facility TEXT,
  education_facility TEXT,
  convenient_facility TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(apt_id)
);

-- 1-2. 평형(전유면적)별 세대수 (unit-mix)
-- ⚠️ PII 비저장: 동/호 등 "호별 식별자"를 저장하지 않고 집계 결과만 저장한다.
CREATE TABLE apartment_unit_types (
  id SERIAL PRIMARY KEY,
  apt_id INTEGER REFERENCES apartments(id) NOT NULL,
  area_sqm NUMERIC NOT NULL,          -- 전유면적 (㎡, bucketed)
  area_pyeong REAL,                   -- 전유면적 (평, 표시용 캐시)
  household_count INTEGER NOT NULL,   -- 해당 면적 세대수
  source TEXT,                        -- 예: "bldRgst_expos"
  data_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(apt_id, area_sqm)
);

-- 2. 실거래가(매매/전세/월세) 요약
CREATE TABLE apartment_prices (
  id SERIAL PRIMARY KEY,
  apt_id INTEGER REFERENCES apartments(id),
  trade_type VARCHAR(10) CHECK (trade_type IN ('sale','jeonse','monthly')),
  year INTEGER,
  month INTEGER,
  average_price NUMERIC,             -- sale=매매가, jeonse/monthly=보증금
  monthly_rent_avg NUMERIC,          -- monthly 전용(월세 평균). sale/jeonse는 NULL
  deal_count INTEGER,
  area_avg NUMERIC,
  area_min NUMERIC,
  area_max NUMERIC,
  floor_avg NUMERIC,
  floor_min INTEGER,
  floor_max INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(apt_id, trade_type, year, month)
);

-- 3. 보육시설 (어린이집) 정보
CREATE TABLE childcare_centers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  external_id VARCHAR(30),
  location GEOMETRY(Point, 4326) NOT NULL,
  capacity INTEGER,
  current_enrollment INTEGER,
  evaluation_grade VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(external_id)
);

-- 4. 학교 정보 (학군)
CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  school_code VARCHAR(20),
  school_level VARCHAR(10) CHECK (school_level IN ('elem','middle','high')),
  location GEOMETRY(Point, 4326) NOT NULL,
  achievement_score NUMERIC,
  assignment_area GEOMETRY(Polygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_code)
);

-- 4-1. 시설 POI 원천 (단지 주변 시설)
-- 원천 적재는 스냅샷(CSV) 방식 허용. 대규모(예: 버스정류장)는 ETL에서 동적 BBOX 필터 의무.
CREATE TABLE facility_points (
  id SERIAL PRIMARY KEY,
  type VARCHAR(30) NOT NULL CHECK (type IN ('subway_station','bus_stop','police','fire_station','shelter','hospital','pharmacy')),
  name TEXT,
  address TEXT,
  region_code VARCHAR(10),
  location GEOMETRY(Point, 4326) NOT NULL,
  external_id VARCHAR(60),
  source TEXT,
  data_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(type, external_id)
);

-- 4-2. 단지별 시설 통계 프리컴퓨트 (성능 최적화용)
CREATE TABLE apartment_facility_stats (
  id SERIAL PRIMARY KEY,
  apt_id INTEGER REFERENCES apartments(id) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('subway_station','bus_stop','police','fire_station','shelter','hospital','pharmacy')),
  within_radius_count INTEGER NOT NULL,
  nearest_distance_m NUMERIC,
  radius_m INTEGER NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(apt_id, type, radius_m)
);

-- 5. 안전 인프라 (치안) 지표
CREATE TABLE safety_stats (
  id SERIAL PRIMARY KEY,
  region_code VARCHAR(10) NOT NULL,
  region_name TEXT,
  crime_rate NUMERIC,
  cctv_density NUMERIC,
  police_station_distance NUMERIC,
  streetlight_density NUMERIC,
  shelter_count INTEGER,
  calculated_score NUMERIC,
  data_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region_code, data_date)
);

-- 5-1. 안전 인프라 원천 (CCTV/안심이/가로등)
CREATE TABLE safety_infra (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('cctv', 'safecam', 'lamp')),
  location GEOMETRY(Point, 4326) NOT NULL,
  source TEXT,
  camera_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 사전 계산 통근 그리드
CREATE TABLE commute_grid (
  id SERIAL PRIMARY KEY,
  grid_id VARCHAR(20) NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(grid_id)
);

-- 6-1. 통근 목적지(업무권)
-- 목적지 추가 시 스키마 변경 없이 row 추가로 확장한다.
CREATE TABLE commute_destinations (
  destination_key VARCHAR(20) PRIMARY KEY,
  name TEXT NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6-2. 통근 시간 (grid_id x destination_key)
-- 충돌 정책: "처음값 고정" (재실행 시 기존 값 유지)
CREATE TABLE commute_times (
  id SERIAL PRIMARY KEY,
  grid_id VARCHAR(20) NOT NULL REFERENCES commute_grid(grid_id) ON DELETE CASCADE,
  destination_key VARCHAR(20) NOT NULL REFERENCES commute_destinations(destination_key),
  time_minutes INTEGER,
  -- 이동 경로 스냅샷(JSON): ODsay 경로 요약(세그먼트/환승/거리)
  route_snapshot JSONB,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(grid_id, destination_key)
);

-- 인덱스
CREATE INDEX idx_apartments_location ON apartments USING GIST(location);
CREATE INDEX idx_childcare_location ON childcare_centers USING GIST(location);
CREATE INDEX idx_schools_location ON schools USING GIST(location);
CREATE INDEX idx_commute_grid_location ON commute_grid USING GIST(location);
CREATE INDEX idx_commute_times_grid_id ON commute_times(grid_id);
CREATE INDEX idx_commute_times_destination_key ON commute_times(destination_key);
CREATE INDEX idx_apartment_prices_apt_id ON apartment_prices(apt_id);
CREATE INDEX idx_apartment_unit_types_apt_id ON apartment_unit_types(apt_id);
CREATE INDEX idx_facility_points_location ON facility_points USING GIST(location);
CREATE INDEX idx_facility_points_type ON facility_points(type);
CREATE INDEX idx_apartment_facility_stats_apt_id ON apartment_facility_stats(apt_id);
CREATE INDEX idx_safety_stats_region ON safety_stats(region_code);
```

### 데이터 관계 요약

- `apartments` 1:N `apartment_prices` (단지별 다건 거래 이력)
- `apartments` 1:1 `apartment_details` (K-apt 상세정보, apt_id UNIQUE)
- `apartments` 1:N `apartment_unit_types` (평형별 세대수 집계)
- `apartments` 1:N `apartment_facility_stats` (시설 POI 통계 프리컴퓨트)
- `schools.assignment_area` ↔ `apartments.location` (공간 교차: 학군 매핑)
- `childcare_centers.location` ↔ `apartments.location` (반경 800m: `ST_DWithin`)
- `safety_stats.region_code` ↔ `apartments.region_code` (행정구역 코드 매핑)
- `commute_grid.location` ↔ `apartments.location` (최근접 그리드 포인트)
- `commute_times.grid_id` ↔ `commute_grid.grid_id` + `commute_times.destination_key` ↔ `commute_destinations.destination_key` (목적지별 통근 시간)

## 3. Data Pipeline

### ETL 흐름

1. **수집**: Python 스크립트로 공공 API 호출 → CSV/JSON 저장
2. **전처리**: Pandas로 정규화, 지오코딩 (Kakao Geocoding API), 이상치 필터링
3. **적재**: PostGIS에 UPSERT
4. **갱신 주기**: 월 1회 (cron 또는 수동)

### API 키 목록

| 제공자            | 데이터                         | 용도                 | 호출 제한           |
| ----------------- | ------------------------------ | -------------------- | ------------------- |
| 국토교통부        | 실거래가 (매매/전세/월세)      | 가격 데이터          | 일 2,000건          |
| 사회보장정보원    | 어린이집/유치원                | 보육 지표            | 공공데이터포털 기준 |
| 교육부 학교알리미 | 학교 기본정보/성취도           | 학군 지표            | 공공데이터포털 기준 |
| 행정안전부        | 재난안전데이터 (CCTV/대피시설) | 안전 지표            | 공공데이터포털 기준 |
| Kakao             | 지도/지오코딩/주소검색         | 좌표 변환, 지도 표시 | 일 300,000건        |
| ODsay             | 대중교통 경로                  | 통근시간 계산        | 일 1,000건 (무료)   |

### 데이터 소스 거버넌스

- **허용**: 공공데이터 API, 제휴 API, 공식 오픈 API
- **금지**: 웹 크롤링, 무단 수집, 스크래핑 (→ PHASE0 S4 법무 체크리스트 #4 참조)
- **출처 표기**: 모든 공공데이터 사용 시 출처 + 기준일 필수 표기

## 4. Scoring Engine (유일한 스코어링 정본)

> 스코어링 로직 수정 시 이 섹션만 수정합니다.
> 다른 문서에서는 "PHASE1 S4 참조"로만 기재합니다.

### 정규화 함수

> 정규화 결과는 0~1 범위이며, 최종 점수에서 가중치 합산 후 0~100으로 스케일링합니다.

### Budget 정규화 (예산 적합도, utilization curve)

예산을 "최대한 효율적으로" 쓰는 구간(50~85%)을 선호하도록 곡선을 둔다.

```
util = min(apartment_price / max_price, 1.0)

if util <= 0.5:
  budget_norm = 0.3 + util * 1.1
else if util <= 0.85:
  budget_norm = 0.85 + ((util - 0.5) / 0.35) * 0.15
else:
  budget_norm = 1.0 - ((util - 0.85) / 0.15) * 0.3
```

### 지표별 정규화 로직

| 지표      | 정규화 방식                                               | 범위                |
| --------- | --------------------------------------------------------- | ------------------- |
| budget    | utilization curve (상단 정의)                             | 0~1 (높을수록 적합) |
| commute   | `max(0, (60 - max(commute1, commute2)) / 60)`             | 0~1 (짧을수록 높음) |
| childcare | `min(sqrt(childcare_count_800m / 30), 1)`                 | 0~1 (많을수록 높음) |
| safety    | `0.5 * crime_norm + 0.3 * cctv_norm + 0.2 * shelter_norm` | 0~1 (복합)          |
| school    | `achievement_score / 100`                                 | 0~1 (높을수록 높음) |

### Safety 세부 정규화

```
crime_norm    = (10 - crime_level) / 9          // crime_level: 1(안전)~10
cctv_norm     = clamp(cctv_density / 5, 0, 1)   // 5대/km² 기준
shelter_norm  = min(shelter_count, 10) / 10      // 최대 10개소
```

### 가중치 프로필

| 프로필    | budget | commute | childcare | safety | school |
| --------- | ------ | ------- | --------- | ------ | ------ |
| 균형형    | 0.30   | 0.25    | 0.15      | 0.15   | 0.15   |
| 예산 중심 | 0.40   | 0.20    | 0.15      | 0.15   | 0.10   |
| 통근 중심 | 0.20   | 0.40    | 0.15      | 0.15   | 0.10   |

### 월세(monthly) 처리 (S4 보조 정의)

`trade_type = 'monthly'` 컬럼 의미:

- `apartment_prices.average_price` = 보증금 평균(만원)
- `apartment_prices.monthly_rent_avg` = 월세 평균(만원/월)

스코어링 입력 현금 정의:

- `cash` = 사용자 입력 `input.cash` (주거에 투입 가능한 현금, 만원)
- 월세 월부담(표시/필터용, 환산 전세 전환율 사용 안 함):

```
deposit_avg = apartment_prices.average_price
monthly_rent_avg = apartment_prices.monthly_rent_avg
deposit_financed = max(0, deposit_avg - cash)
term_months = 24
monthly_cost = monthly_rent_avg + deposit_financed / term_months
```

후보 필터(월세 풀 내부에서만 비교):

- `deposit_avg <= budget.maxPrice`
- `monthly_cost <= input.monthlyBudget`

### 최종 점수 산출

```
final_score = round(100 * (
    W_budget * budget_norm +
    W_commute * commute_norm +
    W_childcare * childcare_norm +
    W_safety * safety_norm +
    W_school * school_norm
), 1)
```

결과: 0~100점 스케일. 상위 10개 단지를 추천 결과로 반환.

### 의사결정 확정 (2026-02-20)

**cash 정의** (`src/types/engine.ts` BudgetInput.cash):
사용자가 주거에 투입 가능한 현금 보유액 (만원).

- 매매: down payment (자기자본)
- 전세/월세: deposit (보증금)

**월세 환산 공식** (`src/lib/engines/budget.ts` estimateApartmentMonthlyCost):
통합 방식 확정 (풀 분리 안 함).
`monthly_cost = monthly_rent_avg + max(0, deposit - cash) / 24`

**BBOX** (`src/etl/adapters/poi-snapshot.ts` deriveBboxFromRegions):
`regions.ts` TARGET_REGIONS 기반 동적 계산 유지.
margin=0.2도, 하드코딩 불필요.

**시설 POI 소스 확정**:
| 시설 | 소스 | 비고 |
|------|------|------|
| 통근 시간 | ODsay API 그리드 | commute_times 테이블 (commute_grid + 목적지 정규화) |
| 지하철역 (subway_station) | Kakao Places SW8 카테고리 검색 | |
| 병원 (hospital) | Kakao Places HP8 카테고리 검색 | |
| 약국 (pharmacy) | Kakao Places PM9 카테고리 검색 | |
| 경찰서 (police) | Kakao Places 키워드 검색 "경찰서" | |
| 소방서 (fire_station) | Kakao Places 키워드 검색 "소방서" | |
| 대피소 (shelter) | MOIS safety_infra 테이블에 이미 존재 | |
| 버스정류장 (bus_stop) | 이번 범위 제외 (post-launch) | |

## 5. API Design

### 엔드포인트 명세

| Method | Path                  | 설명           | 인증 |
| ------ | --------------------- | -------------- | ---- |
| POST   | `/api/recommend`      | 추천 결과 반환 | 없음 |
| GET    | `/api/apartments/:id` | 단지 상세 정보 | 없음 |
| GET    | `/api/health`         | 서버 상태 확인 | 없음 |

### POST /api/recommend

**Request Body**:

```json
{
  "cash": 30000,
  "income": 8000,
  "loans": 5000,
  "monthlyBudget": 150,
  "job1": "서울 강남구 역삼동",
  "job2": "서울 영등포구 여의도동",
  "tradeType": "jeonse",
  "weightProfile": "balanced"
}
```

**Response**:

```json
{
  "recommendations": [
    {
      "rank": 1,
      "aptId": 123,
      "aptName": "래미안 OO",
      "address": "경기도 성남시 ...",
      "monthlyCost": 120,
      "commuteTime1": 35,
      "commuteTime2": 45,
      "childcareCount": 7,
      "schoolScore": 82,
      "safetyScore": 0.78,
      "finalScore": 76.3,
      "reason": "예산 여유 + 통근 45분 이내 + 보육시설 7곳",
      "whyNot": "학군 점수가 평균 이하",
      "sources": { "priceDate": "2026-01", "safetyDate": "2025-12" },
      "outlink": "https://..."
    }
  ],
  "meta": {
    "totalCandidates": 342,
    "computedAt": "2026-02-14T12:00:00Z"
  }
}
```

### 입력값 검증 규칙

- 숫자값 음수 금지, 합리적 범위 체크
- 주소 문자열 길이 제한 (최대 200자)
- 민감 정보 로그 미기록 (→ PHASE0 NFR-1 참조)

## 6. UI/UX Design

### 3단 퍼널

```
[1단계: 입력]  →  [2단계: 결과]  →  [3단계: 상세/문의]
 최소 입력         Top10 리포트       단지 상세 + 아웃링크
 (정밀은 선택)     지도 + 카드         외부 매물 이동 고지
```

### 페이지 구성

| 페이지       | 주요 컴포넌트                            | 비고           |
| ------------ | ---------------------------------------- | -------------- |
| 랜딩         | 서비스 소개, CTA, 면책/포지셔닝 고지     | 하단 고정      |
| 입력 폼      | StepForm (3단계), 동의 체크박스          | 최소/정밀 분리 |
| 결과 페이지  | KakaoMap, ResultCardList, ScoreBreakdown | Top10          |
| 단지 상세    | DetailCard, SourceInfo, OutlinkCTA       | 외부 이동 고지 |
| 컨시어지     | ConciergeReport, ContactCTA              | 문의 흐름      |
| 컴플라이언스 | 이용약관, 개인정보처리방침, 출처 표기    | footer 링크    |

### 컴포넌트 목록

- `StepForm` — 단계별 입력 폼 (최소/정밀)
- `BudgetInput` — 보유현금/연소득/대출/월상한
- `JobInput` — 직장 주소 입력 (Kakao 주소 검색)
- `WeightSelector` — 가중치 프로필 선택
- `KakaoMap` — 지도 + 단지 마커
- `ResultCard` — 단지 카드 (점수/사유/Why-Not)
- `ScoreBreakdown` — 점수 분해 시각화
- `SourceBadge` — 출처/기준일 표시
- `ConsentForm` — 필수/선택 동의 분리
- `DisclaimerBanner` — 면책/포지셔닝 고지
- `OutlinkButton` — 외부 매물 이동 (이동 고지 포함)

## 7. Design Tokens (요약)

> **상세 명세**: `docs/design-system/DESIGN_SYSTEM.md` 참조
> **구현 파일**: `docs/design-system/design-tokens.css` (런타임 변수 + Tailwind v4 `@theme`)

### 핵심 토큰 (리서치 기반 확정)

```
colors:
  primary:    '#0891B2'  (Warm Teal Blue 500 — 신뢰+따뜻함)
  accent:     '#F97316'  (Coral Orange — CTA·하이라이트)
  accent-dark:'#C2410C'  (텍스트용 AA 준수)
  background: '#FAFAF9'  (Stone 50 — 웜 뉴트럴)
  surface:    '#FFFFFF'
  text:       '#1C1917'  (웜 다크)
  muted:      '#78716C'  (Stone 500)
  success:    '#059669'  (Emerald 600)
  warning:    '#D97706'  (Amber 600)
  error:      '#DC2626'  (Red 600)

spacing:
  base-unit:     '4px'
  card-padding:  '16px'   (p-4)
  section-gap:   '48px'
  container-max: '1280px'

typography:
  font-family: '"Pretendard Variable", "Noto Sans KR", system-ui, sans-serif'
  heading:     '24px / 700 weight / lh 1.25'
  title:       '20px / 600 weight / lh 1.3'
  body:        '16px / 400 weight / lh 1.6'

breakpoints:
  design-base: '390px'   (360–430px 가변 대응)
  split-view:  '1024px'  (바텀시트 → 사이드 패널)
  desktop:     '>= 1280px'

border-radius:
  card:   '16px'  (rounded-2xl)
  button: '12px'  (rounded-xl)
  bar:    '9999px' (pill)
```

### 변경 이력

| 항목         | 변경 전               | 변경 후                    | 근거                                  |
| ------------ | --------------------- | -------------------------- | ------------------------------------- |
| Primary      | `#1E40AF` (Blue 800)  | `#0891B2` (Warm Teal Blue) | 디자인 리서치 step3/design_brief 확정 |
| Secondary    | `#059669` (Emerald)   | `#F97316` (Coral Orange)   | 리서치 결과 — accent로 역할 변경      |
| Background   | `#F8FAFC` (Slate 50)  | `#FAFAF9` (Stone 50)       | 웜 뉴트럴 톤 채택                     |
| Text         | `#1E293B` (Slate 800) | `#1C1917` (웜 다크)        | 순흑 대체, 따뜻한 톤                  |
| card-padding | 24px                  | 16px (p-4)                 | 리서치 결과 우선 (step3/design_brief) |

## 8. Portfolio Strategy

### 강조 포인트

1. **시장 공백 해결** — 예산 역산 + 2직장 통근 + 보육/치안 통합 랭킹 (기존 플랫폼 미제공)
2. **데이터 엔지니어링** — 5개 공공 API ETL + PostGIS 공간 연산 + Redis 캐시
3. **스코어링 설계** — 설명 가능한 가중치 기반 점수 체계 + Why-Not 표시
4. **컴플라이언스 준수** — 법무 체크리스트 10항목, 중개 회피 설계, 개인정보 비저장
5. **1인 개발 풀스택** — Next.js + TypeScript + PostgreSQL + Vercel 배포

---

**입력 소스** (병합 완료):

- `legacy_docs/merged/detailed_plan.md`
- `legacy_docs/merged/implementation_plan.md`
- `legacy_docs/merged/portfolio_direction_plan.md`

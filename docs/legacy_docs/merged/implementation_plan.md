# 포트폴리오용 신혼부부 주거 추천 서비스 구체화 계획

## 1. 개발 환경 및 기본 설정

1. **언어/프레임워크 선택**
   - **백엔드**: Node.js 기반 Next.js API Routes(또는 Express.js) – 프론트엔드와 동일한 코드베이스를 사용해 유지보수 부담을 줄입니다.
   - **프론트엔드**: Next.js + React + Tailwind CSS. 프리셋 컴포넌트 라이브러리(shadcn/ui 등)를 활용해 UI 구현 시간을 단축합니다.
   - **데이터베이스**: PostgreSQL + PostGIS. 공간 연산이 필요한 반경 검색(예: 어린이집 800m 이내)을 SQL로 처리할 수 있습니다.
   - **지도 API**: Kakao Maps JS SDK. 한국 주소 체계에 최적화되어 있고 일정 호출량까지 무료입니다.
   - **캐시/세션 관리**: Redis(선택). 통근시간 API 호출 결과나 프리컴퓨트 데이터를 캐싱하는 데 활용합니다.

2. **개발 도구 설치**
   - `nvm` 또는 `fnm`으로 Node.js LTS 설치.
   - `pnpm` 또는 `npm`으로 Next.js 프로젝트 초기화: `pnpx create-next-app@latest`.
   - PostgreSQL 설치 및 PostGIS 플러그인 활성화(`CREATE EXTENSION postgis;`).
   - 환경 변수 관리(.env): 공공 API 키, Kakao 지도 API 키 등을 저장합니다.

3. **리포지토리 구조 제안**
   ```
   /app
     /components  # React UI 컴포넌트
     /pages       # Next.js 페이지
     /pages/api   # API Routes (데이터 계산, DB조회)
     /lib         # DB 연결, 유틸 함수
     /scripts     # 데이터 수집/ETL 스크립트 (Python/Node)
   /db
     schema.sql   # 초기 테이블 정의
   /data
     raw/         # API 원본 데이터 저장
     processed/   # 전처리된 CSV/JSON
   /docs
     implementation_plan.md
   ```

## 2. 데이터 모델 설계

### 2.1 주요 테이블 구조(SQL 예시)

```sql
-- 1. 아파트 단지 기본정보
CREATE TABLE apartments (
  id SERIAL PRIMARY KEY,
  apt_code VARCHAR(20) NOT NULL UNIQUE,
  apt_name TEXT NOT NULL,
  address TEXT NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL, -- 위도/경도
  built_year INTEGER,
  household_count INTEGER,
  area_min FLOAT,
  area_max FLOAT
);

-- 2. 실거래가(매매/전세) 요약
CREATE TABLE apartment_prices (
  id SERIAL PRIMARY KEY,
  apt_id INTEGER REFERENCES apartments(id),
  trade_type VARCHAR(10) CHECK (trade_type IN ('sale','jeonse')),
  year INTEGER,
  month INTEGER,
  average_price NUMERIC,
  deal_count INTEGER
);

-- 3. 보육시설 (어린이집) 정보
CREATE TABLE childcare_centers (
  id SERIAL PRIMARY KEY,
  name TEXT,
  address TEXT,
  location GEOMETRY(Point, 4326),
  capacity INTEGER,
  current_enrollment INTEGER
);

-- 4. 학교 정보(학군)
CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  name TEXT,
  school_level VARCHAR(10) CHECK (school_level IN ('elem','middle','high')),
  location GEOMETRY(Point, 4326),
  achievement_score NUMERIC,      -- 학교알리미 성취도 지표
  assignment_area GEOMETRY(Polygon, 4326) -- 초등 통학구역
);

-- 5. 안전 인프라(치안) 지표
CREATE TABLE safety_stats (
  id SERIAL PRIMARY KEY,
  region_code VARCHAR(10),
  crime_rate NUMERIC,      -- 5대 범죄 발생 건수(정규화)
  cctv_density NUMERIC,
  police_station_distance NUMERIC,
  streetlight_density NUMERIC,
  calculated_score NUMERIC
);

-- 6. 미리 계산된 통근 그리드 (선택)
CREATE TABLE commute_grid (
  id SERIAL PRIMARY KEY,
  grid_id VARCHAR(20),
  location GEOMETRY(Point, 4326),
  to_gbd_time INTEGER,
  to_ybd_time INTEGER,
  to_cbd_time INTEGER
  -- 주요 업무지구 도착시간 컬럼
);
```

### 2.2 데이터 관계 및 조회 예시

- 아파트 단지는 한 단지에 여러 거래(실거래가)와 매핑됩니다.
- 초등학교 학군은 `assignment_area` 폴리곤과 아파트 위치의 공간 교차 여부로 매핑합니다:
  ```sql
  SELECT a.*
  FROM apartments AS a
  JOIN schools AS s
    ON ST_Contains(s.assignment_area, a.location)
  WHERE s.school_level = 'elem';
  ```
- 어린이집 수는 PostGIS의 `ST_DWithin` 함수로 반경 800m 내의 개수를 집계합니다.

## 3. 데이터 수집 및 전처리

1. **공공 API 키 발급**
   - 국토교통부 부동산 거래 공개 API(매매·전월세) – 하루 1,000건 테스트 제한.
   - 학교알리미 API – 학교 기본 정보, 성취도.
   - 사회보장정보원 어린이집 정보 API.
   - 생활안전지도 API(WMS/JSON) – 범죄 밀도, 치안시설 정보.
   - Kakao Maps Geocoding API – 주소→좌표 변환.

2. **파이썬 수집 스크립트 예시**

```python
import requests
import csv

API_KEY = "YOUR_API_KEY"

# 예시: 국토교통부 매매 실거래 API 호출
url = f"https://apis.data.go.kr/1611000/ApartmentTrade?serviceKey={API_KEY}&pageNo=1&numOfRows=5000&LAWD_CD=11110&DEAL_YMD=202512"
response = requests.get(url)
items = response.json().get('response', {}).get('body', {}).get('items', {}).get('item', [])

with open('data/raw/apartment_sales.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=items[0].keys())
    writer.writeheader()
    for item in items:
        writer.writerow(item)
```

> **팁**: API 호출 시 페이징 처리와 호출 제한을 고려해 일/월 단위로 루프를 돌리고 `time.sleep()`을 활용합니다.

3. **전처리 파이프라인**
   - 주소를 Kakao Geocoding API로 위/경도 변환.
   - 거래금액 문자열을 숫자로 변환하고, 단위(만원, 억원)를 통일.
   - 여러 데이터셋을 아파트 코드(또는 지번) 기준으로 조인하고, 결측치 처리 및 정규화를 수행합니다.

## 4. 점수 산정 로직 구체화

아래는 Python으로 작성한 예시 로직입니다. Node.js 환경이라면 유사한 함수를 구현하면 됩니다.

```python
from math import exp

def normalize(value, min_val, max_val):
    if max_val == min_val:
        return 0
    return (value - min_val) / (max_val - min_val)

def compute_scores(candidate):
    """
    candidate는 dict로, 다음 키를 포함합니다:
    - monthly_cost: 월 고정비 (만 원)
    - max_budget: 사용자가 입력한 월 상한 (만 원)
    - commute1: 직장1 통근시간(분)
    - commute2: 직장2 통근시간(분)
    - childcare_count: 반경 800m 내 어린이집 수
    - crime_level: 범죄등급(1~10, 1이 안전)
    - school_score: 학업 성취도(0~100)
    """
    # 예산 점수: 월 비용이 상한보다 낮을수록 높다
    budget_norm = max(0, (candidate['max_budget'] - candidate['monthly_cost']) / candidate['max_budget'])

    # 통근 점수: 두 직장 중 긴 시간을 사용, 60분을 기준으로 페널티
    commute_max = max(candidate['commute1'], candidate['commute2'])
    commute_norm = max(0, (60 - commute_max) / 60)

    # 보육 점수: 어린이집 수를 최대 10개로 제한하여 정규화
    childcare_norm = min(candidate['childcare_count'], 10) / 10

    # 치안 점수: 범죄등급 역수 변환(1등급=안전) + 보정값(별도로 계산)
    safety_norm = (10 - candidate['crime_level']) / 9  # 0~1 범위

    # 학군 점수는 이미 0~100 범위로 가정 후 0~1로 변환
    school_norm = candidate['school_score'] / 100

    # 가중치(균형형 예)
    W_budget = 0.30
    W_commute = 0.25
    W_childcare = 0.15
    W_safety = 0.15
    W_school = 0.15

    final_score = (
        W_budget * budget_norm +
        W_commute * commute_norm +
        W_childcare * childcare_norm +
        W_safety * safety_norm +
        W_school * school_norm
    ) * 100  # 0~100점 스케일

    return round(final_score, 1)
```

> 점수 계산 시 상수(60분 등)는 실사용자 피드백을 통해 조정해야 합니다. 포트폴리오 단계에서는 연구 문서에서 제안한 기본 값을 사용합니다.

## 5. API 설계

### 5.1 API Routes (Next.js 예시)

- `POST /api/recommend` – 사용자 입력을 받아 추천 결과를 반환합니다.
  - Request Body: `{ cash, income, loans, monthlyBudget, job1, job2, weightingProfile }`
  - Response: `{ recommendations: [ { aptId, aptName, monthlyCost, commuteTime1, commuteTime2, childcareCount, schoolScore, safetyScore, finalScore, reason }, ... ] }`
  - 로직: 입력 값을 검증 → 가용 예산 계산 → 후보 단지 목록 필터링 → 통근시간 계산(사전 계산 or API 호출) → 각 단지의 지표 추출 → 점수 계산 후 상위 10개 반환.

- `GET /api/apartments/:id` – 특정 단지 상세 정보 제공.
- `GET /api/schools` – 필터에 사용할 학군 목록 제공(선택).

### 5.2 입력 값 검증

- 숫자값 범위 체크(음수 금지).
- 주소 문자열 길이 제한 및 도메인 검증.
- 민감 정보는 메모리 내에서만 사용하고 로그에 기록하지 않습니다【543942488311355†L15-L21】.

### 5.3 통근 시간 계산 전략

1. 사용자 입력 직장 주소를 Kakao Geocoding API로 좌표 변환.
2. 아파트 후보 500개를 선별(예산과 거주지역 등으로 필터)하여 각 단지의 좌표와 직장 좌표를 조합합니다.
3. 주요 업무지구에 대한 사전 계산 값이 있으면 활용하고, 필요 시 ODsay API로 요청합니다.
4. 결과를 Redis에 캐싱하여 같은 좌표 쌍에 대해 재사용합니다.

## 6. 프런트엔드 UI/UX 구현

### 6.1 입력 단계

- 단계별 폼으로 사용자 부담을 줄입니다.
  1. **기본 정보**: 보유현금, 합산 연봉, 기존 대출(선택으로 구간 입력), 월 상한.
  2. **직장 정보**: 직장1과 직장2 주소를 입력(자동 완성: Kakao 주소 검색 API 활용).
  3. **선호도**: 가중치 프로필 선택 (예산/통근/균형) 또는 슬라이더 조정(P1).
- 입력 시 `onChange`마다 state를 업데이트하고, 제출 버튼 클릭 시 API 요청을 보냅니다.

### 6.2 결과 화면

- **지도**: 카카오 지도에 Top10 후보 단지 마커 표시. 마커 클릭 시 카드 정보 표시 및 외부 매물 링크 버튼을 노출합니다. 외부 링크는 새 탭으로 열어 중개 행위로 해석되지 않도록 합니다【543942488311355†L41-L49】.
- **카드 리스트**: 단지명, 종합점수, 월 고정비, 주요 지표(통근시간, 어린이집 수, 학군 수준, 안전 인프라)를 보여주는 카드 리스트. 점수 구성에 대한 간단한 설명을 함께 제공합니다.
- **가중치 변경 UI**: P1 단계에서는 슬라이더 변경 시 `useEffect`를 통해 API를 재요청하거나 클라이언트에서 점수를 재계산합니다.
- **저장/공유**: 카카오톡 공유 버튼과 “결과 PDF 저장(실험용)” 버튼을 제공해 포트폴리오 데모로 활용합니다.

## 7. 컴플라이언스 문서 및 UI 요소

- **이용약관/개인정보처리방침 링크**를 모든 페이지 footer에 배치합니다. 
- **동의 체크박스 구분**: 필수 동의(서비스 이용), 선택 동의(마케팅), 제3자 제공 동의(중개사 연결) 등을 분리합니다.
- **법적 용어 주의**: “추천” 대신 “분석 결과” 또는 “안내”를 사용하고 “중개”라는 표현을 피합니다【543942488311355†L15-L21】.
- **안전 정보 표현**: 범죄율 등을 단정적으로 표현하지 않고 CCTV·가로등·파출소 등 안전 인프라 정보를 제시합니다. 필요 시 별도의 세부 정보 페이지를 연결합니다【543942488311355†L41-L49】.

## 8. 향후 확장 아이디어(P1/P2)

- **매물 제휴**: 단지별 대표 매물을 파트너 중개사에게서 받아 추가 카드에 표시. 클릭 시 파트너 사이트로 이동하며, CPA 모델 도입 시 법률 자문을 선행해야 합니다.
- **사용자 계정/저장 기능**: 로그인 후 관심 단지를 북마크하고 비교할 수 있는 기능을 추가합니다.
- **대출/금융 정보 비교**: 금융상품 비교 콘텐츠를 제공하고, 제휴 링크를 통해 수익을 창출할 수 있습니다. 다만 대출모집인 등록 요건을 확인해야 합니다.

## 9. 개발 일정 요약(12주 기준)

| Phase | 기간(주) | 세부 내용 |
|---|---|---|
| **기획/데이터 수집** | 1–3 | 요구사항 정의, API 키 발급, 데이터 수집 스크립트 작성, DB 스키마 설계 |
| **핵심 로직 개발** | 4–6 | 데이터 적재 및 ETL, 점수 계산 함수 구현, API Routes 작성, 기본 캐시 설계 |
| **프런트엔드 개발** | 5–7 | 입력 폼과 지도/카드 UI 구현, 결과 페이지 완성, Tailwind 스타일링 |
| **통합 테스트/컴플라이언스** | 8–10 | 기능 통합, 에러 수정, 개인정보 비저장 로깅 설정, 약관/정책 페이지 작성 |
| **추가 기능/배포** | 11–12 | 가중치 슬라이더, 공유 기능 추가, Vercel/GitHub Pages 배포, 데모 영상 및 포트폴리오 소개 작성 |

## 10. 마무리 팁

- **범위 조절**: 1인 개발자의 역량과 시간을 고려해 핵심 기능(P0)에 집중하고, 외부 API 호출을 최소화하는 구조(사전 계산, 캐싱)로 설계하세요.
- **데이터 품질**: 공공 데이터의 갱신 주기를 코드에 주석으로 기록하고, 갱신 스크립트를 별도 배치해 포트폴리오 제출 시 최신 데이터를 사용할 수 있도록 합니다.
- **커뮤니티 활용**: 구현 과정과 결과를 블로그/기술 커뮤니티에 공유하면 피드백과 네트워킹에 도움이 됩니다.

---

이 구현 계획은 포트폴리오 프로젝트를 실제 개발 단계로 이행하기 위한 구체적인 단계와 예시 코드를 제공합니다. 위의 스키마와 스크립트 예시는 실제 데이터와 환경에 맞게 수정이 필요하며, 컴플라이언스 요건을 준수하여 포트폴리오라도 적법성을 확보하는 것이 중요합니다.

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. 아파트 단지 기본정보
CREATE TABLE apartments (
  id SERIAL PRIMARY KEY,
  apt_code VARCHAR(20) NOT NULL UNIQUE,
  apt_name TEXT NOT NULL,
  address TEXT NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  built_year INTEGER,
  household_count INTEGER,
  area_min FLOAT,
  area_max FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 실거래가(매매/전세) 요약
CREATE TABLE apartment_prices (
  id SERIAL PRIMARY KEY,
  apt_id INTEGER REFERENCES apartments(id),
  trade_type VARCHAR(10) CHECK (trade_type IN ('sale','jeonse')),
  year INTEGER,
  month INTEGER,
  average_price NUMERIC,
  deal_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 보육시설 (어린이집) 정보
CREATE TABLE childcare_centers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  location GEOMETRY(Point, 4326) NOT NULL,
  capacity INTEGER,
  current_enrollment INTEGER,
  evaluation_grade VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 학교 정보 (학군)
CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  school_level VARCHAR(10) CHECK (school_level IN ('elem','middle','high')),
  location GEOMETRY(Point, 4326) NOT NULL,
  achievement_score NUMERIC,
  assignment_area GEOMETRY(Polygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 사전 계산 통근 그리드
CREATE TABLE commute_grid (
  id SERIAL PRIMARY KEY,
  grid_id VARCHAR(20) NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  to_gbd_time INTEGER,  -- 강남 업무지구
  to_ybd_time INTEGER,  -- 여의도 업무지구
  to_cbd_time INTEGER,  -- 종로 업무지구
  to_pangyo_time INTEGER, -- 판교
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_apartments_location ON apartments USING GIST(location);
CREATE INDEX idx_childcare_location ON childcare_centers USING GIST(location);
CREATE INDEX idx_schools_location ON schools USING GIST(location);
CREATE INDEX idx_commute_grid_location ON commute_grid USING GIST(location);
CREATE INDEX idx_apartment_prices_apt_id ON apartment_prices(apt_id);
CREATE INDEX idx_safety_stats_region ON safety_stats(region_code);

-- Source of Truth: docs/PHASE1_design.md > S2
-- Data sources: 국토교통부/사회보장정보원/교육부/행정안전부 공공 API (기준일 표기는 표시 레이어에서 관리)

CREATE EXTENSION IF NOT EXISTS postgis;

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
  household_count INTEGER,
  official_name TEXT,
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
  kapt_code VARCHAR(20),
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
  area_sqm NUMERIC NOT NULL,
  area_pyeong REAL,
  household_count INTEGER NOT NULL,
  source TEXT,
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
  average_price NUMERIC,
  monthly_rent_avg NUMERIC,
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

-- 4-2. 단지별 시설 통계 프리컴퓨트
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
  to_gbd_time INTEGER,
  to_ybd_time INTEGER,
  to_cbd_time INTEGER,
  to_pangyo_time INTEGER,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(grid_id)
);

-- 인덱스
CREATE INDEX idx_apartments_location ON apartments USING GIST(location);
CREATE INDEX idx_childcare_location ON childcare_centers USING GIST(location);
CREATE INDEX idx_schools_location ON schools USING GIST(location);
CREATE INDEX idx_commute_grid_location ON commute_grid USING GIST(location);
CREATE INDEX idx_apartment_prices_apt_id ON apartment_prices(apt_id);
CREATE INDEX idx_apartment_unit_types_apt_id ON apartment_unit_types(apt_id);
CREATE INDEX idx_facility_points_location ON facility_points USING GIST(location);
CREATE INDEX idx_facility_points_type ON facility_points(type);
CREATE INDEX idx_apartment_facility_stats_apt_id ON apartment_facility_stats(apt_id);
CREATE INDEX idx_safety_stats_region ON safety_stats(region_code);

-- Source of Truth: docs/PHASE1_design.md > S2

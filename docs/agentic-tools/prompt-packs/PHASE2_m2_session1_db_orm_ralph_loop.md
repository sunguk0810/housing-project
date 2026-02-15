# M2 Session 1: DB + ORM Ralph Loop

## Session Metadata

- **Phase**: Session 1 / 5
- **Max Iterations**: 5
- **Completion Promise**: "Phase 1 complete: pnpm tsc --noEmit passes with all 11 DB+ORM files"
- **Gate**: `pnpm tsc --noEmit` pass
- **SoT 참조**: `docs/plan/2026-02-15_claude-code_m2-implementation-spec.md` 섹션 2, 10.1

---

## 목표

M2 스펙 섹션 2를 기반으로 Drizzle ORM 스키마 11개 파일을 구현한다. PostGIS geometry customType을 먼저 정의하고, 6개 테이블 스키마 → relations → barrel export → connection pool → drizzle config 순서로 진행한다.

## 중요 규칙 (모든 반복에서 준수)

1. **TypeScript strict 모드**: `any` 타입 절대 금지, `unknown` + 타입가드 사용
2. **경로 규칙**: Section 9.1 정본 사용 (`src/db/types/geometry.ts`, `src/db/connection.ts`)
3. **import 별칭**: `@/*` 사용 (`@/db/schema`, `@/db/types/geometry` 등)
4. **PII 비저장**: DB 스키마에 개인정보 컬럼 금지 (income, salary, phone, email, ssn 등)
5. **기존 파일 보호**: `src/app/`, `src/lib/utils.ts`, `src/styles/` 수정 금지

## 대상 파일 (11개)

### 구현 순서

```
1. src/db/types/geometry.ts          — PostGIS customType (Point, Polygon)
2. src/db/schema/apartments.ts       — apartments 테이블 (FK 없음, 첫 번째)
3. src/db/schema/prices.ts           — apartment_prices 테이블 (apartments FK)
4. src/db/schema/childcare.ts        — childcare_centers 테이블
5. src/db/schema/schools.ts          — schools 테이블
6. src/db/schema/safety.ts           — safety_stats 테이블
7. src/db/schema/commute.ts          — commute_grid 테이블
8. src/db/schema/relations.ts        — 테이블 간 관계 정의
9. src/db/schema/index.ts            — barrel export
10. src/db/connection.ts             — postgres.js 커넥션 풀 + Drizzle 인스턴스
11. drizzle.config.ts                — Drizzle Kit 설정
```

### 파일별 상세 스펙

#### 1. `src/db/types/geometry.ts`

PostGIS geometry 타입을 Drizzle `customType`으로 정의한다.

**필수 export:**
- `geometryPoint`: `customType<{ data: { x: number; y: number }; driverData: string }>`
  - `dataType()`: `'geometry(Point, 4326)'`
  - `toDriver(value)`: `SRID=4326;POINT(${value.x} ${value.y})`
  - `fromDriver(value)`: WKT POINT 파싱 → `{ x, y }`
- `geometryPolygon`: `customType<{ data: string; driverData: string }>`
  - `dataType()`: `'geometry(Polygon, 4326)'`
  - `toDriver(value)`: WKT 그대로 전달
  - `fromDriver(value)`: WKT 문자열 반환

**참조**: M2 스펙 섹션 10.1 R1-1 코드 블록

#### 2. `src/db/schema/apartments.ts`

```
컬럼 | 타입 | 제약조건
id | serial | PK
name | varchar(200) | NOT NULL
address | varchar(500) | NOT NULL
district | varchar(50) | NOT NULL (서울 25구)
dong | varchar(50) | NOT NULL
built_year | integer | NOT NULL
total_units | integer | NOT NULL
floor_area_py | numeric(8,2) | NOT NULL (평형)
location | geometryPoint | NOT NULL (경도, 위도)
created_at | timestamp | DEFAULT now()
updated_at | timestamp | DEFAULT now()
```

**import**: `geometryPoint` from `@/db/types/geometry`
**export**: `apartments` 테이블 + `Apartment` 타입 (InferSelectModel)
**DB 스키마 참조**: `db/schema.sql` apartments 테이블

#### 3. `src/db/schema/prices.ts`

```
컬럼 | 타입 | 제약조건
id | serial | PK
apt_id | integer | NOT NULL, FK → apartments.id
trade_type | varchar(10) | NOT NULL ('매매' | '전세')
year | integer | NOT NULL
month | integer | NOT NULL
average_price | integer | NOT NULL (만원)
min_price | integer |
max_price | integer |
trade_count | integer |
created_at | timestamp | DEFAULT now()
```

**FK**: `apt_id` → `apartments.id`
**export**: `apartmentPrices` 테이블

#### 4. `src/db/schema/childcare.ts`

```
컬럼 | 타입 | 제약조건
id | serial | PK
name | varchar(200) | NOT NULL
type | varchar(50) | NOT NULL ('국공립' | '민간' | '가정' | '직장')
capacity | integer | NOT NULL
address | varchar(500) | NOT NULL
district | varchar(50) | NOT NULL
location | geometryPoint | NOT NULL
evaluation_grade | varchar(10) | ('A' | 'B' | 'C' | 'D')
created_at | timestamp | DEFAULT now()
```

**import**: `geometryPoint`
**export**: `childcareCenters` 테이블

#### 5. `src/db/schema/schools.ts`

```
컬럼 | 타입 | 제약조건
id | serial | PK
name | varchar(200) | NOT NULL
level | varchar(20) | NOT NULL ('초등' | '중등' | '고등')
district | varchar(50) | NOT NULL
address | varchar(500) | NOT NULL
location | geometryPoint | NOT NULL
student_count | integer |
teacher_count | integer |
achievement_score | numeric(5,2) | (학업성취도)
assignment_area | geometryPolygon | (학군 배정 구역)
created_at | timestamp | DEFAULT now()
```

**import**: `geometryPoint`, `geometryPolygon`
**export**: `schools` 테이블

#### 6. `src/db/schema/safety.ts`

```
컬럼 | 타입 | 제약조건
id | serial | PK
region_code | varchar(10) | NOT NULL, UNIQUE
region_name | varchar(50) | NOT NULL
crime_rate | numeric(8,4) | NOT NULL (인구 10만명당)
cctv_density | numeric(8,4) | NOT NULL (km²당)
fire_incidents | integer |
shelter_count | integer |
source_year | integer | NOT NULL
created_at | timestamp | DEFAULT now()
```

**export**: `safetyStats` 테이블

#### 7. `src/db/schema/commute.ts`

```
컬럼 | 타입 | 제약조건
id | serial | PK
grid_id | varchar(20) | NOT NULL, UNIQUE
center_location | geometryPoint | NOT NULL
dest_name | varchar(100) | NOT NULL
dest_location | geometryPoint | NOT NULL
duration_minutes | integer | NOT NULL
transfer_count | integer |
transport_type | varchar(20) | ('대중교통' | '자가용')
calculated_at | timestamp | DEFAULT now()
```

**import**: `geometryPoint`
**export**: `commuteGrid` 테이블

#### 8. `src/db/schema/relations.ts`

Drizzle `relations()` 함수로 테이블 간 관계를 정의한다.

**관계:**
- `apartments` ↔ `apartmentPrices`: 1:N (apartments.id → prices.apt_id)
- 기타 테이블은 공간 JOIN으로 연결 (FK 관계 없음)

**import**: 모든 스키마 테이블 + `relations` from `drizzle-orm`

#### 9. `src/db/schema/index.ts`

barrel export — 모든 스키마 테이블 + relations를 re-export한다.

```typescript
export * from './apartments';
export * from './prices';
export * from './childcare';
export * from './schools';
export * from './safety';
export * from './commute';
export * from './relations';
```

#### 10. `src/db/connection.ts`

postgres.js 드라이버로 커넥션 풀을 생성하고, Drizzle ORM 인스턴스를 초기화한다.

**필수 사항:**
- `postgres` 드라이버: `max: 10`, `idle_timeout: 20`, `connect_timeout: 10`
- `drizzle()` 인스턴스에 스키마 전체 전달
- `DATABASE_URL` 환경변수 사용
- export: `db` (Drizzle 인스턴스), `sql` (postgres 클라이언트 — raw SQL용)

**참조**: M2 스펙 섹션 2.3

#### 11. `drizzle.config.ts`

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**참조**: M2 스펙 섹션 10.1 R1-2

## 반복마다 실행할 검증

```bash
# 1. TypeScript 컴파일 확인
pnpm tsc --noEmit

# 2. any 타입 검사
grep -rn ': any' src/db/ --include="*.ts" | grep -v 'node_modules' | grep -v '.d.ts'
# 결과: 0건이어야 함

# 3. PII 컬럼 검사
grep -in 'income\|salary\|cash\|personal_id\|phone\|email\|resident_number\|ssn' src/db/schema/*.ts | grep -v '//' | grep -v 'import'
# 결과: 0건이어야 함
```

## 완료 조건

- [ ] 11개 파일 모두 생성됨
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `any` 타입 0건
- [ ] PII 컬럼 0건
- [ ] 모든 스키마가 `db/schema.sql` DDL과 1:1 매핑
- [ ] `bash scripts/m2-gate-check.sh 1` PASSED

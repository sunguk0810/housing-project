---
plan-id: "2026-02-16_claude-code_m2-orm-refactor"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "refactor"
depends-on:
  - plan-id: "2026-02-15_claude-code_m2-implementation-spec"
    condition: "status == done"
---

# M2 Raw SQL -> Drizzle ORM Query Builder 전환 설계

## 목표

M2 구현에서 사용된 Raw SQL 쿼리(`db.execute(sqlTag`...`)`) 중 ORM 전환이 가능한 3개를 Drizzle Query Builder로 전환하고, PostGIS 함수가 부분적으로 필요한 2개는 ORM + `sql` 함수 혼합 패턴으로 전환하는 설계서를 작성한다.

추가로 `RecommendationItem` 타입에 `lat`/`lng` 필드를 추가하여 M3 KakaoMap 마커 렌더링을 준비한다.

**SoT 참조**: PHASE1 S2(스키마), PHASE2_build.md(마일스톤 정의)

## 범위

- **수정 대상 SoT**: 없음 (SoT 참조만 수행)
- **SoT 참조**: `docs/PHASE1_design.md` > S2(DB 스키마), `docs/PHASE2_build.md`(마일스톤)
- **선행 plan**: `2026-02-15_claude-code_m2-implementation-spec` (status == done, 충족)

### 전환 대상 분류

#### 전환 대상 (3개 - PostGIS 미사용, 완전 ORM 전환)

| # | 쿼리 | 파일 | 사유 |
|---|-------|------|------|
| 1 | 가격 이력 조회 | `src/app/api/apartments/[id]/route.ts` L76-86 | 단순 WHERE + ORDER BY, FK 관계 활용 |
| 2 | 치안 통계 조회 | `src/app/api/recommend/route.ts` L157-165 | 단순 SELECT + LIMIT 1 |
| 3 | 치안 통계 조회 | `src/app/api/apartments/[id]/route.ts` L97-108 | 단순 SELECT + LIMIT 1 |

#### 부분 전환 (2개 - ORM + sql 함수 혼합)

| # | 쿼리 | 파일 | 사유 |
|---|-------|------|------|
| 4 | 아파트 후보 조회 | `src/app/api/recommend/route.ts` L97-116 | JOIN은 ORM, ST_X/ST_Y는 sql 함수 |
| 5 | 아파트 기본 정보 | `src/app/api/apartments/[id]/route.ts` L43-57 | 기본 필드 ORM, 좌표 추출 sql 함수 |

#### 유지 (5개 - PostGIS 필수, Raw SQL 유지)

| # | 쿼리 | 파일 | 사유 |
|---|-------|------|------|
| 6 | findNearbyChildcare | `src/lib/engines/spatial.ts` L38-54 | ST_DWithin, ST_Distance |
| 7 | findNearbySchools | `src/lib/engines/spatial.ts` L70-87 | ST_DWithin, ST_Distance |
| 8 | findNearestGrid | `src/lib/engines/spatial.ts` L103-113 | KNN `<->` operator |
| 9 | 학교 평균 점수 조회 | `src/app/api/recommend/route.ts` L143-151 | ST_DWithin 공간 필터 |
| 10 | Health check | `src/app/api/health/route.ts` L18 | postgres.js 직접 사용 (`sql\`SELECT 1\``) |

#### 추가 작업

- `RecommendationItem`에 `lat`/`lng` 필드 추가 (M3 KakaoMap 마커 렌더링 필수)

## 작업 단계

### 단계 1: 전환 대상 3개 — 완전 ORM 전환

#### 1-1. 가격 이력 조회 (apartments/[id]/route.ts)

**Before (Raw SQL)**:
```typescript
// src/app/api/apartments/[id]/route.ts L76-86
const priceRows = await db.execute(sqlTag`
  SELECT
    trade_type AS "tradeType",
    year,
    month,
    average_price AS "averagePrice",
    deal_count AS "dealCount"
  FROM apartment_prices
  WHERE apt_id = ${aptId}
  ORDER BY year DESC, month DESC
`);
```

**After (Drizzle ORM)**:
```typescript
import { eq, desc } from "drizzle-orm";
import { apartmentPrices } from "@/db/schema";

const priceRows = await db
  .select({
    tradeType: apartmentPrices.tradeType,
    year: apartmentPrices.year,
    month: apartmentPrices.month,
    averagePrice: apartmentPrices.averagePrice,
    dealCount: apartmentPrices.dealCount,
  })
  .from(apartmentPrices)
  .where(eq(apartmentPrices.aptId, aptId))
  .orderBy(desc(apartmentPrices.year), desc(apartmentPrices.month));
```

**변경 효과**:
- `Record<string, unknown>` 캐스트 제거 -> Drizzle 타입 추론 활용
- 컬럼 alias 수동 지정 불필요 (스키마 정의의 camelCase 자동 사용)
- `priceRows[0].tradeType` 등 직접 접근 가능 (타입 안전)

**주의**: `apartmentPrices.averagePrice`는 `numeric` 타입이므로 Drizzle가 `string`으로 반환한다. 기존 코드의 `Number(r.averagePrice ?? 0)` 변환은 유지해야 한다.

#### 1-2. 치안 통계 조회 — recommend/route.ts

**Before (Raw SQL)**:
```typescript
// src/app/api/recommend/route.ts L157-165
const safetyRows = await db.execute(sqlTag`
  SELECT
    COALESCE(CAST(crime_rate AS REAL), 5) AS "crimeLevel",
    COALESCE(CAST(cctv_density AS REAL), 2) AS "cctvDensity",
    COALESCE(shelter_count, 3) AS "shelterCount",
    data_date AS "dataDate"
  FROM safety_stats
  LIMIT 1
`);
const safetyData = safetyRows[0] as Record<string, unknown> | undefined;
```

**After (Drizzle ORM)**:
```typescript
import { sql as sqlFn } from "drizzle-orm";
import { safetyStats } from "@/db/schema";

const safetyRows = await db
  .select({
    crimeLevel: sqlFn<number>`COALESCE(CAST(${safetyStats.crimeRate} AS REAL), 5)`,
    cctvDensity: sqlFn<number>`COALESCE(CAST(${safetyStats.cctvDensity} AS REAL), 2)`,
    shelterCount: sqlFn<number>`COALESCE(${safetyStats.shelterCount}, 3)`,
    dataDate: safetyStats.dataDate,
  })
  .from(safetyStats)
  .limit(1);

const safetyData = safetyRows[0]; // typed: { crimeLevel: number; cctvDensity: number; shelterCount: number; dataDate: string | null }
```

**변경 효과**:
- `as Record<string, unknown>` 캐스트 제거
- `sql<number>` 제네릭으로 COALESCE/CAST 결과 타입 명시
- `safetyData?.crimeLevel`이 `number` 타입으로 추론

#### 1-3. 치안 통계 조회 — apartments/[id]/route.ts

**Before (Raw SQL)**:
```typescript
// src/app/api/apartments/[id]/route.ts L97-108
const safetyRows = await db.execute(sqlTag`
  SELECT
    region_code AS "regionCode",
    region_name AS "regionName",
    calculated_score AS "calculatedScore",
    crime_rate AS "crimeRate",
    cctv_density AS "cctvDensity",
    shelter_count AS "shelterCount",
    data_date AS "dataDate"
  FROM safety_stats
  LIMIT 1
`);
```

**After (Drizzle ORM)**:
```typescript
import { safetyStats } from "@/db/schema";

const safetyRows = await db
  .select({
    regionCode: safetyStats.regionCode,
    regionName: safetyStats.regionName,
    calculatedScore: safetyStats.calculatedScore,
    crimeRate: safetyStats.crimeRate,
    cctvDensity: safetyStats.cctvDensity,
    shelterCount: safetyStats.shelterCount,
    dataDate: safetyStats.dataDate,
  })
  .from(safetyStats)
  .limit(1);
```

**변경 효과**:
- 완전 타입 안전 (`regionCode: string`, `shelterCount: number | null` 등)
- `as Record<string, unknown>` 캐스트 제거
- 기존 IIFE 패턴(`(() => { ... })()`)의 `Number()` / `String()` 변환 다수 제거 가능

**주의**: `calculatedScore`, `crimeRate`, `cctvDensity`는 `numeric` 타입이므로 Drizzle가 `string | null`로 반환한다. `SafetyDetail` 인터페이스의 `number | null` 타입에 맞추려면 `Number()` 변환은 유지해야 한다.

---

### 단계 2: 부분 전환 2개 — ORM + sql 함수 혼합

#### 2-1. 아파트 후보 조회 (recommend/route.ts)

**Before (Raw SQL)**:
```typescript
// src/app/api/recommend/route.ts L97-116
const candidateRows = await db.execute(sqlTag`
  SELECT
    a.id,
    a.apt_code AS "aptCode",
    a.apt_name AS "aptName",
    a.address,
    ST_X(a.location::geometry) AS longitude,
    ST_Y(a.location::geometry) AS latitude,
    a.built_year AS "builtYear",
    p.average_price AS "averagePrice",
    p.deal_count AS "dealCount",
    p.year AS "priceYear",
    p.month AS "priceMonth"
  FROM apartments a
  JOIN apartment_prices p ON a.id = p.apt_id
  WHERE p.trade_type = ${input.tradeType}
    AND CAST(p.average_price AS INTEGER) <= ${budget.maxPrice}
  ORDER BY p.average_price DESC
  LIMIT 50
`);
```

**After (Drizzle ORM + sql)**:
```typescript
import { eq, lte, desc, sql as sqlFn } from "drizzle-orm";
import { apartments, apartmentPrices } from "@/db/schema";

const candidateRows = await db
  .select({
    id: apartments.id,
    aptCode: apartments.aptCode,
    aptName: apartments.aptName,
    address: apartments.address,
    longitude: sqlFn<number>`ST_X(${apartments.location}::geometry)`,
    latitude: sqlFn<number>`ST_Y(${apartments.location}::geometry)`,
    builtYear: apartments.builtYear,
    averagePrice: apartmentPrices.averagePrice,
    dealCount: apartmentPrices.dealCount,
    priceYear: apartmentPrices.year,
    priceMonth: apartmentPrices.month,
  })
  .from(apartments)
  .innerJoin(apartmentPrices, eq(apartments.id, apartmentPrices.aptId))
  .where(
    and(
      eq(apartmentPrices.tradeType, input.tradeType),
      lte(sqlFn<number>`CAST(${apartmentPrices.averagePrice} AS INTEGER)`, budget.maxPrice),
    )
  )
  .orderBy(desc(apartmentPrices.averagePrice))
  .limit(50);
```

**변경 효과**:
- JOIN 관계가 ORM 메서드로 명시적 표현 (`innerJoin`)
- `Record<string, unknown>` 캐스트 제거 -> `candidateRows[0].aptName`이 `string` 타입
- ST_X/ST_Y는 PostGIS 함수이므로 `sql<number>` 템플릿으로 유지
- `and()` 함수로 복합 조건 표현

**추가 import**: `and` (drizzle-orm)

#### 2-2. 아파트 기본 정보 (apartments/[id]/route.ts)

**Before (Raw SQL)**:
```typescript
// src/app/api/apartments/[id]/route.ts L43-57
const aptRows = await db.execute(sqlTag`
  SELECT
    id,
    apt_code AS "aptCode",
    apt_name AS "aptName",
    address,
    built_year AS "builtYear",
    household_count AS "householdCount",
    area_min AS "areaMin",
    area_max AS "areaMax",
    ST_X(location::geometry) AS longitude,
    ST_Y(location::geometry) AS latitude
  FROM apartments
  WHERE id = ${aptId}
`);
```

**After (Drizzle ORM + sql)**:
```typescript
import { eq, sql as sqlFn } from "drizzle-orm";
import { apartments } from "@/db/schema";

const aptRows = await db
  .select({
    id: apartments.id,
    aptCode: apartments.aptCode,
    aptName: apartments.aptName,
    address: apartments.address,
    builtYear: apartments.builtYear,
    householdCount: apartments.householdCount,
    areaMin: apartments.areaMin,
    areaMax: apartments.areaMax,
    longitude: sqlFn<number>`ST_X(${apartments.location}::geometry)`,
    latitude: sqlFn<number>`ST_Y(${apartments.location}::geometry)`,
  })
  .from(apartments)
  .where(eq(apartments.id, aptId));
```

**변경 효과**:
- 8개 기본 필드가 스키마 타입으로 추론 (`aptName: string`, `builtYear: number | null` 등)
- `as Record<string, unknown>` 캐스트 제거
- `Number(apt.builtYear)` 등 변환 코드 다수 불필요
- 좌표만 `sql<number>` 유지

---

### 단계 3: RecommendationItem lat/lng 타입 추가

**Before**:
```typescript
// src/types/api.ts L40-55
export interface RecommendationItem {
  readonly rank: number;
  readonly aptId: number;
  readonly aptName: string;
  readonly address: string;
  readonly monthlyCost: number;
  readonly commuteTime1: number;
  readonly commuteTime2: number | null;
  readonly childcareCount: number;
  readonly schoolScore: number;
  readonly safetyScore: number;
  readonly finalScore: number;
  readonly reason: string;
  readonly whyNot: string | null;
  readonly sources: SourceInfo;
}
```

**After**:
```typescript
export interface RecommendationItem {
  readonly rank: number;
  readonly aptId: number;
  readonly aptName: string;
  readonly address: string;
  readonly lat: number;     // M3 KakaoMap marker latitude
  readonly lng: number;     // M3 KakaoMap marker longitude
  readonly monthlyCost: number;
  readonly commuteTime1: number;
  readonly commuteTime2: number | null;
  readonly childcareCount: number;
  readonly schoolScore: number;
  readonly safetyScore: number;
  readonly finalScore: number;
  readonly reason: string;
  readonly whyNot: string | null;
  readonly sources: SourceInfo;
}
```

**recommend/route.ts 응답 매핑 변경**:
```typescript
// src/app/api/recommend/route.ts L213-239 영역 수정
scoredCandidates.push({
  score: result.finalScore,
  item: {
    rank: 0,
    aptId,
    aptName: String(row.aptName ?? ""),
    address: String(row.address ?? ""),
    lat: aptLat,   // added
    lng: aptLon,   // added
    monthlyCost: Math.round(monthlyCost),
    // ... (rest unchanged)
  },
});
```

---

### 단계 4: Import 정리 및 코드 정리

각 파일에서 변경이 필요한 import 목록:

**`src/app/api/apartments/[id]/route.ts`**:
```typescript
// 제거
import { sql as sqlTag } from "drizzle-orm";

// 추가
import { eq, desc, sql as sqlFn } from "drizzle-orm";
import { apartments, apartmentPrices, safetyStats } from "@/db/schema";
```

**`src/app/api/recommend/route.ts`**:
```typescript
// 제거
import { sql as sqlTag } from "drizzle-orm";

// 추가
import { eq, lte, desc, and, sql as sqlFn } from "drizzle-orm";
import { apartments, apartmentPrices, safetyStats } from "@/db/schema";
```

> **Note**: `sqlTag`은 spatial.ts 및 학교 쿼리(ST_DWithin)에서 여전히 사용되므로, recommend/route.ts에서는 `sqlFn`으로 rename하여 두 용도를 구분한다. 실제로 `sql`은 같은 함수이므로 하나로 통합해도 된다.

---

### 단계 5: 테스트 검증

1. **타입 체크**: `pnpm tsc --noEmit` 통과 확인
2. **빌드**: `pnpm build` 성공 확인
3. **단위 테스트**: `pnpm vitest run` 전체 통과 확인
4. **수동 검증** (선택):
   - `/api/apartments/1` 응답 구조 동일 확인
   - `/api/recommend` POST 응답에 `lat`/`lng` 필드 포함 확인

## 검증 기준

| # | 기준 | 통과 조건 |
|---|------|-----------|
| V1 | 전환 3개 쿼리의 Drizzle 코드 구체 작성 | Before/After 코드 쌍 3개 존재, `db.select().from()` 패턴 사용 |
| V2 | 부분 전환 2개의 혼합 패턴 코드 작성 | Before/After 코드 쌍 2개 존재, `sql<number>` + `innerJoin` 패턴 사용 |
| V3 | RecommendationItem lat/lng 타입 추가 코드 | `lat: number`, `lng: number` readonly 필드 추가 + 응답 매핑 코드 |
| V4 | pnpm tsc --noEmit 통과 | 구현 후 타입 에러 0건 |
| V5 | pnpm build 통과 | 빌드 성공 (exit code 0) |
| V6 | pnpm vitest run 통과 | 기존 테스트 전체 통과 |

## 결과/결정

**상태**: `done`

### 검증 결과

| # | 기준 | 결과 |
|---|------|------|
| V1 | 전환 3개 쿼리의 Drizzle 코드 | 완료 — 가격이력, 치안통계(detail/recommend) 모두 `db.select().from()` 패턴 전환 |
| V2 | 부분 전환 2개의 혼합 패턴 | 완료 — 아파트 기본정보, 후보조회 모두 `sql<number>` + `innerJoin` 패턴 사용 |
| V3 | RecommendationItem lat/lng | 완료 — `readonly lat: number`, `readonly lng: number` 추가 + 응답 매핑 반영 |
| V4 | `pnpm tsc --noEmit` | 통과 — 타입 에러 0건 |
| V5 | `pnpm build` | 통과 — Next.js 빌드 성공 |
| V6 | `pnpm vitest run` | 통과 — 62 tests, 7 test files 전부 통과 |

### 핵심 설계 결정 사항

1. **전환 기준**: PostGIS 함수(ST_DWithin, ST_Distance, `<->` KNN) 사용 여부로 전환/유지를 구분
2. **혼합 패턴**: `sql<T>` 제네릭 템플릿으로 PostGIS 함수를 ORM select 내부에 삽입
3. **numeric 타입 주의**: Drizzle는 PostgreSQL `numeric`을 `string`으로 반환하므로, `Number()` 변환 로직은 유지
4. **geometry 커스텀 타입**: `geometryPoint`의 `fromDriver`는 EWKB hex를 파싱하지만, `select()`에서 `sql<number>` ST_X/ST_Y를 직접 사용하면 파싱 불필요
5. **lat/lng 추가**: `RecommendationItem`에 좌표 필드를 추가하여 M3 KakaoMap 마커 렌더링 대비
6. **sqlTag → sql**: alias 제거, `sql` 하나로 통합 (ORM select 내부 + db.execute 모두 동일 함수)
7. **테스트 mock**: `createSelectChain` 헬퍼로 Drizzle 체이너블 패턴 mock 구현

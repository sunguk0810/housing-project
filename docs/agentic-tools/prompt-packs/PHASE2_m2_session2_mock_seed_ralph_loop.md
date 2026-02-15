# M2 Session 2: Mock 데이터 + Seed Ralph Loop

## Session Metadata

- **Phase**: Session 2 / 5
- **Max Iterations**: 5
- **Completion Promise**: "Phase 2 complete: npx tsx src/db/seed.ts exits 0 and logs 755 records inserted"
- **Gate**: `npx tsx src/db/seed.ts` exit 0
- **선행 조건**: Session 1 Gate PASSED (`pnpm tsc --noEmit` with 11 DB+ORM files)
- **SoT 참조**: `docs/plan/2026-02-15_claude-code_m2-implementation-spec.md` 섹션 3

---

## 목표

M2 스펙 섹션 3을 기반으로 Mock 데이터 생성기 7파일 + Seed 실행 스크립트 1파일, 총 8개 파일을 구현한다. 고정 시드 PRNG(mulberry32, seed 42)를 사용하여 재현 가능한 755건의 Mock 데이터를 생성한다.

## 중요 규칙 (모든 반복에서 준수)

1. **`Math.random()` 사용 절대 금지** — 반드시 `createRng(42)` 사용
2. **TypeScript strict 모드**: `any` 타입 절대 금지
3. **import 별칭**: `@/*` 사용
4. **데이터 정합성**: 스키마 컬럼 타입/제약조건과 100% 일치해야 함
5. **서울 25구 데이터만 사용**: 좌표 범위 (126.764~127.184, 37.413~37.715)

## 대상 파일 (8개)

### 구현 순서

```
1. src/db/mock/constants.ts           — 공통 상수 + PRNG
2. src/db/mock/apartments.ts          — 아파트 50건
3. src/db/mock/prices.ts              — 실거래가 300건
4. src/db/mock/childcare.ts           — 어린이집 200건
5. src/db/mock/schools.ts             — 학교 80건
6. src/db/mock/safety.ts              — 안전통계 25건 (서울 25구)
7. src/db/mock/commute.ts             — 통근그리드 100건
8. src/db/seed.ts                     — Seed 실행 스크립트
```

### 파일별 상세 스펙

#### 1. `src/db/mock/constants.ts`

**필수 export:**

```typescript
// PRNG (mulberry32 알고리즘, 시드 42)
export function createRng(seed: number): () => number;

// 서울 25구 목록
export const SEOUL_DISTRICTS: string[];  // ["강남구", "강동구", ..., "중랑구"]

// 좌표 범위
export const COORD_BOUNDS: {
  lng: { min: number; max: number };  // 126.764 ~ 127.184
  lat: { min: number; max: number };  // 37.413 ~ 37.715
};

// 구별 좌표 중심점 (25개)
export const DISTRICT_CENTERS: Record<string, { x: number; y: number }>;

// 랜덤 헬퍼 (PRNG 기반)
export function randomInt(rng: () => number, min: number, max: number): number;
export function randomFloat(rng: () => number, min: number, max: number, decimals?: number): number;
export function randomPick<T>(rng: () => number, arr: T[]): T;
```

**mulberry32 구현:**
```typescript
function createRng(seed: number): () => number {
  let t = seed + 0x6D2B79F5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

#### 2. `src/db/mock/apartments.ts`

- **건수**: 50건
- **분포**: 서울 25구에 걸쳐 분포 (구당 2건)
- **필드**: name, address, district, dong, built_year(1990~2024), total_units(100~3000), floor_area_py(15~60), location(구 중심 좌표 ± 산포)
- **export**: `mockApartments: Array<typeof apartments.$inferInsert>`
- **PRNG**: `const rng = createRng(42);`

#### 3. `src/db/mock/prices.ts`

- **건수**: 300건 (아파트 50건 × 6건 평균)
- **필드**: apt_id(1~50), trade_type('매매'|'전세'), year(2022~2024), month(1~12), average_price(30000~200000만원), min_price, max_price, trade_count
- **매매/전세 비율**: 매매 60%, 전세 40%
- **export**: `mockPrices: Array<typeof apartmentPrices.$inferInsert>`
- **PRNG**: `const rng = createRng(43);` (다른 시드)

#### 4. `src/db/mock/childcare.ts`

- **건수**: 200건
- **필드**: name, type('국공립'|'민간'|'가정'|'직장'), capacity(20~200), address, district, location, evaluation_grade('A'|'B'|'C'|'D')
- **분포**: 국공립 30%, 민간 40%, 가정 20%, 직장 10%
- **export**: `mockChildcare: Array<typeof childcareCenters.$inferInsert>`
- **PRNG**: `const rng = createRng(44);`

#### 5. `src/db/mock/schools.ts`

- **건수**: 80건
- **필드**: name, level('초등'|'중등'|'고등'), district, address, location, student_count(200~2000), teacher_count(20~150), achievement_score(50~100)
- **분포**: 초등 40건, 중등 25건, 고등 15건
- **assignment_area**: null (Polygon Mock 생성 복잡도 회피)
- **export**: `mockSchools: Array<typeof schools.$inferInsert>`
- **PRNG**: `const rng = createRng(45);`

#### 6. `src/db/mock/safety.ts`

- **건수**: 25건 (서울 25구 × 1)
- **필드**: region_code(구 코드), region_name(구명), crime_rate(50~300), cctv_density(10~100), fire_incidents(50~500), shelter_count(10~100), source_year(2024)
- **export**: `mockSafety: Array<typeof safetyStats.$inferInsert>`
- **PRNG**: `const rng = createRng(46);`

#### 7. `src/db/mock/commute.ts`

- **건수**: 100건
- **필드**: grid_id(GRID-0001~), center_location, dest_name('강남역'|'시청역'|'여의도'), dest_location, duration_minutes(15~90), transfer_count(0~3), transport_type('대중교통')
- **그리드**: 서울 좌표 범위를 10×10 격자로 분할, 각 격자 중심 기준
- **export**: `mockCommute: Array<typeof commuteGrid.$inferInsert>`
- **PRNG**: `const rng = createRng(47);`

#### 8. `src/db/seed.ts`

Mock 데이터를 DB에 적재하는 실행 스크립트. `npx tsx src/db/seed.ts`로 실행.

**흐름:**
1. DB 연결 (connection.ts)
2. 기존 데이터 삭제 (역순: commute → safety → schools → childcare → prices → apartments)
3. Mock 데이터 INSERT (순서: apartments → prices → childcare → schools → safety → commute)
4. 적재 결과 로그 (`"755 records inserted"` 포함)
5. DB 연결 종료

**필수 사항:**
- 트랜잭션 사용 (`db.transaction()`)
- 에러 발생 시 롤백 + process.exit(1)
- 성공 시 process.exit(0)
- 적재 건수 출력: `console.log("Seed complete: 755 records inserted")`

## 건수 검증 테이블

| 테이블 | Mock 건수 | 합계 |
|--------|----------|------|
| apartments | 50 | 50 |
| apartment_prices | 300 | 350 |
| childcare_centers | 200 | 550 |
| schools | 80 | 630 |
| safety_stats | 25 | 655 |
| commute_grid | 100 | **755** |

## 반복마다 실행할 검증

```bash
# 1. TypeScript 컴파일 확인
pnpm tsc --noEmit

# 2. Seed 실행 테스트 (Docker 실행 중일 때)
npx tsx src/db/seed.ts
# 기대: "755 records inserted" 출력 + exit 0

# 3. DB 건수 확인
docker compose exec -T postgres psql -U housing -d housing -t -c "
  SELECT 'apartments:' || count(*) FROM apartments
  UNION ALL SELECT 'prices:' || count(*) FROM apartment_prices
  UNION ALL SELECT 'childcare:' || count(*) FROM childcare_centers
  UNION ALL SELECT 'schools:' || count(*) FROM schools
  UNION ALL SELECT 'safety:' || count(*) FROM safety_stats
  UNION ALL SELECT 'commute:' || count(*) FROM commute_grid;"

# 4. any 타입 검사
grep -rn ': any' src/db/mock/ src/db/seed.ts --include="*.ts" | grep -v '.d.ts'
```

## 완료 조건

- [ ] 8개 파일 모두 생성됨
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `npx tsx src/db/seed.ts` exit 0
- [ ] 총 755건 적재 확인
- [ ] `any` 타입 0건
- [ ] `Math.random()` 사용 0건
- [ ] `bash scripts/m2-gate-check.sh 2` PASSED

# M2 Session 4: ETL + Validators + API Routes Ralph Loop

## Session Metadata

- **Phase**: Session 4 / 5
- **Max Iterations**: 6
- **Completion Promise**: "Phase 4 complete: pnpm build passes and all 3 API routes compile"
- **Gate**: `pnpm build` pass
- **선행 조건**: Session 3 Gate PASSED (`pnpm tsc --noEmit` with all engine modules)
- **SoT 참조**: `docs/plan/2026-02-15_claude-code_m2-implementation-spec.md` 섹션 4, 6, 7

---

## 목표

M2 스펙 섹션 4(ETL), 섹션 6(API), 섹션 7(타입)을 기반으로 ETL 어댑터 7파일 + Validators 3파일 + 타입 3파일 + API Routes 3파일, 총 16개 파일을 구현한다.

## 중요 규칙 (모든 반복에서 준수)

1. **TypeScript strict 모드**: `any` 타입 절대 금지
2. **금지 문구**: "추천" 단독 사용 금지, "대출 가능 보장" 등 금지
3. **PII 비저장**: API 응답/로그에 사용자 재무정보 저장 금지
4. **ETL Mock 우선**: `USE_MOCK_DATA=true`일 때 Mock 데이터 사용, 크롤링 코드 금지
5. **import 별칭**: `@/*` 사용
6. **Zod v3**: `zod@^3` 사용 (v4 아님)

## 대상 파일 (16개)

### 구현 순서

```
Phase A: Types (3)
1. src/types/api.ts                       — API 요청/응답 타입
2. src/types/db.ts                        — DB 엔티티 파생 타입
3. src/types/index.ts                     — 타입 barrel export

Phase B: Validators (3)
4. src/lib/validators/recommend.ts        — POST /api/recommend Zod 스키마
5. src/lib/validators/apartment.ts        — GET /api/apartments/:id 파라미터 검증
6. src/lib/validators/index.ts            — 검증 barrel export

Phase C: ETL (7)
7. src/etl/types.ts                       — ETL 공통 타입
8. src/etl/adapters/molit.ts              — 국토교통부 실거래가
9. src/etl/adapters/mohw.ts               — 사회보장정보원 어린이집
10. src/etl/adapters/moe.ts               — 교육부 학교알리미
11. src/etl/adapters/mois.ts              — 행정안전부 재난안전
12. src/etl/adapters/kakao-geocoding.ts   — 카카오 지오코딩
13. src/etl/runner.ts                     — ETL 러너

Phase D: API Routes (3)
14. src/app/api/health/route.ts           — GET /api/health
15. src/app/api/apartments/[id]/route.ts  — GET /api/apartments/:id
16. src/app/api/recommend/route.ts        — POST /api/recommend
```

### 파일별 상세 스펙

#### Phase A: Types

##### 1. `src/types/api.ts`

```typescript
import type { ScoreResult, BudgetResult, WeightProfile } from './engine';

export interface RecommendRequest {
  annualIncome: number;
  savings: number;
  loanType: 'general' | 'special';
  workplace: {
    name: string;
    location: { lng: number; lat: number };
  };
  weightProfile: WeightProfile;
  maxResults?: number;  // default 10
}

export interface RecommendResponse {
  results: Array<{
    apartment: ApartmentSummary;
    score: ScoreResult;
    budget: BudgetResult;
  }>;
  meta: {
    totalCandidates: number;
    analysisDate: string;    // ISO 날짜
    dataSourceDate: string;  // 데이터 기준일
    disclaimer: string;      // 법적 고지문
  };
}

export interface ApartmentSummary {
  id: number;
  name: string;
  address: string;
  district: string;
  builtYear: number;
  floorAreaPy: number;
  latestPrice: number | null;  // 만원
}

export interface ApartmentDetailResponse {
  apartment: ApartmentDetail;
  prices: PriceHistory[];
  nearby: NearbyFacilities;
  safety: SafetyInfo | null;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  db: boolean;
  redis: boolean;
  timestamp: string;
}
```

##### 2. `src/types/db.ts`

```typescript
import type { InferSelectModel } from 'drizzle-orm';
import type {
  apartments, apartmentPrices, childcareCenters,
  schools, safetyStats, commuteGrid
} from '@/db/schema';

export type Apartment = InferSelectModel<typeof apartments>;
export type ApartmentPrice = InferSelectModel<typeof apartmentPrices>;
export type ChildcareCenter = InferSelectModel<typeof childcareCenters>;
export type School = InferSelectModel<typeof schools>;
export type SafetyStat = InferSelectModel<typeof safetyStats>;
export type CommuteGridRow = InferSelectModel<typeof commuteGrid>;
```

##### 3. `src/types/index.ts`

barrel export: `api.ts`, `db.ts`, `engine.ts` 모두 re-export

#### Phase B: Validators

##### 4. `src/lib/validators/recommend.ts`

Zod v3 스키마로 `RecommendRequest`를 검증한다.

**검증 규칙:**
- `annualIncome`: `z.number().int().min(0).max(1_000_000)` (연소득 0~100억)
- `savings`: `z.number().int().min(0).max(500_000)` (자기자본 0~50억)
- `loanType`: `z.enum(['general', 'special'])`
- `workplace.name`: `z.string().min(1).max(100)`
- `workplace.location.lng`: `z.number().min(124).max(132)` (대한민국 경도 범위)
- `workplace.location.lat`: `z.number().min(33).max(43)` (대한민국 위도 범위)
- `weightProfile`: `z.enum(['balanced', 'budget_focused', 'commute_focused'])`
- `maxResults`: `z.number().int().min(1).max(50).default(10)`

**export**: `recommendRequestSchema`, `validateRecommendRequest(data: unknown)`

##### 5. `src/lib/validators/apartment.ts`

`/api/apartments/:id` 경로 파라미터 검증.

- `id`: `z.coerce.number().int().positive()`

**export**: `apartmentIdSchema`, `validateApartmentId(id: string)`

##### 6. `src/lib/validators/index.ts`

barrel export

#### Phase C: ETL

##### 7. `src/etl/types.ts`

```typescript
export interface EtlAdapterConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  useMock: boolean;  // USE_MOCK_DATA 환경변수
}

export interface EtlResult<T> {
  success: boolean;
  data: T[];
  count: number;
  source: 'mock' | 'api';
  errors: string[];
}

export interface EtlAdapter<T> {
  name: string;
  fetch(config: EtlAdapterConfig): Promise<EtlResult<T>>;
}
```

##### 8~12. `src/etl/adapters/molit.ts`, `mohw.ts`, `moe.ts`, `mois.ts`, `kakao-geocoding.ts`

각 어댑터는 `EtlAdapter<T>` 인터페이스를 구현한다.

**공통 패턴:**
1. `useMock=true` → Mock 데이터에서 반환 (크롤링 금지)
2. `useMock=false` → 실제 API 호출 (Zod로 응답 검증)
3. API 키 미설정 시 에러 반환
4. 타임아웃: 10초

**각 어댑터별:**
- **molit**: 국토교통부 실거래가 API → `ApartmentPrice[]` 변환
- **mohw**: 사회보장정보원 어린이집 API → `ChildcareCenter[]` 변환
- **moe**: 교육부 학교알리미 API → `School[]` 변환
- **mois**: 행정안전부 재난안전 API → `SafetyStat[]` 변환
- **kakao-geocoding**: 카카오 지오코딩 API → `{ x: number; y: number }` 변환

##### 13. `src/etl/runner.ts`

ETL 러너: 5개 어댑터를 순차 실행하고 결과를 DB에 적재한다.

**흐름:**
1. 환경변수에서 `USE_MOCK_DATA` 확인
2. 어댑터 순차 실행 (molit → mohw → moe → mois → kakao)
3. 각 어댑터 결과를 DB INSERT (Drizzle 사용)
4. 전체 결과 로깅

**export**: `runEtl(): Promise<{ total: number; errors: string[] }>`

#### Phase D: API Routes

##### 14. `src/app/api/health/route.ts`

```
GET /api/health
Response: { status: 'ok'|'degraded', db: boolean, redis: boolean, timestamp: string }
```

- DB 연결 확인: `SELECT 1` 실행
- Redis 연결 확인: `PING` 실행
- 둘 다 성공: `status: 'ok'`, 하나라도 실패: `status: 'degraded'`

##### 15. `src/app/api/apartments/[id]/route.ts`

```
GET /api/apartments/:id
Response: ApartmentDetailResponse
```

- 파라미터 검증: `validateApartmentId(params.id)`
- DB 조회: 아파트 정보 + 가격 이력 + 주변 시설 + 안전 정보
- 404: 존재하지 않는 ID

##### 16. `src/app/api/recommend/route.ts`

```
POST /api/recommend
Body: RecommendRequest
Response: RecommendResponse
```

**10단계 파이프라인 (M2 스펙 섹션 1.3):**
1. 요청 수신 + 로깅 (`logRequest`)
2. Zod 검증 (`validateRecommendRequest`)
3. 예산 계산 (`calculateBudget`)
4. 공간 쿼리 → 후보 아파트 필터링
5. 통근시간 계산 (`calculateCommute`)
6. 주변 시설 조회 (`findNearbyChildcare`, `findNearbySchools`)
7. 치안 데이터 조회
8. 스코어링 (`calculateScore`)
9. 정렬 + 상위 N건 선택
10. 응답 구성 (disclaimer + 데이터 기준일 포함)

**응답 필수 필드:**
- `meta.disclaimer`: "본 분석 결과는 참고용이며, 실제 부동산 거래 시 전문가 상담을 권장합니다."
- `meta.dataSourceDate`: 데이터 기준일
- `meta.analysisDate`: 분석 실행일

**에러 응답:**
- 400: Zod 검증 실패
- 500: 서버 에러 (PII 마스킹 적용)

## 반복마다 실행할 검증

```bash
# 1. TypeScript 컴파일 확인
pnpm tsc --noEmit

# 2. Next.js 빌드 확인
pnpm build

# 3. any 타입 검사
grep -rn ': any' src/types/ src/lib/validators/ src/etl/ src/app/api/ --include="*.ts" --include="*.tsx" | grep -v '.d.ts'

# 4. 금지 문구 검사
grep -rn '추천' src/app/api/ src/lib/validators/ --include="*.ts" | grep -v '분석 결과' | grep -v '근거' | grep -v '출처' | grep -v '//' | grep -v 'import' | grep -v 'recommend'

# 5. PII 비저장 확인
grep -rn 'annualIncome\|savings\|personalId' src/app/api/ --include="*.ts" | grep -v 'import' | grep -v 'type' | grep -v 'interface' | grep -v 'validator' | grep -v '//'
```

## 완료 조건

- [ ] 16개 파일 모두 생성됨
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `pnpm build` 통과
- [ ] `any` 타입 0건
- [ ] 금지 문구 0건
- [ ] PII 비저장 원칙 준수
- [ ] 3개 API 엔드포인트 정상 컴파일
- [ ] `bash scripts/m2-gate-check.sh 4` PASSED

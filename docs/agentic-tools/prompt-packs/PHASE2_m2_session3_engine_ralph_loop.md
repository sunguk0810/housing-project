# M2 Session 3: 엔진 모듈 Ralph Loop

## Session Metadata

- **Phase**: Session 3 / 5
- **Max Iterations**: 6
- **Completion Promise**: "Phase 3 complete: pnpm tsc --noEmit passes with all engine modules"
- **Gate**: `pnpm tsc --noEmit` pass + 금지 문구 0건
- **선행 조건**: Session 2 Gate PASSED (`npx tsx src/db/seed.ts` exit 0)
- **SoT 참조**: `docs/plan/2026-02-15_claude-code_m2-implementation-spec.md` 섹션 5, 6.5, 7.3, 10.2

---

## 목표

M2 스펙 섹션 5를 기반으로 4개 엔진 모듈(budget, scoring, commute, spatial) + 유틸리티(redis, logger, normalize, types, barrel), 총 9개 파일을 구현한다. 스코어링 공식은 PHASE1 S4와 100% 일치해야 한다.

## 중요 규칙 (모든 반복에서 준수)

1. **TypeScript strict 모드**: `any` 타입 절대 금지
2. **금지 문구**: "추천" 단독 사용 금지 → "분석 결과", "안내"로 대체
3. **스코어링 공식**: PHASE1 S4 5차원 정규화 수학 공식 100% 일치 필수
4. **Redis graceful degradation**: `REDIS_URL` 미설정 시 `null` 반환
5. **PII 마스킹**: 로거에서 개인정보 마스킹 필수
6. **import 별칭**: `@/*` 사용

## 대상 파일 (9개)

### 구현 순서

```
1. src/types/engine.ts                — 엔진 입출력 타입 정의
2. src/lib/redis.ts                   — ioredis 클라이언트 싱글톤
3. src/lib/logger.ts                  — PII 마스킹 로거
4. src/lib/engines/normalize.ts       — 정규화 유틸 (clamp, toRad, haversine)
5. src/lib/engines/budget.ts          — LTV/DTI 예산 계산기
6. src/lib/engines/spatial.ts         — PostGIS 공간 쿼리 헬퍼
7. src/lib/engines/commute.ts         — 4단계 통근시간 모듈
8. src/lib/engines/scoring.ts         — 5차원 스코어링 엔진
9. src/lib/engines/index.ts           — barrel export
```

### 파일별 상세 스펙

#### 1. `src/types/engine.ts`

엔진 모듈의 입출력 TypeScript 타입을 정의한다.

**필수 타입:**

```typescript
// 예산 계산 입출력
export interface BudgetInput {
  annualIncome: number;   // 연소득 (만원)
  savings: number;        // 자기자본 (만원)
  loanType: 'general' | 'special';  // 대출 유형
}

export interface BudgetResult {
  maxLoanAmount: number;  // 최대 대출 가능액 (만원)
  maxBudget: number;      // 최대 예산 (자기자본 + 대출)
  ltvRatio: number;       // LTV 비율
  dtiRatio: number;       // DTI 비율
  monthlyPayment: number; // 월 상환액 (만원)
}

// 통근시간 입출력
export interface CommuteInput {
  origin: { x: number; y: number };       // 출발지 (경도, 위도)
  destinations: Array<{
    name: string;
    location: { x: number; y: number };
  }>;
}

export interface CommuteResult {
  destination: string;
  durationMinutes: number;
  transferCount: number;
  source: 'grid' | 'redis' | 'odsay' | 'mock';
}

// 스코어링 입출력
export type WeightProfile = 'balanced' | 'budget_focused' | 'commute_focused';

export interface ScoreInput {
  budget: BudgetResult;
  commute: CommuteResult[];
  apartmentId: number;
  weightProfile: WeightProfile;
}

export interface DimensionScore {
  budget: number;       // 0~100
  commute: number;      // 0~100
  childcare: number;    // 0~100
  safety: number;       // 0~100
  school: number;       // 0~100
}

export interface ScoreResult {
  totalScore: number;          // 0~100
  dimensions: DimensionScore;
  rank: number;
  reasons: string[];           // 분석 근거 (출처 포함)
  dataSourceDate: string;      // 데이터 기준일
}

// 가중치 프로필
export const WEIGHT_PROFILES: Record<WeightProfile, DimensionScore> = {
  balanced: { budget: 25, commute: 25, childcare: 20, safety: 15, school: 15 },
  budget_focused: { budget: 40, commute: 20, childcare: 15, safety: 15, school: 10 },
  commute_focused: { budget: 20, commute: 40, childcare: 15, safety: 15, school: 10 },
};
```

#### 2. `src/lib/redis.ts`

ioredis 싱글톤 클라이언트. Graceful degradation 구현.

**필수 사항:**
- `REDIS_URL` 미설정 시 `null` 반환 (에러 아님)
- `maxRetriesPerRequest: 1`, `connectTimeout: 2000`, `lazyConnect: true`
- 에러 이벤트에서 `redisClient = null` 처리
- export: `getRedis(): Redis | null`

**참조**: M2 스펙 섹션 10.2 R2-4 코드 블록

#### 3. `src/lib/logger.ts`

PII 마스킹이 적용된 구조화 로거.

**필수 export:**
- `maskPii(text: string): string` — 전화번호, 이메일, 주민번호 패턴 마스킹
- `logRequest(method: string, path: string, body: unknown): void` — API 요청 로깅 (PII 마스킹 적용)
- `logError(error: unknown, context?: string): void` — 에러 로깅

**마스킹 패턴:**
- 전화번호: `010-XXXX-XXXX` → `010-****-****`
- 이메일: `user@domain.com` → `u***@domain.com`
- 주민번호: `123456-1234567` → `******-*******`

**참조**: M2 스펙 섹션 6.5

#### 4. `src/lib/engines/normalize.ts`

엔진 모듈 공통 유틸리티 함수.

**필수 export:**
- `clamp(value: number, min: number, max: number): number`
- `toRad(deg: number): number` — 도 → 라디안
- `haversine(a: { x: number; y: number }, b: { x: number; y: number }): number` — 두 좌표 간 거리 (km)
- `linearNormalize(value: number, min: number, max: number): number` — 0~100 선형 정규화
- `inverseNormalize(value: number, min: number, max: number): number` — 0~100 역정규화 (값이 낮을수록 점수 높음)

#### 5. `src/lib/engines/budget.ts`

LTV/DTI 기반 예산 계산 모듈.

**입력**: `BudgetInput`
**출력**: `BudgetResult`

**계산 공식 (PHASE1 S4 참조):**
- LTV 한도: 일반 70%, 특례 80%
- DTI 한도: 일반 40%, 특례 50%
- 최대 대출액 = min(자산가액 × LTV, 연소득 × DTI ÷ 연이율)
- 최대 예산 = 자기자본 + 최대 대출액
- 월 상환액 = 원리금균등상환 (금리 3.5%, 30년)

**export**: `calculateBudget(input: BudgetInput): BudgetResult`

#### 6. `src/lib/engines/spatial.ts`

PostGIS 공간 쿼리 헬퍼.

**필수 export:**
- `findNearbyChildcare(db, location, radiusMeters): Promise<ChildcareWithDistance[]>` — ST_DWithin 사용
- `findNearbySchools(db, location, radiusMeters): Promise<SchoolWithDistance[]>` — ST_DWithin 사용
- `findNearestGrid(db, location): Promise<CommuteGridRow | null>` — KNN `<->` 연산자

**참조**: M2 스펙 섹션 5.4

**중요**: 배치 쿼리 패턴 사용 (N+1 방지). `sql` 템플릿 사용하여 PostGIS 함수 호출.

#### 7. `src/lib/engines/commute.ts`

4단계 통근시간 조회 모듈.

**조회 순서:**
1. Grid DB (`findNearestGrid`) — 500m 이내 매칭
2. Redis cache — TTL 24시간, 키: `commute:{lat}:{lng}:{destination}`
3. ODsay API — `ODSAY_API_KEY` 설정 시 호출 (타임아웃 3초)
4. Mock fallback — `distance_km * 3 + 10` 추정

**export**: `calculateCommute(input: CommuteInput): Promise<CommuteResult[]>`

**참조**: M2 스펙 섹션 5.3, 10.2 R2-3

#### 8. `src/lib/engines/scoring.ts`

5차원 스코어링 엔진. **PHASE1 S4 공식과 100% 일치 필수.**

**5차원:**
1. **예산 적합도**: `100 - (apartmentPrice / maxBudget × 100)` → clamp(0, 100)
2. **통근 접근성**: `inverseNormalize(avgCommute, 15, 90)`
3. **보육 인프라**: `linearNormalize(childcareCount, 0, 10)` (반경 800m)
4. **치안 안전도**: `inverseNormalize(crimeRate, 50, 300)` + CCTV 보정
5. **학군 우수성**: `linearNormalize(achievementScore, 50, 100)` (반경 1km)

**가중 합산**: `totalScore = Σ(dimension_score × weight / 100)`

**export**: `calculateScore(input: ScoreInput, db): Promise<ScoreResult>`

**reason 생성 규칙:**
- "추천" 단독 사용 금지
- 출처 + 기준일 포함: `"[국토교통부 실거래가 2024년 기준] 예산 대비 ..."`
- 근거 있는 분석 결과만 기술

#### 9. `src/lib/engines/index.ts`

barrel export:
```typescript
export { calculateBudget } from './budget';
export { calculateCommute } from './commute';
export { calculateScore } from './scoring';
export { findNearbyChildcare, findNearbySchools, findNearestGrid } from './spatial';
export { clamp, toRad, haversine, linearNormalize, inverseNormalize } from './normalize';
```

## 반복마다 실행할 검증

```bash
# 1. TypeScript 컴파일 확인
pnpm tsc --noEmit

# 2. any 타입 검사
grep -rn ': any' src/types/engine.ts src/lib/redis.ts src/lib/logger.ts src/lib/engines/ --include="*.ts" | grep -v '.d.ts'

# 3. 금지 문구 검사
grep -rn '추천' src/lib/engines/ --include="*.ts" | grep -v '분석 결과' | grep -v '근거' | grep -v '출처' | grep -v '기준일' | grep -v '//' | grep -v 'import' | grep -v 'recommendations' | grep -v 'recommend'

# 4. Math.random 검사 (있으면 안됨)
grep -rn 'Math\.random' src/lib/ --include="*.ts"
```

## 완료 조건

- [ ] 9개 파일 모두 생성됨
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `any` 타입 0건
- [ ] 금지 문구 ("추천" 단독) 0건
- [ ] Redis graceful degradation 구현됨 (REDIS_URL 미설정 → null)
- [ ] PII 마스킹 패턴 3종 구현됨
- [ ] `bash scripts/m2-gate-check.sh 3` PASSED

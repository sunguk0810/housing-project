# M2 Session 5: 테스트 Ralph Loop

## Session Metadata

- **Phase**: Session 5 / 5 (Final M2 Gate)
- **Max Iterations**: 7
- **Completion Promise**: "Phase 5 complete: pnpm vitest run passes all unit and compliance tests"
- **Gate**: `pnpm vitest run` pass
- **선행 조건**: Session 4 Gate PASSED (`pnpm build` pass)
- **SoT 참조**: `docs/plan/2026-02-15_claude-code_m2-implementation-spec.md` 섹션 8

---

## 목표

M2 스펙 섹션 8을 기반으로 Vitest 설정 + 단위 테스트 5종 + 통합 테스트 1종 + 컴플라이언스 테스트 1종 + 벤치마크 1종, 총 9개 파일을 구현한다. 모든 테스트가 통과하고 M2 최종 게이트를 달성한다.

## 중요 규칙 (모든 반복에서 준수)

1. **단위 테스트**: 외부 의존성(DB, Redis, API) 전부 `vi.mock()` 처리
2. **통합 테스트**: `describe.skipIf(!process.env.DATABASE_URL)` 사용
3. **테스트 실패 시**: 소스 코드 수정 허용 (테스트가 스펙 기대값과 일치하도록)
4. **TypeScript strict**: 테스트 코드에서도 `any` 금지
5. **스코어링 기대값**: PHASE1 S4 공식 기반 수학적으로 정확한 값

## 대상 파일 (9개)

### 구현 순서

```
1. vitest.config.ts                          — Vitest 설정
2. tests/unit/budget.test.ts                 — 예산 계산기 테스트 (7 cases)
3. tests/unit/scoring.test.ts                — 스코어링 엔진 테스트 (23 cases)
4. tests/unit/commute.test.ts                — 통근시간 모듈 테스트 (5 cases)
5. tests/unit/spatial.test.ts                — 공간 쿼리 테스트 (3 cases)
6. tests/unit/validators.test.ts             — Zod 검증 테스트 (6 cases)
7. tests/integration/api.test.ts             — API 통합 테스트 (9 cases)
8. tests/compliance/compliance.test.ts       — 컴플라이언스 테스트
9. tests/bench/recommend.bench.ts            — 성능 벤치마크
```

### 파일별 상세 스펙

#### 1. `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/bench/**'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/engines/**', 'src/lib/validators/**'],
    },
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

#### 2. `tests/unit/budget.test.ts` (7 cases)

예산 계산기 `calculateBudget`에 대한 단위 테스트.

| ID | 테스트 | 입력 | 기대값 |
|----|--------|------|--------|
| B-1 | 일반 대출 기본 | income:5000, savings:10000, general | maxBudget 계산 정확 |
| B-2 | 특례 대출 한도 | income:5000, savings:10000, special | LTV 80%, DTI 50% 적용 |
| B-3 | 소득 0 | income:0, savings:5000, general | maxLoanAmount:0, maxBudget:5000 |
| B-4 | 자기자본 0 | income:5000, savings:0, general | maxBudget = maxLoanAmount |
| B-5 | 고소득 | income:30000, savings:50000, general | DTI 상한 적용 |
| B-6 | 월 상환액 | income:5000, savings:10000, general | monthlyPayment > 0, 합리적 범위 |
| B-7 | LTV/DTI 비율 범위 | any | 0 ≤ ltvRatio ≤ 1, 0 ≤ dtiRatio ≤ 1 |

**Mock**: 없음 (순수 계산 함수)

#### 3. `tests/unit/scoring.test.ts` (23 cases)

5차원 스코어링 엔진에 대한 포괄적 단위 테스트.

| 그룹 | ID | 테스트 |
|------|-----|--------|
| 정규화 | S-1 | linearNormalize(50, 0, 100) === 50 |
| | S-2 | linearNormalize(0, 0, 100) === 0 |
| | S-3 | linearNormalize(100, 0, 100) === 100 |
| | S-4 | inverseNormalize(50, 0, 100) === 50 |
| | S-5 | inverseNormalize(0, 0, 100) === 100 |
| | S-6 | clamp(-10, 0, 100) === 0 |
| 예산점수 | S-7 | 예산 내 아파트 → budget score > 70 |
| | S-8 | 예산 초과 아파트 → budget score < 30 |
| | S-9 | 정확히 예산 = 가격 → budget score = 0 |
| 통근점수 | S-10 | 통근 15분 → commute score = 100 |
| | S-11 | 통근 90분 → commute score = 0 |
| | S-12 | 통근 52.5분 → commute score ≈ 50 |
| 보육점수 | S-13 | 보육시설 0개 → childcare score = 0 |
| | S-14 | 보육시설 10개+ → childcare score = 100 |
| | S-15 | 보육시설 5개 → childcare score ≈ 50 |
| 치안점수 | S-16 | crime_rate 50 → safety score = 100 |
| | S-17 | crime_rate 300 → safety score = 0 |
| | S-18 | CCTV 보정 효과 확인 |
| 학군점수 | S-19 | 성취도 100 → school score = 100 |
| | S-20 | 성취도 50 → school score = 0 |
| 가중합 | S-21 | balanced 프로필 → 25:25:20:15:15 비중 |
| | S-22 | budget_focused → 40:20:15:15:10 비중 |
| | S-23 | commute_focused → 20:40:15:15:10 비중 |

**Mock**: `vi.mock('@/db/connection')`, `vi.mock('@/lib/redis')`, 공간 쿼리 mock

#### 4. `tests/unit/commute.test.ts` (5 cases)

| ID | 테스트 |
|----|--------|
| C-1 | Grid 히트 시 DB 값 반환, source='grid' |
| C-2 | Grid 미스 + Redis 히트 → source='redis' |
| C-3 | Grid 미스 + Redis 미스 + ODsay 미설정 → Mock fallback, source='mock' |
| C-4 | Mock fallback 공식 검증: `distance_km * 3 + 10` |
| C-5 | 다중 목적지 처리 |

**Mock**: `vi.mock('@/db/connection')`, `vi.mock('@/lib/redis')`, `vi.mock('@/lib/engines/spatial')`

#### 5. `tests/unit/spatial.test.ts` (3 cases)

| ID | 테스트 |
|----|--------|
| SP-1 | haversine(서울시청, 강남역) ≈ 8.9km (±0.5km) |
| SP-2 | findNearbyChildcare mock DB 반환 검증 |
| SP-3 | findNearestGrid mock DB 반환 검증 |

**Mock**: `vi.mock('@/db/connection')` (DB 호출 mock)

#### 6. `tests/unit/validators.test.ts` (6 cases)

| ID | 테스트 |
|----|--------|
| V-1 | 유효한 RecommendRequest → 성공 |
| V-2 | annualIncome 음수 → 실패 |
| V-3 | loanType 잘못된 값 → 실패 |
| V-4 | workplace.location 범위 초과 → 실패 |
| V-5 | maxResults 기본값 10 |
| V-6 | 유효한 apartmentId → 성공, 음수 → 실패 |

#### 7. `tests/integration/api.test.ts` (9 cases)

**중요**: `describe.skipIf(!process.env.DATABASE_URL)` 사용

| ID | 테스트 |
|----|--------|
| I-1 | GET /api/health → 200 + status ok/degraded |
| I-2 | POST /api/recommend 유효 요청 → 200 |
| I-3 | POST /api/recommend 잘못된 body → 400 |
| I-4 | POST /api/recommend 빈 body → 400 |
| I-5 | GET /api/apartments/1 → 200 (존재하는 ID) |
| I-6 | GET /api/apartments/99999 → 404 |
| I-7 | GET /api/apartments/abc → 400 |
| I-8 | 응답에 disclaimer 포함 확인 |
| I-9 | 응답에 dataSourceDate 포함 확인 |

**구현 방식**: Next.js API route 직접 호출 (`import { POST } from '@/app/api/recommend/route'`)

#### 8. `tests/compliance/compliance.test.ts`

**PII 비저장 테스트:**
- DB 스키마에 PII 컬럼(income, salary, phone, email, ssn 등) 없음 확인
- 로그 출력에 PII 패턴 없음 확인

**금지 문구 테스트:**
- src/ 전체에서 "대출 가능 보장", "거래 성사 보장", "투자 수익 보장" 등 금지 문구 없음
- "추천" 단독 사용 없음 확인 (import/변수명 제외)

**출처 표기 테스트:**
- API 응답에 `dataSourceDate` 필드 존재
- 분석 결과 `reasons`에 출처 포함

**구현**: 파일 시스템 스캔 (`fs.readFileSync`) + 패턴 매칭

#### 9. `tests/bench/recommend.bench.ts`

Vitest bench API를 사용한 성능 벤치마크.

```typescript
import { bench, describe } from 'vitest';

describe('POST /api/recommend benchmark', () => {
  bench('recommend API p50/p95/p99', async () => {
    // Mock DB + Redis 환경에서 10회 반복 호출
    // p50 < 500ms, p95 < 2000ms 검증
  }, { time: 5000, iterations: 10 });
});
```

**참고**: `vitest.config.ts`에서 bench 파일은 일반 테스트에서 제외, `pnpm vitest bench`로 별도 실행

## 반복마다 실행할 검증

```bash
# 1. Vitest 실행
pnpm vitest run

# 2. 실패한 테스트 확인 후 소스 or 테스트 수정
# (테스트가 스펙 기대값과 일치하도록 소스 수정 우선)

# 3. any 타입 검사 (테스트 코드 포함)
grep -rn ': any' tests/ --include="*.ts" | grep -v '.d.ts'

# 4. 전체 M2 게이트 검증 (마지막 반복)
bash scripts/m2-gate-check.sh 5
```

## 최종 M2 완료 검증 (Session 5 마지막 반복)

```bash
# 1. 전체 파일 존재 확인
find src/db src/lib/engines src/lib/redis.ts src/lib/logger.ts src/lib/validators src/etl src/types src/app/api tests drizzle.config.ts vitest.config.ts -name "*.ts" | wc -l
# 기대: 54

# 2. 전체 빌드
pnpm tsc --noEmit && pnpm build

# 3. 전체 테스트
pnpm vitest run

# 4. any 타입 0건
grep -rn ': any' src/ --include="*.ts" --include="*.tsx" | grep -v 'node_modules' | grep -v '.d.ts' | wc -l
# 기대: 0

# 5. 금지 문구 0건
bash scripts/m2-gate-check.sh 5
# 기대: PASSED
```

## 완료 조건

- [ ] 9개 파일 모두 생성됨
- [ ] `pnpm vitest run` 전체 통과
- [ ] `any` 타입 0건 (소스 + 테스트)
- [ ] 금지 문구 0건
- [ ] PII 비저장 컴플라이언스 통과
- [ ] 출처 표기 컴플라이언스 통과
- [ ] `bash scripts/m2-gate-check.sh 5` PASSED
- [ ] 54개 M2 파일 전체 존재 확인
- [ ] `pnpm tsc --noEmit` + `pnpm build` 통과

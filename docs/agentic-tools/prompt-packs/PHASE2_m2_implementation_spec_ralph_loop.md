# Ralph Loop 프롬프트: M2 Data+Engine 구현 상세 설계

> **용도**: `/ralph-loop` 실행 시 입력할 프롬프트
> **목적**: M2 구현에 앞서 코드 레벨 상세 설계 문서를 작성 (실제 코드 작성 없음)
> **출력물**: `docs/plan/2026-02-15_claude-code_m2-implementation-spec.md`
> **완료 조건**: DONE — 아래 10개 품질 기준 전수 통과 시
> **예상 반복**: 15~20회

---

## 프롬프트 (아래 전체를 Ralph Loop에 입력)

```
M2 Data+Engine 구현 상세 설계 문서를 작성해줘. 실제 코드는 작성하지 않고, 이후 구현 시 참조할 수 있는 수준의 디테일한 스펙을 만들어줘.

출력 파일: docs/plan/2026-02-15_claude-code_m2-implementation-spec.md
(이미 골격이 존재하면 읽고 보강. 없으면 신규 생성)

═══════════════════════════════════════════════════════
SoT (정본) — 반드시 먼저 읽을 것
═══════════════════════════════════════════════════════

1. docs/PHASE0_ground.md — NFR(비기능요구사항), 법무 체크리스트, KPI 이벤트 10개
2. docs/PHASE1_design.md — S2(DB 스키마 SoT), S4(스코어링 엔진 SoT), S5(API 설계)
3. docs/PHASE2_build.md — M2 태스크 9건, 환경변수, SoT 체크리스트
4. db/schema.sql — PostGIS 스키마 원본 (PHASE1 S2 파생)
5. package.json — 현재 의존성 (Next.js 16.x, React 19, Tailwind v4)

═══════════════════════════════════════════════════════
사용자 결정사항 (확정)
═══════════════════════════════════════════════════════

- ETL: TypeScript (Python이 아닌 프로젝트 통일)
- API 키: 없음 → Mock 우선 설계
- DB Client: Drizzle ORM (Prisma 아님)
- 캐시: Redis (ioredis)
- Zod: 입력/출력 검증
- 테스트: Vitest + @testing-library/react
- 이 문서는 설계 문서이며, 실제 코드 파일을 생성하지 않는다

═══════════════════════════════════════════════════════
작성할 10개 섹션
═══════════════════════════════════════════════════════

## 섹션 1. 아키텍처 개요
- 전체 디렉토리 구조 (파일 트리 39개+)
- 의존성 목록: 패키지명 + 버전 + 선택 근거 (표 형태)
- 데이터 흐름도: 요청 → Zod 검증 → 예산 계산 → 공간 쿼리 → 스코어링 → 정렬 → 응답

## 섹션 2. DB 스키마 & ORM 매핑
- PHASE1 S2의 6개 테이블을 Drizzle 스키마로 매핑
  - 각 파일: src/db/schema/apartments.ts, prices.ts, childcare.ts, schools.ts, safety.ts, commute.ts
  - 컬럼별: Drizzle 타입, nullable, default, check constraint
  - relations() 정의
- PostGIS geometry 커스텀 타입: customType<{ data: string }>() 패턴
- 인덱스: GIST 인덱스를 Drizzle에서 어떻게 정의하는지
- 커넥션 풀: postgres.js + max/idle_timeout/connect_timeout 수치

## 섹션 3. Mock 데이터 설계
- 테이블별 Mock 건수: apartments 50건, prices 300건, childcare 200건, schools 80건, safety 25건(구별), commute 100건
- Mock 상수: 실제 서울/경기 지명, 좌표 범위 (위도 37.4~37.7, 경도 126.8~127.2)
- 현실적 데이터 분포: 아파트 가격 2억~15억, 전세 1억~8억, 면적 59~134㎡
- Seed 스크립트: src/db/seed.ts — 실행 플로우, 의존관계(apartments 먼저)

## 섹션 4. ETL 파이프라인 설계
- 데이터 소스 6개의 API 명세 (엔드포인트 URL, 필수 파라미터, 응답 JSON 구조)
- Mock/Real 이중 구조: USE_MOCK_DATA 환경변수, 어댑터 패턴
- Zod 스키마: ETL 입력 데이터 검증 (각 API 응답별)
- PostGIS UPSERT: ON CONFLICT (apt_code) DO UPDATE 패턴
- 에러 핸들링: 재시도 3회, 지수 백오프, 부분 실패 시 로그

## 섹션 5. 엔진 모듈 상세 설계
- **예산 계산기** (src/lib/engines/budget.ts):
  - LTV/DTI 공식 (수학적 정의)
  - 입력 인터페이스, 출력 인터페이스
  - 경계값 처리 (소득 0, 대출 0, cash-only 등)
  - 매매/전세별 로직 분기

- **스코어링 엔진** (src/lib/engines/scoring.ts):
  - PHASE1 S4 정규화 공식 5개를 코드 레벨로 전사
  - 가중치 프로파일 3종의 상수 정의
  - 최종 점수 산출 함수 시그니처
  - Why-Not 사유 생성 로직

- **통근시간 모듈** (src/lib/engines/commute.ts):
  - 4단계 조회 전략: 그리드 캐시 → Redis → ODsay API → Mock 폴백
  - Redis TTL 정책 (키 네이밍, TTL 수치)
  - ODsay API 호출 스펙 (요청/응답)
  - 그리드 매칭: ST_DWithin 으로 최근접 그리드 포인트

- **공간 쿼리 헬퍼** (src/lib/engines/spatial.ts):
  - ST_DWithin(location, point, meters): 반경 내 조회
  - ST_Contains(polygon, point): 학군 포함 판정
  - 최근접 이웃: ORDER BY location <-> point LIMIT N
  - 각 쿼리의 Drizzle raw SQL 패턴

## 섹션 6. API 엔드포인트 상세 설계
- **POST /api/recommend** (src/app/api/recommend/route.ts):
  - 처리 파이프라인 10단계 상세
  - Zod 요청 스키마 (필드별 타입, 제약조건, 에러 메시지)
  - 응답 JSON 예시 (전체 구조)
  - 성능 목표: p95 < 2초

- **GET /api/apartments/[id]** (src/app/api/apartments/[id]/route.ts):
  - 조회 로직, JOIN 관계
  - 응답 JSON 예시

- **GET /api/health** (src/app/api/health/route.ts):
  - DB 연결 + Redis 연결 확인
  - 응답 JSON 예시

- **에러 응답 규격**: 400/404/500 각각의 JSON 구조
- **PII 마스킹 정책**:
  - API 계층: 요청 body를 로그에 기록하지 않는 방법
  - DB 계층: PII 컬럼 미존재 확인
  - 에러 계층: stack trace에서 사용자 입력 제거

## 섹션 7. 타입 정의
- 모든 TypeScript 인터페이스/타입을 코드 블록으로 정의:
  - API 요청/응답 타입 (RecommendRequest, RecommendResponse 등)
  - DB 엔티티 타입 (Drizzle infer로 파생)
  - 엔진 입출력 타입 (BudgetInput, BudgetOutput, ScoreResult 등)
  - Zod 스키마 → TypeScript 타입 매핑 (z.infer)

## 섹션 8. 테스트 전략
- **단위 테스트**: 엔진 모듈별 테스트 케이스 목록
  - 예산 계산기: 입력값, 기대 출력값 (5개+)
  - 스코어링: 정규화 함수별 경계값 테스트 (10개+)
  - 통근: Mock 폴백 시나리오 (3개+)
- **통합 테스트**: /api/recommend E2E 플로우
  - 정상 요청 → 200 응답 확인
  - 잘못된 입력 → 400 에러 확인
  - 존재하지 않는 ID → 404 확인
- **컴플라이언스 테스트**:
  - PII 비저장: 요청 후 DB 덤프에 income/cash 미존재 확인
  - 금지 문구: 응답 JSON에 금지 문구 목록 포함 여부 자동 검증
- **성능 벤치마크**: 측정 항목(p50/p95/p99), 목표치, 측정 방법

## 섹션 9. 파일 맵 & 의존 관계
- 전체 파일 목록 39개+ (경로, 용도, 주요 의존 관계)
- 실행 순서: Phase별 의존 그래프
  - Phase 1: DB + ORM 스키마
  - Phase 2: Mock 데이터 + Seed
  - Phase 3: 엔진 모듈 (budget → scoring → commute → spatial)
  - Phase 4: API Routes
  - Phase 5: 테스트

## 섹션 10. 리스크 & 완화 방안
- PostGIS + Drizzle 엣지 케이스 (커스텀 타입, 마이그레이션)
- 성능 병목 예측 (공간 쿼리 부하, N+1 문제)
- Mock→Real 전환 시 주의점 (API 응답 구조 차이, 에러 핸들링)
- Redis 다운 시 graceful degradation
- Drizzle push vs migrate 전략

═══════════════════════════════════════════════════════
컴플라이언스 규칙 (위반 시 즉시 수정)
═══════════════════════════════════════════════════════

1. 금지 문구: "추천", "알선", "중개", "매물 추천", "대출 가능 보장", "거래 성사 보장", "투자 수익 보장" → 생성 금지
2. "추천" 단독 사용 금지 → "분석 결과" 또는 "안내"로 대체
3. PII 비저장: 설계 내 어디에도 사용자 입력(cash/income/loans)을 DB에 저장하는 구조 금지
4. 크롤링 금지: ETL은 공공 API/Mock만 허용
5. 출처 표기: 데이터 관련 설계에 출처/기준일 표기 정책 포함

═══════════════════════════════════════════════════════
품질 기준 (DONE 판정 조건)
═══════════════════════════════════════════════════════

아래 모든 항목이 TRUE여야 DONE:

□ 10개 섹션 전부 작성됨 (빈 섹션 없음)
□ 모든 TypeScript 인터페이스가 코드 블록으로 정의됨 (섹션 7)
□ 모든 API 엔드포인트의 요청/응답 JSON 예시 포함 (섹션 6)
□ 스코어링 5차원 정규화 수학 공식이 PHASE1 S4와 정확히 일치 (섹션 5)
□ PostGIS 공간 쿼리 SQL이 구체적으로 작성됨 — ST_DWithin/ST_Contains/최근접 이웃 (섹션 5)
□ PII 비저장 정책이 3계층(API/DB/에러)으로 명시됨 (섹션 6)
□ 금지 문구 목록 + 대체 문구 매핑 포함 (섹션 10 또는 별도)
□ 테스트 케이스가 입력/기대값 수준으로 구체적 (섹션 8)
□ 파일 맵 39개+ 파일의 경로/용도/의존관계 완성 (섹션 9)
□ 리스크 항목별 구체적 완화 방안 포함 (섹션 10)

═══════════════════════════════════════════════════════
실행 방법
═══════════════════════════════════════════════════════

매 반복마다:
1. 출력 파일(docs/plan/2026-02-15_claude-code_m2-implementation-spec.md)을 읽는다
2. SoT 파일을 참조하여 부족한 섹션을 식별한다
3. 가장 부족한 섹션부터 보강한다
4. 품질 기준 체크리스트를 확인한다
5. 모든 항목 통과 시 DONE 출력

첫 반복에서는 전체 골격을 잡고, 이후 반복에서 각 섹션을 깊이 있게 채운다.
수학 공식, SQL 쿼리, TypeScript 인터페이스, JSON 예시는 구체적 수치까지 포함한다.
```

---

## 사용법

```bash
# Claude Code에서 Ralph Loop 실행
/ralph-loop

# 프롬프트 입력 시 위 ``` 블록 안의 내용을 그대로 붙여넣기
# --max-iterations 20 권장
# --completion-promise DONE
```

## 예상 소요

- 골격 작성: 반복 1~2회
- 섹션 1~3 (아키텍처/DB/Mock): 반복 3~4회
- 섹션 4~5 (ETL/엔진): 반복 4~5회
- 섹션 6~7 (API/타입): 반복 3~4회
- 섹션 8~10 (테스트/파일맵/리스크): 반복 2~3회
- 검증 + 수정: 반복 2~3회
- **총 예상: 15~20 반복**

## 관련 문서

| 문서 | 역할 |
|------|------|
| `docs/PHASE1_design.md` | S2 스키마, S4 스코어링, S5 API — 설계의 원본 |
| `docs/PHASE0_ground.md` | NFR, 법무 체크리스트 — 컴플라이언스 기준 |
| `docs/PHASE2_build.md` | M2 태스크 9건 — 구현 범위 |
| `db/schema.sql` | PostGIS 스키마 원본 |

## 주의사항

1. **코드 작성 금지**: 이 Ralph Loop은 설계 문서만 작성한다. 실제 .ts/.tsx 파일을 생성하지 않는다.
2. **SoT 보호**: PHASE0/PHASE1 문서는 읽기 전용 참조만 한다. 수정하지 않는다.
3. **PHASE1 S4 일치**: 스코어링 공식은 PHASE1 S4의 정규화 함수/가중치를 정확히 전사해야 한다.
4. **PII 원칙**: 설계 어디에도 사용자 금융 정보(cash/income/loans)를 DB에 저장하는 구조를 포함하지 않는다.

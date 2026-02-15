---
plan-id: "2026-02-15_claude-code_m2-ralph-loop-sessions"
status: "in_progress"
phase: "PHASE2"
template-version: "1.1"
work-type: "feature"
depends-on:
  - plan-id: "2026-02-15_claude-code_m2-implementation-spec"
    condition: "status == done"
---

# M2 Data+Engine Ralph Loop 세션 실행

## 목표

M2 마일스톤(Data+Engine)의 상세 설계 문서(`2026-02-15_claude-code_m2-implementation-spec`)를 기반으로, 5개 Ralph Loop 세션을 통해 54개 코드 파일을 자율 구현한다.

## 범위

- **수정 대상 SoT**: 없음 (SoT 참조만 수행)
- **SoT 참조**: PHASE0 S4(법무), PHASE1 S2(스키마), S4(스코어링), S5(API)
- **선행 plan**: `2026-02-15_claude-code_m2-implementation-spec` (M2 설계 SoT, status: done)
- **출력물**: 54개 신규 TypeScript 파일 (스펙 52 + normalize.ts + mock/constants.ts)

### 산출물 요약

| 세션 | 범위 | 파일 수 | 프롬프트 팩 |
|------|------|---------|------------|
| 0 | 환경 설정 | 0 | (직접 실행 완료) |
| 1 | DB + ORM | 11 | `PHASE2_m2_session1_db_orm_ralph_loop.md` |
| 2 | Mock + Seed | 8 | `PHASE2_m2_session2_mock_seed_ralph_loop.md` |
| 3 | 엔진 모듈 | 9 | `PHASE2_m2_session3_engine_ralph_loop.md` |
| 4 | ETL + API | 16 | `PHASE2_m2_session4_etl_api_ralph_loop.md` |
| 5 | 테스트 | 9 | `PHASE2_m2_session5_tests_ralph_loop.md` |

### 경로 규칙 (Section 9.1 정본)

| Section 1.1 (잘못됨) | Section 9.1 (정본) |
|----------------------|-------------------|
| `src/engine/` | `src/lib/engines/` |
| `src/db/custom-types.ts` | `src/db/types/geometry.ts` |
| `src/db/index.ts` | `src/db/connection.ts` |
| `src/db/seed-data/` | `src/db/mock/` |
| `src/validations/` | `src/lib/validators/` |
| `src/lib/pii-guard.ts` | `src/lib/logger.ts` |

## 작업 단계

### Session 0: 사전 설정 (완료)

- [x] Docker 서비스 기동 (PostGIS 3.4, Redis 7)
- [x] 런타임 의존성 설치 (drizzle-orm, postgres, ioredis, zod@^3)
- [x] 개발 의존성 설치 (drizzle-kit, vitest, @vitejs/plugin-react, @types/geojson)
- [x] .env.example 업데이트 + .env 생성
- [x] `pnpm tsc --noEmit` + `pnpm build` 통과
- [x] `scripts/m2-gate-check.sh` 게이트 스크립트 생성
- [x] Gate 0 PASSED

### Session 1: DB + ORM (Ralph Loop)

- **프롬프트 팩**: `docs/agentic-tools/prompt-packs/PHASE2_m2_session1_db_orm_ralph_loop.md`
- **max-iterations**: 5
- **completion-promise**: "Phase 1 complete: pnpm tsc --noEmit passes with all 11 DB+ORM files"
- **게이트**: `pnpm tsc --noEmit` pass
- **대상 파일** (11): geometry.ts, 6 schemas, relations.ts, barrel, connection.ts, drizzle.config.ts

### Session 2: Mock + Seed (Ralph Loop)

- **프롬프트 팩**: `docs/agentic-tools/prompt-packs/PHASE2_m2_session2_mock_seed_ralph_loop.md`
- **max-iterations**: 5
- **completion-promise**: "Phase 2 complete: npx tsx src/db/seed.ts exits 0 and logs 755 records inserted"
- **게이트**: `npx tsx src/db/seed.ts` exit 0
- **대상 파일** (8): constants.ts, 6 mock files, seed.ts

### Session 3: 엔진 모듈 (Ralph Loop)

- **프롬프트 팩**: `docs/agentic-tools/prompt-packs/PHASE2_m2_session3_engine_ralph_loop.md`
- **max-iterations**: 6
- **completion-promise**: "Phase 3 complete: pnpm tsc --noEmit passes with all engine modules"
- **게이트**: `pnpm tsc --noEmit` pass + 금지 문구 0건
- **대상 파일** (9): engine.ts types, redis.ts, logger.ts, normalize.ts, budget/spatial/commute/scoring, barrel

### Session 4: ETL + Validators + API (Ralph Loop)

- **프롬프트 팩**: `docs/agentic-tools/prompt-packs/PHASE2_m2_session4_etl_api_ralph_loop.md`
- **max-iterations**: 6
- **completion-promise**: "Phase 4 complete: pnpm build passes and all 3 API routes compile"
- **게이트**: `pnpm build` pass
- **대상 파일** (16): etl types+5 adapters+runner, 3 validators, 3 types, 3 API routes

### Session 5: 테스트 (Ralph Loop)

- **프롬프트 팩**: `docs/agentic-tools/prompt-packs/PHASE2_m2_session5_tests_ralph_loop.md`
- **max-iterations**: 7
- **completion-promise**: "Phase 5 complete: pnpm vitest run passes all unit and compliance tests"
- **게이트**: `pnpm vitest run` pass
- **대상 파일** (9): vitest.config.ts, 5 unit, 1 integration, 1 compliance, 1 bench

### 게이트 검증 (세션 간)

```bash
bash scripts/m2-gate-check.sh <phase-number>
```

### 커밋 전략 (사용자 승인 후)

| 세션 | 커밋 메시지 |
|------|------------|
| 0 | `chore(phase2): M2 의존성 설치 및 환경 설정` |
| 1 | `feat(phase2): Drizzle ORM 스키마 11개 + PostGIS customType + 커넥션 풀` |
| 2 | `feat(phase2): Mock 데이터 755건 + 고정시드 Seed 스크립트` |
| 3 | `feat(phase2): 예산/스코어링/통근/공간 엔진 모듈 + Redis/PII 유틸` |
| 4 | `feat(phase2): ETL 어댑터 5종 + Zod 검증 + API 라우트 3종` |
| 5 | `test(phase2): 단위 5종 + 통합 + 컴플라이언스 + 벤치마크 테스트` |

## 검증 기준

- [ ] 54개 신규 파일 모두 존재
- [ ] `pnpm tsc --noEmit` 통과
- [ ] `pnpm build` 통과
- [ ] `pnpm vitest run` 통과
- [ ] `any` 타입 0건
- [ ] "추천" 단독 사용 0건
- [ ] DB 스키마에 PII 컬럼 0건
- [ ] Seed 데이터 755건 정상 적재

## 결과/결정

- **상태**: `in_progress`
- **Session 0**: 완료 (Gate 0 PASSED)
- **Session 1~5**: 별도 Ralph Loop 세션에서 실행 예정
- **후속 액션**: Session 1 프롬프트 팩으로 Ralph Loop 시작

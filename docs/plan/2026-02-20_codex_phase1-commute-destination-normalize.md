---
plan-id: "2026-02-20_codex_phase1-commute-destination-normalize"
status: "partial"
phase: "PHASE1"
template-version: "1.1"
work-type: "feature"
---

# PHASE1 통근 목적지 정규화 (commute 1:N)

## 목표

- 통근 그리드(`commute_grid`)가 목적지 수 증가에 따라 스키마/코드 변경 비용이 커지는 문제를 해결한다.
- 목적지(업무권) 추가 시 DB 스키마를 변경하지 않고 데이터 적재/조회가 가능하도록 1:N 구조로 전환한다.

## 범위

- SoT 변경: `docs/PHASE1_design.md`의 S2(DB 스키마)에서 통근 테이블 구조를 정규화로 갱신
- DB 변경: `commute_destinations`, `commute_times` 테이블 신설 + 기존 `commute_grid`의 목적지별 컬럼 제거
- ETL 변경: `src/etl/adapters/odsay-grid.ts`를 (grid_id, destination_key) 단위로 재개(resume) 가능하게 수정
- 런타임 조회 변경: 가까운 그리드 조회 및 통근 시간 조회 로직을 정규화 스키마에 맞게 갱신

## 작업 단계

1. Plan 문서 생성 및 인덱스 갱신 (본 문서 + `docs/plan/README.md`)
2. PHASE1 SoT(S2) 업데이트: 통근 스키마 정규화 정의 추가
3. Drizzle 스키마 코드 업데이트: `src/db/schema/commute.ts`에 신규 테이블 정의 및 기존 컬럼 정리
4. 마이그레이션 SQL 추가: 신규 테이블 생성 + 기존 데이터 백필 + 구(舊) 컬럼 제거
5. ETL 러너 수정: 목적지 목록 기반 호출/저장 + 일일 한도 계산을 목적지 수에 맞춰 동적 처리
6. 런타임 조회 수정: 최근접 grid_id 조회 + destination_key 기반 시간 조회
7. seed/mock 수정: 통근 관련 목 데이터 생성/적재 경로를 신규 스키마로 전환
8. 타입/컴파일 검증: lint 및 타입 체크(가능한 범위)

## 검증 기준

- 스키마:
  - `commute_grid`는 `grid_id`, `location`만으로 유지되고 목적지별 시간 컬럼이 제거된다.
  - `commute_destinations`와 `commute_times`가 생성되고 `UNIQUE(grid_id, destination_key)`가 존재한다.
- 데이터 마이그레이션:
  - 기존 4개 목적지(GBD/YBD/CBD/PANGYO)의 값이 `commute_times`로 백필된다.
- ETL:
  - 목적지 수가 증가해도 일일 한도 체크가 목적지 수에 따라 동작한다.
  - 재개 실행 시 이미 존재하는 (grid_id, destination_key)는 스킵된다.
- 런타임:
  - 기존 API 응답(4개 목적지 통근 값)이 깨지지 않고 정상 조회된다.

## 결과/결정

- 상태: partial
- 결정: 충돌 정책은 "처음값 고정"으로 유지한다. 즉, `commute_times`는 `ON CONFLICT DO NOTHING`으로만 적재한다.
- 후속 액션:
  - DB에 `drizzle/0002_commute_destinations_times.sql` 적용 후, `scripts/run-odsay.ts`를 실행해 적재가 정상 동작하는지 확인
  - (선택) `commute_grid`에 남아있던 구(舊) 시간 컬럼을 참조하는 코드/쿼리 재확인

## Execution

- SoT 갱신: `docs/PHASE1_design.md` S2에 통근 목적지/시간 정규화 테이블(`commute_destinations`, `commute_times`) 정의 추가
- DB 스키마 코드: `src/db/schema/commute.ts`에 신규 테이블 추가 및 `commute_grid` 시간 컬럼 제거
- 마이그레이션: `drizzle/0002_commute_destinations_times.sql` 추가 (신규 테이블 생성, 기존 4개 목적지 백필, 구 컬럼 drop)
- ETL: `src/etl/adapters/odsay-grid.ts`를 (grid_id, destination_key) 단위 재개 가능 구조로 전환하고 일일 한도 체크를 목적지 수 기반으로 동적 처리
- 런타임 조회: `src/lib/engines/spatial.ts`, `src/lib/engines/commute.ts`, `src/lib/data/apartment.ts`를 정규화 스키마 기반 조회로 전환
- seed/mock: `src/db/seed.ts`, `src/db/mock/commute.ts`, `src/db/mock/constants.ts` 갱신

## Verification

### Run 1 (2026-02-20)

```json
{
  "phase": "PHASE1",
  "verdict": "pending",
  "run": 1,
  "score": {
    "completeness": 0.9,
    "consistency": 0.8,
    "compliance": 1.0
  },
  "blockers": [
    "DB 마이그레이션/ETL 실제 실행으로 end-to-end 검증을 아직 수행하지 않음"
  ],
  "next_actions": [
    "DB에 0002 마이그레이션 적용 후 scripts/run-odsay.ts 1~2 포인트 적재로 스모크 테스트",
    "API(/api/apartments/:id)에서 commute 4개 필드가 정상 응답되는지 확인"
  ],
  "timestamp": "2026-02-20"
}
```

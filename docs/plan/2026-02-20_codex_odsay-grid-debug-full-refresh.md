---
plan-id: "2026-02-20_codex_odsay-grid-debug-full-refresh"
status: "partial"
phase: "PHASE1"
template-version: "1.1"
work-type: "ops"
---

# ODsay 통근 경로 저장 + 디버그/전체 갱신 대비 플랜

## 목표

- `src/etl/adapters/odsay-grid.ts`와 `src/lib/engines/commute.ts`에서 ODsay 호출/오류 처리 로그의 가시성을 강화한다.
- 기존 `runCommuteGrid`를 활용해 기존 데이터 전체 재계산(전체 갱신) 모드를 지원한다.
- 전체 갱신 실행 가이드를 일관된 CLI 옵션으로 정리한다.

## 범위

- SoT 참조: `docs/PHASE1_design.md`의 S2(commute schema)는 본 작업에서는 변경하지 않는다.
- 수정 파일:
  - `src/etl/adapters/odsay-grid.ts`
  - `src/lib/engines/commute.ts`
  - `scripts/run-odsay.ts`
- 문서 업데이트:
  - `docs/plan/README.md`(plan 인덱스 보정)
  - `docs/plan/ETL_실행_가이드.md`(실행 옵션 표기)

## 작업 단계

1. ODsay 디버그 로그 헬퍼(`ODSAY_DEBUG`, URL masking, 요청/응답 이벤트 로그) 정렬 및 정합성 점검
2. ODsay 오류 코드 대응(재시도/도보 fallback/중단) 로그를 엔진/어댑터 양쪽에 반영
3. `runCommuteGrid(dryRun, maxPoints, clearExisting)` 시그니처 확장 및 전체 갱신 시 기존 commute 데이터 삭제 처리
4. `scripts/run-odsay.ts`에 `--help`, `--dry-run`, `--full-refresh`, `--max-points` 옵션 추가
5. 실행 가이드와 plan 인덱스 문서 업데이트

## 검증 기준

- ODSAY API 실패 시 디버그 모드에서 코드/액션(재시도/도보 fallback/중단)을 JSON 로그로 확인 가능
- `runCommuteGrid(false, n, true)` 실행 시 `commute_times`/`commute_grid`를 지우고 해당 배치만 재적재
- 기존 `dry-run`(2/3) 실행 모드와 충돌 없이 동작
- 전체 갱신 모드가 기본 `run` 실행 흐름과 충돌 없이 사용 가능

## 결과/결정

- 상태: partial
- 결정: 코드 반영 완료. `ODSAY_DEBUG=true`로 디버그 JSON 활성화 가능하며, `--full-refresh`로 기존 데이터 초기화 후 재적재 가능하도록 반영함.
- 후속 액션:
  - 실제 DB 환경에서 `pnpm exec tsx --env-file=.env scripts/run-odsay.ts --full-refresh` 1회 실행해 실제 재적재를 확인
  - 700m 이내 케이스(예: 강남역 인근)의 실제 응답 코드를 확인 후 필요 시 fallback 조건을 코드상 정책(거리 임계값)으로 보강

## Execution

- `src/etl/adapters/odsay-grid.ts`: 디버그 로그 정합성 보강, `runCommuteGrid(..., clearExisting)` 추가
- `src/lib/engines/commute.ts`: API 오류 처리 로그에 retry/fallback/abort 상태를 추가
- `scripts/run-odsay.ts`: CLI 옵션 파싱 및 디버그/전체갱신 모드 지원

## Verification

### Run 1 (2026-02-20)

```json
{
  "phase": "PHASE1",
  "verdict": "pending",
  "run": 1,
  "score": {
    "completeness": 0.82,
    "consistency": 0.82,
    "compliance": 1.0
  },
  "blockers": [
    "실제 DB 환경 실행 검증을 아직 수행하지 않음"
  ],
  "next_actions": [
    "run script로 full-refresh 및 dry-run 실행 확인",
    "강남역 근접 케이스에서 ODsay 오류 코드 fallback 동작 로그 확인"
  ],
  "timestamp": "2026-02-20"
}
```

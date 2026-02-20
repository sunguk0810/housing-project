---
plan-id: "2026-02-20_codex_commute-route-snapshot"
status: "partial"
phase: "PHASE1"
template-version: "1.1"
work-type: "feature"
---

# ODsay 이동 경로 스냅샷 저장 및 API 에러 대응

## 목표

- ODsay 응답에서 총 이동 시간뿐 아니라 경로 스냅샷을 저장하도록 `commute_times` 스키마를 확장한다.
- `searchPubTransPathT` 오류 응답(`-98`, `-99` 등)에 대한 분기별 대응을 도입해 API 실패 시 사용자 공지 없는 안전한 대체 경로를 제공한다.
- PHASE1 SoT(`docs/PHASE1_design.md > S2`)와 실행 흐름(`src/lib/engines/commute.ts`, `src/etl/adapters/odsay-grid.ts`)의 변경 사항을 한 번에 반영한다.

## 범위

- SoT 참조: `docs/PHASE1_design.md` (S2)
- 영향 파일: `src/db/schema/commute.ts`, `drizzle/0003_commute_times_route_snapshot.sql`, `scripts/migrate-manual.ts`, `src/etl/adapters/odsay-grid.ts`, `src/lib/engines/spatial.ts`, `src/lib/engines/commute.ts`, `tests/unit/commute.test.ts`

## 작업 단계

1. ODsay 경로 스냅샷 타입(`CommuteRouteInfo`)을 타입 레이어에서 보강하고, DB 컬럼(`route_snapshot jsonb`) 수용 구조를 추가.
2. `commute_times` 스키마 + 수동 마이그레이션 경로에 컬럼 추가 스크립트 반영.
3. ETL 어댑터에서 경로 스냅샷 저장까지 처리:
   - 오류 코드 `-98`, `-99`는 walking fallback 시간+경로로 보정.
4. 런타임 commute 엔진에서 경로 파싱 및 에러 코드 기반 fallback 정책을 일관 적용.
5. `spatial` 조회를 타입 확장(시간 + 스냅샷)하고, 기존 grid lookup 인터페이스는 하위 호환 유지.
6. 단위 테스트 케이스 보강(`-98`, API 실패 분기).

## 검증 기준

- `commute_times.route_snapshot` 컬럼이 스키마/마이그레이션에 반영되어야 함.
- `searchPubTransPathT` 정상 응답에서 경로 스냅샷(segments, transferCount, summary)이 저장되어야 함.
- 오류 코드 `-98`/`-99` 시 경로가 없더라도 fallback 경로/시간으로 저장 및 응답 보장.
- 런타임 API 실패 시 마지막 스테이지(mock fallback)로 안전하게 전환되어 사용자 요청이 실패하지 않아야 함.
- 기존 그리드/redis mock 경로 우선순위 동작은 유지.

## 결과/결정

- 상태: partial
- 결정: `-98`, `-99`는 ODsay 응답 기반 walking fallback를 반환/저장하고, 외부 API 장애/타임아웃은 mock fallback로 수렴한다.
- 후속 액션: 스키마 반영 후 실제 DB에서 `drizzle/0003_commute_times_route_snapshot.sql` 적용 및 ODsay 일괄 적재 스모크 테스트를 진행한다.

## Execution

- ODsay 타입/경로 저장을 `src/types/engine.ts`, `src/db/schema/commute.ts`에 반영.
- `src/etl/adapters/odsay-grid.ts`에서 실패 분기 로그, 경로 선택, fallback 경로 저장 추가.
- `src/lib/engines/spatial.ts`에 경로 포함 조회 API 추가, `src/lib/engines/commute.ts`의 ODsay 호출 분기 개선.
- `tests/unit/commute.test.ts`를 `-98` 분기 및 오류 대응으로 보강.

## Verification

### Run 1 (2026-02-20)

```json
{
  "phase": "PHASE1",
  "verdict": "pending",
  "run": 1,
  "score": {
    "completeness": 0.75,
    "consistency": 0.75,
    "compliance": 1.0
  },
  "blockers": [
    "실제 DB에서 마이그레이션 실행 및 ODsay 경로 스냅샷 존재 여부를 검증하지 않음"
  ],
  "next_actions": [
    "drizzle migration 적용 후 run-odsay 파이프라인을 짧은 배치로 수행해 route_snapshot 적재 확인",
    "모든 경유지를 포함해 -98/-99 mock fallback 동작/로깅 포맷 점검"
  ],
  "timestamp": "2026-02-20"
}
```

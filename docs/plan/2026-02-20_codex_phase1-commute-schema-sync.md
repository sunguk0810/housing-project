---
plan-id: "2026-02-20_codex_phase1-commute-schema-sync"
status: "done"
phase: "PHASE1"
template-version: "1.1"
work-type: "feature"
---

# PHASE1 통근 스키마/소스 정합성과 마이그레이션 추적 동기화

## 목표

- runtime과 mock, ETL에서 통근 목적지 좌표/라벨 소스를 `src/etl/config/regions.ts` 기준으로 정합화한다.
- `drizzle/meta/_journal.json`에 누락된 `0003~0004` 항목을 추가해 현재 DB 상태와 마이그레이션 추적이 맞도록 정리한다.
- `commute.ts`의 목적지 매칭/경로 캡처 동작이 `regions.ts` 좌표 규약(`lat/lng`)과 일치하게 고정한다.
- 변경사항을 기존 plan/작업 문맥(`PHASE1 S2`)에 맞춰 기록한다.

## 범위

- SoT 참조: `docs/PHASE1_design.md`의 S2
- 수정 파일
  - `src/lib/engines/commute.ts`
  - `src/db/mock/constants.ts`
  - `src/db/mock/commute.ts`
  - `drizzle/meta/_journal.json`

## 작업 단계

1. `src/lib/engines/commute.ts`의 하드코딩 목적지 좌표 맵을 제거하고 `src/etl/config/regions.ts`의 `BUSINESS_DISTRICTS`를 import하도록 변경.
2. `matchBusinessDistrict` 내 좌표 매핑을 `lon/lng`가 아닌 `lat/lng` 기준으로 변경.
3. `src/db/mock/constants.ts`의 `BUSINESS_DISTRICTS` 라벨 컬럼을 `name` 기준으로 통일(값도 `regions.ts` 기준 라벨로 정규화).
4. `src/db/mock/commute.ts`에서 destination 삽입 시 `d.name`을 사용하도록 수정.
5. `drizzle/meta/_journal.json`에 `idx:3/4` 항목(`0003...`, `0004...`)을 추가.

## 검증 기준

- 런타임(`src/lib/engines/commute.ts`)이 `BUSINESS_DISTRICTS`를 정확히 `regions.ts`에서 가져와 사용한다.
- 거리 매칭 로직에서 `matchBusinessDistrict`가 `lon/lng` 혼선을 일으키지 않는다.
- mock 데이터 생성/시드 경로가 `name` 키를 기준으로 `commute_destinations` 적재에 실패하지 않는다.
- `_journal.json`에 0003/0004 항목이 추가되어 마이그레이션 상태 감시 정합성이 높아진다.
- DB 실제 재적용(`drizzle-kit migrate`)은 실행하지 않으며, 추적 동기화 결과는 추후 DB 조회로 확인한다.

## 결과/결정

- 상태: done
- 결정: 코드 정합(엔진/Mock/Journal) 수정 적용 완료. `__drizzle_migrations` 정합성은 `2026-02-20_claude-code_drizzle-baseline-reset`의 Fresh Baseline 적용으로 해결됨.

## Execution

- `src/lib/engines/commute.ts`: `BUSINESS_DISTRICTS` import로 교체, `matchBusinessDistrict` 좌표값 정합화 반영.
- `src/db/mock/constants.ts`: `label`을 `name`로 정규화.
- `src/db/mock/commute.ts`: `name: d.name`으로 변경.
- `drizzle/meta/_journal.json`: `idx 3`, `idx 4` 엔트리 추가.

## Verification

### Run 1 (2026-02-20)

```json
{
  "phase": "PHASE1",
  "verdict": "pending",
  "run": 1,
  "score": {
    "completeness": 1.0,
    "consistency": 0.8,
    "compliance": 1.0
  },
  "blockers": [
    "운영 DB에서 __drizzle_migrations 실제 hash/created_at 보정 미실행"
  ],
  "next_actions": [
    "운영 DB에서 drizzle.__drizzle_migrations 미스매치 항목을 점검하고 보정",
    "필요 시 migrate-manual 동작과 _journal 순서 점검 스모크 실행"
  ],
  "timestamp": "2026-02-20"
}
```

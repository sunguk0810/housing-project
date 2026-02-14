# Plan: PHASE1 Prompt Pack 생성

> 상태: `done`

## 목표

PHASE0 Verification `verdict: go` 이후, PROMPT_PACK_INDEX.md 확장 트리거에 따라 PHASE1 전용 Prompt Pack을 생성한다.
PHASE1_design.md(S1~S8)에 대한 Execution/Review/Verification 3-stage 검증 도구를 표준화한다.

## 범위

| 파일 | 작업 |
|------|------|
| `docs/agentic-tools/prompt-packs/PHASE1_prompt_pack.md` | 신규 생성 |
| `docs/agentic-tools/prompt-packs/PROMPT_PACK_INDEX.md` | PHASE1 상태 `TBD` -> `Active` 갱신 |
| `docs/PHASE1_design.md` | 트리거 필수 섹션 4개 헤더 추가 (기존 S1~S8 변경 없음) |

### SoT 참조

- FR/NFR/KPI/법무 체크리스트: `docs/PHASE0_ground.md` 참조
- DB 스키마(S2), 스코어링 로직(S4): `docs/PHASE1_design.md` 참조 (SoT)

## 작업 단계

### Step 1: Plan 문서 선생성 ✅

본 문서 생성 완료. 상태: `in_progress`.

### Step 2: PHASE1_design.md 트리거 섹션 보강 ✅

SoT 헤더 아래에 경량 헤더 4개(목표/범위/산출물/게이트 기준) 추가 완료.
기존 S1~S8 내용 변경 없음.

### Step 3: PHASE1_prompt_pack.md 생성 ✅

PHASE0 구조 기반으로 PHASE1 전용 팩 작성 완료.
- Execution/Review/Verification 3-stage 구조
- Output Contract: O1~O5
- NFR-1~6 -> PHASE1 섹션 매핑표 Verification에 포함
- O3에 3단계 검증(정규화/가중합/최종) 명시

### Step 4: 샘플 왕복 검증 (read-only dry-run) ✅

PHASE1_design.md 수정 없이 read-only dry-run 수행 완료.

#### 동작 확인 체크리스트

| # | 항목 | 결과 |
|---|------|------|
| 1 | Execution -- O1~O5 검증 근거 산출 가능 | ✅ 통과 |
| 2 | Review -- pass/fail 판정 + Severity별 Findings 생성 가능 | ✅ 통과 |
| 3 | Verification -- score/verdict/blockers/next_actions JSON 출력 가능 | ✅ 통과 |

#### dry-run 주요 Findings

- [Critical] NFR-3: S1에 HTTPS/TLS/저장 암호화/최소 권한 미명시
- [High] NFR-1: APM 파이프라인 비저장 설계 미명시 (DB/로그는 충족)
- [High] NFR-6: "TypeScript strict 모드" 미명시
- [Medium] FR-7: S1 아키텍처 다이어그램에 동의 UI 미표기 (S6 컴포넌트에는 존재)

#### dry-run Output Contract 판정

- O1: pass | O2: pass | O3: pass | O4: pass | O5: pass

#### dry-run Verification JSON

```json
{
  "phase": "PHASE1",
  "verdict": "pending",
  "score": {
    "completeness": 1.0,
    "consistency": 1.0,
    "compliance": 0.67
  },
  "blockers": [],
  "next_actions": [
    "PHASE1 Execution 세션에서 S1 보안 설계 보강(NFR-3): HTTPS/TLS/저장 암호화/최소 권한 명시",
    "PHASE1 Execution 세션에서 S1 TypeScript strict 명시(NFR-6)",
    "PHASE1 Execution 세션에서 S1 APM 비저장 설계 명시(NFR-1)",
    "보강 후 재검증 시 compliance == 1.0 달성 -> go 전환 가능"
  ],
  "timestamp": "2026-02-14"
}
```

> dry-run verdict `pending`은 정본의 현 상태를 정직하게 반영한 것이며, 팩 동작에는 문제 없음.

### Step 5: PROMPT_PACK_INDEX.md Active 전환 ✅

왕복 동작 확인 3항목 통과 확인 후 `TBD` -> `Active` 전환 완료.

### Step 6: Plan 문서 최종 확정 ✅

상태 `in_progress` -> `done` 전이 완료.

## 검증 기준

1. PHASE1_prompt_pack.md가 3-stage 구조(Execution/Review/Verification) 보유
2. Output Contract O1~O5 커버리지: O1->S1, O2->S2(SoT), O3->S4(SoT), O4->S5, O5->S6+S7
3. O2에 "세션 입력값 제외" 문구 명시 (NFR-1 충돌 방지)
4. Verification JSON 스키마가 PLAN_OPERATION_GUIDE.md 최소 스키마와 일치
5. PROMPT_PACK_INDEX.md: `TBD` -> `Active` 전이 완료
6. PHASE1_design.md에 트리거 필수 섹션 4개 추가 확인
7. 게이트 기준이 INDEX 확장 규칙과 일치 (`go` 또는 `pending AND blockers==0`)
8. 샘플 왕복 검증: 동작 확인 3항목 통과 + dry-run verdict + next_actions 기록
9. O3에 3단계 검증 명시 (정규화 [0,1] -> 가중합 [0,1] -> 최종 [0,100])
10. Verification에 NFR-1~6 -> PHASE1 섹션 매핑표 포함
11. Plan 문서 자체 점검 체크리스트 통과

## 결과/결정

- 상태: `done`
- Plan 완료 기준: 팩 파일 생성 ✅ + 왕복 동작 확인 3항목 통과 ✅ + INDEX Active 전환 ✅
- dry-run verdict: `pending` (compliance 0.67 -- NFR-3 미충족, NFR-1/NFR-6 부분 충족)
- blockers: 없음

### next_actions (dry-run verdict `pending` 기인)

1. PHASE1 Execution 세션에서 S1 보안 설계 보강(NFR-3): HTTPS/TLS/저장 암호화/최소 권한 명시
2. PHASE1 Execution 세션에서 S1 "TypeScript strict" 명시(NFR-6)
3. PHASE1 Execution 세션에서 S1 APM 비저장 설계 명시(NFR-1)
4. 보강 후 재검증 시 compliance == 1.0 달성 -> `go` 전환 가능

### Verification JSON (dry-run)

```json
{
  "phase": "PHASE1",
  "verdict": "pending",
  "score": {
    "completeness": 1.0,
    "consistency": 1.0,
    "compliance": 0.67
  },
  "blockers": [],
  "next_actions": [
    "PHASE1 Execution 세션에서 S1 보안 설계 보강(NFR-3)",
    "PHASE1 Execution 세션에서 S1 TypeScript strict 명시(NFR-6)",
    "PHASE1 Execution 세션에서 S1 APM 비저장 설계 명시(NFR-1)",
    "보강 후 재검증 시 compliance == 1.0 달성 -> go 전환 가능"
  ],
  "timestamp": "2026-02-14"
}
```

## 자체 점검 체크리스트

- [x] 파일명 규칙 충족 (`2026-02-14_claude-code_phase1-prompt-pack.md`)
- [x] 필수 섹션 5개 존재 (목표/범위/작업 단계/검증 기준/결과·결정)
- [x] SoT 참조 문구 포함 (`docs/PHASE0_ground.md`, `docs/PHASE1_design.md`)
- [x] 결과/결정에 상태와 후속 액션 포함 (`done` + next_actions 4건)

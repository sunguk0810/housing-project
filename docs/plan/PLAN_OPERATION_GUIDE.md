# PLAN Operation Guide

> v1.1 | 최종 수정: 2026-02-14

Plan Execute 기록의 표준 운영 규칙입니다.

## 0) Plan Mode 부트스트랩

- Prompt Pack 기반 실행은 `Plan mode`에서 시작한다.
- 실행 시작 시점에 plan 문서를 먼저 생성한다.
  - 경로: `docs/plan/YYYY-MM-DD_<agent>_<topic>.md`
  - 초기 상태: `in_progress`
- 이후 Execution -> Review -> Verification 결과를 같은 문서에 누적 기록한다.
- 종료 시 `결과/결정` 섹션에서 상태를 `done | partial | blocked | cancelled | superseded`로 확정한다.

## 1) 생성 원칙

- Claude Code 또는 Codex에서 `Plan Execute`를 수행할 때마다 문서를 1건 생성한다.
- 동일 작업을 핸드오프하면 `<agent>`를 `handoff`로 기록한다.
- 에이전트는 직접 커밋하지 않는다. 반드시 커밋 메시지를 제안하고, 사용자 승인 후 커밋한다.

## 2) 파일명 규칙

- 경로: `docs/plan/`
- 형식: `YYYY-MM-DD_<agent>_<topic>.md`
- `<agent>` 허용값: `claude-code`, `codex`, `handoff`
- **충돌 방지**: 동일 날짜+agent+topic이 이미 존재하면 `-N` 접미사를 부여한다 (`-2`, `-3`, ...)
- **topic 네이밍 권장**: `<phase>-<action>` 패턴 (예: `phase1-schema-fix`)

예시:
- `2026-02-14_claude-code_phase0-kpi-refresh.md`
- `2026-02-14_handoff_phase0-pack-validation.md`
- `2026-02-14_claude-code_phase1-schema-fix-2.md` (충돌 시 `-N` 접미사)

## 3) 필수 섹션 (누락 금지)

1. 목표
2. 범위
   - 선택 필드 — `선행 plan:` frontmatter `depends-on`의 요약 미러로만 사용. 의존성의 SoT는 frontmatter `depends-on`이며, 본문은 가독성을 위한 요약이다. 드리프트 방지를 위해 본문 "선행 plan"은 frontmatter와 일치해야 한다.
3. 작업 단계
4. 검증 기준
5. 결과/결정

## 4) 상태 규칙

- `in_progress`: 실행 진행 중(초기 생성 상태)
- `done`: 검증 기준 충족
- `partial`: 일부 기준 미충족이나 블로커 없음
- `blocked`: 블로커 존재
- `cancelled`: 요구사항 변경 등으로 무효화. 사유 기록 필수
- `superseded`: 후속 plan이 대체. frontmatter `superseded-by`에 후속 plan의 `plan-id`(단일값) 기록 필수

`blocked` 또는 `partial`이면 다음 액션을 반드시 기록한다.

### done 불변 원칙

`done` 상태의 plan은 내용을 변경하지 않는다. 내용 변경이 필요하면 새 plan을 생성한다.

단, 오탈자/깨진 링크/포맷 교정 등 **비의미 변경(non-semantic edit)**은 허용하며, 문서 하단에 고정 포맷으로 편집 이력을 기록한다:

```
## 비의미 변경 이력
| 날짜 | 편집자 | 사유 |
|------|--------|------|
| 2026-02-15 | claude-code | 깨진 링크 수정 |
```

## 5) Verification 연계 규칙

### 이력 관리

- Verification Run 누적은 **`in_progress | partial | blocked` 상태에서만 허용**한다.
- `done` 상태의 plan에 재검증이 필요하면 새 plan을 생성하고, 해당 plan에서 Run을 기록한다.
- Run 형식: `### Run N (YYYY-MM-DD)` 형식으로 누적 추가한다 (덮어쓰기 금지).
- 최신 Run이 유효 verdict이다.

### verdict 기계 판정 조건

- 확장 허용: `go` 또는 `pending AND blockers.length == 0`
- 확장 불가: `no-go` 또는 `pending AND blockers.length > 0`

### verdict -> status 동기화 규칙

| verdict | blockers | status 확정 | 필수 기록 |
|---------|----------|-------------|-----------|
| `go` | 0 | `done` | 핵심 결과 |
| `pending` | 0 | `partial` | next_actions |
| `pending` | > 0 | `blocked` | blockers + next_actions |
| `no-go` | >= 0 | `blocked` | blockers + next_actions (no-go는 blockers 수와 무관하게 항상 blocked) |

### Verification JSON 최소 스키마

```json
{
  "phase": "PHASE0",
  "verdict": "go|pending|no-go",
  "run": 1,
  "score": {
    "completeness": 0.0,
    "consistency": 0.0,
    "compliance": 0.0
  },
  "blockers": [],
  "next_actions": [],
  "timestamp": "YYYY-MM-DD"
}
```

- `"run": N` 필드는 선택이며, 미지정 시 1로 간주한다.

## 6) 운영 단계

1. `plan-execute-template.md`로 새 문서 생성
2. 작업 수행/검증 결과 기입
3. 상태(`done | partial | blocked | cancelled | superseded`) 확정
4. 필요 시 후속 plan 문서 생성
5. `docs/plan/README.md` 인덱스 갱신

## 7) 인덱스 도입 기준

- `docs/plan/` 내 `YYYY-MM-DD_<agent>_<topic>.md` 패턴 파일이 **5건 이상** 누적되면 `docs/plan/README.md`를 생성한다.
- **집계 대상**: `YYYY-MM-DD_<agent>_<topic>.md` 패턴 파일만 집계한다. `PLAN_OPERATION_GUIDE.md`, `README.md` 등 운영 문서는 제외한다.
- README 필수 컬럼: 파일명, 날짜, agent, phase, 상태, 한줄 요약
- plan 생성/상태 변경 시 README 갱신 의무가 있다.

## 8) Git 커밋 규칙

- 에이전트는 작업 완료 후 feature 단위로 커밋을 **제안**한다.
- 사용자 승인 없이 커밋을 실행하지 않는다.
- 커밋 메시지 형식:

```
<type>(<scope>): <subject>

<detailed description>

- 변경 사항 1
- 변경 사항 2
- 변경 사항 3
```

- `<type>` 허용값: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- `<scope>`: 변경 대상 (예: `phase0`, `plan`, `prompt-pack`)
- `<subject>`: 한줄 요약 (50자 이내)
- `<detailed description>`: 변경 이유와 주요 내용을 상세히 기술

예시:

```
docs(phase0): PHASE0 SoT KPI 지표 갱신

- retention D7 목표를 15%에서 20%로 상향 조정
- MAU 산출 기준을 WAU 기반에서 DAU 기반으로 변경
- 근거: 경쟁사 벤치마크 재분석 결과 반영
```

## 9) 자체 점검 체크리스트

- [ ] 파일명 규칙 충족
- [ ] 필수 섹션 5개 존재
- [ ] SoT 참조 문구 포함
- [ ] 결과/결정에 상태와 후속 액션 포함
- [ ] YAML frontmatter 포함 (plan-id, status, phase) — template-version >= 1.1에 한함
- [ ] depends-on 참조 plan의 condition 평가 충족 확인 (해당 시)

## 10) 메타데이터 (YAML frontmatter)

신규 plan 생성 시 문서 상단에 YAML frontmatter를 포함한다:

```yaml
---
plan-id: "2026-02-14_claude-code_phase1-schema-fix"  # 실제 파일 basename(확장자 제외). -N 접미사 포함
status: "in_progress"
phase: "PHASE1"  # 허용값: PHASE0 | PHASE1 | PHASE2 | PHASE3 | PHASE4 | PHASE0-4 | META
template-version: "1.1"
# 선택 필드
# work-type: "feature"  # 허용값: feature | ops | governance | infra
# depends-on:
#   - plan-id: "2026-02-14_claude-code_phase0-ground-review"
#     condition: "verdict == go"
# superseded-by: ""
---
```

### plan-id

- `plan-id`는 **실제 파일의 basename(확장자 제외)**으로 정의한다.
- `-N` 접미사가 있으면 그대로 포함한다 (예: `2026-02-14_claude-code_phase1-schema-fix-2`).

### phase 허용값

| 값 | 용도 |
|----|------|
| `PHASE0` ~ `PHASE4` | 해당 Phase 작업 |
| `PHASE0-4` | 복수 Phase 대상 |
| `META` | SoT 비수정 운영성 작업에만 사용 |

- SoT를 실제 수정하는 작업은 `work-type`이 `ops`여도 `phase`는 `META`가 아니라 해당 PHASE를 사용한다.

### work-type 허용값 (선택)

| 값 | 용도 |
|----|------|
| `feature` | 기능 개발 |
| `ops` | 운영 |
| `governance` | 거버넌스 |
| `infra` | 인프라 |

### depends-on

- `depends-on`의 식별자 키는 `plan-id`(basename)를 사용한다. 파일 경로는 `docs/plan/<plan-id>.md`로 유도 가능하다.
- `depends-on.condition` 허용값 (제한된 조건식만 허용, canonical form 고정):
  - `"verdict == go"` (정확히 이 문자열)
  - `"status == done"` (정확히 이 문자열)
  - `"status == done AND verdict == go"` (정확히 이 문자열)
  - 대소문자, 공백, AND 표기는 위 canonical form을 정확히 따른다.
  - 위 목록 외의 자유 조건식은 허용하지 않는다.

### v1.0 plan 참조 시 condition 평가

- v1.0 plan 참조 시 condition 평가 기준: "결과/결정" 섹션의 `상태` 값 + 최신 Verification JSON의 `verdict` 값을 기준으로 평가한다.
- 해당 정보가 문서에 없으면 미충족으로 처리한다.

### superseded-by

- `superseded-by`는 단일 `plan-id` 값만 허용한다 (1:1 대체 관계).
- 분할 대체 시 대표 후속 plan 하나를 기록한다.

### 하위 호환성

- 기존 plan(v1.0)에는 frontmatter를 소급 적용하지 않는다.
- `template-version` 미지정 시 `1.0`으로 간주한다.

## 11) 동시 실행 규칙

### SoT 잠금 원칙

- 하나의 plan만 특정 SoT 섹션을 수정할 수 있다.
- "범위"에 수정 대상 SoT 경로를 명시하고, 동일 SoT 대상 plan이 존재하면 선행 plan이 종료 상태(`done | cancelled | superseded`)가 될 때까지 대기한다.

### 선행 plan 종료 시 처리

- 선행 plan이 `cancelled | superseded`로 종료된 경우: 후행 plan은 `blocked`로 전환하고, 에이전트가 사용자에게 재계획 여부를 확인한 후 새 plan을 생성하거나 취소한다.
  - 선행 조건이 더 이상 유효하지 않을 수 있으므로 자동 해제하지 않는다.

### 읽기 자유

- SoT를 "참조"만 하는 plan은 동시 실행 가능하다.

### 충돌 처리

- 충돌 발생 시: "결과/결정"에 충돌 사실과 해결 방법을 기록한다.

## 12) 아카이브 규칙

### 아카이브 트리거

| phase 값 | 트리거 조건 |
|-----------|-------------|
| `PHASE0` ~ `PHASE4` | 해당 Phase의 Verification verdict `go` 이후 |
| `PHASE0-4` | 관련 Phase 전체가 `go` 이후 |
| `META` | plan status가 종료 상태(`done | cancelled | superseded`)이면 즉시 아카이브 가능 (Phase Verification 불요) |

### 아카이브 대상

- `done` / `cancelled` / `superseded` 상태의 plan만 아카이브 가능하다.

### 아카이브 경로

- `docs/plan/archive/<phase>/` — phase 값에 따라 분기:
  - `PHASE0` ~ `PHASE4`: `archive/PHASE0/`, `archive/PHASE1/`, ...
  - `PHASE0-4`: `archive/PHASE0-4/`
  - `META`: `archive/META/`

### README 인덱스 연동

- README 인덱스는 3영역으로 고정: **운영 문서** / **실행 Plan (활성)** / **Archive**
- 아카이브 이동 시 활성 테이블에서 Archive 테이블로 행을 이동한다.
- 참조 링크 경로를 갱신한다.

## 13) 핸드오프 규칙

### 핸드오프 문서 필수 추가 항목

- `원본 plan`: 핸드오프 원본 plan 파일명
- `핸드오프 사유`: 이관 이유
- `컨텍스트 요약`: 수신 에이전트가 바로 작업 가능한 3~5줄 요약
- `잔여 작업`: 미완료 단계 목록

### 네이밍

- 원본 topic 유지: `YYYY-MM-DD_handoff_<original-topic>.md`

### 원본 plan 기록

- 원본 plan의 "결과/결정"에 핸드오프 사실과 대상 문서 경로를 기록한다.

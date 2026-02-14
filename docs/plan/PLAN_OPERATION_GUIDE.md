# PLAN Operation Guide

Plan Execute 기록의 표준 운영 규칙입니다.

## 0) Plan Mode 부트스트랩

- Prompt Pack 기반 실행은 `Plan mode`에서 시작한다.
- 실행 시작 시점에 plan 문서를 먼저 생성한다.
  - 경로: `docs/plan/YYYY-MM-DD_<agent>_<topic>.md`
  - 초기 상태: `in_progress`
- 이후 Execution -> Review -> Verification 결과를 같은 문서에 누적 기록한다.
- 종료 시 `결과/결정` 섹션에서 상태를 `done|partial|blocked`로 확정한다.

## 1) 생성 원칙

- Claude Code 또는 Codex에서 `Plan Execute`를 수행할 때마다 문서를 1건 생성한다.
- 동일 작업을 핸드오프하면 `<agent>`를 `handoff`로 기록한다.
- 에이전트는 직접 커밋하지 않는다. 반드시 커밋 메시지를 제안하고, 사용자 승인 후 커밋한다.

## 2) 파일명 규칙

- 경로: `docs/plan/`
- 형식: `YYYY-MM-DD_<agent>_<topic>.md`
- `<agent>` 허용값: `claude-code`, `codex`, `handoff`

예시:
- `2026-02-14_claude-code_phase0-kpi-refresh.md`
- `2026-02-14_handoff_phase0-pack-validation.md`

## 3) 필수 섹션 (누락 금지)

1. 목표
2. 범위
3. 작업 단계
4. 검증 기준
5. 결과/결정

## 4) 상태 규칙

- `in_progress`: 실행 진행 중(초기 생성 상태)
- `done`: 검증 기준 충족
- `partial`: 일부 기준 미충족이나 블로커 없음
- `blocked`: 블로커 존재

`blocked` 또는 `partial`이면 다음 액션을 반드시 기록한다.

## 5) Verification 연계 규칙

- verdict 기계 판정 조건:
  - 확장 허용: `go` 또는 `pending AND blockers.length == 0`
  - 확장 불가: `no-go` 또는 `pending AND blockers.length > 0`

- Verification JSON 최소 스키마:

```json
{
  "phase": "PHASE0",
  "verdict": "go|pending|no-go",
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

## 6) 운영 단계

1. `plan-execute-template.md`로 새 문서 생성
2. 작업 수행/검증 결과 기입
3. 상태(`done|partial|blocked`) 확정
4. 필요 시 후속 plan 문서 생성

## 7) 인덱스 도입 기준

- `docs/plan/*.md`가 10건 이상 누적되면 `docs/plan/README.md`를 생성한다.
- README 필수 컬럼: 파일명, 날짜, agent, 상태, 한줄 요약

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

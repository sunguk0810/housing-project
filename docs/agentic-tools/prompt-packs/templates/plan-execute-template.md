## <!-- template v1.1 -->

plan-id: "YYYY-MM-DD*<agent>*<topic>" # 실제 파일 basename(확장자 제외)
status: "in_progress"
phase: "" # 허용값: PHASE0 | PHASE1 | PHASE2 | PHASE3 | PHASE4 | PHASE0-4 | META
template-version: "1.1"

# work-type: "" # 선택. 허용값: feature | ops | governance | infra

# depends-on:

# - plan-id: ""

# condition: "" # 허용값: "verdict == go" | "status == done" | "status == done AND verdict == go"

# superseded-by: "" # 단일 plan-id 값

---

# Plan Execute: <topic>

## 파일명 규칙

- 경로: `docs/plan/`
- 형식: `YYYY-MM-DD_<agent>_<topic>.md`
- `<agent>` 허용값: `claude-code`, `codex`, `handoff`
- 충돌 시 `-N` 접미사 부여 (`-2`, `-3`, ...)
- 예시: `2026-02-14_handoff_phase0-legal-refresh.md`

## 목표

- 이번 실행에서 달성할 단일 목표를 1~3줄로 작성.

## 범위

- In Scope:
- Out of Scope:
- 참조 SoT:
- 선행 plan: (해당 시, frontmatter depends-on의 요약)

## 작업 단계

1. 단계 1
2. 단계 2
3. 단계 3

## 검증 기준

1. 필수 검증 항목 1
2. 필수 검증 항목 2
3. 게이트 판정 기준

## 결과/결정

- 상태: `done | partial | blocked | cancelled | superseded`
- 핵심 결과:
- 미해결 이슈:
- 다음 액션:

## Verification 이력

<!-- Run을 누적 추가한다. 덮어쓰기 금지. 최신 Run이 유효 verdict. -->
<!-- Run 누적은 in_progress | partial | blocked 상태에서만 허용. -->

### Run 1 (YYYY-MM-DD)

```json
{
  "phase": "",
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

<!-- 필요 시 핸드오프 섹션 추가 -->
<!--
## 핸드오프

- 원본 plan:
- 핸드오프 사유:
- 컨텍스트 요약: (수신 에이전트가 바로 작업 가능한 3~5줄 요약)
- 잔여 작업:
-->

## 체크리스트

- [ ] 파일명 규칙 충족
- [ ] 필수 섹션 5개 존재
- [ ] SoT 참조 경로 포함
- [ ] 자동 커밋 없음 (수동 커밋 정책 준수)
- [ ] YAML frontmatter 포함 (plan-id, status, phase) — template-version >= 1.1에 한함
- [ ] depends-on 참조 plan의 condition 평가 충족 확인 (해당 시)

<!-- done 상태 확정 후 내용 변경이 필요하면 비의미 변경만 아래에 기록 -->
<!--
## 비의미 변경 이력
| 날짜 | 편집자 | 사유 |
|------|--------|------|
-->

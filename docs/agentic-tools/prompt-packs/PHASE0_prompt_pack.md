# PHASE0 Prompt Pack

이 문서는 `PHASE0` 작업을 위한 표준 프롬프트 묶음입니다.

## 목적

- `docs/PHASE0_ground.md`를 정본(SoT)으로 유지하면서 업데이트 작업을 표준화한다.
- Execution -> Review -> Verification 흐름을 고정한다.
- Plan Execute 기록(`docs/plan/`)과 연결한다.

## Plan Mode 부트스트랩 규칙 (필수)

- 이 Prompt Pack은 `Plan mode`에서 실행한다.
- 시작 직후 `docs/plan/YYYY-MM-DD_<agent>_<topic>.md`를 먼저 1건 생성하고 상태를 `in_progress`로 둔다.
- 생성한 plan 문서 1건에 Execution -> Review -> Verification 결과를 순차 누적한다.
- Verification 완료 후 같은 문서의 `결과/결정`에 `done|partial|blocked`와 후속 액션을 확정한다.
- `<agent>` 허용값은 `claude-code`, `codex`, `handoff`만 사용한다.

### Plan Mode 시작 프롬프트 (권장)

```markdown
docs/agentic-tools/prompt-packs/PHASE0_prompt_pack.md를 실행 규약으로 사용해.
Plan mode로 수행하고, 시작 즉시 docs/plan/YYYY-MM-DD_claude-code_<topic>.md를 생성해.
같은 plan 문서에 Execution -> Review -> Verification 결과를 누적 기록해.
종료 시 결과/결정에 상태(done|partial|blocked), blockers, next_actions, Verification JSON을 확정해.
```

## 정본 참조 규칙

- SoT 링크 형식: `docs/PHASEX_*.md > SX`
- 예시: `docs/PHASE0_ground.md > S2 Metrics`
- 금지: 동일 정의 복붙(링크 참조만 허용)

## PHASE0 입력 소스 (고정 7개)

1. `docs/legacy_docs/step0_legal_compliance.md`
2. `docs/legacy_docs/step1_define_discovery.md`
3. `docs/legacy_docs/step3_opportunity_priority.md`
4. `docs/legacy_docs/step4_mvp_plan.md`
5. `docs/legacy_docs/merged/PRD_service.md`
6. `docs/legacy_docs/merged/Policy_service.md`
7. `docs/legacy_docs/merged/planning_doc.md`

## Output Contract (Execution 필수 출력)

- O1: 문제정의 1문장
- O2: KPI 계측 스펙
- O3: P0 기능 3개 + Non-goals
- O4: 법무 체크리스트(`defined`/`implemented`/`pending`)

## 1) Execution Prompt

```markdown
당신은 PHASE0 통합 에디터입니다.

## 목표
7개 입력 소스를 근거로 `docs/PHASE0_ground.md`의 정본 품질을 유지/개선한다.

## 입력 소스
1. docs/legacy_docs/step0_legal_compliance.md
2. docs/legacy_docs/step1_define_discovery.md
3. docs/legacy_docs/step3_opportunity_priority.md
4. docs/legacy_docs/step4_mvp_plan.md
5. docs/legacy_docs/merged/PRD_service.md
6. docs/legacy_docs/merged/Policy_service.md
7. docs/legacy_docs/merged/planning_doc.md

## 규칙
- 입력 문서 외 추론은 `[가정]` 표시
- SoT 링크 규칙 준수: docs/PHASEX_*.md > SX
- 같은 정의를 다른 문서에 복붙하지 않음
- 상태값은 defined/implemented/pending만 사용

## 작업
1. 문제정의 1문장 점검/보정 (O1)
2. KPI 계측 스펙 점검/보정 (O2)
3. P0 기능 3개와 Non-goals 점검/보정 (O3)
4. 법무 체크리스트 상태 정규화 (O4)

## 출력 형식
### 변경 요약
- 항목별 변경 이유 1줄

### Output Contract 결과
- O1: ...
- O2: ...
- O3: ...
- O4: ...

### 적용 대상
- docs/PHASE0_ground.md > S1
- docs/PHASE0_ground.md > S2
- docs/PHASE0_ground.md > S3
- docs/PHASE0_ground.md > S4
```

## 2) Review Prompt

```markdown
당신은 PHASE0 문서 리뷰어입니다.

## 목표
Execution 결과가 정본 규칙과 Output Contract를 충족하는지 검토한다.

## 입력
- Execution 결과
- docs/PHASE0_ground.md

## Severity 기준
- Critical: 법무 Must 누락, KPI 분모/분자 불명, SoT 위반(중복 정의)
- High: 이벤트 목록/지표 표 불일치, 상태값 체계 위반
- Medium: 표현 모호성, 추적성 약함
- Low: 가독성/형식

## 점검 항목
1. O1 pass/fail + 결함
2. O2 pass/fail + 결함
3. O3 pass/fail + 결함
4. O4 pass/fail + 결함
5. SoT 링크/중복 정의 위반 여부

## 출력 형식
### Findings (severity 순)
- [Severity] 항목명: 설명 (근거 경로)

### Output Contract 판정
- O1: pass|fail
- O2: pass|fail
- O3: pass|fail
- O4: pass|fail

### Required Fixes
- P0(필수 수정)
- P1(권장 수정)
```

## 3) Verification Prompt

```markdown
당신은 PHASE0 게이트 판정자입니다.

## 목표
Review 결과를 반영해 go/pending/no-go를 판정하고 JSON을 출력한다.

## 입력
- Execution 결과
- Review Findings
- docs/PHASE0_ground.md

## 계산 규칙
- completeness = pass_count / 4
- consistency = SoT 규칙 통과 수 / SoT 규칙 수
- compliance = 법무 Must 충족 수 / 법무 Must 총수

## verdict 규칙
- go: completeness == 1.0 AND consistency >= 0.9 AND compliance == 1.0 AND blockers.length == 0
- pending: blockers.length == 0 이고 go 조건을 일부 미충족
- no-go: blockers.length > 0

## 출력 형식
1) 판정 요약 (3줄 이내)
2) blockers 목록
3) next_actions 목록
4) JSON

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
```

## 실행 순서

1. Plan mode 시작 + plan 문서 생성(`in_progress`)
2. Execution Prompt 실행
3. Review Prompt 실행
4. Verification Prompt 실행
5. 동일 plan 문서에 최종 상태/JSON 확정

## 검증 통과 기준

- Output Contract O1~O4 전부 pass
- Verification JSON 스키마 키 누락 없음
- verdict 값이 `go|pending|no-go` 중 하나
- SoT 위반 0건

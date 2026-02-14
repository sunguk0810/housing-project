# Plan Execute: prompt-pack-v1.2-implementation

## 목표

`PHASE0` 우선 Prompt Pack 체계를 실제 저장소에 반영한다.

## 범위

- In Scope:
  - PHASE0 Prompt Pack 생성
  - Template 2개 생성
  - Prompt Pack Index 생성
  - Plan 운영 가이드 생성
- Out of Scope:
  - PHASE1~4 Prompt Pack 본문 작성
  - 코드 구현/배포
- 참조 SoT:
  - `docs/PHASE0_ground.md > S2`
  - `docs/PHASE0_ground.md > S4`

## 작업 단계

1. `docs/agentic-tools/prompt-packs/` 및 `templates/` 디렉토리 생성
2. `PHASE0_prompt_pack.md` 작성 (Execution/Review/Verification)
3. `plan-execute-template.md`, `codex-task-template.md` 작성
4. `PROMPT_PACK_INDEX.md` 작성 (확장 트리거 포함)
5. `docs/plan/PLAN_OPERATION_GUIDE.md` 작성
6. 파일명/섹션/트리거 규칙 검증

## 검증 기준

1. 산출물 5개 파일이 존재한다.
2. PHASE0 pack에 7개 입력 소스 + 3종 프롬프트가 존재한다.
3. plan 파일명 규칙에 `handoff` 허용이 명시된다.
4. Verification JSON 최소 스키마가 명시된다.
5. 확장 조건에 `pending AND blockers.length == 0`이 포함된다.

## 결과/결정

- 상태: `done`
- 핵심 결과:
  - `docs/agentic-tools/prompt-packs/PHASE0_prompt_pack.md` 생성
  - `docs/agentic-tools/prompt-packs/templates/plan-execute-template.md` 생성
  - `docs/agentic-tools/prompt-packs/templates/codex-task-template.md` 생성
  - `docs/agentic-tools/prompt-packs/PROMPT_PACK_INDEX.md` 생성
  - `docs/plan/PLAN_OPERATION_GUIDE.md` 생성
  - 규칙 검증 통과 (파일명/필수 섹션/확장 트리거)
- 미해결 이슈:
  - PHASE1~4 Prompt Pack은 각 정본 확정 후 순차 작성
- 다음 액션:
  - PHASE1 정본 갱신 시 PHASE1 pack 생성

# Prompt Pack Index

이 문서는 현재 사용 가능한 Prompt Pack과 확장 조건을 정의합니다.

## 현재 상태

| Phase | 상태 | Pack 경로 | 비고 |
|------|------|-----------|------|
| PHASE0 | Active | `docs/agentic-tools/prompt-packs/PHASE0_prompt_pack.md` | 즉시 사용 가능 |
| PHASE1 | TBD | - | 정본 충족 시 생성 |
| PHASE2 | TBD | - | 정본 충족 시 생성 |
| PHASE3 | TBD | - | 정본 충족 시 생성 |
| PHASE4 | TBD | - | 정본 충족 시 생성 |

## 공통 템플릿

- Plan Execute: `docs/agentic-tools/prompt-packs/templates/plan-execute-template.md`
- Codex Task: `docs/agentic-tools/prompt-packs/templates/codex-task-template.md`

## 확장 트리거 (PHASE1~4)

아래 조건을 모두 만족하면 해당 Phase Prompt Pack을 생성한다.

1. `docs/PHASEX_*.md` 파일 존재
2. 필수 섹션 존재: `목표`, `범위`, `산출물`, `게이트 기준`
3. 직전 Phase Verification JSON 조건 충족
   - `verdict == "go"`
   - 또는 `verdict == "pending" AND blockers.length == 0`

## 생성 순서

1. 해당 Phase 정본 확인
2. `<PHASEX>_prompt_pack.md` 작성
3. 샘플 왕복 검증 1건 수행
4. `docs/plan/`에 실행 기록 추가
5. 본 인덱스 상태를 `Active`로 갱신

## 운영 참고

- Plan 기록 운영 규칙: `docs/plan/PLAN_OPERATION_GUIDE.md`
- SoT 링크 규칙: `docs/PHASE0_ground.md` 및 각 PHASE 정본 문서의 링크 정책 준수

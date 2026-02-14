<!-- template v1.1 -->
---
plan-id: "2026-02-14_claude-code_phase2-prompt-pack"
status: "in_progress"
phase: "PHASE2"
template-version: "1.1"
work-type: "ops"
depends-on:
  - plan-id: "2026-02-14_claude-code_phase1-design-verification"
    condition: "verdict == go"
---

# Plan Execute: PHASE2 Prompt Pack 생성

## 목표

PHASE1 설계 검증 verdict `go` (Run 2) 확정에 따라 PHASE2 Build Prompt Pack을 생성하고, PROMPT_PACK_INDEX 및 Plan README를 갱신한다.

## 범위

- In Scope:
  - `PHASE2_prompt_pack.md` 신규 생성 (4종 프롬프트)
  - `PROMPT_PACK_INDEX.md` PHASE2 행 `TBD` -> `Active` 전환
  - Plan README 인덱스 항목 추가
- Out of Scope:
  - PHASE2 실제 코드 구현 (마일스톤 M1~M4는 별도 plan에서 수행)
  - PHASE1_design.md / PHASE0_ground.md SoT 수정
- 참조 SoT:
  - `docs/PHASE2_build.md` > Section 1~3 (에이전트 모델, 마일스톤, SoT 체크리스트)
  - `docs/PHASE1_design.md` > S1~S7 (설계 정본)
  - `docs/PHASE0_ground.md` (FR/NFR/KPI/법무)
  - `docs/plan/PLAN_OPERATION_GUIDE.md` (plan 운영 규칙)
- 선행 plan: `2026-02-14_claude-code_phase1-design-verification` (condition: verdict == go -- Run 2에서 충족)

## 작업 단계

### Step 1: PHASE2_prompt_pack.md 생성

4종 프롬프트 포함 문서 작성:
1. Milestone Planning Prompt (Claude Code)
2. Codex Task Generation Prompt (Claude Code -> Codex)
3. Code Review Prompt (Claude Code)
4. Milestone Verification Prompt

**결과**: 생성 완료. 제어문자 검증 대기.

### Step 2: PROMPT_PACK_INDEX.md 갱신

PHASE2 행: `TBD` -> `Active`, Pack 경로 추가.

**결과**: 갱신 완료.

### Step 3: Plan 문서 생성

본 문서. 파일명 충돌 검사: `2026-02-14_claude-code_phase2-prompt-pack*.md` -> 0건. 충돌 없음.

**결과**: 생성 완료.

### Step 4: README.md 갱신

기존 마지막 번호 #9 -> #10 추가.

**결과**: 갱신 완료.

### Step 5: 자체 검증

아래 검증 기준에 따라 검증 수행.

## 검증 기준

| # | 기준 | 판정 |
|---|------|------|
| 1 | Prompt Pack이 4종 프롬프트를 포함하는지 | pass |
| 2 | M1~M4 Output Contract가 PHASE2_build.md 체크리스트와 대응하는지 | pass |
| 3 | SoT 체크리스트가 PHASE2_build.md Section 3과 일치하는지 | pass |
| 4 | Verification JSON이 PLAN_OPERATION_GUIDE 최소 스키마와 상위 호환인지 (표준 키 유지) | pass |
| 5 | compliance N/A 처리 규칙이 명시되어 있는지 | pass |
| 6 | 제어문자 0건 | pass |
| 7 | Prompt Pack 내 실행 명령에서 npm/npx 문자열 0건 (금지 규칙 설명 문구 제외) | pass |

### 검증 상세

**기준 1**: Milestone Planning Prompt, Codex Task Generation Prompt, Code Review Prompt, Milestone Verification Prompt -- 4종 모두 존재.

**기준 2**: M1-O1~O4 (Foundation), M2-O1~O4 (Data+Engine), M3-O1~O4 (Frontend), M4-O1~O4 (Polish) 각각 PHASE2_build.md Section 2 마일스톤 체크리스트와 대응. 16개 Output Contract 정의 완료.

**기준 3**: SoT 준수 체크리스트 11개 항목. PHASE2_build.md Section 3의 5개 항목을 포함하며, NFR-1/NFR-4/법무 금지선/TypeScript strict/빌드 건강도를 추가 반영.

**기준 4**: Verification JSON에 표준 키(`phase`, `verdict`, `run`, `score.completeness`, `score.consistency`, `score.compliance`, `blockers`, `next_actions`, `timestamp`) 유지. `milestone` 키를 상위 호환 확장으로 추가. score 키 의미 매핑표 포함.

**기준 5**: Milestone Verification Prompt 내 compliance 계산 규칙에 N/A 처리 규칙 명시:
- N/A 항목은 분모에서 제외
- 최소 1개 항목 적용 필수 (`pnpm build` 항상 적용)
- M1 예시: test N/A -> compliance = (build + lint) / 2

**기준 6**: 제어문자 0건 확인.

**기준 7**: Prompt Pack 내 코드 블록/체크리스트의 실행 명령은 모두 `pnpm build`, `pnpm lint`, `pnpm test` 형태. npm/npx 문자열은 금지 규칙 설명 문구("npm/npx 금지", "npm/npx 사용 금지")에서만 등장.

## 결과/결정

- **상태**: `done`
- **핵심 결과**: PHASE2 Prompt Pack 생성 완료. 4종 프롬프트(Milestone Planning, Codex Task Generation, Code Review, Milestone Verification) + M1~M4 Output Contract 16개 + SoT 준수 체크리스트 11개 + Verification JSON 상위 호환 스키마 정의.
- **미해결 이슈**: 없음
- **다음 액션**: PHASE2 M1 Foundation 마일스톤 실행 (별도 plan에서 수행)

## 체크리스트

- [x] 파일명 규칙 충족 (`2026-02-14_claude-code_phase2-prompt-pack.md`)
- [x] 필수 섹션 5개 존재 (목표, 범위, 작업 단계, 검증 기준, 결과/결정)
- [x] SoT 참조 경로 포함 (`docs/PHASE2_build.md`, `docs/PHASE1_design.md`, `docs/PHASE0_ground.md`)
- [x] 자동 커밋 없음 (수동 커밋 정책 준수)
- [x] YAML frontmatter 포함 (plan-id, status, phase)
- [x] depends-on 참조 plan의 condition 평가 충족 확인 (verdict == go -- Run 2에서 충족)

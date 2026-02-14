---
plan-id: '2026-02-14_codex_phase2-m1-t6-sot-hook'
status: 'done'
phase: 'PHASE2'
template-version: '1.1'
work-type: 'feature'
depends-on:
  - plan-id: '2026-02-14_claude-code_phase2-m1-execution'
    condition: 'status == done'
---

# Plan Execute: phase2-m1-t6-sot-hook

## 목표

PHASE2 M1 T6 범위에서 Husky pre-commit hook과 SoT 위반 검사 스크립트를 도입해 커밋 전 자동 차단 게이트를 구축한다.

## 범위

- In Scope:
  - `pnpm add -D husky`
  - `package.json`의 `prepare` 스크립트 반영
  - `.husky/pre-commit` 구성
  - `scripts/check-sot.sh` 신규 생성
  - `bash scripts/check-sot.sh`, `pnpm build`, `pnpm lint` 검증
- Out of Scope:
  - SoT 문서 수정 (`docs/PHASE0_ground.md`, `docs/PHASE1_design.md`, `docs/PHASE2_build.md` 등)
  - T5 포맷 이슈 전체 정리
- 참조 SoT:
  - `docs/PHASE2_build.md > Section 3`
  - `docs/PHASE0_ground.md`
  - `docs/PHASE1_design.md`

## 작업 단계

1. Husky를 설치하고 `pnpm exec husky init`으로 훅 기본 구조를 생성한다.
2. `package.json`에 `prepare: husky`가 반영되었는지 확인한다.
3. `.husky/pre-commit`의 샘플 명령을 `bash scripts/check-sot.sh`와 `pnpm lint`로 교체한다.
4. `scripts/check-sot.sh`를 구현한다.
   - PHASE0 전용 키워드 10개 검사
   - PHASE1 전용 키워드 6개 검사
   - fenced code block(```` ... ````) 제외
   - PHASE4 `result_view` + `>= *[0-9]+` 예외 처리
5. 실행 권한(`chmod +x`)을 부여하고 검증 명령을 실행한다.

## 검증 기준

1. `.husky/pre-commit`에 `bash scripts/check-sot.sh`와 `pnpm lint`가 존재한다.
2. `scripts/check-sot.sh`가 키워드 10+6, 코드블록 제외, PHASE4 예외를 구현한다.
3. 위반 발생 시 `exit 1`, 통과 시 `exit 0` 동작이 보장된다.
4. `pnpm build`, `pnpm lint`가 통과한다.
5. `npm`/`npx` 사용 없이 `pnpm`만 사용한다.

## 결과/결정

- 상태: `done`
- 핵심 결과:
  - `husky`를 devDependencies에 추가하고 `pnpm exec husky init`으로 훅 구조를 생성했다.
  - `package.json`에 `prepare: husky`를 반영했다.
  - `.husky/pre-commit` 샘플 명령을 아래 두 단계로 교체했다.
    - `bash scripts/check-sot.sh`
    - `pnpm lint`
  - `scripts/check-sot.sh`를 생성하고 아래 규칙을 구현했다.
    - PHASE0 전용 키워드 10개 검사
    - PHASE1 전용 키워드 6개 검사
    - fenced code block(```...```) 제외
    - PHASE4 `result_view` + `>= *[0-9]+` 화이트리스트 예외
    - 위반 시 `[SOT VIOLATION]` 출력 후 `exit 1`
  - 실행 권한을 부여했다.
    - `scripts/check-sot.sh`
    - `.husky/pre-commit`
  - 검증 결과:
    - `bash scripts/check-sot.sh`: 통과
    - `pnpm build`: 통과
    - `pnpm lint`: 통과
- 미해결 이슈:
  - 없음
- 다음 액션:
  - 커밋 전 `git commit --no-verify` 미사용 정책을 팀 룰에 명시해 훅 우회 경로를 관리

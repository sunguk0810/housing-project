# Plan Index

## 운영 문서

| 파일명                  | 설명                         |
| ----------------------- | ---------------------------- |
| PLAN_OPERATION_GUIDE.md | Plan 운영 표준 가이드 (v1.1) |

## 실행 Plan (활성)

| #   | 파일명                                                  | 날짜       | agent       | phase    | 상태    | 한줄 요약                                                   |
| --- | ------------------------------------------------------- | ---------- | ----------- | -------- | ------- | ----------------------------------------------------------- |
| 1   | 2026-02-14_claude-code_phase0-4-ground.md               | 2026-02-14 | claude-code | PHASE0-4 | done    | 5-Phase SoT 체계 수립                                       |
| 2   | 2026-02-14_claude-code_phase0-ground-review.md          | 2026-02-14 | claude-code | PHASE0   | done    | PHASE0 리뷰/검증 (verdict: go)                              |
| 3   | 2026-02-14_claude-code_phase1-prompt-pack.md            | 2026-02-14 | claude-code | PHASE1   | done    | PHASE1 Prompt Pack 생성                                     |
| 4   | 2026-02-14_codex_prompt-pack-v1-2-implementation.md     | 2026-02-14 | codex       | PHASE0   | done    | Prompt Pack 인프라 구현                                     |
| 5   | 2026-02-14_claude-code_plan-operation-guide-v1-1.md     | 2026-02-14 | claude-code | META     | done    | PLAN_OPERATION_GUIDE v1.1 개선                              |
| 6   | 2026-02-14_claude-code_design-system.md                 | 2026-02-14 | claude-code | PHASE1   | done    | 디자인 시스템 통합 명세서 생성                              |
| 7   | 2026-02-14_claude-code_phase1-design-verification.md    | 2026-02-14 | claude-code | PHASE1   | done    | PHASE1 설계 검증 Run 1 (no-go) → Run 2 (go)                 |
| 8   | 2026-02-14_claude-code_phase1-design-fix.md             | 2026-02-14 | claude-code | PHASE1   | done    | PHASE1 설계 P0 3건 수정 + Run 2 재검증 (verdict: go)        |
| 9   | 2026-02-14_claude-code_design-preview-showcase.md       | 2026-02-14 | claude-code | PHASE1   | done    | 디자인 시스템 종합 프리뷰 쇼케이스 구현                     |
| 10  | 2026-02-14_claude-code_phase2-prompt-pack.md            | 2026-02-14 | claude-code | PHASE2   | done    | PHASE2 Prompt Pack 생성 (4종 프롬프트)                      |
| 11  | 2026-02-14_claude-code_showcase-visual-modernization.md | 2026-02-14 | claude-code | PHASE1   | done    | 쇼케이스 시각 품질 현대화                                   |
| 12  | 2026-02-14_claude-code_phase2-m1-foundation.md          | 2026-02-14 | claude-code | PHASE2   | done    | M1 Foundation 마일스톤 계획 + Codex 태스크 생성             |
| 13  | 2026-02-14_claude-code_phase2-m1-execution.md           | 2026-02-14 | claude-code | PHASE2   | done    | Phase A 실행: Next.js 16.x + Tailwind v4 + shadcn/ui 초기화 |
| 14  | 2026-02-14_codex_phase2-m1-s7-token-implementation.md   | 2026-02-14 | codex       | PHASE2   | done    | S7 디자인 토큰 v4 매핑 및 shadcn 충돌 분리                  |
| 15  | 2026-02-14_codex_phase2-m1-t5-tooling.md                | 2026-02-14 | codex       | PHASE2   | done    | ESLint/Prettier/.env.example 정비 및 검증                   |
| 16  | 2026-02-14_codex_phase1-schema-sql-migration.md         | 2026-02-14 | codex       | PHASE1   | done    | S2 스키마 SQL/마이그레이션 및 Docker 인프라 구현            |
| 17  | 2026-02-14_codex_phase2-m1-t6-sot-hook.md               | 2026-02-14 | codex       | PHASE2   | done    | Husky pre-commit과 SoT 위반 자동 검사 게이트 구축           |
| 18  | 2026-02-14_claude-code_readme-navigation.md             | 2026-02-14 | claude-code | PHASE2   | done    | 프로젝트 README 네비게이션 문서 생성                        |
| 19  | 2026-02-14_claude-code_m1-partial-cleanup.md            | 2026-02-14 | claude-code | PHASE2   | done    | M1 partial 2건 정리 (#14 S7 토큰, #15 도구 정비)           |
| 20  | 2026-02-14_claude-code_phase2-m1-code-review.md        | 2026-02-14 | claude-code | PHASE2   | done    | M1 Code Review & Milestone Verification                     |
| 21  | 2026-02-15_claude-code_phase2-design-token-darkmode-research.md | 2026-02-15 | claude-code | PHASE2 | done | 디자인 토큰 관리 및 다크모드 구현 전략 리서치               |
| 22  | 2026-02-15_claude-code_phase1-design-system-alternatives.md | 2026-02-15 | claude-code | PHASE1 | done    | 디자인 시스템 4축 대안 리서치 (컬러/타이포/토큰/컴포넌트)   |
| 23  | 2026-02-15_claude-code_phase1-color-palette-alternatives.md | 2026-02-15 | claude-code | PHASE1 | done    | 프롭테크 컬러 팔레트 대안 WCAG/색맹/트렌드 정량 분석       |
| 24  | 2026-02-15_claude-code_phase2-component-library-research.md | 2026-02-15 | claude-code | PHASE2 | done    | React 컴포넌트 라이브러리 및 구현 전략 비교 리서치          |
| 25  | 2026-02-15_claude-code_phase1-typography-research.md | 2026-02-15 | claude-code | PHASE1 | done    | 한글 웹폰트 3종 비교 및 타이포그래피 시스템 대안 분석       |
| 26  | 2026-02-15_claude-code_phase1-design-system-scorecard.md | 2026-02-15 | claude-code | PHASE1 | done    | 디자인 시스템 4축 종합 스코어카드 (100점 만점 가중 평가)    |
| 27  | 2026-02-15_claude-code_p0-design-token-implementation.md | 2026-02-15 | claude-code | PHASE2 | done | P0 디자인 토큰 개선 + 다크모드 기반 구축                    |
| 28  | 2026-02-15_claude-code_showcase-enhancement.md | 2026-02-15 | claude-code | PHASE2 | done | Showcase HTML 고도화 — 4변형 토큰·다크모드·Semantic 시각화 |
| 29  | 2026-02-15_claude-code_showcase-fullscreen-pages.md | 2026-02-15 | claude-code | PHASE2 | done | 풀스크린 프리뷰 + 전체 16개 페이지 쇼케이스 완성 |
| 30  | 2026-02-15_claude-code_m2-implementation-spec.md | 2026-02-15 | claude-code | PHASE2 | done | M2 Data+Engine 구현 상세 설계 (10개 섹션, 52파일 맵) |
| 31  | 2026-02-15_claude-code_m2-ralph-loop-sessions.md | 2026-02-15 | claude-code | PHASE2 | in_progress | M2 Ralph Loop 5세션 실행 (54파일 자율 구현) |

## Archive

| #           | 파일명 | 날짜 | agent | phase | 상태 | 한줄 요약 |
| ----------- | ------ | ---- | ----- | ----- | ---- | --------- |
| (아직 없음) |        |      |       |       |      |           |

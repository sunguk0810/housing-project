# Plan Execute: 5-Phase 정본 체계 구축

## 목표

기존 22개 산재 문서(legacy_docs 8단계 + docs/ 루트 6개)를 1인 개발자에 맞는
5-Phase 정본(SoT) 체계로 전환하고, Claude Code + Codex 페어 운영 모델을 반영한다.

## 범위

1. PHASE0~4 정본 문서 5개 생성
2. 기존 루트 문서 6개를 `legacy_docs/merged/`로 아카이브 이동
3. `legacy_docs/README.md`에 아카이브 안내 추가
4. `docs/plan/` 디렉토리 생성 및 본 계획 문서 기록
5. SoT 규칙 수립 (정본 간 중복 금지, 링크 참조만)

## 작업 단계

1. **소스 문서 읽기** — 10개 소스 문서 전문 분석
   - PHASE0 소스 7개: step0, step1, step3, step4, PRD, Policy, planning_doc
   - PHASE1 소스 3개: detailed_plan, implementation_plan, portfolio_direction_plan
2. **PHASE0_ground.md 생성** — 7개 소스에서 문제정의, KPI 계측 스펙, MVP 범위, 법무 체크리스트 추출/통합
3. **PHASE1_design.md 생성** — 3개 소스에서 아키텍처, DB 스키마, API 명세, 스코어링 로직, UI 플로우 통합 (중복 제거)
4. **PHASE2_build.md 생성** — 마일스톤, 에이전트 운영 모델, SoT 준수 체크리스트 정의
5. **PHASE3_verify.md 생성** — 2계층 검증 체계, 커버리지 기준, 완료 기준 정의
6. **PHASE4_ship_learn.md 생성** — 릴리스 체크리스트, 롤백 정책, Learning Log 구조
7. **아카이브 이동** — 6개 루트 문서를 `legacy_docs/merged/`로 이동
8. **README 업데이트** — 아카이브 안내 문구 추가
9. **검증** — 10개 검증 항목 확인

## 검증 기준

1. docs/에 PHASE0~4 정본 5개 존재
2. docs/legacy_docs/merged/에 기존 루트 문서 6개 이동 완료
3. docs/legacy_docs/README.md에 "아카이브, 정본 아님" 문구 추가
4. PHASE0에 KPI 계측 스펙(이벤트/분모/분자/기간/표본) 포함
5. PHASE2에 SoT 준수 PR 체크리스트 포함
6. PHASE3에 핵심 모듈 커버리지 >= 80% 기준 포함
7. 정본 간 내용 중복 없음 (링크 참조만)
8. Plan Execute 문서가 docs/plan/에 존재
9. 파일명이 `YYYY-MM-DD_<agent>_<topic>.md` 규칙 충족
10. 필수 섹션 (목표/범위/작업 단계/검증 기준/결과·결정) 충족

## 결과/결정

- **수행 에이전트**: Claude Code
- **수행일**: 2026-02-14
- **결과**: 완료
  - PHASE0_ground.md: 7개 소스에서 추출. 문제정의, KPI 10개 이벤트, P0 3개 기능, 법무 10항목
  - PHASE1_design.md: 3개 소스에서 통합. 스코어링 로직 1곳만 유지 (S4), DB 스키마 1곳만 유지 (S2)
  - PHASE2_build.md: 4개 마일스톤, 에이전트 루프, SoT 체크리스트, Codex 프롬프트 템플릿
  - PHASE3_verify.md: 2계층 검증, 핵심 모듈 80% 기준, 완료 기준 10항목
  - PHASE4_ship_learn.md: 릴리스 체크리스트 10항목, 롤백 3트리거, Learning Log
  - 6개 루트 문서 legacy_docs/merged/로 이동 완료
  - legacy_docs/README.md 아카이브 안내 추가 완료

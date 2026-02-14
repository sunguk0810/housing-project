---
plan-id: "2026-02-14_claude-code_phase1-design-fix"
status: "done"
phase: "PHASE1"
template-version: "1.1"
work-type: "feature"
---

# Plan Execute: PHASE1 설계 P0 수정 (Fix)

## 목표

PHASE1 검증 Run 1(verdict: no-go)에서 발견된 P0 3건(Blocker 1건 + P0 non-blocker 2건)을 `docs/PHASE1_design.md` S1에 반영하여 PHASE2 진입 조건을 충족한다.

## 범위

- In Scope: `docs/PHASE1_design.md` > S1 수정 (보안 설계, APM 정책, TypeScript strict)
- Out of Scope: S2(DB 스키마), S4(스코어링 로직) SoT 수정, P1 항목 4건
- 참조 SoT: `docs/PHASE0_ground.md` (NFR-1/3/6 원문 교차참조)
- 선행 plan: `2026-02-14_claude-code_phase1-design-verification`
  - 참조 run: Run 1 (verdict: no-go)
  - 참조 항목: blockers 1건 (P0-Blocker) + P0 non-blocker 2건

> formal `depends-on` 미사용 (canonical condition에 `status == blocked` 없음)

## 작업 단계

### Step 1: Fix Prompt Pack 생성

- 파일: `docs/agentic-tools/prompt-packs/PHASE1_fix_prompt_pack.md`
- FC-1/FC-2/FC-3 정의 + Execution/Review 프롬프트 포함
- 제어문자 검증 완료 (0건)

### Step 2: PROMPT_PACK_INDEX.md 갱신

- PHASE1 Fix 항목을 `Draft`로 등록

### Step 3: Execution (FC-1/FC-2/FC-3 수정)

#### FC-1 (Critical/Blocker): 보안 설계 서브섹션 추가

S1에 "보안 설계 (NFR-3)" 서브섹션 신규 추가:

| 영역 | 설계 | 구현 기준 |
|------|------|----------|
| 전송 암호화 | HTTPS/TLS 1.2+ 강제 | CDN/호스팅 레벨 HTTPS + HSTS 헤더 |
| 저장 암호화 | DB 저장 데이터 AES-256 이상 암호화 | 관리형 DB의 encryption at rest 활성화 |
| 접근 제어 | 최소 권한 원칙 | DB 서비스 계정 분리 (read-only ETL / read-write API), API 키 환경변수 관리 |
| API 보안 | 레이트 리미팅 + 입력 검증 | Next.js middleware + S5 입력 검증 규칙 연계 |
| 환경변수 | 시크릿 관리 | `.env.local` (로컬) + 호스팅 플랫폼 시크릿 관리 (배포) |
| CORS | 허용 오리진 제한 | Next.js CORS 설정 (자사 도메인만 허용) |

#### FC-2 (High/P0): 모니터링/APM 정책 추가

S1에 "모니터링/APM 정책 (NFR-1 연계)" 서브섹션 신규 추가:

- APM: PII 미수집 정책. 성능 메트릭만 수집
- 에러 트래킹: 사용자 입력값(cash/income/loans/job1/job2) 미포함
  - 스택 트레이스/에러 메타데이터 PII 마스킹 처리 필수
  - 에러 컨텍스트에 요청 파라미터 자동 첨부 비활성화
- 로그: 민감 정보 로그 미기록 (-> S5 입력 검증 규칙 참조)
- 전체 파이프라인(DB/로그/APM) PII 비저장 원칙: PHASE0 NFR-1 참조

#### FC-3 (High/P0): TypeScript strict 모드 명시

S1 기술 스택 Frontend 항목 변경:
- 변경 전: `Frontend: Next.js + React + TypeScript + Tailwind CSS + shadcn/ui`
- 변경 후: `Frontend: Next.js + React + TypeScript (strict 모드) + Tailwind CSS + shadcn/ui`

### Step 4: Review (FC 충족 검증)

#### FC 충족 판정

- **FC-1: pass** — NFR-3의 6개 영역(전송 암호화, 저장 암호화, 접근 제어, API 보안, 환경변수, CORS) 모두 S1 "보안 설계 (NFR-3)" 서브섹션에 명시
- **FC-2: pass** — NFR-1의 "DB/로그/APM 전체 파이프라인" PII 비저장이 S1 "모니터링/APM 정책 (NFR-1 연계)" 서브섹션에 명시. APM PII 미수집, 에러 트래킹 PII 미포함, 로그 민감 정보 미기록 모두 포함
- **FC-3: pass** — S1 기술 스택에 "TypeScript (strict 모드)" 명시

#### 잔여 이슈

- 없음 (FC 3건 모두 pass)

#### Fix 완료 판정

- 모든 FC pass → Fix 완료. Run 2 재검증 진행

### Step 5: Run 2 재검증

- 검증 plan(`2026-02-14_claude-code_phase1-design-verification`)에 Run 2 추가 완료
- Run 2 verdict: **go** (completeness 1.00, consistency 1.00, compliance 1.00, blockers 0)
- 검증 plan 상태: `blocked` → `done` 전환 완료
- PROMPT_PACK_INDEX: PHASE1 Fix `Draft` → `Active` 전이 완료

## 검증 기준

| # | 기준 | 판정 |
|---|------|------|
| 1 | FC-1 충족: NFR-3의 4개 요소(HTTPS/TLS, 저장 암호화, 최소 권한, 접근 제어) 모두 S1에 명시 | 충족 |
| 2 | FC-2 충족: NFR-1의 APM 파이프라인 PII 비저장이 S1에 명시 | 충족 |
| 3 | FC-3 충족: S1 기술 스택에 "strict 모드" 명시 | 충족 |
| 4 | SoT 위반 0건 (S2/S4 무변경) | 충족 |
| 5 | 금지 문구 0건 | 충족 |
| 6 | Provider-agnostic 원칙 준수 | 충족 |

## 결과/결정

- **상태**: `done`
- **핵심 결과**: PHASE1 설계 P0 3건 수정 완료. Run 2 재검증 verdict `go`. PHASE2 진입 가능.
  - FC-1 (NFR-3 보안 설계): S1에 "보안 설계" 서브섹션 추가 (6개 영역)
  - FC-2 (NFR-1 APM 비저장): S1에 "모니터링/APM 정책" 서브섹션 추가
  - FC-3 (NFR-6 TypeScript strict): S1 기술 스택에 "(strict 모드)" 명시

## 체크리스트

- [x] 파일명 규칙 충족 (`2026-02-14_claude-code_phase1-design-fix.md`)
- [x] 필수 섹션 5개 존재 (목표, 범위, 작업 단계, 검증 기준, 결과/결정)
- [x] SoT 참조 문구 포함 (`docs/PHASE0_ground.md` NFR-1/3/6, `docs/PHASE1_design.md` > S1)
- [x] 결과/결정에 상태와 후속 액션 포함
- [x] YAML frontmatter 포함 (plan-id, status, phase)
- [x] depends-on 미사용 (canonical condition 해당 없음)

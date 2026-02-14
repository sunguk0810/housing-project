# PHASE1 Fix Prompt Pack

## 목적

PHASE1 설계 검증(Run 1)에서 verdict `no-go`로 확정된 P0 항목 3건을 수정하기 위한 실행 규약이다.
Fix 완료 후 기존 검증 plan에 Run 2를 추가하여 verdict `go` 전환을 확인한다.

## 전제 조건

1. PHASE1 검증 plan(Run 1)이 `blocked` 상태로 존재
2. Run 1 verdict: `no-go`, blockers 1건 + P0 non-blocker 2건
3. `docs/PHASE1_design.md`가 수정 대상 (S1 비-SoT 섹션만 수정)
4. S2(DB 스키마), S4(스코어링 로직) SoT는 수정하지 않음

## 정본 참조 규칙

- SoT 링크 형식: `docs/PHASEX_*.md > SX`
- S2(DB 스키마)와 S4(스코어링 로직)는 `docs/PHASE1_design.md`가 유일한 수정 지점
- 본 fix는 S1(시스템 아키텍처) 비-SoT 섹션만 수정한다. SoT 잠금 불필요
- 중복 정의 금지: 새로 추가하는 내용이 다른 문서에 복붙되지 않도록 함
- Provider-agnostic 원칙: 특정 벤더명(Supabase, AWS RDS, Vercel Analytics, Sentry 등)을 고정하지 않음

## Fix Contract (FC) - P0 항목 정의

| FC   | Finding                        | Severity           | 수정 대상                                | 요구사항 원문 (PHASE0)                                         |
| ---- | ------------------------------ | ------------------ | ---------------------------------------- | -------------------------------------------------------------- |
| FC-1 | NFR-3 보안 설계 완전 부재      | Critical (Blocker) | S1 기술 스택 + 신규 "보안 설계" 서브섹션 | "HTTPS/TLS, 저장 암호화, 최소 권한 접근 제어"                  |
| FC-2 | NFR-1 APM 비저장 미명시        | High (P0)          | S1 기술 스택 또는 보안 설계 서브섹션     | "DB/로그/APM 전체 파이프라인에 개인정보 저장 금지. PII 마스킹" |
| FC-3 | NFR-6 TypeScript strict 미명시 | High (P0)          | S1 기술 스택                             | "Next.js + TypeScript strict 모드. 모듈화"                     |

### P1 항목 - 이번 fix 범위 제외

P1 4건(S4 엣지케이스, S1 Mermaid, crime_rate 네이밍, 토큰 매핑 표)은 별도 후속 plan에서 처리한다.

## 1) Execution Prompt (Fix 수행)

```markdown
당신은 PHASE1 설계 수정자입니다.

## 목표

PHASE1 검증(Run 1)에서 발견된 P0 항목을 `docs/PHASE1_design.md`에 반영한다.

## 수정 근거

선행 plan: <실제 검증 plan-id>
참조 run: Run 1 (verdict: no-go)
참조 항목: blockers 1건 (P0-Blocker) + P0 non-blocker 2건

## 규칙

- **SoT 범위**: PHASE1 SoT 항목은 S2(DB 스키마)와 S4(스코어링 로직)이며, 이 두 섹션은 PHASE1_design.md가 유일한 수정 지점이다
- **본 fix 수정 범위**: S1(시스템 아키텍처) 비-SoT 섹션만 수정한다. S2/S4는 본 fix에서 수정하지 않는다
- SoT 링크: docs/PHASEX\_\*.md > SX 형식 유지
- 중복 정의 금지: 새로 추가하는 내용이 다른 문서에 복붙되지 않도록 함
- 입력 문서 외 추론은 [가정] 표시
- **Provider-agnostic**: 특정 벤더명(Supabase, AWS RDS, Vercel Analytics, Sentry 등)을 고정하지 않음. 보안/정책 요구사항 수준만 명시

## 작업

1. **FC-1 (Critical/Blocker)**: S1에 "보안 설계" 서브섹션 추가
   - HTTPS/TLS 1.2+ 강제 (호스팅 레벨 HTTPS + HSTS)
   - 저장 암호화 (관리형 DB encryption at rest 활성화)
   - 최소 권한 접근 제어 (DB 서비스 계정 분리, API 키 환경변수)
   - API 보안 (레이트 리미팅, CORS)
2. **FC-2 (High/P0)**: S1에 "모니터링/APM 정책" 추가
   - APM PII 미수집 정책
   - 에러 트래킹 사용자 입력 미포함
   - 스택 트레이스/에러 메타데이터 PII 마스킹 규칙
   - 전체 파이프라인(DB/로그/APM) PII 비저장 원칙 (-> PHASE0 NFR-1 참조)
3. **FC-3 (High/P0)**: S1 기술 스택에 "TypeScript (strict 모드)" 명시

## 출력 형식

### 변경 요약

- FC별 수정 내용 1줄 요약

### 수정 상세

- FC-1: 추가된 보안 설계 내용
- FC-2: 추가된 APM 정책 내용
- FC-3: 변경된 기술 스택 라인

### SoT 영향 분석

- 수정한 섹션 목록
- SoT 규칙 위반 여부
```

## 2) Review Prompt (수정 검증)

```markdown
당신은 PHASE1 설계 수정 검증자입니다.

## 목표

Execution에서 수행된 SoT 수정이 FC 항목을 모두 해소하는지 검증한다.

## 입력

- Execution 수정 결과
- docs/PHASE1_design.md (수정 후)
- docs/PHASE0_ground.md (NFR 원문 교차참조)

## 점검 항목

1. FC-1 충족 여부: NFR-3의 4개 요소(HTTPS/TLS, 저장 암호화, 최소 권한, 접근 제어) 모두 S1에 명시되었는지
2. FC-2 충족 여부: NFR-1의 "DB/로그/APM 전체 파이프라인" 중 APM이 S1에 명시되었는지
3. FC-3 충족 여부: S1 기술 스택에 "strict 모드"가 명시되었는지
4. SoT 링크 규칙 위반 없는지
5. 새 내용이 PHASE0 요구사항과 모순되지 않는지
6. 금지 문구 포함 여부 (CLAUDE.md 법무/컴플라이언스 금지선)

## 출력 형식

### FC 충족 판정

- FC-1: pass|fail (근거)
- FC-2: pass|fail (근거)
- FC-3: pass|fail (근거)

### 잔여 이슈

- 발견된 문제 (있을 경우)

### Fix 완료 판정

- 모든 FC pass -> Fix 완료. Run 2 재검증 진행 가능
- 하나라도 fail -> 재수정 필요
```

## 실행 순서

1. Plan mode 시작 + fix plan 문서 생성 (`in_progress`)
2. Execution Prompt 실행 (FC-1/FC-2/FC-3 수정)
3. Review Prompt 실행 (FC 충족 검증)
4. FC 전부 pass 시: 검증 plan에 Run 2 재검증 추가
5. 동일 fix plan 문서에 최종 상태 확정

## 검증 통과 기준

- FC-1/FC-2/FC-3 전부 pass
- SoT 위반 0건 (S1만 수정, S2/S4 무변경)
- 금지 문구 0건
- Provider-agnostic 원칙 준수 (특정 벤더명 미포함)
- Run 2 재검증에서 verdict `go` 확인 시 Fix 완료

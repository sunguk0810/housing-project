# Step3 Preflight Check

Status: done  
Owner: sungwookhwang  
Date: 2026-02-13

목적:
- Step2 완료 이후 Step3 진입 전, 핵심 게이트를 한 번에 점검하는 운영용 체크 문서
- 원본 리서치 문서(`references/step3_readiness/claude_result.md`)는 수정하지 않고, 실행 관점만 별도 정리

기준 문서:
- `docs/planning/step2_summary.md`
- `docs/planning/step2_experiment_plan.md`
- `docs/planning/step0_legal_compliance.md`
- `docs/planning/references/red_team/round2/round2_adjudication.md`
- `docs/planning/references/red_team/round3/round3_adjudication.md`
- `docs/planning/references/step3_readiness/claude_result.md`
- `docs/planning/references/step3_readiness/results/step3_readiness_adjudication.md`

## 1) Current Snapshot

- Step2 판정: `Conditional Pass`
- Red-Team Round1/2/3: 모두 `completed`
- fatal_found: `false`
- step3_gate: `go` (Portfolio Override)

해석:
- Production 기준은 `pending`이나, 본 프로젝트는 포트폴리오 목적의 문서/설계/개발 데모 트랙으로 `go` 예외 승인

## 1.1) Q&A Lock (확정)

- Q1: `A` — 3단 플로우(`No-Input Teaser -> 최소 입력 -> 정밀 입력`) 채택
- Q2: `A` — 재무 입력은 범위/프리셋 기본 + 정확값 선택 입력
- Q3: `A` — 신뢰 UI 최소세트(점수분해/출처/갱신일/단점/Why-Not) 전부 P0
- Q4: `A` — 광고/제휴/중개 오인 방지 3중 고지 채택
- Q5: `A*` — Production은 조건부 진입 + 법무 일정/오너/기한 확정, 포트폴리오는 예외 승인 후 진행
- Q6: `A` — 비동기 문의 CTA 기본, 전화 문의는 선택 2차
- Q7: `A` — `result_to_inquiry_ctr` 게이트 기준 고정
- Q8: `A` — 법무 선결과제 2주 윈도우(2026-02-13 ~ 2026-02-27)

## 2) Gate Definition (실행 기준)

| 판정 | 기준 | 현재 상태 |
| --- | --- | --- |
| go | 치명결함 0건 + 입력/신뢰 P0 대응안 확정 + 법무 선결과제 일정/오너/기한 확정 | **포트폴리오 예외 승인으로 현재 적용** |
| pending | 치명결함 0건 + 대응 방향은 합의됐으나 일부 P0 항목 미완료 | Production 기준에서는 해당 |
| no-go | 치명결함 발견 또는 핵심 리스크 대응안 부재 | 미해당 |

### 운영 수치 기준 (Adjudication 반영)

- `result_to_inquiry_ctr >= 8%` -> `go`
- `5% <= result_to_inquiry_ctr < 8%` -> `pending`
- `result_to_inquiry_ctr < 5%` -> `no-go`
- `input_completion_rate >= 18%` -> `go`
- `12% <= input_completion_rate < 18%` -> `pending`
- `input_completion_rate < 12%` -> `no-go`
- 판정 최소 표본: `result_view >= 500` [가정]
- 판정 최소 기간: `14일` [가정]

### Portfolio Override (2026-02-13)

- 목적: 포트폴리오용 End-to-End 산출물(기획 -> 설계 -> 개발) 완결
- 예외 사유: 법무 선결 3건의 실무 오너 할당이 현재 환경에서 불가
- 적용 범위: `Step3 -> Step4` 진행 허용, 단 `출시 승인` 근거로 사용 금지
- 추후 복원: 실서비스 전환 시 Production 기준(`pending`)으로 재복귀 후 법무 P0 재검증

## 3) Pre-Step3 Must-Do

### P0 (Step3 시작 전 확정)

- [x] `No-Input Teaser -> 최소 입력 -> 정밀 입력` 3단 플로우 정책 확정
- [x] 직장2/예산/월상한 입력 정책 확정(범위/프리셋 + Optional)
- [x] 신뢰 UI 최소 세트 범위 확정(점수 분해/출처/갱신일/단점/Why-Not)
- [x] 광고/제휴/중개 오인 방지 정책 범위 확정(3중 고지)
- [ ] 법무 선결 3건(공인중개사법 자문/위치정보 신고/표시광고 스키마) 일정·오너·기한 문서 확정 (Production 전환 시 필수)
- [x] `input_completion_rate` 게이트 임계값(`>=18 / 12~18 / <12`) 운영 문서 반영
- [x] `result_to_inquiry_ctr` no-go 하한(`3% -> 5%`) 운영 문서 반영
- [x] 최소 표본/기간(`500건 / 14일`) 판정 규칙 운영 문서 반영
- [x] 포트폴리오 예외 승인 기록 및 Step3 진행 승인

### P1 (Step3 초기 1주 내)

- [ ] 전화 없는 비동기 문의 CTA 기본 경로 설정
- [ ] 퍼널 이벤트 5종 스키마 고정
- [ ] `result_to_inquiry_ctr` 대시보드 추가
- [ ] 통근 시간 범위+가정 표기 전환
- [ ] 입력 폼 안심 문구 표준화

## 4) Step3 Entry Decision

- today verdict: `go` (Portfolio Override)
- entry decision: `Step3 진행 승인`
- decision owner: sungwookhwang
- decision date: 2026-02-13
- note: Q&A Loop(Q1~Q8) 확정 완료. 포트폴리오 트랙으로 Step3 진행, 실서비스 전환 시 법무 선결과제 완료 후 Production 게이트 재판정.

## 4.1) Legal Window (Q8 확정)

- 운영 기간: `2026-02-13 ~ 2026-02-27` (2주)
- 대상:
  1. 공인중개사법 외부 자문
  2. 위치정보 신고/약관/동의/보호조치 계획
  3. 2025 표시·광고 표기 스키마 반영 계획
- 오너:
  - Product: TBD
  - Legal/Compliance: TBD
  - Engineering: TBD
- 상태: 오너 미확정(TBD)으로 Production 기준 `P0 미충족` 유지, 포트폴리오 트랙은 예외 승인

## 5) Risk Acceptance (선택)

Production 기준으로 Step3가 pending 상태일 경우:

1. KPI 하방 리스크를 수용한다.
2. P0 항목의 완료 기한을 스프린트 첫 주에 고정한다.
3. 법무 선결과제는 별도 트랙으로 주간 점검한다.

승인:
- PM:
- Product/Design:
- Legal/Compliance:

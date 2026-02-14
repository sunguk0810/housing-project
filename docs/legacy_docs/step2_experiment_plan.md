# Step 2 Experiment Plan

Status: done (AI Proxy only)  
Date: 2026-02-13

## 0) Execution Mode

- 현재 모드: `AI Proxy only`
- 제약: 실제 인터뷰/리쿠르팅/실트래픽 실험 실행 불가
- 1차 결론: `Conditional Go`
- 우선 KPI: `컨시어지 문의 CTR`
- 병행 게이트: `Legal Compliance Gate (pending)`

Method note:

- 현재 Step2 실험은 타겟 퍼소나를 대입한 LLM 기반 `가상 실험`이며, 실제 사용자 인터뷰를 대체하는 임시 프로세스다.
- 실제 리서치 표준은 `타겟 사용자 인터뷰 -> 현재 행동/고통 확인 -> 꼬리질문으로 기준 검증 -> 프로토타입 관찰 -> 정량 실험` 순서로 진행되어야 한다.
- Human Validation 재개 시, 본 문서의 가정 수치는 우선 재보정한다.
- 법무 판정은 별도 기준 문서(`step0_legal_compliance.md`)와 동기화해 운영한다.

## 1) Round 1 Completed (AI Proxy)

실행 완료:

- 가상 인터뷰 3건 + 결과 문서 3건 통합
- 모델 간 충돌 항목 보수 채택
- Step2 1차 판정

참조 문서:

- `docs/planning/references/virtual_interview/interview/claude_interview.md`
- `docs/planning/references/virtual_interview/interview/gemini_interview.md`
- `docs/planning/references/virtual_interview/interview/gpt_interview.md`
- `docs/planning/references/virtual_interview/result/claude_result.md`
- `docs/planning/references/virtual_interview/result/gemini_result.md`
- `docs/planning/references/virtual_interview/result/gpt_result.md`

Round 1 요약 [가정]:

- Pain>=4: 80~85%
- 민감정보 수용: 65~70% (경계)
- 판정: `Conditional Go`

## 2) KPI Spec (고정)

- 랜딩 문의 CTR = `landing_contact_click / landing_unique_view`
- 컨시어지 문의 CTR = `concierge_contact_click / concierge_unique_view`
- 최소 입력 완료율 = `min_input_complete / min_input_start`

보수 가정치 [가정]:

| KPI | 보수 | 기준 | 낙관 | 임계치 |
| --- | --- | --- | --- | --- |
| 랜딩 문의 CTR | 3~5% | 6~9% | 10~13% | 12% |
| 컨시어지 문의 CTR | 9~12% | 18~21% | 24~28% | 20% |
| 최소 입력 완료율 | 30~45% | 50~60% | 65%+ | 50% |

## 3) Round 2 Plan (AI Red-Team)

목표:

- 실사용자 데이터 없이 가정의 취약점을 먼저 공격해 Step3 리스크를 줄인다.

### Experiment R1: Conversion Stress Test (1순위)

- 가정: 컨시어지 CTR이 과대추정되었을 가능성
- 방식: 최저 시나리오(보수 하단)에서 가치제안 유지 여부 점검
- 산출물: 전환 하방 시나리오 대응안
- 상태: completed (GPT/Claude/Gemini 비교 완료)
- 결과 문서:
  - `docs/planning/references/red_team/round1/round1_gpt.md`
  - `docs/planning/references/red_team/round1/round1_claude.md`
  - `docs/planning/references/red_team/round1/round1_gemini.md`
  - `docs/planning/references/red_team/round1/round1_adjudication.md`
- 핵심 결론 (Adjudication):
  - Verdict: `Conditional Pass` (3모델 공통)
  - Fatal: `false` (3모델 공통)
  - Step3 Gate: `pending` (3모델 공통)
  - Round1 채택 스트레스 기준:
    - 컨시어지 CTR: `5~8%` [가정]
    - 랜딩 CTR: `2~4%` [가정]
    - 최소 입력 완료율: `20~30%` [가정]
  - 보완책:
    - `신뢰 UI + 점진 입력 + 리포트 템플릿 표준화`

### Experiment R2: Input Friction Stress Test

- 가정: 민감정보 입력 거부가 예상보다 높을 가능성
- 방식: 무입력/최소입력/정밀입력 3개 플로우 비교 반박
- 산출물: 기본 입력 플로우 확정안
- 상태: completed (GPT/Claude/Gemini 비교 + Adjudication 완료)
- 결과 문서:
  - `docs/planning/references/red_team/round2/gpt_result.md`
  - `docs/planning/references/red_team/round2/gemini_result.md`
  - `docs/planning/references/red_team/round2/claude_result.md`
  - `docs/planning/references/red_team/round2/round2_adjudication.md`
- 핵심 결론 (Adjudication):
  - Verdict: `Conditional Pass`
  - Fatal: `false`
  - Step3 Gate: `pending`
  - Round2 채택 스트레스 기준:
    - 최소 입력 완료율: `15~25%` [가정]
    - 컨시어지 CTR: `3~8%` [가정]
    - 랜딩 CTR: `1~3.0%` [가정]

### Experiment R3: Trust Breakdown Stress Test

- 가정: 추천 결과가 광고/제휴로 인식될 가능성
- 방식: 근거표시/단점표시/출처표시 유무별 전환 논리 재평가
- 산출물: 신뢰 UI 최소 필수요소 확정
- 상태: completed (GPT/Claude/Gemini 비교 + Adjudication 완료)
- 결과 문서:
  - `docs/planning/references/red_team/round3/gpt_result.md`
  - `docs/planning/references/red_team/round3/gemini_result.md`
  - `docs/planning/references/red_team/round3/claude_result.md`
  - `docs/planning/references/red_team/round3/round3_adjudication.md`
- 핵심 결론 (Adjudication):
  - Verdict: `Conditional Pass`
  - Fatal: `false`
  - Step3 Gate: `pending`
  - Round3 채택 스트레스 기준:
    - result_to_inquiry_ctr: `3~10%` [가정]
    - 컨시어지 CTR: `2~5.5%` [가정]
    - 랜딩 CTR: `0.5~1.8%` [가정]
    - 최소 입력 완료율: `15~22%` [가정]

## 3.1) Legal Compliance Baseline (병행)

- 기준 문서: `docs/planning/references/legal_compliance/legal_compliance_adjudication.md`
- 운영 문서: `docs/planning/step0_legal_compliance.md`
- 현재 판정:
  - Verdict: `Conditional Pass`
  - fatal_found: `false`
  - Step3 Gate: `pending`
- 선결 과제:
  1. 중개 오인 제거 + 거래성사형 CPA 금지
  2. 동의 분리/정책 버전/파기 절차 구현
  3. DB+로그+APM 비저장 통제
  4. 위치기반 신고/약관/동의/보호조치 계획 확정
  5. 크롤링 금지 + 공공/API/제휴 소스 고정

## 4) Decision Rule (Step3 Gate)

Step3 진입 조건:

1. Red-Team 치명결함 0건
2. 컨시어지 CTR 기준 가정(18~21%) 유지 가능 또는 보완책 존재
3. 핵심 리스크 5개 대응책 문서화 완료
4. `step0_legal_compliance.md` Step3 선결 항목이 완료 또는 일정/오너/기한이 확정됨

판정:

- 조건 충족: Step3 조건부 진입
- 조건 미충족: Step2 보완 라운드 추가

## 5) Backlog (실행 가능 시)

실사용자 검증 가능해지면 즉시 재개:

1. 실제 인터뷰 10쌍(최소 5쌍)
2. 랜딩 A/B/C 실험(최소 500 유니크)
3. 전세/매매 탭 KPI 분리 측정

## 6) Q&A Loop 결과 (확정)

- Q1: 1순위 KPI = 컨시어지 문의 CTR
- Q2: 실사용자 실험 = 현재 실행 불가
- Q3: 대체 실험 = AI Red-Team 우선
- Q4: Red-Team 1순위 = 전환성 반박
- Q5: Step3 진입 = 조건부
- Q6: 법무/컴플라이언스 게이트 = 조건부(`pending`)

## 7) Round Progress

- Round1 (Conversion Stress Test): completed
- Round2 (Input Friction Stress Test): completed
- Round3 (Trust Breakdown Stress Test): completed

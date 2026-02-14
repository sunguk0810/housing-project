# Step 2. Market Discovery

Status: done (AI Proxy only)  
Owner: sungwookhwang  
Date: 2026-02-13

## Method Note (중요)

- 본 문서는 `실제 사용자 인터뷰`가 어려운 상황에서, 타겟 퍼소나를 대입한 LLM(GPT/Gemini/Claude) 응답을 사용해 만든 `가상(Proxy) 리서치` 결과다.
- 따라서 수치/판정은 탐색용 가설이며, 실제 사용자 행동 데이터로 확정된 사실이 아니다.
- 실제 제품 리서치의 표준 프로세스는 다음과 같다.
  1. 타겟 사용자 리쿠르팅
  2. 현재 행동(어떤 앱/엑셀/중개사 흐름인지) 관찰
  3. 반복 고통과 의사결정 기준을 인터뷰/꼬리질문으로 확인
  4. 프로토타입 사용 과제 수행으로 실제 이탈 지점 측정
  5. 인터뷰 인사이트를 정량 실험(CTR/완료율)과 결합해 판정

## 1) Research Question

- Q1: `재무입력 + 2직장 통근 + 보육 + 치안` 통합추천 공백이 실제로 존재하는가?
- Q2: 신혼부부가 집 탐색에서 가장 고통스러운 단계는 무엇인가?
- Q3: MVP(8~12주)에서 신뢰 가능한 Top10 추천을 만들 최소 데이터 조합은 무엇인가?

## 2) Competitor / Alternative Scan

| 제품/대안 | 강점 | 약점 | 시사점 |
| --- | --- | --- | --- |
| 네이버 부동산 | 매물 커버리지 큼 | 개인화 추천 약함 | "찾기"가 아닌 "추천"으로 차별화 필요 |
| 직방 | 모바일 UX 강함 | 2직장 통근 + 생활지표 통합 약함 | 복합 조건 점수화 공백 존재 |
| 호갱노노 | 단지/학군 탐색 강함 | 개인 재무 기반 필터 약함 | "내 예산에서 가능한 단지" 우선 제시 필요 |
| KB부동산 | 금융 계산/시세 신뢰 | 생활요소 통합 UX 약함 | 금융 + 생활지표 통합 결과 필요 |
| 리치고/아실 | 비교/분석 도구 강함 | 신혼부부 실거주 최적화 약함 | 실거주 중심 포지셔닝 유효 |

## 3) User Signals (AI Proxy 합의)

- 반복 불만:
  - 여러 앱 + 엑셀을 오가야 해서 피로가 크다
  - 2직장 통근 균형을 맞추기 어렵다
  - 추천 근거가 한 화면에 없어 불안하다
- 지불/행동 신호:
  - 문제 강도는 높지만 민감정보 입력 장벽이 크다
  - Step2 핵심 지표는 문의 클릭률(CTR)이다

정량 요약 [가정]:

- Pain Score 4 이상: 80~85%
- 민감정보 조건부 수용: 65~70%
- 핵심 장벽: 정확값 입력 저항 + 결과 신뢰 부족

## 4) Market Insight Summary

- 인사이트 1: 정보는 충분하지만, 신혼부부 맥락 통합 추천 경험은 약하다.
- 인사이트 2: P0는 "호수 단위 매물 자동화"보다 "단지 추천 + 아웃링크"가 현실적이다.
- 인사이트 3: 정확도 주장보다 행동지표(문의 CTR) 중심 판단이 타당하다.
- 인사이트 4: 랜딩 단독보다 컨시어지/리포트 방식이 보수 시나리오에서 유리하다.

## 5) Positioning Draft

`서울/수도권 맞벌이 신혼부부를 위한 주거 의사결정 도구로서, 재무/통근/보육/치안을 통합 점수화해 Top10 단지를 제안한다.`

## 6) Validation Record (Round 1)

실행 완료:

1. 가상 인터뷰/결과 문서 6건 수집
2. 모델 간 충돌 항목 보수 채택으로 조정
3. Step2 1차 판정 수행

참조:

- `docs/planning/references/virtual_interview/interview/claude_interview.md`
- `docs/planning/references/virtual_interview/interview/gemini_interview.md`
- `docs/planning/references/virtual_interview/interview/gpt_interview.md`
- `docs/planning/references/virtual_interview/result/claude_result.md`
- `docs/planning/references/virtual_interview/result/gemini_result.md`
- `docs/planning/references/virtual_interview/result/gpt_result.md`

## 7) Decision Pack (AI Proxy)

판정: `Conditional Go` -> `Step2 done (AI Proxy only)`

- 조건 1: Pain 강도는 충분히 높음 (보수 80%)
- 조건 2: 민감정보 수용은 경계선 충족 (65~70%)
- 조건 3: KPI는 랜딩 단독보다 컨시어지 병행 시 달성 가능성이 높음

운영 결론:

- Step2 우선 전략: `컨시어지/리포트 + 점진 입력(범위/프리셋)`
- 랜딩 단독 12%를 기본 가정으로 두지 않음

## 8) Final Pain Top 5

1. 2직장 통근 교집합/중간지점 탐색의 수작업 고통
2. 보유현금 + 대출 + 월상한의 현실 예산 계산 난이도
3. 치안/보육/학군/실거래 정보 통합 비교 난이도
4. 허위/만료/중복 매물로 인한 신뢰 저하
5. 민감정보 입력 저항으로 인한 퍼널 이탈

## 9) KPI Definition (분모 고정)

- 랜딩 문의 CTR = `landing_contact_click / landing_unique_view`
- 컨시어지 문의 CTR = `concierge_contact_click / concierge_unique_view`
- 최소 입력 완료율 = `min_input_complete / min_input_start`

보수 가정치 [가정]:

| KPI | 보수 | 기준 | 낙관 | 임계치 |
| --- | --- | --- | --- | --- |
| 랜딩 문의 CTR | 3~5% | 6~9% | 10~13% | 12% |
| 컨시어지 문의 CTR | 9~12% | 18~21% | 24~28% | 20% |
| 최소 입력 완료율 | 30~45% | 50~60% | 65%+ | 50% |

## 10) Risk Register (P0)

| 리스크 | 조기 징후 | 즉시 대응 |
| --- | --- | --- |
| 민감정보 입력 거부 | 입력 시작 대비 완료율 급락 | 범위 입력 + 점진 입력 |
| 추천 신뢰 부족 | 결과 확인 후 문의 클릭 저조 | 점수 분해 + 출처 + 갱신일 + 단점 표시 |
| 통근 계산 체감 괴리 | "실제로 더 걸림" 피드백 반복 | 문앞-문앞 가정 + 시간대 표기 |
| 아웃링크 품질 이슈 | 클릭 후 빠른 이탈 증가 | 중복 제거 + 신선도 고지 |
| 법/규제 리스크 | 자문/중개로 해석될 표현 존재 | Step0 통제안 적용(정보제공 포지션 고정/CPA 금지/동의 분리/크롤링 금지) |

## 11) Round 2 Plan (AI Red-Team 우선)

제약:

- 실제 인터뷰/리쿠르팅 실행 불가

실행:

1. 전환성 반박 라운드(1순위)
   - 가정: 컨시어지 CTR이 과대추정되었을 가능성
   - 목표: CTR 하방 시나리오에서도 유지되는 핵심 가치 확인
2. 입력 장벽 반박 라운드
   - 가정: 민감정보 수용이 실제보다 낮을 가능성
   - 목표: 무입력/최소입력 플로우로도 가치 전달 가능성 검증
3. 신뢰성 반박 라운드
   - 가정: 추천이 광고처럼 보일 가능성
   - 목표: 근거/단점/출처 표기가 전환에 미치는 영향 재평가

Round1 완료 기록:

- 입력 문서:
  - `docs/planning/references/red_team/round1/round1_gpt.md`
  - `docs/planning/references/red_team/round1/round1_claude.md`
  - `docs/planning/references/red_team/round1/round1_gemini.md`
- 통합 문서:
  - `docs/planning/references/red_team/round1/round1_adjudication.md`
- 요약:
  - Verdict: `Conditional Pass`
  - Fatal: `false`
  - Step3 Gate: `pending`
  - Round1 채택 스트레스 기준: 컨시어지 5~8%, 랜딩 2~4%, 입력완료 20~30% [가정]

Round2 완료 기록 (Input Friction):

- 입력 문서:
  - `docs/planning/references/red_team/round2/gpt_result.md`
  - `docs/planning/references/red_team/round2/gemini_result.md`
  - `docs/planning/references/red_team/round2/claude_result.md`
- 통합 문서:
  - `docs/planning/references/red_team/round2/round2_adjudication.md`
- 요약:
  - Verdict: `Conditional Pass`
  - Fatal: `false`
  - Step3 Gate: `pending`

Round3 완료 기록 (Trust Breakdown):

- 입력 문서:
  - `docs/planning/references/red_team/round3/gpt_result.md`
  - `docs/planning/references/red_team/round3/gemini_result.md`
  - `docs/planning/references/red_team/round3/claude_result.md`
- 통합 문서:
  - `docs/planning/references/red_team/round3/round3_adjudication.md`
- 요약:
  - Verdict: `Conditional Pass`
  - Fatal: `false`
  - Step3 Gate: `pending`

법무 합의 기준(별도):

- 참조: `docs/planning/references/legal_compliance/legal_compliance_adjudication.md`
- 판정: `Conditional Pass`
- Step3 Gate: `pending`
- 핵심 선결조건:
  - 중개 오인 기능/문구/정산 제거(거래성사형 CPA 금지)
  - 개인정보 비저장 통제를 DB/로그/APM까지 확장
  - 위치기반 신고/약관/동의/보호조치 완료 전 GPS 비활성
  - 크롤링 금지 및 공공/API/제휴 데이터만 사용

산출물:

- Red-Team 시나리오별 반박 리포트
- 유지 가능한 KPI 범위(보수 재추정)
- Step3 진입 조건 충족 여부

## 12) Step3 Gate (조건부 진입)

Step3 진입 조건:

1. Red-Team에서 치명결함 0건
2. 컨시어지 CTR 기준 가정치(18~21%) 유지 또는 대응책으로 보완 가능
3. 핵심 리스크 5개에 대한 대응책 문서화 완료
4. `step0_legal_compliance.md`의 Step3 선결 항목(법률 자문/위치정보/표시광고 스키마) 진행계획이 확정됨

## 13) Q&A Loop 결과 (확정)

- Q1: 컨시어지 CTR 우선
- Q2: Step2 상태 = `done (AI Proxy only)`
- Q3: 실사용자 검증 불가 -> `AI Red-Team` 우선
- Q4: Red-Team 1순위 = 전환성 반박
- Q5: Step3 진입 = 조건부 진입(게이트 충족 시)
- Q6: 법무/컴플라이언스 게이트 = `pending` (Step0와 동기화)

## Done Checklist

- [x] 경쟁/대체재 desk research 정리
- [x] 반복 문제 패턴 가설 정리 (AI Proxy)
- [x] 포지셔닝 초안 작성
- [x] AI Proxy 인터뷰/결과 통합 판정 완료
- [x] KPI 분모/정의 통일 및 Risk Register 정리
- [x] Q&A Loop 의사결정 확정
- [ ] Human Validation (실행 불가로 별도 트랙)

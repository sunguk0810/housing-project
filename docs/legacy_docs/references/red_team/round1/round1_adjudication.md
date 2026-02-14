# Round1 Adjudication - GPT/Claude/Gemini 통합

Status: completed  
Date: 2026-02-13  
Owner: sungwookhwang

입력 문서:

- `docs/planning/references/red_team/round1/round1_gpt.md`
- `docs/planning/references/red_team/round1/round1_claude.md`
- `docs/planning/references/red_team/round1/round1_gemini.md`

## 1) Consensus Summary

세 모델 공통 결론:

1. Verdict는 모두 `Conditional Pass`
2. `fatal_found`는 모두 `false`
3. Step3 진입 상태는 모두 `pending` (조건부)
4. CTR 하락의 1순위 원인은 다음 3축으로 수렴
   - 입력 마찰(민감정보/연락처 공포)
   - 신뢰 붕괴(점수/통근/출처 불신)
   - 저의도 유입 또는 체리피킹(결과만 보고 문의 안 함)

## 2) Disagreement Log

| 항목 | GPT | Claude | Gemini | 해석 |
| --- | --- | --- | --- | --- |
| 컨시어지 CTR 스트레스 | 2~10% | 8~14% | 5~8% | GPT가 가장 보수적, Claude가 상대 낙관 |
| 랜딩 CTR 스트레스 | 0.5~4% | 3~6% | 2~4% | GPT 하한이 매우 낮음 |
| 최소 입력 완료율 스트레스 | 10~35% | 28~42% | 20~30% | 모델 간 편차가 큼 |

## 3) Adjudicated Baseline (Round1 채택)

운영용 기준(보수 채택):

- 컨시어지 CTR 스트레스 기준: `5~8%` [가정]
- 랜딩 CTR 스트레스 기준: `2~4%` [가정]
- 최소 입력 완료율 스트레스 기준: `20~30%` [가정]

최악 하방(Contingency):

- 컨시어지 CTR: `2~5%` [가정]
- 랜딩 CTR: `0.5~2%` [가정]
- 입력 완료율: `10~20%` [가정]

채택 이유:

- 단일 모델 극단값(GPT 하한)만 쓰면 과도하게 보수적이어서 실행 판단이 왜곡될 수 있음
- Claude 범위는 상대 낙관적이므로, Gemini 범위를 중심값으로 채택하고 GPT 하한은 비상 시나리오로 분리

## 4) Step3 Gate Impact

Round1만 기준으로는 Step3 즉시 진입 불가:

- 상태: `pending`
- 사유: 세 모델 모두 "조건부"이며, 입력/신뢰 리스크가 KPI를 구조적으로 깎는 것으로 합의

Round1 통과 조건(문서 기준):

1. 치명결함 0건 유지
2. 신뢰 UI 필수 요소 고정
   - 점수 분해
   - 출처/갱신일
   - 단점(Bad news) 1개 이상
3. 점진 입력 고정
   - 1단계 최소 입력(권역/예산 범위/월 상한)
   - 2단계 정밀 입력(현금/소득/대출)

## 5) Must-Do (Round2 전 필수)

1. `전화 없는 문의`를 기본 경로로 설정
2. 입력 필드에서 정확값 강제 제거(범위/프리셋)
3. 리포트 템플릿 표준화(Top10/점수분해/추천사유/단점/외부링크)
4. 이벤트 분모 고정(landing vs concierge vs input)
5. Round2에서 입력 마찰 테스트를 우선 실행

## 6) Final Decision

- Round1 최종 판정: `Conditional Pass`
- Step2 상태: 유지 (`done - AI Proxy only`, Red-Team 추가 라운드 진행)
- 다음 라운드: `Round2 Input Friction Stress Test`


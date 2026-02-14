당신은 **Product Red-Team Analyst**입니다.

목표:
- **Round3: Trust Breakdown Stress Test** 수행
- Step2의 핵심 가정(추천 결과 신뢰, 문의 전환 가능성)을 **신뢰 붕괴 관점**에서 공격적으로 반박
- Round1/2 결론(Conditional Pass)을 전제로, **신뢰 관점에서 Step3 Gate 가능 여부**를 재판정

입력 문서:
- `docs/planning/step2_market_discovery.md`
- `docs/planning/step2_experiment_plan.md`
- `docs/planning/step2_summary.md`
- `docs/planning/references/red_team/round1/round1_adjudication.md`
- `docs/planning/references/red_team/round2/gpt_result.md`
- `docs/planning/references/red_team/round2/gemini_result.md`
- `docs/planning/references/red_team/round2/claude_result.md`
- `docs/planning/step0_legal_compliance.md` (선택)

중요 규칙:
1) 반드시 **입력 문서 내용만 근거**로 사용한다.
2) 문서 밖 추론은 반드시 `[가정]`으로 표시한다.
3) 핵심 주장마다 `[source: 파일명]` 표기를 붙인다.
4) Round1/2 수치를 단순 반복하지 말고, **신뢰 붕괴 관점의 신규 스트레스 범위**를 제시한다.
5) **출력 형식은 반드시 Markdown**으로 작성한다.

작업:
1) 신뢰 퍼널을 4단계로 분해하라:
   - 결과 노출 -> 근거 확인 -> 신뢰 판단 -> 문의 클릭
2) 신뢰 붕괴 시나리오 3개를 제시하라:
   - 시나리오당: 공격 가정, 예상 영향(수치 범위), 조기 징후, 즉시 대응
3) 각 시나리오에서 아래 4개 지표를 추정하라(전부 `[가정]`):
   - 결과->문의 클릭률 (`result_to_inquiry_ctr`)
   - 컨시어지 문의 CTR
   - 랜딩 문의 CTR
   - 최소 입력 완료율
4) 최종 판정:
   - Verdict: Pass / Conditional Pass / Fail
   - fatal_found: true/false
   - step3_gate: go / pending / no-go
5) Must-Do Top5를 우선순위(P0/P1)로 제시하라.

출력 형식(반드시 준수, Markdown):

### 1) Executive Summary (5줄 이내)

### 2) Trust Funnel Breakdown (표)
- 열: `단계 | 기준값(문서근거) | 스트레스값 | 신뢰 붕괴 원인 | source`

### 3) Stress Scenarios (표)
- 열: `시나리오 | 공격 가정 | 예상 영향(4지표) | 조기 징후 | 즉시 대응 | source`

### 4) Decision
- verdict
- fatal_found
- step3_gate
- 판정 근거 3개

### 5) Must-Do Top5
- 각 항목에 P0/P1 라벨 포함

### 6) JSON Summary (코드블록)
```json
{
  "verdict": "",
  "fatal_found": false,
  "step3_gate": "pending",
  "stress_ranges": {
    "result_to_inquiry_ctr": "",
    "concierge_ctr": "",
    "landing_ctr": "",
    "min_input_completion": ""
  },
  "top_risks": ["", "", ""],
  "must_do": [
    {"priority": "P0", "action": ""},
    {"priority": "P0", "action": ""},
    {"priority": "P0", "action": ""},
    {"priority": "P1", "action": ""},
    {"priority": "P1", "action": ""}
  ]
}
```

추가 지시:
- 반드시 한국어로 작성한다.
- 표와 JSON을 포함한 최종 결과 전체를 **Markdown 문서 형식**으로 반환한다.

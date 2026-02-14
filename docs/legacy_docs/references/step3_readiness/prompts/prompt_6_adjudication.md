# Prompt 6 — Step3 Readiness Adjudication

첨부 문서와 함께 아래 프롬프트를 Claude에 입력하세요.

**첨부 문서:**
- step3_preflight_check.md
- step2_summary.md
- step0_legal_compliance.md
- results/teaser_result.md
- results/commute_label_result.md
- results/trust_copy_ab_result.md
- results/gate_validation_result.md

---

```markdown
<role>
당신은 Research Adjudicator입니다.
전문 영역: 복수 리서치 산출물 비교, 충돌 정리, 보수적 단일안 의사결정
판단 기준: "Step3 진입 판단에 필요한 최소 근거를 보수적으로 통합할 수 있는가"를 최우선으로 평가하세요.
</role>

<rules>
1. 첨부된 문서 내용만 근거로 사용하세요.
2. 문서 밖 추론은 [가정]으로 표시하세요.
3. 핵심 주장마다 [source: 파일명]을 붙이세요.
4. 수치 충돌 시 아래 규칙으로 통합하세요.
   - 보수값: 최저
   - 기준값: 중앙값
   - 낙관값: 최고
5. 출력은 Markdown으로 작성하세요.
</rules>

<tasks>
1. 공통점(Consensus) 5개를 요약하세요.
2. 충돌/불일치(Disagreement)를 표로 정리하세요.
3. KPI별 Adjudicated Baseline(보수/기준/낙관)을 작성하세요.
4. Step3 판정(Verdict, step3_gate, fatal_found)을 제시하세요.
5. P0/P1 Must-Do를 5개 제시하세요.
6. JSON Summary를 본문과 일치하게 작성하세요.
</tasks>

<output_format>
### 1) Executive Summary (5줄 이내)

### 2) Consensus Summary (bullet 5개)

### 3) Disagreement Log (표)
| 항목 | teaser | commute | trust | gate | 채택값 | 근거 |
|---|---|---|---|---|---|---|

### 4) Adjudicated Baseline (표)
| KPI | 보수 | 기준 | 낙관 | 비고 |
|---|---|---|---|---|

### 5) Decision
- Verdict: Pass / Conditional Pass / Fail
- fatal_found: true / false
- Step3 Gate: go / pending / no-go
- 판정 근거 3개

### 6) Must-Do Top5 (P0/P1 라벨 필수)
1.
2.
3.
4.
5.

### 7) JSON Summary
```json
{
  "verdict": "Conditional Pass",
  "fatal_found": false,
  "step3_gate": "pending",
  "kpi": {
    "result_to_inquiry_ctr": {"conservative": "", "baseline": "", "optimistic": ""},
    "input_completion_rate": {"conservative": "", "baseline": "", "optimistic": ""},
    "drop_off_rate": {"conservative": "", "baseline": "", "optimistic": ""}
  },
  "top_risks": ["", "", ""],
  "must_do": [
    {"priority": "P0", "action": ""},
    {"priority": "P0", "action": ""},
    {"priority": "P1", "action": ""},
    {"priority": "P1", "action": ""},
    {"priority": "P1", "action": ""}
  ]
}
```
</output_format>
```

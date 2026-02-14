# Step3 Readiness Research — Claude Prompt

아래 프롬프트를 Claude에 입력 문서들과 함께 사용하세요.

---

```xml
<role>
당신은 Step3 Readiness Research Analyst입니다.
Step1~Step2 결과를 분석하여 Step3(기회 우선순위 확정) 진입 가능 여부를 판정하고,
실행안을 Markdown 문서로 산출합니다.
</role>

<input_documents>
아래 문서들이 이 대화에 첨부되어 있습니다. 반드시 이 문서들만 근거로 사용하세요.

1. docs/planning/step1_define_discovery.md
2. docs/planning/step2_market_discovery.md
3. docs/planning/step2_experiment_plan.md
4. docs/planning/step2_summary.md
5. docs/planning/references/red_team/round1/round1_adjudication.md
6. docs/planning/references/red_team/round2/round2_adjudication.md
7. docs/planning/references/red_team/round3/round3_adjudication.md
8. docs/planning/step0_legal_compliance.md
</input_documents>

<rules>
- 반드시 입력 문서 내용만 근거로 사용한다.
- 문서에 없는 추론은 반드시 [가정]으로 명시한다.
- 핵심 주장마다 [source: 파일명]을 붙인다.
- KPI/게이트 수치는 문서값 우선, 없으면 [가정]으로 제안한다.
- 최종 출력은 Markdown으로 작성한다.
- 한국어로 작성한다.
</rules>

<tasks>
아래 8개 섹션을 순서대로, 빠짐없이 작성하세요.

Task 1: Executive Summary를 5줄 이내로 작성하라.

Task 2: Step1~Step2 핵심 결론을 bullet 10개 이내로 요약하라.

Task 3: Step3 진입을 막는 리스크를 3축(입력 마찰 / 신뢰 붕괴 / 법무·컴플라이언스 게이트)으로 정리하라.

Task 4: Step3 진입 판정 기준표를 go / pending / no-go 조건으로 만들라.
각 조건에 필요한 최소 증거(문서/지표/체크리스트)를 명시하라.

Task 5: Step3에서 우선 다룰 Opportunity Top 5를 제시하라.
각 항목에 Impact / Confidence / Effort (1~5)를 부여하고, 우선순위 근거를 문서 기반으로 설명하라.

Task 6: Step3 착수 전 필수 실행 항목(Pre-Step3 Must-Do)을 P0 / P1로 분류하라.

Task 7: 최종 판정을 내려라.
- verdict: Pass / Conditional Pass / Fail
- step3_gate: go / pending / no-go
- fatal_found: true / false
- 판정 근거 3개

Task 8: JSON Summary를 코드블록으로 출력하라.
</tasks>

<output_format>
반드시 아래 Markdown 구조를 그대로 따르세요. 섹션 번호와 제목을 변경하지 마세요.

### 1) Executive Summary
<!-- 5줄 이내 서술 -->

### 2) Step1~Step2 핵심 요약
<!-- bullet 10개 이내. 각 bullet에 [source: 파일명] 필수 -->

### 3) Step3 Risk Axes

| 리스크 축 | 현재 상태 | 증거 | 미충족 항목 | 대응 |
|-----------|----------|------|------------|------|
| 입력 마찰 | | | | |
| 신뢰 붕괴 | | | | |
| 법무/컴플라이언스 게이트 | | | | |

### 4) Step3 Gate Criteria

| 판정 | 조건 | 필수 증거 | 현재 상태 | 비고 |
|------|------|----------|----------|------|
| go | | | | |
| pending | | | | |
| no-go | | | | |

### 5) Opportunity Priority Draft

| Opportunity | Impact(1-5) | Confidence(1-5) | Effort(1-5) | 우선순위 | 근거 |
|-------------|-------------|-----------------|-------------|---------|------|
| | | | | | |

### 6) Pre-Step3 Must-Do

**P0 (블로커 — Step3 착수 전 반드시 해결)**
- [ ] ...

**P1 (중요 — Step3 초기 1주 내 해결)**
- [ ] ...

### 7) Decision

- **verdict**: 
- **fatal_found**: 
- **step3_gate**: 
- **판정 근거**:
  1. 
  2. 
  3. 

### 8) JSON Summary

```json
{
  "verdict": "",
  "fatal_found": false,
  "step3_gate": "pending",
  "top_opportunities": [
    {"name": "", "priority": "P0", "impact": 0, "confidence": 0, "effort": 0}
  ],
  "must_do": [
    {"priority": "P0", "action": ""},
    {"priority": "P1", "action": ""}
  ],
  "top_risks": ["", "", ""]
}
```
</output_format>

<thinking_process>
작업 순서:
1. 먼저 모든 입력 문서를 통독하고 핵심 팩트를 추출한다.
2. 팩트를 리스크 3축과 기회 후보로 분류한다.
3. 분류 결과를 바탕으로 각 섹션을 순서대로 채운다.
4. 최종 판정은 앞선 모든 분석 결과를 종합하여 내린다.
5. JSON Summary는 본문 내용과 정확히 일치시킨다.
</thinking_process>
```

---

## 사용 방법

1. 위 프롬프트를 복사합니다.
2. Claude 대화에서 8개 입력 문서를 모두 첨부합니다.
3. 프롬프트를 메시지로 붙여넣고 전송합니다.

## 원본 대비 주요 변경점

| 항목 | 변경 내용 |
|------|----------|
| **XML 태그 구조화** | `<role>`, `<rules>`, `<tasks>`, `<output_format>` 등으로 분리하여 Claude가 각 지시를 명확히 구분 |
| **Task 번호 명시** | 암묵적 나열 → Task 1~8로 명시하여 누락 방지 |
| **출력 템플릿 제공** | 표 헤더·마크다운 골격을 그대로 제시하여 형식 준수율 향상 |
| **Thinking Process 추가** | 단계별 사고 순서를 명시하여 분석 품질 향상 |
| **중복 제거** | 규칙과 출력 형식에 흩어져 있던 동일 지시를 통합 정리 |
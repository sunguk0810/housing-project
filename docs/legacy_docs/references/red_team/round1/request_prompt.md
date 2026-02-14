v당신은 Product Red-Team Analyst입니다.

컨텍스트:
- 서비스: 신혼부부 대상 주거 추천
- 핵심 가치: 예산 + 2직장 통근 + 보육 + 치안 통합 점수화
- Step2 현재 상태: AI Proxy only, Conditional Go
- 우선 KPI: 컨시어지 문의 CTR
- 기준 가정:
    - 컨시어지 CTR: 18~21%
    - 랜딩 CTR: 6~9%
    - 최소 입력 완료율: 50~60%
- 목표: Round1 Conversion Stress Test (전환성 반박)

작업:
1) 위 기준이 과대추정되었을 가능성을 가장 공격적으로 반박하라.
2) CTR 하락을 유발하는 시나리오 3개를 제시하라.
3) 각 시나리오별로:
    - 공격 가정
    - 예상 영향(수치 범위, 모두 [가정] 표기)
    - 조기 징후
    - 즉시 대응
      를 작성하라.
4) 최종 판정:
    - Pass / Conditional Pass / Fail
    - Fatal(치명결함) 여부
    - Step3 진입 가능 여부(조건 포함)
5) 반드시 “근거 없는 단정”을 피하고, 불확실성은 [가정]으로 표기하라.

출력 형식(반드시 준수):
- 섹션 1: Executive Summary (5줄 이내)
- 섹션 2: Stress Scenarios (표)
- 섹션 3: Decision
- 섹션 4: Must-Do Top5
- 섹션 5: JSON Summary (코드블록)
  {
  "verdict": "...",
  "fatal_found": true/false,
  "concierge_ctr_stress_range": "...",
  "landing_ctr_stress_range": "...",
  "min_input_completion_stress_range": "...",
  "step3_gate": "go/pending/no-go",
  "top_risks": ["...", "...", "..."]
  }

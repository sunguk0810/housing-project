# Round2: Input Friction Stress Test (Product Red-Team Analysis)

> ⚠️ 본 문서는 **입력 문서(지정된 .md 파일)만** 근거로 작성된 **Red-Team 스트레스 테스트**입니다.  
> 문서 밖 추론/수치 추정은 반드시 **[가정]**으로 표시했습니다.  
> 각 핵심 주장에는 **[source: 파일명]** 표기를 붙였습니다.

---

### 1) Executive Summary (5줄 이내)

- Step2는 `AI Proxy only` 상태에서 `Conditional Go`로 정리되었고, 우선 KPI는 **컨시어지 문의 CTR**로 고정되어 있다. [source: step2_experiment_plan.md]  
- Round1 Adjudication은 **Verdict=Conditional Pass, fatal_found=false, step3_gate=pending**을 합의 결론으로 명시하며, CTR 하락 1순위를 **입력 마찰(민감정보/연락처 공포)**로 정리했다. [source: round1_adjudication.md]  
- Step2의 “기준 가정치”는 **최소 입력 완료율 50~60%, 컨시어지 문의 CTR 18~21%, 랜딩 문의 CTR 6~9%**로 제시되어 있으나(문서 자체도 [가정] 표기), 입력 마찰을 충분히 반영하지 못했을 가능성이 있다. [source: step2_experiment_plan.md]  
- 입력 마찰 중심 스트레스에서는 **최소 입력 완료율 [가정] 10~30%**, **컨시어지 문의 CTR [가정] 2~9%**, **랜딩 문의 CTR [가정] 0.3~3.0%**까지 하방이 열릴 수 있다. [source: step2_market_discovery.md]  
- 결론: Round2 관점에서도 **Conditional Pass 유지**가 타당하나, Step3 Gate는 **pending(입력/문의 UX 방어 + 계측 고정 선행)**로 재확인한다. [source: step2_experiment_plan.md]

---

### 2) Funnel Breakdown (표)

| 단계 | 기준값(문서근거) | 스트레스값 | 하락 원인 | source |
|---|---|---|---|---|
| 랜딩 도착 | 랜딩 문의 CTR 분모 정의: `landing_unique_view` (정의 고정) | (분모 이벤트 자체는 유지) | 본 Round2 범위(입력 마찰)에서는 유입 품질보다 **입력 전 설득/안심 문구**가 시작률에 영향 | [source: step2_experiment_plan.md] |
| 입력 시작 | 최소 입력 완료율 분모 정의: `min_input_start` (정의 고정). 단, “랜딩→입력 시작률”의 기준 수치 자체는 문서에 명시 없음 | 랜딩→입력 시작률 **[가정] 10~25%** | “가치가 보이기 전 입력”으로 인식되거나, 민감정보 입력을 예상해 **시작 자체를 회피** | [source: round1_adjudication.md] |
| 최소 입력 완료 | 최소 입력 완료율 기준(문서 내 가정): **50~60%** (`min_input_complete / min_input_start`) | 최소 입력 완료율 **[가정] 10~30%** | 문서에서 핵심 장벽으로 제시된 **정확값 입력 저항/연락처 공포**가 실제로는 더 강할 경우 단계별 이탈이 누적 | [source: step2_market_discovery.md] |
| 문의 클릭 | 랜딩 문의 CTR 기준(문서 내 가정): **6~9%** / 컨시어지 문의 CTR 기준(문서 내 가정): **18~21%** | 랜딩 문의 CTR **[가정] 0.3~3.0%** / 컨시어지 문의 CTR **[가정] 2~9%** | “문의=전화/영업/중개사 연결”로 해석되면 클릭 자체가 억제될 수 있음(입력 마찰과 결합) | [source: round1_adjudication.md] |

---

### 3) Stress Scenarios (표)

| 시나리오 | 공격 가정 | 예상 영향(3지표) | 조기 징후 | 즉시 대응 | source |
|---|---|---|---|---|---|
| 1) 직장2 입력 장벽 (Workplace-2 Wall) | 직장 2개 입력(또는 권역/역 선택)이 개인정보 노출로 해석되거나, 모바일 입력 피로로 인해 **입력 시작/완료 전 단계에서 대량 이탈**이 발생한다. **[가정]** | - 최소 입력 완료율: **[가정] 18~30%**  
- 컨시어지 문의 CTR: **[가정] 4~9%**  
- 랜딩 문의 CTR: **[가정] 1.2~3.0%** | - `min_input_start` 대비 `min_input_complete` 급락 **[가정]**  
- 직장2 단계에서 이탈이 급증 **[가정]** | - 직장 입력을 **정확 주소가 아닌 권역/역 프리셋**으로 고정  
- “직장2는 나중에 입력” 옵션 제공(점진 입력) | [source: step2_experiment_plan.md] |
| 2) 예산/월상한 불확실성 동결 (Budget Freeze) | 사용자가 “예산/월상한”을 즉시 정확히 정하기 어렵고, 입력 과정이 현실 스트레스를 유발해 **중도 포기**한다. 특히 “정확값 요구”가 이탈을 가속한다. **[가정]** | - 최소 입력 완료율: **[가정] 10~22%**  
- 컨시어지 문의 CTR: **[가정] 3~7%**  
- 랜딩 문의 CTR: **[가정] 0.8~2.2%** | - 예산/월상한 필드에서 체류시간↑ 후 이탈↑ **[가정]**  
- “어떻게 계산하나요?” 질문 증가 **[가정]** | - 예산/현금/월상한은 **범위 입력**을 기본값으로  
- 최소 입력만으로도 “제한된 결과 미리보기(Teaser)” 제공 | [source: step2_market_discovery.md] |
| 3) 문의=연락처/전화 공포 (Contact Fear Lock) | 최소 입력을 완료해도, 문의가 “전화/영업/중개사 연결”로 해석되면 **문의 클릭이 구조적으로 억제**된다. **[가정]** | - 최소 입력 완료율: **[가정] 15~28%**  
- 컨시어지 문의 CTR: **[가정] 2~5%**  
- 랜딩 문의 CTR: **[가정] 0.3~1.5%** | - 결과/리포트 페이지 도달은 있는데 문의 클릭이 0에 수렴 **[가정]**  
- CTA 주변 체류시간 증가(망설임) **[가정]** | - **전화 없는 문의(비동기)**를 기본 경로로 고정  
- “광고 연락 없음/저장 안 함” 등 안심 문구를 폼 상단 고정 노출 | [source: round1_adjudication.md] |

---

### 4) Decision

- **verdict:** Conditional Pass [source: round1_adjudication.md]  
- **fatal_found:** false (문서 근거로 Fatal 확정 불가) [source: round1_adjudication.md]  
- **step3_gate:** pending [source: round1_adjudication.md]  

**판정 근거 3개**
1. Round1 합의 문서에서 CTR 하락의 1순위를 **입력 마찰**로 명시했으므로, Round2의 입력 마찰 스트레스는 Step3 Gate를 보수적으로 “pending”으로 유지할 근거가 된다. [source: round1_adjudication.md]  
2. Step2 문서에서 최소 입력 완료율/CTR은 “가정치”로 제시되어 있으며, Round2 계획 자체가 “무입력/최소입력/정밀입력 3개 플로우 비교”를 요구한다(즉, 입력 설계가 아직 고정되지 않음). [source: step2_experiment_plan.md]  
3. Market Discovery에서 “정확값 입력 저항 + 결과 신뢰 부족”이 핵심 장벽으로 명시되어 있어, 입력 마찰을 방치하면 KPI 하방 리스크가 크다(따라서 Step3는 방어 장치 선행이 필요). [source: step2_market_discovery.md]

---

### 5) Must-Do Top5
- **(P0)** 전화 없는 문의(비동기/익명) 기본 경로 고정 (문의=연락처 공포 제거) [source: round1_adjudication.md]  
- **(P0)** 최소 입력에서 “정확값 강제” 제거 → 범위/프리셋 입력을 기본값으로 재정의 [source: step2_market_discovery.md]  
- **(P0)** 점진 입력(무입력 Teaser → 최소 입력 → 정밀 입력)으로 플로우 분리 및 A/B 구조 확정 [source: step2_experiment_plan.md]  
- **(P1)** 입력 단계별 드롭 계측(특히 직장2/예산 필드)과 이탈 사유 수집(마이크로 설문) [source: step2_experiment_plan.md]  
- **(P1)** 결과/리포트 템플릿에 “입력 가치”를 설명하는 근거 블록(점수 분해/출처/단점)을 표준화 [source: step2_market_discovery.md]

---

### 6) JSON Summary (코드블록)

```json
{
  "verdict": "Conditional Pass",
  "fatal_found": false,
  "step3_gate": "pending",
  "stress_ranges": {
    "min_input_completion": "[가정] 10~30%",
    "concierge_ctr": "[가정] 2~9%",
    "landing_ctr": "[가정] 0.3~3.0%"
  },
  "top_risks": [
    "직장2/권역 입력에서 개인정보·입력 피로로 시작/완료 급락 가능 [가정]",
    "예산/월상한 정확값 요구가 입력 동결(Budget Freeze)을 유발할 가능성 [가정]",
    "문의가 전화/영업으로 해석되어 컨시어지 CTR이 구조적으로 억제될 가능성 [가정]"
  ],
  "must_do": [
    {"priority": "P0", "action": "전화 없는 문의(비동기/익명) 기본 경로 고정"},
    {"priority": "P0", "action": "정확값 강제 제거: 범위/프리셋 입력으로 최소 입력 재정의"},
    {"priority": "P0", "action": "점진 입력 플로우(무입력→최소→정밀) 확정 및 A/B 설계"},
    {"priority": "P1", "action": "입력 단계별 드롭 계측 + 이탈 사유 수집(마이크로 설문)"},
    {"priority": "P1", "action": "결과/리포트 템플릿 표준화(근거/출처/단점 포함)로 입력 가치 증명"}
  ]
}
```

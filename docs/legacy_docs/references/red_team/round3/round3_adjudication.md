# Round3 Adjudication (Trust Breakdown Stress Test)

작성일: 2026-02-13  
입력 문서:
- `docs/planning/references/red_team/round3/gpt_result.md`
- `docs/planning/references/red_team/round3/gemini_result.md`
- `docs/planning/references/red_team/round3/claude_result.md`

## 1) Executive Summary

- 3개 문서 모두 Round3 판정을 `Conditional Pass`, `fatal_found=false`, `step3_gate=pending`으로 제시했다. [source: gpt_result.md|gemini_result.md|claude_result.md]
- 공통 리스크는 입력 이후 구간의 신뢰 붕괴(광고/제휴 오인, 근거 불투명, 통근 체감 괴리)다. [source: gpt_result.md|gemini_result.md|claude_result.md]
- 모델별 수치 편차는 크지만, `결과 확인 -> 문의 클릭` 구간이 가장 취약하다는 방향성은 일치한다. [source: gpt_result.md|gemini_result.md|claude_result.md]
- Step3 진입은 가능하되, 신뢰 UI/설명 가능성/계측 고정이 선행되지 않으면 Gate는 유지(pending)되어야 한다. [source: gpt_result.md|gemini_result.md|claude_result.md]

## 2) Consensus Summary

1. Round3의 핵심 병목은 `result_view -> inquiry_click` 신뢰 전환 구간이다. [source: gpt_result.md|gemini_result.md|claude_result.md]
2. 점수 분해, 출처, 갱신일, 단점(Bad News) 표시는 P0 신뢰 장치다. [source: gpt_result.md|gemini_result.md|claude_result.md]
3. 광고/제휴/중개 오인을 줄이기 위한 문구·정책·UX 분리가 필요하다. [source: gpt_result.md|gemini_result.md|claude_result.md]
4. 통근 계산은 단일 수치보다 가정/시간대/오차를 함께 표기해야 신뢰를 방어할 수 있다. [source: gpt_result.md|claude_result.md]
5. 신뢰 붕괴 조기 감지를 위한 전용 계측(result_to_inquiry_ctr 포함)이 필요하다. [source: gpt_result.md|claude_result.md]

## 3) Disagreement Log

| 항목 | GPT | Gemini | Claude | 채택값 | 근거 |
| --- | --- | --- | --- | --- | --- |
| result_to_inquiry_ctr 스트레스 | 0.3~3.5% [가정] | 5~12% [가정] | 3~10% [가정] | 중심 `3~10%`, 외피 `0.3~12%` | 3모델 교집합 부재, 보수/운영 분리 채택 |
| 컨시어지 CTR 스트레스 | 0.8~5.5% [가정] | 2~6% [가정] | 1.5~6% [가정] | 교집합 `2~5.5%`, 외피 `0.8~6%` | 하방/상방 편차 존재 |
| 랜딩 CTR 스트레스 | 0.1~1.8% [가정] | 0.5~2.5% [가정] | 0.3~3% [가정] | 교집합 `0.5~1.8%`, 외피 `0.1~3%` | 모델별 하한/상한 차이 |
| 최소 입력 완료율 스트레스 | 6~22% [가정] | 15~25% [가정] | 15~30% [가정] | 교집합 `15~22%`, 외피 `6~30%` | Round2 대비 하방 리스크 유지 |
| 신뢰 붕괴 1차 원인 | 광고/제휴 오인 + 근거 부재 | 블랙박스 + 광고성 인식 + 문의 공포 | 블랙박스 + 통근 괴리 + 광고 오인 | `근거 투명성 + 광고 오인 + 통근 신뢰` 3축 | 공통 하위 요인 통합 |

## 4) Adjudicated Baseline (Round3)

| KPI | GPT | Gemini | Claude | 교집합(합의) | 외피(리스크 감시) |
| --- | --- | --- | --- | --- | --- |
| result_to_inquiry_ctr | 0.3~3.5% | 5~12% | 3~10% | `3~10%` [가정] | `0.3~12%` [가정] |
| 컨시어지 문의 CTR | 0.8~5.5% | 2~6% | 1.5~6% | `2~5.5%` [가정] | `0.8~6%` [가정] |
| 랜딩 문의 CTR | 0.1~1.8% | 0.5~2.5% | 0.3~3% | `0.5~1.8%` [가정] | `0.1~3%` [가정] |
| 최소 입력 완료율 | 6~22% | 15~25% | 15~30% | `15~22%` [가정] | `6~30%` [가정] |

해석:
- Step3 설계 기준은 교집합(합의 구간)으로 두고, 모니터링 알람은 외피 하한까지 감시한다. [가정]

## 5) Decision

- Verdict: `Conditional Pass`
- fatal_found: `false`
- Step3 Gate: `pending`

판정 근거:
1. 3개 결과 문서의 최종 판정이 동일하다. [source: gpt_result.md|gemini_result.md|claude_result.md]
2. 신뢰 붕괴의 원인(설명 불충분/광고 오인/통근 불신)과 대응책(신뢰 UI/문구/계측)이 높은 수준에서 일치한다. [source: gpt_result.md|gemini_result.md|claude_result.md]
3. 다만 핵심 전환 구간(result_to_inquiry)의 스트레스 편차가 커 보완 적용 전 Step3 Gate를 열기 어렵다. [source: gpt_result.md|gemini_result.md|claude_result.md]

## 6) Must-Do Top5

1. **P0**: 신뢰 UI 최소 세트(점수 분해/출처/갱신일/단점/Why-Not) 결과 템플릿 고정 [source: gpt_result.md|gemini_result.md|claude_result.md]
2. **P0**: 광고/제휴/중개 오인 방지 문구와 외부 링크 정책(제휴/비제휴 고지) 고정 [source: gpt_result.md|gemini_result.md|claude_result.md]
3. **P0**: 통근 표시를 단일값에서 범위+가정(시간대/오차 포함)으로 전환 [source: gpt_result.md|claude_result.md]
4. **P1**: 아웃링크 품질 가드레일(중복/신선도/품질 신고/복수 플랫폼 분산) 적용 [source: gpt_result.md|gemini_result.md|claude_result.md]
5. **P1**: Trust 전용 계측(result_to_inquiry_ctr, 근거확인 이벤트, VOC) 대시보드 추가 [source: gpt_result.md|claude_result.md]

## 7) JSON Summary

```json
{
  "verdict": "Conditional Pass",
  "fatal_found": false,
  "step3_gate": "pending",
  "stress_ranges": {
    "result_to_inquiry_ctr": {
      "consensus_intersection": "3~10% [가정]",
      "risk_envelope": "0.3~12% [가정]"
    },
    "concierge_ctr": {
      "consensus_intersection": "2~5.5% [가정]",
      "risk_envelope": "0.8~6% [가정]"
    },
    "landing_ctr": {
      "consensus_intersection": "0.5~1.8% [가정]",
      "risk_envelope": "0.1~3% [가정]"
    },
    "min_input_completion": {
      "consensus_intersection": "15~22% [가정]",
      "risk_envelope": "6~30% [가정]"
    }
  },
  "top_risks": [
    "추천 결과가 광고/제휴/중개로 오인되어 문의 전환이 붕괴될 가능성",
    "점수 산식/출처/기준일 부재로 '점수=블랙박스' 인식이 확산될 가능성",
    "통근 체감 괴리로 핵심 가치 신뢰가 역전될 가능성"
  ],
  "must_do": [
    {"priority": "P0", "action": "신뢰 UI 최소 세트(점수 분해/출처/갱신일/단점/Why-Not) 고정"},
    {"priority": "P0", "action": "광고/제휴/중개 오인 방지 문구와 링크 정책 고정"},
    {"priority": "P0", "action": "통근 시간을 범위+가정 표기로 전환"},
    {"priority": "P1", "action": "아웃링크 품질 가드레일 및 복수 플랫폼 분산 적용"},
    {"priority": "P1", "action": "Trust 전용 계측(result_to_inquiry_ctr 등) 대시보드 추가"}
  ]
}
```

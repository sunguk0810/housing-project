# Step3 Gate Review — Product Gate Reviewer 판정서

Reviewer: Product Gate Reviewer (AI)  
Review Date: 2026-02-13  
대상: 신혼부부 주거 추천 서비스 Step3 진입 판정

---

## 1) Gate Status

> **현재 상태: `pending` (조건부 진입 대기)**
>
> - Round1/2/3 전 라운드에서 `Conditional Pass / fatal=false / step3_gate=pending` 판정이 일치하며, 치명 결함은 발견되지 않았다. [source: step2_summary.md, round2_adjudication.md, round3_adjudication.md]
> - Q&A Lock(Q1~Q8)은 모두 확정되었으나, Gate Definition의 `go` 조건인 "법무 선결과제 일정/오너/기한 확정"이 미충족 상태다. [source: step3_preflight_check.md §2, §4]
> - 법무 선결 3건(공인중개사법 자문, 위치정보 신고, 표시광고 스키마)의 오너가 모두 `TBD`이며, 이것이 `pending → go` 전환의 최종 블로커다. [source: step3_preflight_check.md §4.1, step0_legal_compliance.md §9.1]

---

## 2) KPI 타당성 검토

### 2-A. 자문 전제: "이 기준이 너무 느슨하지 않은가?"

검토 대상 KPI별로, 현재 문서에 정의된 기준값을 Round2/3 스트레스 테스트 결과와 대조하여 느슨함 여부를 판단한다.

| KPI | 현재 기준 | 문제점 | 조정안 | 근거 |
|---|---|---|---|---|
| **result_to_inquiry_ctr** | `≥8%` go / `3~8%` pending / `<3%` no-go [source: step3_preflight_check.md §2] | **(1) go 임계값이 느슨하다.** Round3 합의 구간이 `3~10%`이므로, 합의 구간 중앙(≈6.5%)도 pending에 머문다. 즉 "가장 낙관적 시나리오에서만 go"인 기준처럼 보이지만, 반대로 합의 상한(10%)을 초과해야 확실한 go라는 점에서 **go 기준 8%는 합의 구간 내부에 있어 통과 확률이 낮다.** 이 자체는 보수적이라 느슨하지 않다. **(2) 반면 no-go 하한 3%가 느슨할 수 있다.** GPT 스트레스 결과 하한이 0.3%까지 내려가므로, 3% 미만이 되었을 때 이미 서비스 신뢰가 심각하게 훼손된 상태일 수 있다. 3%에서 no-go를 선언하면 이미 늦을 수 있다. | no-go 하한을 `<5%`로 상향 조정하거나, `3~5%` 구간에 별도 "경고(warning)" 레벨 신설을 권장한다. go 기준 8%는 유지해도 무방하다. | Round3 외피 하한 0.3%, 합의 하한 3% [source: round3_adjudication.md §4]. 합의 하한 = no-go 하한이면 "최악 사례에 도달해야 no-go"이므로 대응이 늦어진다. [가정: 업계 관행상 no-go 기준은 합의 구간 하한보다 위에 두는 것이 일반적] |
| **input_completion_rate (최소 입력 완료율)** | **명시적 gate 임계값 없음** [source: step3_preflight_check.md — 해당 KPI에 대한 go/pending/no-go 수치 기준 부재] | **가장 심각한 누락이다.** Round2 합의 `15~25%`, Round3 합의 `15~22%`로 스트레스 범위는 정의되어 있으나, 이 수치가 몇 %일 때 go/no-go인지 운영 기준이 없다. Step3에서 입력 완료율이 10% 미만으로 떨어져도 공식적으로 no-go를 선언할 근거가 없다. | **즉시 gate 임계값을 신설해야 한다.** 제안: `≥18%` go / `12~18%` pending / `<12%` no-go. 근거: 합의 구간 하한(15%)에 약간의 버퍼를 둔 12%를 no-go로, 합의 중앙(~20%) 근처를 go로 설정. | Round2 합의 `15~25%` [source: round2_adjudication.md §4], Round3 합의 `15~22%` [source: round3_adjudication.md §4]. 외피 하한 `6~10%`를 감안하면 12% 미만은 외피 하방 진입이므로 no-go가 타당. [가정: 입력 완료율 gate 기준은 합의 구간 하한과 외피 하한 사이에 no-go 선을 두는 것이 적절] |
| **drop_off_rate (단계별 이탈율)** | **KPI 자체가 정의되어 있지 않음** [source: 전체 문서 — drop_off_rate라는 명칭의 KPI 없음] | 퍼널 5단계(`landing→input_start→min_complete→result_view→inquiry_click`)는 계측 대상으로 P1에 명시되어 있으나, 각 구간의 이탈율을 KPI로 정의하거나 gate 기준으로 활용하는 문서는 없다. 현재 `result_to_inquiry_ctr`이 `result_view→inquiry_click` 구간만 커버하므로, 상류 퍼널의 병목(특히 `input_start→min_complete`)은 사각지대다. | **(1) Step3 초기 1주 내에 단계별 이탈율 정의를 P1으로 신설한다.** **(2) 최소한 `input_start → min_complete` 구간 이탈율을 보조 KPI로 추가하고, 외피 하한 기준 알람을 설정한다.** 예: `input_start_to_min_complete_rate < 20%`이면 경고. [가정] | 퍼널 이벤트 5종 고정이 P1 항목으로 존재 [source: step3_preflight_check.md §3], Round2에서 "입력 2단계 절벽"이 구조적 병목으로 채택됨 [source: round2_adjudication.md §3]. 이탈율 KPI 없이 계측만 하면 판정 근거가 부재. |

### 2-B. 보충 검토: 표본 기준의 타당성

현재 `result_view ≥ 200`을 최소 표본으로 가정하고 있다. [source: step3_preflight_check.md §2]

**문제:** 200건은 통계적 유의성 확보에 부족할 수 있다. `result_to_inquiry_ctr`이 8%(go 기준)인지 3%(no-go 기준)인지 구분하려면, 비율 검정(proportion test)의 관점에서 더 큰 표본이 필요하다.

- 예시: CTR 진짜값이 5%일 때 200건 중 기대 클릭 수는 10건이며, 95% 신뢰구간은 대략 `2.4%~9.0%`로 go/pending/no-go 3개 구간을 모두 포함해 판정이 불가능하다. [가정: 이항분포 기반 Clopper-Pearson 신뢰구간 추정]

---

## 3) 판정 프로토콜 제안

### 최소 표본

- **제안: `result_view ≥ 500`**
- 근거: CTR 5% 가정 시 500건이면 95% CI ≈ `3.3%~7.2%`로 go(8%)와 no-go(3%)를 어느 정도 분리 가능. 더 엄밀하게는 `≥ 800`이 바람직하나, 초기 서비스 트래픽 현실을 감안해 500을 최소선으로 제안한다. [가정: 업계 A/B 테스트 관행에서 전환율 5% 내외 측정 시 500~1000 표본이 일반적 최소치]
- 현재 문서 기준(`≥ 200`)은 **탐색적 관찰(directional signal)**로만 사용하고, 공식 gate 판정에는 부족하다.

### 최소 기간

- **제안: 최소 14일 (2주)**
- 근거:
    - 주거 탐색은 주중/주말 패턴 차이가 크다. [가정: 부동산 관련 서비스의 트래픽은 주말에 집중되는 경향이 있으며, 최소 2주기를 봐야 주중/주말 편향을 제거할 수 있음]
    - 법무 선결과제 운영 기간이 `2026-02-13~02-27`(2주)이므로, 법무 완료와 KPI 판정을 동기화할 수 있다. [source: step3_preflight_check.md §4.1]
    - 1주 미만 데이터는 초기 유입 편향(얼리어답터 효과)이 반영되어 과대추정 위험이 높다. [가정]

### 판정 규칙

| 조건 | 판정 |
|---|---|
| 표본 ≥ 500 + 관측 ≥ 14일 + `result_to_inquiry_ctr ≥ 8%` 연속 7일 + `input_completion_rate ≥ 18%` + 법무 P0 전건 완료 | **go** |
| 표본 ≥ 500 + 관측 ≥ 14일 + `result_to_inquiry_ctr 5~8%` 또는 `input_completion_rate 12~18%` + 법무 P0 중 1건 이상 미완 | **pending** (1주 추가 관찰 후 재판정) |
| (a) `result_to_inquiry_ctr < 5%` 연속 7일, 또는 (b) `input_completion_rate < 12%` 연속 7일, 또는 (c) 법무 자문에서 서비스 포지션 변경 필요 판정 | **no-go** (구조 변경 후 재진입) |

근거:
- "연속 7일"은 일시 변동 제거 + 주중/주말 1사이클 포함 목적. [가정: 업계 관행상 연속일 기준은 5~7일이 일반적]
- `pending` 재판정 시 1주 추가 관찰은 총 3주(14+7)로 한정해 무기한 보류를 방지한다. [가정]
- 법무 자문 결과가 서비스 포지션 자체를 변경해야 하는 수준이면, KPI와 무관하게 no-go로 처리한다. [source: step0_legal_compliance.md §1 — 금지 포지션이 확인될 경우]

---

## 4) 선행조건 P0/P1 재정렬

### P0 (필수 — 미충족 시 no-go)

- [ ] `No-Input Teaser → 최소 입력 → 정밀 입력` 3단 플로우 정책 확정 ✅ (기존 P0, 완료) [source: step3_preflight_check.md §3]
- [ ] 직장2/예산/월상한 입력 정책 확정 ✅ (기존 P0, 완료) [source: step3_preflight_check.md §3]
- [ ] 신뢰 UI 최소 세트 범위 확정 ✅ (기존 P0, 완료) [source: step3_preflight_check.md §3]
- [ ] 광고/제휴/중개 오인 방지 정책 범위 확정 ✅ (기존 P0, 완료) [source: step3_preflight_check.md §3]
- [ ] **법무 선결 3건 일정·오너·기한 문서 확정** ❌ (기존 P0, 미완료) [source: step3_preflight_check.md §3]
- [ ] **`input_completion_rate` gate 임계값 신설** ❌ (**신규 추가**) — 현재 누락
- [ ] **`result_to_inquiry_ctr` no-go 기준 재조정 (3% → 5%)** 또는 **경고 레벨 신설** ❌ (**신규 추가**)

### P1 (권장 — 미충족 시 conditional)

- [ ] 전화 없는 비동기 문의 CTA 기본 경로 설정 (기존 P1 유지) [source: step3_preflight_check.md §3]
- [ ] 퍼널 이벤트 5종 스키마 고정 (기존 P1 유지) [source: step3_preflight_check.md §3]
- [ ] `result_to_inquiry_ctr` 대시보드 추가 (기존 P1 유지) [source: step3_preflight_check.md §3]
- [ ] 통근 시간 범위+가정 표기 전환 (**기존 P0→P1로 하향 조정** — 아래 사유 참조)
- [ ] 입력 폼 안심 문구 표준화 (기존 P1 유지) [source: step3_preflight_check.md §3]
- [ ] **단계별 이탈율(drop_off_rate) 보조 KPI 정의** (**신규 추가**)
- [ ] **최소 표본 기준 200→500 상향 반영** (**신규 추가**)

### 기존 대비 변경 사항

| 항목 | 기존 분류 | 변경 후 | 변경 이유 |
|---|---|---|---|
| 통근 시간 범위+가정 표기 전환 | P0 (Round3 Must-Do #3) [source: round3_adjudication.md §6] | **P1** | 통근 표기 방식은 신뢰 개선에 기여하지만, 미적용 상태에서도 서비스 운영이 불가능한 수준은 아니다. Round3에서 신뢰 붕괴 1차 원인으로 채택된 것은 "광고 오인 + 블랙박스 인식"이며, 통근 괴리는 2차 요인이다. [source: round3_adjudication.md §3] Step3 초기 1주 내 적용으로 충분하다고 판단. |
| `input_completion_rate` gate 임계값 | 없음 | **P0 신규** | 위 §2에서 상술. 입력 퍼널이 Round2의 핵심 병목으로 확정되었으나 판정 기준이 없다. [source: round2_adjudication.md §1] |
| `result_to_inquiry_ctr` no-go 재조정 | 3% (현행) | **P0 신규 (5%로 상향 또는 경고 레벨 신설)** | 위 §2에서 상술. 합의 하한 = no-go 하한은 대응 지연 리스크. |
| 단계별 이탈율 보조 KPI | 없음 | **P1 신규** | 퍼널 계측은 P1으로 있으나, 이탈율 KPI 정의가 없어 계측 데이터의 판정 활용이 불가. |
| 최소 표본 기준 | 200 [가정] | **P1 신규 (500으로 상향)** | 위 §2-B에서 상술. 200건으로는 CTR 5~8% 구간에서 go/pending 구분이 통계적으로 불가능. |

---

## 5) 최종 판정

- **Verdict: `Conditional Pass`**

### 근거

**근거 1: 치명 결함 부재 + 3라운드 일관된 조건부 통과**  
Round1/2/3 전체에서 `fatal_found=false`이며, 입력 마찰(Round2)과 신뢰 붕괴(Round3) 모두 구현 가능한 대응책이 합의되었다. 서비스 구조 자체를 변경해야 하는 수준의 결함은 발견되지 않았다. [source: step2_summary.md §4, round2_adjudication.md §5, round3_adjudication.md §5]

**근거 2: 핵심 블로커(법무 + KPI 기준 누락)가 잔존**  
법무 선결 3건의 오너가 전원 TBD이며 [source: step3_preflight_check.md §4.1], `input_completion_rate`의 gate 임계값이 부재하고, `result_to_inquiry_ctr`의 no-go 하한이 합의 구간 하한과 동일해 판정 지연 리스크가 있다. 이 상태에서 `go`를 선언하면 Step3 진입 후 되돌리기 어려운 리스크가 통제되지 않는다.

**근거 3: 조건 충족 경로가 명확하고 시한이 한정적**  
법무 윈도우가 2주(~02-27)로 설정되어 있고 [source: step0_legal_compliance.md §9.1], P0 중 4/5건이 이미 완료되었으며 [source: step3_preflight_check.md §3], 잔여 항목(법무 오너 확정 + KPI 기준 신설)은 의사결정만으로 해소 가능한 수준이다. 따라서 `Fail`이 아닌 `Conditional Pass`가 적절하다.

---

## Appendix: 조건부 통과 → go 전환 체크리스트

아래 항목이 **전부** 충족되면 `go` 재판정을 권고한다:

1. 법무 선결 3건의 오너·시작일·목표일이 실명으로 확정되고 문서에 반영됨
2. `input_completion_rate` gate 임계값이 운영 문서에 명시됨
3. `result_to_inquiry_ctr` no-go 기준이 재조정되거나 경고 레벨이 신설됨
4. 최소 표본 기준이 200에서 500 이상으로 상향됨 (또는 200 유지의 통계적 근거가 문서화됨)
5. Risk Acceptance(step3_preflight_check.md §5)에 PM/Product/Legal 서명이 완료됨
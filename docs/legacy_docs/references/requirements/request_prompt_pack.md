# Requirements Research Prompt Pack v2 (Step4 Ready, Claude)

> **사용법**: 각 프롬프트를 Claude에 입력할 때, 지시된 문서를 함께 첨부(또는 붙여넣기)하세요.
> **실행 순서**: `Prompt 1 → Prompt 2 → Prompt 3/4 병렬 → Prompt 4.5 교차검증 → Prompt 5 → Prompt 6`
> **출력 형식**: 모든 산출물은 Markdown으로 고정
> **변경 이력**: v1 대비 주요 변경은 하단 [Changelog](#changelog) 참조

---

## 공통 입력 문서 (기본 세트)

아래 문서를 기본으로 첨부하세요.

| # | 문서 | 역할 | 토큰 부족 시 |
|---|------|------|-------------|
| 1 | `docs/planning/references/design_research/design_brief.md` | 기능 범위·UI 요구사항 원천 | ⭐ 우선 투입 |
| 2 | `docs/planning/step3_opportunity_priority.md` | 기회 우선순위 근거 | 요약 투입 가능 |
| 3 | `docs/planning/step3_preflight_check.md` | KPI 게이트·검증 기준 원천 | ⭐ 우선 투입 |
| 4 | `docs/planning/references/step3_readiness/results/step3_readiness_adjudication.md` | 판정 결과·조건부 통과 | ⭐ 우선 투입 |
| 5 | `docs/planning/step0_legal_compliance.md` | 법적 요구사항 원천 | P5에서 필수 |
| 6 | `docs/planning/references/legal_compliance/legal_compliance_adjudication.md` | 법적 판정 결과 | P5에서 필수 |
| 7 | `docs/planning/step4_mvp_plan.md` | MVP 범위·일정 | 항상 투입 |

선택 보강 문서:
- `docs/planning/step2_summary.md` — [가정] 항목이 많을 때 투입
- `docs/planning/step2_experiment_plan.md` — 실험 설계 근거 필요 시

---

## 공통 규칙 (모든 프롬프트에 적용)

아래 규칙은 모든 프롬프트에 공통 적용됩니다. 각 프롬프트 안에서 반복하지 않으니 항상 함께 투입하세요.

```markdown
## 공통 규칙 (이 블록을 모든 프롬프트 상단에 붙여넣으세요)

1. **근거 원칙**: 입력 문서 내용만 근거로 사용한다.
2. **가정 표시**: 문서에 없는 판단은 반드시 [가정]으로 표시한다.
3. **출처 표시**: 모든 요구사항·주장 끝에 [source: 파일명]을 붙인다.
4. **분리 원칙**: Production 기준과 Portfolio Override 기준을 혼합하지 말고 분리 표기한다.
5. **테스트 가능성**: 각 요구사항은 "~해야 한다" / "~하지 않아야 한다" 형식의 검증 가능한 한 문장으로 작성한다.
6. **ID 체계**: 아래 접두어를 사용한다.
   - FR-001, FR-002 ... (Functional Requirements)
   - NFR-001, NFR-002 ... (Non-Functional Requirements)
   - PR-001, PR-002 ... (Policy Requirements)
   - EPIC-01, EPIC-02 ... (Epics)
   - ST-001, ST-002 ... (Stories)
   - EVT-001, EVT-002 ... (Events)
7. **우선순위 기준**:
   - P0: MVP 출시에 반드시 필요 (없으면 출시 불가)
   - P1: MVP 품질에 중요하지만 출시 후 빠른 후속으로 대체 가능
   - P2: 있으면 좋지만 MVP 범위에서 제외 가능
8. **하지 말 것**:
   - 문서에 없는 기능을 창작하지 말 것
   - "일반적으로 ~한다" 식의 업계 관행을 근거로 사용하지 말 것
   - 하나의 요구사항에 여러 기능을 묶지 말 것 (1요구사항 = 1기능)
```

---

## Prompt 1: 요구사항 추출 (FR / NFR / Policy)

```markdown
당신은 시니어 Requirements Analyst입니다.

## 목표
첨부 문서를 근거로 Step4 구현용 요구사항(FR/NFR/Policy)을 빠짐없이 추출합니다.

## 입력 문서
- 공통 입력 문서 (기본 세트) 전체

## 작업 순서 (이 순서대로 사고하세요)
1. 각 입력 문서를 순회하며 "구현해야 할 것"을 모두 나열한다.
2. 나열된 항목을 FR / NFR / Policy로 분류한다.
3. 중복 항목을 병합하고, 병합 시 더 엄격한 기준을 채택한다.
4. 각 항목에 우선순위를 부여한다 (공통 규칙의 P0/P1/P2 기준 참조).
5. 누락 여부를 점검한다 — 아래 "커버리지 체크리스트"의 모든 카테고리에 최소 1개 이상의 요구사항이 있는지 확인한다.

## 커버리지 체크리스트 (빠짐 방지)
추출 완료 후, 아래 카테고리별로 최소 1개 이상 요구사항이 있는지 확인하세요.
없다면 해당 카테고리에 [누락 가능] 표시를 남기세요.

**FR 카테고리**:
- [ ] 온보딩/입력
- [ ] 스코어링/추천
- [ ] 결과 UI (리스트/지도/상세)
- [ ] 비교/공유
- [ ] CTA/아웃링크
- [ ] 계정/동의/정책
- [ ] 데이터 처리
- [ ] 에러/빈 상태(Empty State)

**NFR 카테고리**:
- [ ] 성능 (응답시간, 로딩)
- [ ] 보안/개인정보
- [ ] 접근성 (a11y)
- [ ] 관측성 (Observability)
- [ ] 데이터 품질

**Policy 카테고리**:
- [ ] 개인정보보호
- [ ] 부동산 표시/광고
- [ ] 전자상거래/중개
- [ ] 금융(대출/보험) 표시
- [ ] 위치정보
- [ ] 면책/고지

## 출력 형식

### 1) Executive Summary
- FR / NFR / Policy 각각의 총 개수와 P0 개수
- 리스크 상위 3개 (항목명 + 리스크 사유 1줄)
- 구현 난이도 상위 3개 (항목명 + 난이도 사유 1줄)

### 2) Functional Requirements
| FR ID | 요구사항 | 우선순위 | 카테고리 | 검증 기준 | source |
|---|---|---|---|---|---|

### 3) Non-Functional Requirements
| NFR ID | 요구사항 | 우선순위 | 카테고리 | 수치/SLO | source |
|---|---|---|---|---|---|

### 4) Policy/Compliance Requirements
| PR ID | 요구사항 | 우선순위 | 관련 규제 | 위반 시 영향 | source |
|---|---|---|---|---|---|

### 5) 커버리지 체크 결과
- 위 체크리스트 대비 누락 카테고리 목록
- 각 누락 항목에 대한 판단: 의도적 제외 vs 실수 누락

### 6) Open Questions Top 10
| # | 질문 | 영향 받는 요구사항 | Owner |
|---|---|---|---|

Owner: Product / Design / Dev / Legal 중 택 1

## 셀프 체크 (출력 전 반드시 확인)
- [ ] 모든 P0 항목에 [source]가 있는가?
- [ ] [가정] 표시가 누락된 문서 밖 판단이 없는가?
- [ ] "~해야 한다" 형식이 아닌 요구사항이 없는가?
- [ ] Production 기준과 Portfolio 기준이 혼재된 항목이 없는가?
- [ ] 하나의 요구사항에 2개 이상의 기능이 묶여있지 않은가?
```

권장 산출물 파일명: `requirements_extraction.md`

---

## Prompt 2: 충돌/모호성/누락 갭 분석

```markdown
당신은 Requirements Gap Hunter입니다.

## 목표
문서 간 충돌, 모호성, 누락 요구사항을 식별하고 채택안을 제시합니다.

## 입력 문서
- 공통 입력 문서 (기본 세트)
- requirements_extraction.md (P1 산출물 — 반드시 투입)

## 작업 순서
1. P1 산출물의 모든 요구사항을 기준 목록으로 설정한다.
2. 아래 5개 분석 축별로 원본 문서를 교차 대조한다.
3. 발견된 문제를 "충돌" vs "모호성" vs "누락"으로 분류한다.
4. 각 문제에 영향도를 매기고 채택안을 제시한다.

## 5대 분석 축

### 축 1: KPI 충돌
- Step3 게이트 수치(`result_to_inquiry_ctr`, `input_completion_rate`)와 Step4 성공 기준이 일치하는가?
- 게이트 구간(go/pending/no-go)이 문서 간 동일한가?
- **체크**: 수치가 다른 곳이 있으면 각 문서의 정확한 수치를 인용하고 어느 것을 채택할지 제안

### 축 2: 범위 충돌
- Step3 P0/P1 목록과 Step4 P0/P1/P2 목록을 비교
- Step3에서 P0인데 Step4에서 빠진 항목이 있는가?
- Step4에서 P0인데 Step3에서 언급 없는 항목이 있는가?

### 축 3: 정책 충돌
- "정보 제공 포지셔닝"과 실제 기능/카피/CTA 표현이 모순되지 않는가?
- **구체적 체크**: "추천", "최적", "최고" 같은 단어가 카피에 사용되었는데 면책 조항이 없는 경우

### 축 4: 데이터 충돌
- 비저장 아키텍처 원칙과 이벤트 계측 요구사항이 양립하는가?
- 세션 기반 데이터 중 "저장"으로 해석될 수 있는 항목이 있는가?

### 축 5: 운영 충돌
- Production 기준과 Portfolio Override 기준이 한 문서 안에서 혼재되어 있지 않은가?
- 동일 항목에 두 기준이 다른 판정을 내리는 경우가 있는가?

## 영향도 판정 기준
- **H (High)**: 해소하지 않으면 MVP 출시 불가 또는 법적 위험
- **M (Medium)**: 해소하지 않으면 KPI 측정이 부정확하거나 UX 품질 저하
- **L (Low)**: 해소하지 않아도 출시는 가능하지만 기술 부채 발생

## 출력 형식

### 1) Executive Summary
- 충돌 / 모호성 / 누락 각각의 개수
- 영향도 H인 항목 수
- 치명도 상위 3개 (항목명 + 1줄 요약)

### 2) Conflict Log (충돌)
| # | 항목 | 문서 A 내용 | 문서 B 내용 | 영향도 | 권장 채택안 | 채택 근거 | source |
|---|---|---|---|---|---|---|---|

### 3) Ambiguity Log (모호성)
| # | 항목 | 모호한 표현 (원문 인용) | 해석 A | 해석 B | 위험 | 확인 질문 | Owner | source |
|---|---|---|---|---|---|---|---|---|

### 4) Missing Requirements Top 10
| # | 누락 추정 항목 | 근거 | 예상 우선순위 | 누락 시 리스크 | 관련 FR ID |
|---|---|---|---|---|---|

### 5) Decision Questions (의사결정 필요 사항)

**P0 — 즉시 결정 필요 (Step4 착수 전)**
| # | 질문 | 선택지 | 영향 범위 | Owner |
|---|---|---|---|---|

**P1 — Step4 진행 중 결정 가능**
| # | 질문 | 선택지 | 데드라인 | Owner |
|---|---|---|---|---|

## 셀프 체크
- [ ] 5개 분석 축을 모두 검토했는가?
- [ ] 모든 H 항목에 구체적 채택안이 있는가?
- [ ] "충돌"과 "모호성"이 혼재된 항목이 없는가?
- [ ] P1 산출물의 P0 요구사항이 모두 교차 검증되었는가?
```

권장 산출물 파일명: `requirements_gap.md`

---

## Prompt 3: User Story + Acceptance Criteria (P0 중심)

```markdown
당신은 시니어 Product Owner입니다.

## 목표
P0 요구사항을 개발팀이 바로 구현 가능한 User Story + Acceptance Criteria로 변환합니다.
P1 요구사항은 Story까지만 작성하고 AC는 생략합니다.

## 입력 문서
- requirements_extraction.md (P1 산출물)
- requirements_gap.md (P2 산출물)
- docs/planning/references/design_research/design_brief.md
- docs/planning/step4_mvp_plan.md

## 사용자 맥락 (페르소나)
```
이름: 지은 & 민수 (가상)
프로필: 수도권 맞벌이 신혼부부, 30대 초반
사용 패턴:
- 평일 저녁: 모바일로 10~15분 짧은 탐색
- 주말 오전: 데스크톱으로 30분+ 깊은 비교
  핵심 니즈: "우리 예산/통근 조건에서 가능한 Top10을 신뢰할 수 있게 보여줘"
  불안 요소:
- "이 점수가 어떻게 나온 건지 모르겠어"
- "광고 아니야? 중립적인 정보 맞아?"
- "내 조건을 다 입력해야 해? 귀찮아"
```

## 작업 순서
1. P1의 P0 요구사항을 기능 흐름 순서로 그룹핑 → Epic 정의
2. 각 Epic 안에서 User Story 작성 (As a / I want / so that)
3. 각 P0 Story에 AC 작성 (Given / When / Then)
4. P2의 갭 분석에서 채택한 결정이 AC에 반영되었는지 확인
5. P1 요구사항은 Story만 작성, AC는 "[P1 — 후속 작성]"으로 표시

## Story 복잡도 판정 기준
- **S (Small)**: UI 변경 또는 단순 로직, 1~2일
- **M (Medium)**: API 연동 또는 중간 로직, 3~5일
- **L (Large)**: 복합 로직 + 외부 의존성, 5일+. → L이면 분할 필요 여부를 [분할 검토] 표시

## 출력 형식

### 1) Epic 목록
| Epic ID | Epic 명 | 기능 흐름 단계 | 포함 Story 수 (P0/P1) | 설명 |
|---|---|---|---|---|

### 2) User Stories (전체)
| Story ID | Epic | User Story | Priority | 복잡도 | 의존성 | source |
|---|---|---|---|---|---|---|

의존성 컬럼: 이 Story가 선행되어야 하는 다른 Story ID (없으면 "-")

### 3) Acceptance Criteria (P0만)

각 P0 Story에 대해:

---
#### [Story ID] [Story 제목]

**FR 매핑**: [관련 FR ID 목록]

**Happy Path**
```gherkin
Given [선행 조건]
When [사용자 행동]
Then [기대 결과 — 측정 가능한 표현]
```

**Edge Cases** (최소 2개)
```gherkin
Given [비정상 조건]
When [사용자 행동]
Then [시스템 대응 — 에러 메시지 또는 폴백]
```

**Compliance** (해당 시)
```gherkin
[Compliance] Given [정책 조건]
When [사용자 행동]
Then [정책 준수 결과]
```

**측정 연결**: 이 AC를 검증할 이벤트명 (P4에서 정의 예정이면 [P4 연결 필요] 표시)

---

### 4) Definition of Done (P0 공통)
| # | 기준 | 검증 방법 |
|---|---|---|
| 1 | 코드 리뷰 완료 | PR approved by 1+ reviewer |
| 2 | AC 기반 테스트 통과 | 자동화 테스트 green |
| 3 | 정책 체크 통과 | [Compliance] AC 전체 pass |
| 4 | 디자인 QA | design_brief.md 대비 스크린 비교 |
| 5 | 이벤트 QA | 해당 이벤트 정상 발화 확인 |

### 5) Story Map (텍스트 다이어그램)
```
[Epic 흐름 순서]
EPIC-01 온보딩  →  EPIC-02 결과  →  EPIC-03 상세  →  EPIC-04 비교/공유
  ST-001           ST-004          ST-007          ST-010
  ST-002           ST-005          ST-008          ST-011
  ST-003           ST-006          ST-009
```

## 셀프 체크
- [ ] P1의 모든 P0 FR이 최소 1개 Story에 매핑되었는가?
- [ ] 모든 P0 AC가 Given/When/Then 형식인가?
- [ ] L 복잡도 Story에 [분할 검토] 표시가 있는가?
- [ ] [Compliance] AC가 필요한 Story에 빠짐없이 작성되었는가?
- [ ] P2에서 채택한 결정이 AC에 반영되었는가?
```

권장 산출물 파일명: `requirements_story_ac.md`

---

## Prompt 4: 이벤트/지표 명세 (Gate 고정)

```markdown
당신은 Product Analytics Spec Writer입니다.

## 목표
Step4 검증용 KPI/이벤트/대시보드 스펙을 고정합니다.
모든 P0 User Story의 AC가 측정 가능하도록 이벤트를 설계합니다.

## 입력 문서
- docs/planning/step3_preflight_check.md
- docs/planning/references/step3_readiness/results/step3_readiness_adjudication.md
- docs/planning/step4_mvp_plan.md
- requirements_extraction.md (P1 산출물)

## 고정 게이트 (문서 우선, 변경 제안은 [대안]으로 분리)
| 지표 | go | pending | no-go | source |
|---|---|---|---|---|
| result_to_inquiry_ctr | >= 8% | 5~8% | < 5% | step3_preflight_check |
| input_completion_rate | >= 18% | 12~18% | < 12% | step3_preflight_check |
| 최소 표본 | result_view >= 500 | | | step3_preflight_check |
| 최소 기간 | 14일 | | | step3_preflight_check |

## 작업 순서
1. 고정 게이트의 분자/분모 이벤트를 먼저 정의한다.
2. P1의 모든 P0 FR에 대해 검증용 이벤트를 추가한다.
3. 사용자 퍼널 순서로 이벤트를 정렬한다.
4. 이벤트 속성에 PII가 포함되지 않았는지 검증한다.
5. 비저장 아키텍처 제약과 양립하는지 확인한다.

## 이벤트 네이밍 규칙
- 형식: `{object}_{action}` (소문자, 언더스코어)
- 예: `result_view`, `onboarding_step_complete`, `outlink_click`
- 금지: camelCase, 한글, 공백, 하이픈

## 출력 형식

### 1) KPI Definition
| KPI | 계산식 | 분자 이벤트 | 분모 이벤트 | 게이트 구간 | 판정 시점 | source |
|---|---|---|---|---|---|---|

### 2) Funnel Definition (퍼널 순서)
```
onboarding_start
→ onboarding_step_complete (× N steps)
→ min_input_complete
→ result_view
→ score_detail_view / outlink_click / compare_add
→ [전환 목표] inquiry_click
```

### 3) Event Dictionary
| EVT ID | 이벤트명 | 퍼널 단계 | 트리거 조건 | 필수 속성 | 선택 속성 | PII | source |
|---|---|---|---|---|---|---|---|

필수 이벤트군 (최소한 아래가 모두 포함되어야 함):

**온보딩 퍼널**:
- onboarding_start, onboarding_step_complete, min_input_complete

**결과 탐색**:
- result_view, result_sort, result_filter

**상세/점수**:
- score_detail_view, why_not_expand

**전환 액션**:
- outlink_click, compare_add, compare_view, share_click

**정책/동의**:
- consent_shown, consent_accepted, policy_version_exposed

**에러/품질**:
- api_error, scoring_error, data_stale_detected

### 4) 이벤트 속성 상세 (복잡한 이벤트만)
각 복잡 이벤트에 대해:
```
이벤트: result_view
필수 속성:
- session_id: string (비PII 세션 식별자)
- result_count: integer
- sort_type: enum [score_desc, price_asc, price_desc, commute_asc]
- filter_applied: boolean
  선택 속성:
- load_time_ms: integer
  PII 검증: ✅ PII 없음
  비저장 검증: ✅ session_id는 세션 종료 시 폐기
```

### 5) Data Quality Checklist
| # | 체크 항목 | 기준 | 검증 방법 |
|---|---|---|---|
| 1 | 이벤트 유실률 | < 1% | 클라이언트 발화 수 vs 서버 수신 수 비교 |
| 2 | 이벤트 중복률 | < 0.1% | 동일 session_id + timestamp 중복 체크 |
| 3 | 세션 타임아웃 | 30분 무활동 시 새 세션 | 타임아웃 후 첫 이벤트에 새 session_id |
| 4 | 필수 속성 누락 | 0% | 스키마 밸리데이션 |
| 5 | 퍼널 순서 위반 | 경고 로그 | result_view 없이 outlink_click 발생 시 |

### 6) Dashboard Minimum Spec
| 패널 | 차트 타입 | 갱신 주기 | 알림 조건 |
|---|---|---|---|
| 퍼널 전환율 | 퍼널 차트 | 실시간 | 전환율 전일 대비 30%+ 하락 |
| KPI 추이 | 라인 차트 (일별) | 일 1회 | go/pending/no-go 구간 표시 |
| 에러율 | 바 차트 | 실시간 | 에러율 > 5% |
| 표본 누적 | 카운터 | 실시간 | 500 도달 시 알림 |

### 7) Gate 판정 프로토콜
```
판정 조건:
1. 최소 기간 충족: 운영일 >= 14일
2. 최소 표본 충족: result_view >= 500
3. 두 조건 모두 충족 시:
    - 각 KPI를 게이트 구간에 대조
    - 모든 KPI가 go → GO
    - 하나라도 no-go → NO-GO
    - 나머지 → PENDING (사유 기록)

미충족 시:
- 기간 미달: 연장 운영
- 표본 미달: 트래픽 확보 방안 논의
```

## 셀프 체크
- [ ] 고정 게이트의 분자/분모 이벤트가 Event Dictionary에 존재하는가?
- [ ] P1의 모든 P0 FR에 대응하는 측정 이벤트가 있는가?
- [ ] 모든 이벤트 속성에서 PII 여부를 확인했는가?
- [ ] 비저장 아키텍처 위반 이벤트가 없는가?
- [ ] 퍼널 순서가 사용자 흐름과 일치하는가?
```

권장 산출물 파일명: `requirements_events.md`

---

## Prompt 4.5: Story ↔ Event 교차 검증 (신규)

```markdown
당신은 QA Analyst입니다.

## 목표
P3(User Story + AC)과 P4(이벤트 명세) 간의 정합성을 검증합니다.

## 입력 문서
- requirements_story_ac.md (P3 산출물)
- requirements_events.md (P4 산출물)

## 작업
1. P3의 각 P0 Story AC를 순회한다.
2. 각 AC의 "Then" 절에 대응하는 측정 이벤트가 P4에 존재하는지 확인한다.
3. P4의 각 이벤트가 최소 1개의 Story AC와 연결되는지 확인한다.
4. 불일치를 목록으로 출력한다.

## 출력 형식

### 1) AC → Event 매핑
| Story ID | AC 구분 | Then 절 요약 | 매핑 이벤트 | 상태 |
|---|---|---|---|---|

상태: ✅ 매핑됨 / ❌ 이벤트 없음 / ⚠️ 부분 매핑 (속성 부족)

### 2) 미연결 이벤트 (Event → AC 역매핑)
| EVT ID | 이벤트명 | 연결된 Story | 비고 |
|---|---|---|---|

연결된 Story가 없으면 "고아 이벤트 — 필요성 재검토"

### 3) 수정 필요 사항
| # | 대상 문서 | 수정 내용 | 우선순위 |
|---|---|---|---|

## 결과 처리
- 수정 사항이 있으면 P3 또는 P4를 업데이트한 후 P5로 진행
- 수정 사항이 없으면 바로 P5로 진행
```

권장 산출물 파일명: `requirements_cross_check.md`

---

## Prompt 5: 컴플라이언스 매핑 (출시 게이트 분리)

```markdown
당신은 Compliance Reviewer입니다.

## 목표
P0 요구사항과 컴플라이언스 통제 항목을 매핑하고,
Production 출시 게이트와 Portfolio 데모 게이트를 분리해 정의합니다.

## 입력 문서
- docs/planning/step0_legal_compliance.md
- docs/planning/references/legal_compliance/legal_compliance_adjudication.md
- docs/planning/references/step3_readiness/results/step3_readiness_adjudication.md
- requirements_story_ac.md (P3 산출물)

## 6대 규제 영역 (모두 커버 필수)
아래 6개 영역 모두에 대해 매핑이 존재해야 합니다.
해당 Story가 없으면 "해당 없음 — [사유]"로 기록합니다.

| # | 규제 영역 | 주요 법률/가이드 |
|---|---|---|
| 1 | 개인정보보호 | 개인정보보호법, 정보통신망법 |
| 2 | 부동산 표시/광고 | 공인중개사법, 표시광고법 |
| 3 | 전자상거래/중개 | 전자상거래법, 전자금융거래법 |
| 4 | 금융 표시 | 여신전문금융업법, 대부업법 |
| 5 | 위치정보 | 위치정보법 |
| 6 | 면책/고지 | 소비자기본법, 약관규제법 |

## 상태 판정 기준
- **충족**: 현재 설계로 규제 요건 완전 충족
- **부분 충족**: 설계는 있으나 구현 세부사항에 따라 미충족 가능 → 구체적 조건 기술
- **미충족**: 현재 설계에 해당 통제 없음 → 필요 조치 기술
- **[법률자문 필요]**: 법률 해석이 확정되지 않은 항목

## 출력 형식

### 1) Compliance Mapping
| Story ID | 요구사항 요약 | 규제 영역 | 관련 법률 | 통제 항목 | 상태 | 미충족 시 조치 | source |
|---|---|---|---|---|---|---|---|

### 2) Production Release Gate Checklist
MVP를 실 서비스로 출시하기 위해 반드시 통과해야 하는 항목.

| # | 게이트 항목 | 규제 영역 | 검증 방법 | 현재 상태 | 블로커 여부 |
|---|---|---|---|---|---|

### 3) Portfolio Demo Gate Checklist
포트폴리오 데모/내부 시연 수준에서 필요한 항목 (Production 대비 완화).

| # | 게이트 항목 | Production 대비 차이 | 검증 방법 | 현재 상태 |
|---|---|---|---|---|

### 4) Must-Fix Before Production
| # | 항목 | 현재 상태 | 필요 조치 | 예상 공수 | 블로커 여부 | source |
|---|---|---|---|---|---|---|

### 5) Post-Launch Compliance Roadmap
| # | 항목 | 트리거 시점 | 조치 | 관련 규제 | source |
|---|---|---|---|---|---|

트리거 시점 예시: "사용자 1,000명 돌파 시", "유료 전환 시", "대출 비교 기능 추가 시"

## 셀프 체크
- [ ] 6대 규제 영역이 모두 1회 이상 언급되었는가?
- [ ] Production Gate와 Portfolio Gate가 명확히 분리되었는가?
- [ ] "미충족" 항목 모두에 구체적 조치가 있는가?
- [ ] [법률자문 필요] 항목이 있다면 Open Items로 별도 정리했는가?
```

권장 산출물 파일명: `requirements_compliance.md`

---

## Prompt 6: 최종 통합 (Requirements Baseline)

```markdown
당신은 Requirements Integrator입니다.

## 목표
Prompt 1~5 산출물을 통합해 개발팀 실행용 단일 베이스라인을 작성합니다.
이 문서는 "새로운 분석"이 아니라 "기존 결과의 통합·판정"입니다.

## 입력 문서
1. requirements_extraction.md (P1)
2. requirements_gap.md (P2)
3. requirements_story_ac.md (P3)
4. requirements_events.md (P4)
5. requirements_cross_check.md (P4.5) — 있다면
6. requirements_compliance.md (P5)
7. docs/planning/step3_preflight_check.md
8. docs/planning/step4_mvp_plan.md

## 통합 원칙 (우선순위 순)
1. **컴플라이언스 우선**: 정책 요구사항이 기능 요구사항과 충돌 시 정책이 이긴다.
2. **P0 우선**: P0 > P1 > P2. 자원 부족 시 P1/P2부터 절삭한다.
3. **정량 우선**: 정량 기준이 정성 표현보다 우선한다.
4. **분리 원칙**: Production 판정과 Portfolio 판정을 반드시 분리한다.
5. **미결 명시**: 해소 불가 항목은 [미결]로 명시하고 Owner를 지정한다.

## 작업 순서
1. P1~P5 산출물의 Executive Summary를 종합한다.
2. P2의 Conflict Log에서 "채택안"이 P3/P4/P5에 일관 반영되었는지 확인한다.
3. P4.5의 교차 검증 결과에서 미해소 항목을 Open Items로 이동한다.
4. Adjudicated Baseline을 작성한다.
5. Traceability Matrix를 작성한다.
6. 판정(verdict)을 내린다.

## 출력 형식

### 1) Executive Summary
- 최종 요구사항 수: FR ___개 / NFR ___개 / Policy ___개
- P0: ___개 / P1: ___개 / P2: ___개
- 해소된 충돌: ___건 / 미결: ___건
- 법률자문 필요: ___건

### 2) Consensus Summary (핵심 합의 5개)
| # | 합의 사항 | 근거 | source |
|---|---|---|---|

### 3) Disagreement Log (미해소 충돌)
| # | 항목 | 충돌 내용 | 채택값 | 채택 근거 | 대안 | Owner | source |
|---|---|---|---|---|---|---|---|

### 4) Adjudicated Baseline Requirements
| Req ID | 요구사항 | 우선순위 | 카테고리 | Story ID | AC 요약 | 컴플라이언스 상태 | source |
|---|---|---|---|---|---|---|---|

### 5) Traceability Matrix (신규)
| FR ID | Story ID | AC 수 | 관련 이벤트 (EVT ID) | Compliance 상태 | 비고 |
|---|---|---|---|---|---|

이 테이블로 "요구사항 → 구현 → 측정 → 규제 준수"의 전체 추적이 가능해야 합니다.
매핑 없는 행이 있다면 [Gap] 표시.

### 6) Implementation Sequence

**Phase 1 — P0 (MVP 출시 필수)**
| 순서 | Story ID | 요약 | 의존성 | 예상 복잡도 |
|---|---|---|---|---|

**Phase 2 — P1 일부 (출시 후 2주 내)**
| 순서 | Story ID | 요약 | 의존성 |
|---|---|---|---|

**Phase 3 — P1/P2 (출시 후 1개월 내)**
| 순서 | Story ID | 요약 |
|---|---|---|

**의존성 메모**: Phase 간 의존성이 있는 경우 명시

### 7) Decision Log
```yaml
production_verdict: GO | CONDITIONAL GO | NO-GO
portfolio_verdict: GO | CONDITIONAL GO | NO-GO
fatal_found: true | false
conditions:
  - "[조건 1]"
  - "[조건 2]"
must_do_top5:
  - "[항목 1]"
  - "[항목 2]"
  - "[항목 3]"
  - "[항목 4]"
  - "[항목 5]"
verdict_rationale: "[판정 근거 2~3줄]"
```

### 8) Open Items
**법률자문 필요**
| # | 항목 | 관련 규제 | 데드라인 | Owner |
|---|---|---|---|---|

**추가 리서치 필요**
| # | 항목 | 사유 | 데드라인 | Owner |
|---|---|---|---|---|

**의사결정 필요**
| # | 항목 | 선택지 | 데드라인 | Owner |
|---|---|---|---|---|

### 9) JSON Summary
```json
{
  "version": "1.0",
  "date": "YYYY-MM-DD",
  "production_verdict": "CONDITIONAL GO",
  "portfolio_verdict": "GO",
  "fatal_found": false,
  "requirements_count": {
    "FR": 0, "NFR": 0, "Policy": 0,
    "P0": 0, "P1": 0, "P2": 0
  },
  "conflicts": {
    "resolved": 0, "unresolved": 0
  },
  "kpi_gate": {
    "result_to_inquiry_ctr": {"go": ">=8%", "pending": "5~8%", "no_go": "<5%"},
    "input_completion_rate": {"go": ">=18%", "pending": "12~18%", "no_go": "<12%"}
  },
  "must_do_top5": ["", "", "", "", ""],
  "open_items": ["", "", ""],
  "legal_review_needed": 0
}
```

## 셀프 체크
- [ ] Traceability Matrix에 Gap 표시된 행이 없는가? (있다면 Open Items에 등록)
- [ ] P2의 모든 H 충돌이 Disagreement Log 또는 Consensus Summary에 있는가?
- [ ] Production Gate와 Portfolio Gate 판정이 분리되어 있는가?
- [ ] verdict가 conditions 및 must_do_top5와 일관성이 있는가?
- [ ] JSON Summary와 본문 수치가 일치하는가?
```

권장 산출물 파일명: `requirements_baseline.md`

---

## 토큰 관리 팁

| 상황 | 권장 방법 |
|---|---|
| 컨텍스트 초과 | P1/P2는 공통 문서 중 ⭐ 표시 3개 우선 투입 |
| P6 컨텍스트 과다 | P1~P5 산출물의 **Executive Summary + 핵심 테이블(P0만)** 투입 |
| P6 우선순위 | P5(컴플라이언스) > P1(FR/NFR) > P3(Story AC) > P4(이벤트) > P2(갭) |
| 반복 실행 | 파일명 뒤에 `_v2`, `_v3` 추가 |
| Claude 사용 | 파일 첨부 후 프롬프트 실행, 출력은 Markdown 파일로 저장 |
| [가정]이 많을 때 | 보강 문서(`step2_summary.md`, `step2_experiment_plan.md`) 추가 투입 |

---

## 롤백 가이드

특정 단계에서 심각한 문제가 발견되었을 때 대응 방법:

| 발견 시점 | 문제 유형 | 롤백 대상 | 조치 |
|-----------|----------|----------|------|
| P2 갭 분석 | P0 범위 충돌 (H) | P1 재실행 | 범위 조정 반영 후 P1 → P2 순차 재실행 |
| P3 Story 작성 | 모호성 해소 불가 | P2 업데이트 | P2 갭 분석에 미결 항목 추가 → P3 재실행 |
| P4.5 교차 검증 | AC ↔ Event 불일치 | P3 또는 P4 | 불일치 항목 수정 후 P4.5 재실행 |
| P5 컴플라이언스 | 법적 블로커 발견 | P3 Story AC 수정 | [Compliance] AC 추가 → P5 재실행 |
| P6 통합 | Gate 수치 불일치 | P4 이벤트 명세 | 수치 정정 → P6 재실행 |

---

## Changelog (v1 → v2)

| 변경 사항 | 영향 프롬프트 | 사유 |
|-----------|-------------|------|
| 공통 규칙 블록 분리 | 전체 | 중복 제거 + 일관성 확보 |
| ID 체계 통일 (FR-/NFR-/PR-/ST-/EVT-) | 전체 | 문서 간 추적성 확보 |
| 우선순위 판정 기준 명시 | P1 | P0/P1/P2 판단 근거 표준화 |
| 커버리지 체크리스트 추가 | P1 | 카테고리별 누락 방지 |
| P2를 P1 순차 의존으로 변경 | P2 | 갭 분석 정밀도 향상 |
| 영향도 판정 기준 (H/M/L) 명시 | P2 | 주관적 판단 줄이기 |
| 모호성 Log에 "해석 A/B" 컬럼 추가 | P2 | 모호성의 구체적 위험 시각화 |
| 페르소나 상세화 + 불안 요소 추가 | P3 | Story 품질 향상 |
| Story 복잡도 판정 기준 추가 | P3 | L 사이즈 분할 검토 유도 |
| Story 의존성 컬럼 추가 | P3 | 구현 순서 파악 용이 |
| Story Map 텍스트 다이어그램 추가 | P3 | Epic 간 흐름 시각화 |
| 이벤트 네이밍 규칙 추가 | P4 | 일관된 이벤트명 |
| 퍼널 다이어그램 추가 | P4 | 이벤트 흐름 시각화 |
| 이벤트 속성 상세 섹션 추가 | P4 | 구현 시 모호성 제거 |
| Data Quality 체크리스트 테이블화 | P4 | 검증 기준 명확화 |
| **Prompt 4.5 교차 검증 신규 추가** | P4.5 | Story↔Event 정합성 보장 |
| 6대 규제 영역 테이블 명시 | P5 | 커버리지 누락 방지 |
| 상태 판정 기준 상세화 | P5 | "부분 충족" 판단 근거 |
| Post-Launch 트리거 시점 예시 추가 | P5 | 실행 시점 구체화 |
| **Traceability Matrix 추가** | P6 | FR→Story→Event→Compliance 전체 추적 |
| Implementation Sequence 테이블화 | P6 | Phase별 실행 순서 명확화 |
| verdict_rationale 필드 추가 | P6 | 판정 근거 기록 |
| JSON Summary 필드 보강 | P6 | 자동화 파싱 용이 |
| 모든 프롬프트에 셀프 체크 추가 | 전체 | 오류 전파 방지 |
| 공통 입력 문서에 토큰 우선순위 표시 | 전체 | 토큰 부족 시 가이드 |
| 롤백 가이드 추가 | README | 문제 발생 시 대응 체계 |
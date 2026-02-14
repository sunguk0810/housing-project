# Operating Model Research — Refined Prompt

---

## Role

```
당신은 Product/Engineering Operating Model Research Lead입니다.
```

---

## Goal

현재 프로젝트를 기준으로, **서비스 기획 → 개발 → 배포** 전 구간을 커버하는
"과도하지 않은" 운영 규칙(문서 체계 + 개발 플로우 + 배포 규칙)을 설계하라.

구체적으로:
1. 대기업 / 중견 / 스타트업의 운영 방식을 **웹 리서치 기반**으로 비교하라.
2. 우리 상황(1~2인 팀, 빠른 실행, 포트폴리오 겸용)에 맞는 **실용형 하이브리드 규칙**을 제안하라.
3. 제안한 규칙을 **즉시 적용 가능한 템플릿**과 **30일 도입 계획**으로 구체화하라.

---

## Constraints (반드시 지켜야 할 것)

1. **웹 리서치 필수** — 모든 주장에 출처 링크를 붙여라. 최근 3~5년 자료를 우선 사용하라.
2. **사실/해석 분리** — 문서에 없는 판단은 반드시 `[가정]`으로 표시하라.
3. **최소 규칙 우선** — 회의·문서·승인 절차를 추가할 때마다 "이것이 없으면 어떤 사고가 나는가?"를 명시하라. 답이 없으면 제거하라.
4. **한국어** 작성, 애매한 표현 대신 **수치/조건** 중심으로 작성하라.
5. **프로젝트 컨텍스트를 반드시 읽은 뒤 작업을 시작하라** (아래 §참조).

---

## Project Context (첨부 ZIP)

첨부된 ZIP 파일에 프로젝트 전체 문서가 포함되어 있다.
작업 시작 전 아래 순서로 컨텍스트를 파악하라:

### 필수 읽기 (우선순위 순)
| 순서 | 파일 | 읽는 목적 |
|---|---|---|
| 1 | `docs/planning/README.md` | 전체 기획 흐름/Step 구조 파악 |
| 2 | `docs/planning/step4_mvp_plan.md` | 현재 MVP 범위와 기능 스코프 |
| 3 | `docs/planning/step0_legal_compliance.md` | 법무/컴플라이언스 제약 |
| 4 | `docs/planning/step3_preflight_check.md` | KPI/게이트 판정 기준 |
| 5 | `docs/planning/references/design_research/design_brief.md` | 디자인 의사결정 구조 |
| 6 | `docs/planning/references/requirements/README.md` | 요구사항 체계 현황 |
| 7 | `docs/planning/references/requirements/request_prompt_pack.md` | 프롬프트 기반 작업 흐름 |

### 배경 요약 (읽기 전 사전 지식)
- 문서가 `step0 → step1 → ... → step4` 중심으로 쌓여 있음
- "step" 네이밍을 **실무(Production) 언어**로 재정리하고 싶음
- 엄격한 통제보다 **개발 흐름을 방해하지 않는 규칙**이 필요함
- Production 기준과 Portfolio Override 기준이 공존함

---

## Tasks (작업 순서)

아래 순서대로 진행하라. 각 태스크는 출력 형식의 해당 섹션에 매핑된다.

| # | 태스크 | 출력 섹션 | 핵심 질문 |
|---|---|---|---|
| T1 | 대기업/스타트업 프로젝트 운영 방식 비교 | §2 Research Evidence Table | 어떤 규칙이 실제로 사고를 방지했는가? |
| T2 | 공통 효과적 최소 규칙 추출 | §2 하단 요약 | 조직 규모와 무관하게 효과적인 규칙은? |
| T3 | 운영모델 2안 제시 | §3, §4 | A안(Startup Lean) vs B안(Scale-ready Lean) |
| T4 | 최종 1안 선택 + 근거 | §5 | 우리 상황에서 왜 이 안인가? |
| T5 | 문서 체계 재설계 (IA) | §6 | step → production 네이밍 전환, 폴더/파일 구조 |
| T6 | 규칙을 Must/Should/Could로 분류 | §7 | 문서 규칙 / 개발 규칙 / 배포 규칙 각각 |
| T7 | 추적성(Traceability) 설계 | §8 | 요구사항 ↔ 설계 ↔ 이벤트 ↔ 테스트 ↔ 배포 ID 체계 |
| T8 | 30일 도입 계획 | §9 | Week 1~4, 각 주 산출물과 완료 기준 |
| T9 | 리스크 및 과잉통제 방지 가드레일 | §10 | 규칙이 부담이 되는 시점 감지 + 제거 기준 |
| T10 | 즉시 사용 가능한 템플릿 | §11 | PRD / Requirement Baseline / Release Checklist |

---

## Research Scope (검색 축)

리서치는 아래 3축으로 제한하라. 범위가 넓으면 품질이 떨어진다.

| 축 | 검색 키워드 (예시) | 기대 산출물 |
|---|---|---|
| 문서 체계 | "lightweight product documentation", "startup PRD template", "ADR best practices" | 문서 종류/깊이 비교 |
| 개발 플로우 | "trunk-based development small team", "GitHub flow vs GitFlow", "CI/CD for solo developer" | 브랜치/리뷰/머지 규칙 |
| 배포 규칙 | "release checklist startup", "feature flag rollout", "canary deployment small team" | 배포 게이트/롤백 기준 |

---

## Output Format (Markdown 고정)

```markdown
## 1) Executive Summary
<!-- 5줄 이내. 핵심 결론만. -->

## 2) Research Evidence Table
<!-- 표 5행 이상. 열: 조직/출처 | 핵심 방식 | 장점 | 단점 | 우리 적용도(H/M/L) | 링크 -->
<!-- 표 아래에 "공통 최소 규칙 3~5개" 요약 -->

## 3) Operating Model Option A — Startup Lean
<!-- 대상: 1~3인, 속도 최우선 -->
<!-- 포함: 문서 체계 / 개발 플로우 / 배포 규칙 / 예상 주간 오버헤드(시간) -->

## 4) Operating Model Option B — Scale-ready Lean
<!-- 대상: 3~8인, 확장 대비 -->
<!-- 포함: 문서 체계 / 개발 플로우 / 배포 규칙 / 예상 주간 오버헤드(시간) -->

## 5) Recommended Model
<!-- 최종 1안 선택 + 선택 이유(3줄) + 도입 비용/기대효과 비교 표 -->

## 6) Documentation IA
<!-- 폴더/파일 트리 (코드블록) -->
<!-- step → production 네이밍 매핑 표 -->
<!-- 문서 간 연결(요구사항 ↔ 설계 ↔ 이벤트 ↔ 테스트 ↔ 배포) 다이어그램 또는 표 -->

## 7) Rules v1 (Must / Should / Could)
### 7-a) 문서 규칙
### 7-b) 개발 규칙
### 7-c) 배포 규칙
<!-- 각 규칙에: 규칙 문장 | 등급 | 위반 시 리스크 | 예시 -->

## 8) Traceability Design
<!-- ID 체계: FR-001 → DS-001 → EVT-001 → TC-001 → REL-001 -->
<!-- 추적 매트릭스 예시 (표 3행 이상) -->

## 9) 30-Day Adoption Plan
<!-- Week 1~4, 각 주: 목표 / 산출물 / 완료 기준(DoD) / 담당 -->

## 10) Risks & Anti-overhead Guardrails
<!-- 리스크 표: 리스크 | 발생 조건 | 대응 | 제거 기준 -->
<!-- "규칙 제거 트리거": 이 조건이 되면 이 규칙을 폐기한다 -->

## 11) Ready-to-Use Templates
### 11-a) PRD Template
### 11-b) Requirement Baseline Template
### 11-c) Release Checklist Template
<!-- 각 템플릿: 즉시 복사해서 사용 가능한 수준 -->
<!-- 빈 칸 + 작성 가이드 + 예시 1행 포함 -->
```

---

## Self-Check (출력 전 반드시 확인)

- [ ] 모든 주장에 출처 링크가 있는가? (없으면 `[가정]` 표시)
- [ ] Must 규칙이 10개를 초과하지 않는가? (초과 시 우선순위 재정렬)
- [ ] 각 규칙에 "위반 시 리스크"가 명시되어 있는가?
- [ ] 템플릿이 빈 칸 + 가이드 + 예시를 모두 포함하는가?
- [ ] 30일 계획의 각 주에 DoD(완료 기준)가 있는가?
- [ ] 프로젝트 컨텍스트(ZIP)의 현재 문서 구조를 §6에서 명시적으로 참조했는가?
- [ ] Production 기준과 Portfolio Override 기준이 혼합되지 않고 분리되어 있는가?
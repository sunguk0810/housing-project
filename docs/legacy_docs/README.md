# Product Planning Docs (아카이브)

## 아카이브 안내

이 폴더의 문서는 의사결정 이력 보존용입니다. **정본이 아닙니다.**
정본은 `docs/PHASE0_ground.md` ~ `docs/PHASE4_ship_learn.md` 문서를 참조하세요.

`merged/` 폴더: 정본에 병합 완료된 문서의 원본입니다.
- `PRD_service.md` → PHASE0에 병합 완료
- `Policy_service.md` → PHASE0에 병합 완료
- `planning_doc.md` → PHASE0에 병합 완료
- `detailed_plan.md` → PHASE1에 병합 완료
- `implementation_plan.md` → PHASE1에 병합 완료
- `portfolio_direction_plan.md` → PHASE1에 병합 완료

---

이 폴더는 기존에 제품 기획을 `Legal Gate -> Discovery -> Validation -> Delivery -> Learning` 흐름으로 운영하기 위한 작업 공간이었습니다.

현재 기준 문서:
- `docs/planning/references/research_result/신혼부부_주거추천서비스_리서치_종합정리.md`
- `docs/planning/references/legal_compliance/legal_compliance_adjudication.md`

## 문서 순서

1. `step0_legal_compliance.md`
2. `step1_define_discovery.md`
3. `step2_market_discovery.md`
4. `step3_opportunity_priority.md`
5. `step4_mvp_plan.md`
6. `step5_validation.md`
7. `step6_delivery_plan.md`
8. `step7_product_learned.md`

보조 실행 문서:
- `step2_interview_guide.md`
- `step2_experiment_plan.md`
- `step2_summary.md`
- `docs/planning/references/legal_compliance/request_prompt.md`
- `docs/planning/references/requirements/README.md`
- `docs/planning/references/requirements/request_prompt_pack.md`
- `docs/planning/references/virtual_interview/request_prompt.md`

## 사용 규칙

- 각 스텝 문서 상단의 `Status`를 `draft -> in_progress -> done`으로 업데이트합니다.
- 각 스텝 완료 시, 바로 다음 스텝 문서로 넘어가며 핵심 결론만 연결합니다.
- `Non-goals`를 매 스텝에서 명시해 범위가 커지는 것을 방지합니다.
- 수치 KPI는 항상 `기준값 + 목표값 + 판정 시점`을 같이 기록합니다.
- Step3 진입 전 `법무/컴플라이언스 게이트`를 함께 충족해야 합니다.
- 포트폴리오 트랙은 `step3_preflight_check.md`에 예외 승인 기록이 있을 때만 Step3/Step4 진행을 허용합니다.
- 서비스 정책 문서(약관/개인정보/광고표기 등)는 `step4_mvp_plan.md` 완료 후 산출물로 작성합니다.

## 요구사항 리서치 시점

- 수행 단계: 기획 단계 내 `Step3 확정 직후 -> Step4 최종 확정 직전`
- 목적: 기획 가설을 `개발 가능한 요구사항(FR/NFR/AC/이벤트/컴플라이언스 매핑)`으로 변환
- 실행 방식: Claude 단일 리서치(멀티모델 비교 생략)
- 실행 자료: `docs/planning/references/requirements/request_prompt_pack.md`

## Method Guardrail

- Step2의 AI 결과는 `실제 인터뷰 대체가 아니라 가설 탐색용 Proxy`입니다.
- Legal 문서도 `법률 자문 대체`가 아니며, 출시 전 최종 법률 검토가 필요합니다.
- 실제 제품 리서치는 타겟 사용자를 직접 만나 아래 순서로 진행해야 합니다.
  1. 타겟 리쿠르팅
  2. 현재 행동/고통 인터뷰
  3. 꼬리질문으로 의사결정 기준 검증
  4. 프로토타입 사용 관찰
  5. 정량 실험 결합 판정

## Q&A Loop 규칙

각 스텝은 아래 순서로 반복합니다.

1. 현재 가설/결정을 문서에 먼저 반영
2. 미확정 항목을 `Q&A Loop` 질문으로 분리
3. 답변을 받아 문서 재반영
4. Done Checklist 기준 충족 시 다음 스텝 이동

## 현재 진행 상태

| 문서 | 상태 | 메모 |
| --- | --- | --- |
| `step0_legal_compliance.md` | in_progress | Adjudication 기준으로 통제안 반영 완료, 법률 자문/신고 실행 항목 pending |
| `step1_define_discovery.md` | done | 1인 의사결정 기준으로 Step1 항목 확정 완료 |
| `step2_market_discovery.md` | done (AI Proxy only) | Q&A Loop 확정 반영, Step3 조건부 진입 게이트 정의 완료 |
| `step2_experiment_plan.md` | done (AI Proxy only) | Red-Team Round1/2/3 완료, Step3 Gate는 보완 전제 `pending` |
| `step2_interview_guide.md` | blocked | Human Validation 실행 불가 상태, 인터뷰 트랙 보류 |
| `step3_opportunity_priority.md` | done | 포트폴리오 트랙 기준 `go` 승인, Production 게이트는 별도 유지 |

AI 결과 저장 경로:
- `docs/planning/references/virtual_interview`
- 인터뷰 원본: `docs/planning/references/virtual_interview/interview`
- 합의/요약 결과: `docs/planning/references/virtual_interview/result`
- 법무 리서치/합의: `docs/planning/references/legal_compliance`

## 빠른 시작

1. `step0_legal_compliance.md`의 P0 Must-Do 및 Step3 Gate 항목을 확인합니다.
2. `step2_market_discovery.md`와 `step2_experiment_plan.md`의 KPI/Red-Team 조건을 업데이트합니다.
3. 법무 게이트 + 실험 게이트 동시 충족 시 `step3_opportunity_priority.md`를 확정합니다. (포트폴리오는 예외 승인 문서 기반으로 진행)
4. `docs/planning/references/requirements/request_prompt_pack.md`로 요구사항 리서치를 수행합니다.
5. `step4_mvp_plan.md`에서 P0 기능과 컴플라이언스 요구사항을 함께 고정합니다.
6. 이후 `step5`~`step7`에서 검증/배포/학습을 기록합니다.

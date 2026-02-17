---
plan-id: "2026-02-17_codex_onboarding-prompt-alignment-implementation"
status: "done"
phase: "PHASE3"
template-version: "1.1"
work-type: "feature"
---

# /search 온보딩 프롬프트 정합 구현

## 목표

`/search` 온보딩 플로우를 `onboarding_page_implementation_prompt.md` 기준으로 정합 구현하고,
E2E 기반 UI/UX 가이드 검증 체계를 프로젝트에 고정한다.

## 범위

- In Scope:
  - Step1 입력 구조를 주거형태 + 결혼예정일로 전환
  - Step4를 슬라이더(개별 0~100) + 생활권 칩 + 자녀계획 수집으로 재구성
  - payload 매핑/세션 마이그레이션/로딩 단계 연계 수정
  - 주소 검색 오버레이 UI/결과 구조 정합 개선
  - 레거시 step 파일 deprecated 표기 정리
  - Playwright E2E(플로우 + UI/UX 가이드 검증) 자산 추가
- Out of Scope:
  - `/results`, `/complex`, `/compare` 화면 리디자인
  - 추천 엔진 가중치 정책 자체 변경
  - 레거시 step 파일 물리 삭제
- 참조 SoT:
  - `docs/PHASE0_ground.md` (법무/컴플라이언스 금지선)
  - `docs/PHASE1_design.md` (스코어링/엔진 경계)
  - 구현 기준 문서: `docs/research/design-system/prompt/onboarding_page_implementation_prompt.md`
- 선행 plan: 없음

## 작업 단계

1. 레거시 step 파일 deprecated 표기 정비 + StepWizard 실제 렌더 경로 기준 정리
2. Step1/Step4 데이터 모델 개편 (marriagePlannedAt, priorityWeights, livingAreas, childPlan 이동)
3. useStepForm Zod 스키마/세션 마이그레이션(v1->v2) 구현
4. Step5 payload 변환 로직 갱신 (priorityWeights 정규화 -> weightProfile, marriagePlannedAt 제외)
5. 주소 검색 오버레이 UI/결과 렌더 정합 개선
6. Playwright E2E 및 UI/UX 가이드 체크 테스트 추가
7. 타입체크/테스트 실행 후 결과 기록

## 검증 기준

1. `/search` Step1~5 플로우가 새로운 입력 모델로 정상 동작한다.
2. `useStepForm` 세션 복원 시 구버전 데이터(v1)도 안전 변환된다.
3. `/api/recommend` 호출 payload가 스키마와 호환되고 `marriagePlannedAt`은 제외된다.
4. 금지 문구/컴플라이언스 테스트에 위반이 없다.
5. E2E에서 Must 항목(핵심 플로우/CTA/라우팅)이 통과한다.

## 결과/결정

- 상태: `done`
- 핵심 결과:
  - Step1이 주거형태 + 결혼예정일 입력으로 전환됨
  - Step4가 슬라이더 + 생활권 칩 + 자녀계획 수집 구조로 교체됨
  - `useStepForm`에 v2 세션 저장 포맷 및 v1->v2 마이그레이션 적용
  - Step5 payload 변환이 `priorityWeights -> weightProfile` 기반으로 갱신됨
  - 주소 검색 오버레이가 라벨/밑줄 입력/2계층 결과 UI로 보강됨
  - Playwright E2E 온보딩 플로우 + UI/UX 검증 세트가 레포에 고정됨
- 미해결 이슈: 없음
- 다음 액션: 사용자 승인 시 feature 단위 커밋 진행

## Verification 이력

### Run 1 (2026-02-17)

```json
{
  "phase": "PHASE3",
  "verdict": "pending",
  "run": 1,
  "score": {
    "completeness": 0.0,
    "consistency": 0.0,
    "compliance": 0.0
  },
  "blockers": [],
  "next_actions": [
    "Step1/Step4 데이터 구조 변경",
    "세션 마이그레이션 구현",
    "E2E 테스트 자산 추가"
  ],
  "timestamp": "2026-02-17"
}
```

### Run 2 (2026-02-17)

```json
{
  "phase": "PHASE3",
  "verdict": "go",
  "run": 2,
  "score": {
    "completeness": 1.0,
    "consistency": 0.95,
    "compliance": 1.0
  },
  "blockers": [],
  "next_actions": [],
  "timestamp": "2026-02-17"
}
```

### Run 3 (2026-02-17)

```json
{
  "phase": "PHASE3",
  "verdict": "go",
  "run": 3,
  "score": {
    "completeness": 1.0,
    "consistency": 0.95,
    "compliance": 1.0
  },
  "blockers": [],
  "next_actions": [],
  "checks": [
    "pnpm exec vitest run src/__tests__/lib/priorities.test.ts src/__tests__/hooks/useStepForm.test.ts src/__tests__/pages/search.test.tsx",
    "pnpm test:e2e:onboarding",
    "pnpm build"
  ],
  "timestamp": "2026-02-17"
}
```

## 체크리스트

- [x] 파일명 규칙 충족
- [x] 필수 섹션 5개 존재
- [x] SoT 참조 경로 포함
- [x] 자동 커밋 없음 (수동 커밋 정책 준수)
- [x] YAML frontmatter 포함 (plan-id, status, phase)
- [x] depends-on 참조 plan의 condition 평가 충족 확인 (해당 없음)

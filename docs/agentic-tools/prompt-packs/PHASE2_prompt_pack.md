# PHASE2 Prompt Pack

이 문서는 `PHASE2 Build` 작업을 위한 표준 프롬프트 묶음입니다.

## 목적

- `docs/PHASE2_build.md`를 마일스톤 실행 규약으로, `docs/PHASE1_design.md`를 설계 정본(SoT)으로 유지하면서 코드 구현 + 검증 작업을 표준화한다.
- 마일스톤별(M1~M4) Milestone Planning → Codex Task Generation → Code Review → Milestone Verification 흐름을 고정한다.
- Plan Execute 기록(`docs/plan/`)과 연결한다.

## 전제 조건

1. PHASE1 설계 검증 verdict `go` (Run 2, 2026-02-14)
2. `docs/PHASE2_build.md` 존재 + 필수 섹션(목표, 범위, 산출물, 게이트 기준) 확인
3. **패키지 매니저는 pnpm만 허용한다. npm/npx 사용 금지** (`pnpm dlx` 또는 `pnpm exec`으로 대체)

## 에이전트 페어 운영 모델

> docs/PHASE2_build.md > Section 1 참조

| 역할                     | 에이전트        | 담당                                                          |
| ------------------------ | --------------- | ------------------------------------------------------------- |
| Planning / Creative      | **Claude Code** | 마일스톤 계획, 태스크 분해, 코드 리뷰, SoT 검증, Verification |
| Domain-Specific / Detail | **Codex**       | ETL 스크립트, 스코어링 엔진, API 구현, 컴포넌트 구현          |

### 개발 루프

```
1. Claude Code: Milestone Planning Prompt → 태스크 분해 + Codex 태스크 정의
   └─ 산출물: plan 문서 > "M<N> 태스크 분해" 섹션에 기록
2. Claude Code: Codex Task Generation Prompt → 구체적 Codex 태스크 생성
   └─ 산출물: plan 문서 > "M<N> Codex 태스크" 섹션에 기록
3. Codex: 코드 생성 (plan 문서의 Codex 태스크 섹션을 복사하여 전달)
4. Claude Code: Code Review Prompt → diff 리뷰 + SoT 체크리스트 검증
   └─ 산출물: plan 문서 > "M<N> Code Review" 섹션에 기록
5. Claude Code: Milestone Verification Prompt → Output Contract pass/fail 판정
   └─ 산출물: plan 문서 > "Verification 이력" 섹션에 JSON 누적
6. 개발자: 판단 후 수동 커밋
```

> 커밋은 항상 개발자가 직접 실행한다.

### 태스크 영속화 및 전달 규칙

각 프롬프트의 산출물은 **plan 문서에 영속화**한다. 대화 컨텍스트에만 의존하지 않는다.

| 단계                   | 산출물                   | plan 문서 기록 위치      | 후속 단계 참조 방식              |
| ---------------------- | ------------------------ | ------------------------ | -------------------------------- |
| Milestone Planning     | 태스크 분해 표 + OC 매핑 | `### M<N> 태스크 분해`   | Codex Task Generation의 입력     |
| Codex Task Generation  | Codex 태스크 프롬프트    | `### M<N> Codex 태스크`  | **Codex에 복사-붙여넣기로 전달** |
| Code Review            | Findings + 판정          | `### M<N> Code Review`   | Milestone Verification의 입력    |
| Milestone Verification | Verification JSON        | `### Run N (YYYY-MM-DD)` | 다음 마일스톤 진입 조건          |

**Codex 전달 동선**:

1. Claude Code가 Codex Task Generation Prompt로 태스크 프롬프트를 생성한다
2. 생성된 프롬프트를 plan 문서의 `### M<N> Codex 태스크` 섹션에 기록한다
3. 개발자가 해당 섹션의 내용을 Codex에 복사-붙여넣기로 전달한다
4. Codex 실행 결과(코드 diff)를 Claude Code가 Code Review Prompt로 검증한다

## Plan Mode 부트스트랩 규칙 (필수)

- 이 Prompt Pack은 `Plan mode`에서 실행한다.
- 시작 직후 `docs/plan/YYYY-MM-DD_<agent>_<topic>.md`를 먼저 1건 생성하고 상태를 `in_progress`로 둔다.
- 생성한 plan 문서 1건에 마일스톤별 실행 결과를 순차 누적한다. 각 프롬프트 산출물의 기록 위치는 "태스크 영속화 및 전달 규칙" 참조.
- Milestone Verification 완료 후 같은 문서의 `결과/결정`에 `done|partial|blocked`와 후속 액션을 확정한다.
- `<agent>` 허용값은 `claude-code`, `codex`, `handoff`만 사용한다.

### Plan Mode 시작 프롬프트 (권장)

```markdown
docs/agentic-tools/prompt-packs/PHASE2*prompt_pack.md를 실행 규약으로 사용해.
Plan mode로 수행하고, 시작 즉시 docs/plan/YYYY-MM-DD_claude-code*<topic>.md를 생성해.
마일스톤 M<N>을 실행해. 같은 plan 문서에 실행 결과를 누적 기록해.
종료 시 결과/결정에 상태(done|partial|blocked), blockers, next_actions, Verification JSON을 확정해.
```

## 정본 참조 규칙

- SoT 링크 형식: `docs/PHASEX_*.md > SX`
- 설계 정본: `docs/PHASE1_design.md` > S1~S7
- 요구사항 정본: `docs/PHASE0_ground.md` (FR/NFR/KPI/법무 체크리스트)
- 빌드 마일스톤: `docs/PHASE2_build.md` > Section 2
- 금지: 동일 정의 복붙 (링크 참조만 허용)
- **S2(DB 스키마)와 S4(스코어링 로직)는 `docs/PHASE1_design.md`가 유일한 수정 지점** -- 코드 구현 시 이 정의를 기준으로 구현하되, 정의 자체를 다른 문서에 복제하지 않는다

## SoT 준수 체크리스트 (공통)

> docs/PHASE2_build.md > Section 3 참조. 매 기능 완료 시 아래 체크리스트를 확인한다.

- [ ] 스코어링 로직 수정 시: PHASE1 S4가 유일한 수정 지점인가?
- [ ] 새 이벤트 추가 시: PHASE0 S2 Metrics에 정의가 있는가?
- [ ] DB 스키마 변경 시: PHASE1 S2를 먼저 수정했는가?
- [ ] 법무 UI 수정 시: PHASE0 S4 Legal Gate와 일치하는가?
- [ ] 다른 Phase 문서에 같은 내용을 복사하지 않았는가?
- [ ] 개인정보(연봉/주소)가 로그/DB에 저장되지 않는가? (NFR-1)
- [ ] 중개 오인 문구("추천" 대신 "분석 결과")를 사용하지 않는가?
- [ ] 공공데이터 출처 표기가 포함되었는가? (NFR-4)
- [ ] TypeScript strict 모드를 통과하는가?
- [ ] 크롤링/스크래핑 코드가 포함되지 않았는가? (NFR-4)
- [ ] `pnpm build` / `pnpm lint` 통과하는가?

## 마일스톤별 Output Contract (M1~M4)

### M1 Foundation (4개)

| ID    | 항목                                                    | 검증 방법                         |
| ----- | ------------------------------------------------------- | --------------------------------- |
| M1-O1 | Next.js + TypeScript strict + Tailwind + shadcn/ui 설정 | `pnpm build` pass                 |
| M1-O2 | `db/schema.sql`이 PHASE1 S2와 1:1 대응, PostGIS 활성화  | S2 테이블 6개 + 인덱스 대조       |
| M1-O3 | PHASE1 S7 디자인 토큰이 Tailwind 설정에 반영            | `tailwind.config.ts` 토큰 값 대조 |
| M1-O4 | `.env.example` + ESLint/Prettier + `pnpm lint` pass     | `pnpm lint` 실행 결과             |

### M2 Data+Engine (4개)

| ID    | 항목                                              | 검증 방법                                              |
| ----- | ------------------------------------------------- | ------------------------------------------------------ |
| M2-O1 | ETL 파이프라인 동작, 크롤링 코드 없음 (NFR-4)     | ETL 스크립트 실행 + 코드 내 크롤링 패턴 검색           |
| M2-O2 | PHASE1 S4 스코어링 엔진 구현                      | `pnpm test` pass + S4 정규화/가중합/최종점수 로직 대조 |
| M2-O3 | API 엔드포인트 구현, PHASE1 S5 계약 충족          | S5 request/response 스펙 대조                          |
| M2-O4 | PII 비저장 확인 (NFR-1), 법무 #3/#4 `implemented` | 코드 내 PII 저장 경로 검색 + 법무 체크리스트 대조      |

### M3 Frontend (4개)

| ID    | 항목                                                                  | 검증 방법                                     |
| ----- | --------------------------------------------------------------------- | --------------------------------------------- |
| M3-O1 | 3단 퍼널(랜딩 → 입력 → 결과) 동작, PHASE1 S6 컴포넌트 구현            | S6 컴포넌트 목록 대조 + 퍼널 흐름 확인        |
| M3-O2 | 신뢰 UI (면책 고지, 출처 표기, 점수 근거, 외부 이동 고지)             | PHASE0 S4 Legal Gate 대조                     |
| M3-O3 | 동의 분리(ConsentForm), 금지 문구 0건, 법무 #1/#5/#6/#7 `implemented` | 코드 내 금지 문구 검색 + 법무 체크리스트 대조 |
| M3-O4 | KakaoMap + 마커 + ResultCardList 연동                                 | 지도-카드 연동 동작 확인                      |

### M4 Polish (4개)

| ID    | 항목                                                                                                                                         | 검증 방법                                            |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| M4-O1 | mobile/tablet/desktop 반응형 (NFR-5)                                                                                                         | PHASE1 S7 breakpoints(390px/1024px/1280px) 기준 확인 |
| M4-O2 | API 응답 성능 -- 로컬 개발 환경에서 `POST /api/recommend` 단건 응답 < 3s (DB 시드 데이터 기준). 스테이징/프로덕션 p95 < 2s는 PHASE3에서 측정 | 로컬 API 호출 시간 측정                              |
| M4-O3 | PHASE0 이벤트 10개 트래킹 구현                                                                                                               | PHASE0 S2 이벤트 목록 대조                           |
| M4-O4 | `pnpm build` pass + `pnpm lint` 0 error + PHASE1 S1 보안 설계 구현                                                                           | 빌드/린트 실행 + S1 보안 설계 대조                   |

## 1) Milestone Planning Prompt (Claude Code)

```markdown
당신은 PHASE2 마일스톤 플래너입니다.

## 목표

마일스톤 M<N>의 태스크를 분해하고 Codex 태스크를 정의한다.

## 입력

- docs/PHASE2_build.md > Section 2 > M<N> 체크리스트
- docs/PHASE1_design.md > S1~S7 (설계 정본)
- docs/PHASE0_ground.md (FR/NFR/KPI/법무 교차참조)

## 규칙

- 패키지 매니저: pnpm만 사용 (npm/npx 금지, pnpm dlx 또는 pnpm exec으로 대체)
- SoT 링크: docs/PHASEX\_\*.md > SX 형식 유지
- 동일 정의 복붙 금지 (링크 참조만)
- S2(DB 스키마)와 S4(스코어링 로직)는 PHASE1_design.md가 유일한 수정 지점
- 코드에서 "추천" 단독 사용 금지 -> "분석 결과" 또는 "안내"로 대체
- 개인정보 비저장 원칙 (NFR-1) 준수
- 크롤링/스크래핑 코드 작성 금지 (NFR-4)

## 작업

1. M<N> 체크리스트 항목을 독립 실행 가능한 태스크로 분해
2. 태스크별 참조 SoT 섹션 지정
3. 태스크별 예상 산출물(파일 목록) 정의
4. 태스크 간 의존 관계 정리 (선후행)
5. Codex에 위임할 태스크 vs Claude Code 직접 수행 태스크 분류
6. Output Contract M<N>-O1~O4와 태스크 매핑

## 출력 형식

> 아래 내용을 plan 문서의 `### M<N> 태스크 분해` 섹션에 기록한다.

### 마일스톤 개요

- M<N> 목표 1줄 요약

### 태스크 분해

| #   | 태스크명 | 에이전트 | 참조 SoT | 산출물 | 선행 태스크 |
| --- | -------- | -------- | -------- | ------ | ----------- |

### Output Contract 매핑

| OC  | 관련 태스크 |
| --- | ----------- |

### Codex 위임 태스크 요약

- 태스크별 Codex Task Generation Prompt로 전달할 핵심 요구사항
```

## 2) Codex Task Generation Prompt (Claude Code -> Codex)

````markdown
당신은 Codex 태스크 생성기입니다.

## 목표

Milestone Planning에서 정의된 Codex 위임 태스크를 codex-task-template 기반으로 구체화한다.

## 입력

- Milestone Planning 결과 (태스크 분해 + Codex 위임 목록)
- docs/agentic-tools/prompt-packs/templates/codex-task-template.md (템플릿)
- docs/PHASE1_design.md > 해당 SoT 섹션
- docs/PHASE0_ground.md > S4 Legal Gate

## 규칙

- 패키지 매니저: pnpm만 사용 (npm/npx 금지)
- codex-task-template의 실행 명령을 pnpm 기반으로 생성:
  ```bash
  pnpm build
  pnpm lint
  pnpm test
  ```
````

- 체크리스트 4개 항목 필수 포함:
  - [ ] 개인정보(연봉/주소)가 로그/DB에 저장되지 않는가
  - [ ] 중개 오인 문구("추천" 대신 "분석 결과")를 사용하지 않는가
  - [ ] 공공데이터 출처 표기가 포함되었는가
  - [ ] TypeScript strict 모드 통과하는가
- 추가 체크리스트: 태스크별 SoT 관련 검증 항목 추가

## 작업

1. Codex 위임 태스크별로 codex-task-template 형식의 프롬프트 생성
2. 참조 문서 경로를 구체적으로 명시 (docs/PHASE1_design.md > S<N>)
3. 구현 범위(수정/비수정 파일) 명시
4. 실행 명령을 pnpm 기반으로 지정

## 출력 형식

> 아래 내용을 plan 문서의 `### M<N> Codex 태스크` 섹션에 기록한다.
> 개발자는 이 섹션의 내용을 Codex에 복사-붙여넣기로 전달한다.

태스크별로 아래 형식 반복:

---

## 작업: [태스크명]

## 참조 문서: docs/PHASE1_design.md > [섹션]

## 구현 범위

- 수정 파일:
- 비수정 파일:

## 체크리스트:

- [ ] (공통 4개)
- [ ] (태스크별 추가)

## 실행 명령

```bash
pnpm build
pnpm lint
pnpm test
```

## 결과 보고 형식

### 변경점

### 검증 결과

### 리스크/후속

---

````

## 3) Code Review Prompt (Claude Code)

```markdown
당신은 PHASE2 코드 리뷰어입니다.

## 목표
Codex 산출물의 diff를 리뷰하고 SoT 준수 체크리스트를 검증한다.

## 입력
- Codex 산출물 (코드 diff)
- 해당 태스크의 Codex Task Generation Prompt (체크리스트 포함)
- docs/PHASE1_design.md > 해당 SoT 섹션
- docs/PHASE0_ground.md > S4 Legal Gate, NFR

## Severity 기준
- Critical: SoT(S2/S4) 불일치, PHASE0 FR/NFR 미수용, PII 저장, 크롤링 코드, 금지 문구 포함
- High: API 계약(S5) 불일치, 스코어링 로직 오류, 디자인 토큰(S7) 미반영
- Medium: 컴포넌트 구조(S6) 불완전, 이벤트 트래킹 누락
- Low: 코드 스타일, 네이밍, 가독성

## 점검 항목
1. **SoT 준수 체크리스트** (전체 11개 항목) 통과 여부
2. **법무 금지 문구 검색**: "대출 가능 보장", "거래 성사 보장", "투자 수익 보장", "가장 안전한 지역 확정", "최적 투자 확정", "추천" 단독 사용
3. **PII 비저장 검증**: DB 스키마, 로그 출력, API 응답에 PII 포함 여부
4. **크롤링 코드 검색**: 웹 스크래핑/크롤링 패턴 존재 여부
5. **TypeScript strict 위반**: `any` 타입 사용 여부
6. **S2 대응**: DB 마이그레이션/스키마가 PHASE1 S2와 1:1 대응하는지
7. **S4 대응**: 스코어링 엔진이 PHASE1 S4 정규화/가중합/최종점수 로직과 일치하는지
8. **S5 대응**: API request/response가 PHASE1 S5 계약을 충족하는지
9. **S7 대응**: 디자인 토큰이 PHASE1 S7과 일치하는지
10. **패키지 매니저**: 코드/설정에서 npm/npx 사용 여부 (pnpm만 허용)

## 출력 형식

> 아래 내용을 plan 문서의 `### M<N> Code Review` 섹션에 기록한다.

### Findings (severity 순)
- [Severity] 항목명: 설명 (파일:라인)

### SoT 준수 체크리스트 판정
- [ ] 항목별 pass|fail

### 빌드 건강도
- build: pass|fail
- lint: pass|fail
- test: pass|fail (해당 시)

### Required Fixes
- P0(필수 수정): Critical/High 항목
- P1(권장 수정): Medium/Low 항목

### 판정
- approve: P0 0건 + 빌드 건강도 전체 pass
- request-changes: P0 1건 이상 또는 빌드 실패
````

## 4) Milestone Verification Prompt

````markdown
당신은 PHASE2 마일스톤 게이트 판정자입니다.

## 목표

마일스톤 M<N>의 Output Contract pass/fail을 판정하고 Verification JSON을 출력한다.

## 입력

- Code Review 결과 (전체 태스크)
- 마일스톤 M<N> Output Contract (M<N>-O1~O4)
- docs/PHASE1_design.md > 해당 SoT 섹션
- docs/PHASE0_ground.md (FR/NFR/KPI/법무 교차참조)

## 계산 규칙

### completeness (M*-O* pass 비율)

completeness = M<N>-O\* pass 수 / 4

### consistency (SoT 준수 체크리스트 통과 비율)

SoT 준수 체크리스트 11개 항목 중 해당 마일스톤에 적용 가능한 항목만 분모로 산정:

| #   | 체크리스트 항목                        | M1  | M2  | M3  | M4  |
| --- | -------------------------------------- | --- | --- | --- | --- |
| 1   | 스코어링 로직 PHASE1 S4 유일 수정 지점 | -   | O   | -   | -   |
| 2   | 새 이벤트 PHASE0 S2 정의 존재          | -   | -   | -   | O   |
| 3   | DB 스키마 PHASE1 S2 먼저 수정          | O   | -   | -   | -   |
| 4   | 법무 UI PHASE0 S4 일치                 | -   | -   | O   | -   |
| 5   | 다른 Phase 문서 복사 금지              | O   | O   | O   | O   |
| 6   | PII 비저장 (NFR-1)                     | O   | O   | O   | O   |
| 7   | 중개 오인 문구 금지                    | -   | -   | O   | O   |
| 8   | 출처 표기 (NFR-4)                      | -   | O   | O   | -   |
| 9   | TypeScript strict 통과                 | O   | O   | O   | O   |
| 10  | 크롤링/스크래핑 금지 (NFR-4)           | -   | O   | -   | -   |
| 11  | pnpm build / pnpm lint 통과            | O   | O   | O   | O   |

consistency = 해당 마일스톤 적용 항목 중 통과 수 / 적용 항목 수

### compliance (빌드 건강도)

빌드 건강도 구성 항목:

| 항목  | 명령         | M1  | M2  | M3  | M4  |
| ----- | ------------ | --- | --- | --- | --- |
| build | `pnpm build` | O   | O   | O   | O   |
| lint  | `pnpm lint`  | O   | O   | O   | O   |
| test  | `pnpm test`  | N/A | O   | O   | O   |

**N/A 처리 규칙**:

- 해당 마일스톤에 테스트가 없거나 N/A인 항목은 분모에서 제외
- 예: M1에 test 없음 -> compliance = (`pnpm build` pass + `pnpm lint` pass) / 2
- 최소 1개 항목은 적용 가능해야 함 (`pnpm build`은 항상 적용)
- 빌드 건강도 계산은 pnpm 명령 기준으로만 산정

compliance = 통과 항목 수 / 적용 가능 항목 수

## verdict 규칙

- go: completeness == 1.0 AND consistency == 1.0 AND compliance >= 0.67 AND blockers == 0
- pending: blockers == 0 AND go 조건 일부 미충족
- no-go: blockers > 0

## 출력 형식

1. 판정 요약 (3줄 이내)

2. Output Contract 판정

| OC      | 판정      | 근거 |
| ------- | --------- | ---- |
| M<N>-O1 | pass/fail |      |
| M<N>-O2 | pass/fail |      |
| M<N>-O3 | pass/fail |      |
| M<N>-O4 | pass/fail |      |

3. SoT 준수 체크리스트 판정 (적용 항목만)

4. 빌드 건강도

| 항목  | 결과          | 비고 |
| ----- | ------------- | ---- |
| build | pass/fail     |      |
| lint  | pass/fail     |      |
| test  | pass/fail/N/A |      |

5. blockers 목록 (있을 경우)
6. next_actions 목록
7. Verification JSON

```json
{
  "phase": "PHASE2",
  "milestone": "M<N>",
  "verdict": "go|pending|no-go",
  "run": 1,
  "score": {
    "completeness": 0.0,
    "consistency": 0.0,
    "compliance": 0.0
  },
  "blockers": [],
  "next_actions": [],
  "timestamp": "YYYY-MM-DD"
}
```
````

```

### Verification JSON 스키마 설명

PLAN_OPERATION_GUIDE Section 5 최소 스키마의 **상위 호환 확장**이다. 표준 키(`completeness`, `consistency`, `compliance`)를 유지하되, PHASE2 고유 의미로 재정의한다.

| 표준 키 | PHASE0/1 의미 | PHASE2 의미 | 계산 |
|---------|-------------|-------------|------|
| `completeness` | OC pass 비율 | M*-O* pass 비율 | pass 수 / 4 |
| `consistency` | SoT 규칙 통과 비율 | SoT 준수 체크리스트 통과 비율 | 통과 수 / 적용 항목 수 |
| `compliance` | NFR 수용 비율 | 빌드 건강도 (build/lint/test) | 위 N/A 규칙 참조 |

추가 키: `"milestone": "M<N>"` -- PHASE2 고유 확장 필드.

## 실행 순서

1. Plan mode 시작 + plan 문서 생성 (`in_progress`)
2. 마일스톤 M<N> 선택
3. **Milestone Planning Prompt** 실행 → 결과를 plan 문서 `### M<N> 태스크 분해`에 기록
4. **Codex Task Generation Prompt** 실행 → 결과를 plan 문서 `### M<N> Codex 태스크`에 기록
5. 개발자가 plan 문서의 Codex 태스크 섹션을 Codex에 복사-붙여넣기로 전달 → Codex 코드 생성
6. **Code Review Prompt** 실행 → 결과를 plan 문서 `### M<N> Code Review`에 기록
7. (P0 발견 시) 수정 후 6번 재실행
8. **Milestone Verification Prompt** 실행 → Verification JSON을 plan 문서 `### Run N`에 누적
9. verdict `go` 시 다음 마일스톤으로 이동, `no-go`/`pending` 시 수정 후 재검증

## 검증 통과 기준

- Output Contract M<N>-O1~O4 전부 pass
- Verification JSON 스키마 키 누락 없음 (`phase`, `milestone`, `verdict`, `run`, `score`, `blockers`, `next_actions`, `timestamp`)
- verdict 값이 `go|pending|no-go` 중 하나
- SoT 위반 0건
- 금지 문구 0건
- PII 저장 경로 0건
- 크롤링 코드 0건
- 코드/설정에서 npm/npx 사용 0건
- compliance N/A 처리 규칙이 적용되었는지 확인
```

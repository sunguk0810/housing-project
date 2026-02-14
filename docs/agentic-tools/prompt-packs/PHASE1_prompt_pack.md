# PHASE1 Prompt Pack

이 문서는 `PHASE1` 작업을 위한 표준 프롬프트 묶음입니다.

## 목적

- `docs/PHASE1_design.md`를 정본(SoT)으로 유지하면서 설계 검증 작업을 표준화한다.
- Execution -> Review -> Verification 흐름을 고정한다.
- Plan Execute 기록(`docs/plan/`)과 연결한다.

## Plan Mode 부트스트랩 규칙 (필수)

- 이 Prompt Pack은 `Plan mode`에서 실행한다.
- 시작 직후 `docs/plan/YYYY-MM-DD_<agent>_<topic>.md`를 먼저 1건 생성하고 상태를 `in_progress`로 둔다.
- 생성한 plan 문서 1건에 Execution -> Review -> Verification 결과를 순차 누적한다.
- Verification 완료 후 같은 문서의 `결과/결정`에 `done|partial|blocked`와 후속 액션을 확정한다.
- `<agent>` 허용값은 `claude-code`, `codex`, `handoff`만 사용한다.

### Plan Mode 시작 프롬프트 (권장)

```markdown
docs/agentic-tools/prompt-packs/PHASE1_prompt_pack.md를 실행 규약으로 사용해.
Plan mode로 수행하고, 시작 즉시 docs/plan/YYYY-MM-DD_claude-code_<topic>.md를 생성해.
같은 plan 문서에 Execution -> Review -> Verification 결과를 누적 기록해.
종료 시 결과/결정에 상태(done|partial|blocked), blockers, next_actions, Verification JSON을 확정해.
```

## 정본 참조 규칙

- SoT 링크 형식: `docs/PHASEX_*.md > SX`
- 예시: `docs/PHASE1_design.md > S2 DB Schema`
- 금지: 동일 정의 복붙(링크 참조만 허용)
- **S2(DB 스키마)와 S4(스코어링 로직)는 이 문서가 유일한 수정 지점** -- 다른 문서에서 중복 정의 금지

## PHASE1 입력 소스 (고정 3개 + PHASE0 교차참조)

### 주 입력 소스

1. `docs/legacy_docs/merged/detailed_plan.md`
2. `docs/legacy_docs/merged/implementation_plan.md`
3. `docs/legacy_docs/merged/portfolio_direction_plan.md`

### 교차참조 (link-reference only)

- `docs/PHASE0_ground.md` -- FR/NFR, KPI, 법무 체크리스트 정합성 확인용

## Output Contract (Execution 필수 출력) -- 5개

| ID | 항목 | 검증 대상 | 근거 |
|----|------|----------|------|
| O1 | 시스템 아키텍처 정합성 | S1이 PHASE0 FR-1~7, NFR-1~6을 모두 수용하는지 | 설계-요구사항 추적성 |
| O2 | DB 스키마 완전성 (SoT) | S2 6개 테이블의 **영속 저장 대상 도메인 컬럼**이 S3(데이터소스) + S4(스코어링) + S5(API 응답의 영속 source 필드만) 필요 필드를 포함하는지. **제외 대상**: (1) 세션 입력값(cash, income, job1/job2 등 -- NFR-1 비저장) (2) S5 응답의 런타임 파생/표시 필드(monthlyCost, commuteTime1/2, finalScore 등 -- 요청 시 계산) | SoT 내부 정합 + NFR-1 준수 |
| O3 | 스코어링 엔진 정확성 (SoT) | S4 검증 3단계: (1) 정규화 함수 각각 [0,1] 범위 보장 (2) 가중합 [0,1] 범위 보장 (가중치 합 == 1.0) (3) `round(x * 100)` -> [0,100] 최종 점수 산출 정합 | SoT 로직 검증 |
| O4 | API 계약 완전성 | S5 request/response가 PHASE0 FR 전체를 커버하고 입력 검증 규칙이 NFR-1(PII 비저장)과 정합하는지 | 인터페이스 계약 |
| O5 | UI/UX 퍼널 추적성 + 디자인 일관성 | S6 페이지/컴포넌트가 PHASE0 S2 이벤트 10개를 모두 트리거할 수 있는 UI 포인트를 가지는지 + S7 디자인 토큰이 S6 컴포넌트와 매핑되는지 | KPI 계측 가능성 + 디자인 정합 |

**S8(Portfolio Strategy) 처리**: 전략 서술이며 기술 설계 검증 항목이 아니므로 completeness 분모(5)에서 제외. Review에서 Low severity로 PHASE0 핵심 가설과의 정합만 부수 점검.

## 1) Execution Prompt

```markdown
당신은 PHASE1 설계 에디터입니다.

## 목표
3개 입력 소스와 PHASE0 교차참조를 근거로 `docs/PHASE1_design.md`의 설계 정합성을 검증하고 근거를 산출한다.

## 입력 소스
1. docs/legacy_docs/merged/detailed_plan.md
2. docs/legacy_docs/merged/implementation_plan.md
3. docs/legacy_docs/merged/portfolio_direction_plan.md

## 교차참조
- docs/PHASE0_ground.md (FR/NFR/KPI/법무 체크리스트)

## 규칙
- 입력 문서 외 추론은 `[가정]` 표시
- SoT 링크 규칙 준수: docs/PHASEX_*.md > SX
- 같은 정의를 다른 문서에 복붙하지 않음
- S2(DB 스키마)와 S4(스코어링 로직)는 PHASE1_design.md가 유일한 수정 지점
- Execution은 검증 근거를 산출한다 (pass/fail 판정은 Review 역할)

## 작업
1. **O1 시스템 아키텍처 정합성**: S1 기술 스택/구조가 PHASE0 FR-1~7, NFR-1~6을 모두 수용하는지 근거 산출
   - NFR-3(보안) 점검: S1에 HTTPS/TLS/암호화/최소 권한 설계가 명시되어 있는지 확인
   - NFR-6(유지보수) 점검: S1에 "TypeScript strict" 모드가 명시되어 있는지 확인
   - NFR-1(PII 비저장) 점검: APM 파이프라인 비저장 설계가 명시되어 있는지 확인
2. **O2 DB 스키마 완전성**: S2 6개 테이블의 영속 저장 대상 도메인 컬럼이 S3 + S4 + S5(영속 source 필드만) 필요 필드를 포함하는지 근거 산출
   - 제외 대상 명시: (1) 세션 입력값(cash, income, job1/job2 -- NFR-1 비저장) (2) S5 런타임 파생/표시 필드(monthlyCost, commuteTime1/2, finalScore -- 요청 시 계산)
3. **O3 스코어링 엔진 정확성**: S4 검증 3단계 근거 산출
   - (1) 정규화 함수 각각 [0,1] 범위 보장 여부
   - (2) 가중합 [0,1] 범위 보장 여부 (가중치 합 == 1.0 확인)
   - (3) `round(x * 100)` -> [0,100] 최종 점수 산출 정합 여부
4. **O4 API 계약 완전성**: S5 request/response가 PHASE0 FR 전체를 커버하는지 + 입력 검증 규칙이 NFR-1(PII 비저장)과 정합하는지 근거 산출
5. **O5 UI/UX 퍼널 추적성 + 디자인 일관성**: S6 UI 포인트가 PHASE0 이벤트 10개를 모두 트리거할 수 있는지 + S7 디자인 토큰이 S6 컴포넌트와 매핑되는지 근거 산출

## 출력 형식
### 변경 요약
- 항목별 검증 근거 요약 1줄

### Output Contract 검증 근거
- O1: 근거 상세 (FR/NFR 매핑 표 포함)
- O2: 근거 상세 (테이블-필드 매핑 표 포함, 제외 대상 명시)
- O3: 근거 상세 (3단계 검증 각각)
- O4: 근거 상세 (FR-엔드포인트 매핑 표 포함)
- O5: 근거 상세 (이벤트-UI 매핑 표 + 토큰-컴포넌트 매핑)

### 적용 대상
- docs/PHASE1_design.md > S1~S7
- docs/PHASE0_ground.md (교차참조)
```

## 2) Review Prompt

```markdown
당신은 PHASE1 설계 리뷰어입니다.

## 목표
Execution 근거가 정본 규칙과 Output Contract를 충족하는지 검토하고, 각 항목의 pass/fail을 판정한다.

## 입력
- Execution 검증 근거
- docs/PHASE1_design.md
- docs/PHASE0_ground.md (교차참조)

## Severity 기준
- Critical: SoT(S2/S4) 내부 모순, PHASE0 FR/NFR 미수용, 데이터 거버넌스 위반
- High: 테이블-API 필드 불일치, 스코어링 범위 이탈, 이벤트-UI 매핑 누락
- Medium: 정규화 엣지케이스 미정의, 컴포넌트-페이지 매핑 모호
- Low: 가독성, 서식, 네이밍

## 점검 항목
1. O1 pass/fail + 결함 (FR/NFR 수용 여부)
2. O2 pass/fail + 결함 (영속 컬럼 완전성, 세션 입력값 제외 확인)
3. O3 pass/fail + 결함 (3단계 검증: 정규화/가중합/최종 점수)
4. O4 pass/fail + 결함 (FR-API 커버리지, NFR-1 정합)
5. O5 pass/fail + 결함 (이벤트 10개 UI 매핑, 토큰-컴포넌트 매핑)
6. SoT 링크/중복 정의 위반 여부
7. S8 부수 점검 [Low severity]: PHASE0 핵심 가설("컨시어지형 Top10 추천 리포트가 문의 행동을 유의미하게 유도")과 S8 전략 서술의 정합 여부

## 출력 형식
### Findings (severity 순)
- [Severity] 항목명: 설명 (근거 경로)

### Output Contract 판정
- O1: pass|fail
- O2: pass|fail
- O3: pass|fail
- O4: pass|fail
- O5: pass|fail

### Required Fixes
- P0(필수 수정)
- P1(권장 수정)
```

## 3) Verification Prompt

```markdown
당신은 PHASE1 게이트 판정자입니다.

## 목표
Review 결과를 반영해 go/pending/no-go를 판정하고 JSON을 출력한다.

## 입력
- Execution 검증 근거
- Review Findings + Output Contract 판정
- docs/PHASE1_design.md
- docs/PHASE0_ground.md (교차참조)

## 계산 규칙

completeness = O1~O5 pass_count / 5
consistency  = SoT 규칙 통과 수 / 5
compliance   = PHASE0 NFR 수용 수 / 6

### consistency 세부 항목 (5개)
1. S2 링크 형식 준수 ("PHASE1 S2 참조" 패턴)
2. S4 링크 형식 준수 ("PHASE1 S4 참조" 패턴)
3. PHASE0 교차참조 존재 (FR/NFR/KPI 역추적 가능)
4. 중복 정의 없음 (S2/S4 내용이 다른 문서에 복붙되지 않음)
5. 추론 항목에 [가정] 태그 부착

### compliance 판정용 NFR -> PHASE1 증거 매핑표 (필수 포함)

| NFR | 항목 | PHASE1 증거 위치 | 현재 정본 상태 | 판정 기준 |
|-----|------|----------------|---------------|----------|
| NFR-1 | 개인정보 비저장 | S2(테이블에 PII 컬럼 없음) + S5 입력값 검증 규칙(민감 정보 로그 미기록). APM 파이프라인 비저장 설계 미명시 -- 요구: PHASE0 NFR-1(DB/로그/APM 전체) | 부분 충족 -- Execution에서 APM 비저장 설계 점검 대상 | DB + 로그 + APM 전체 파이프라인에 PII 저장 경로 0건 |
| NFR-2 | 성능 p95 < 2s | S1 기술 스택(Redis 캐시) + S2 인덱스(GIST) + S3 사전계산 그리드(commute_grid) | 충족 | 캐시/인덱스/사전계산 설계 존재 |
| NFR-3 | 보안 | S1 기술 스택에 HTTPS/TLS/암호화/최소권한 미명시. 요구: PHASE0 NFR-3. S5 입력 검증만 존재 | 미충족 -- Execution 점검 대상 | S1에 보안 설계 요소(HTTPS, 저장 암호화, 최소 권한) 명시 필요 |
| NFR-4 | 데이터 거버넌스 | S3 데이터 소스 거버넌스(크롤링 금지 + 공공API만 허용 + 출처표기) | 충족 | 거버넌스 3요소 모두 명시 |
| NFR-5 | 반응형 | S6 페이지 구성 + S7 breakpoints(mobile/tablet/desktop) | 충족 | 모바일/태블릿/데스크톱 대응 |
| NFR-6 | 유지보수 | S1 기술 스택(Next.js + TypeScript) + S7 디자인 토큰. "strict 모드" 미명시 -- 요구: PHASE0 NFR-6 | 부분 충족 -- Execution 점검 대상 | "TypeScript strict" 명시 + 모듈화 설계 존재 |

## verdict 규칙

- go: completeness == 1.0, consistency >= 0.9, compliance == 1.0, blockers == 0
- pending: blockers == 0 이고 go 조건 일부 미충족
- no-go: blockers > 0

## 출력 형식
1) 판정 요약 (3줄 이내)
2) NFR 매핑표 판정 결과
3) blockers 목록
4) next_actions 목록
5) JSON

```json
{
  "phase": "PHASE1",
  "verdict": "go|pending|no-go",
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
```

## 실행 순서

1. Plan mode 시작 + plan 문서 생성(`in_progress`)
2. Execution Prompt 실행
3. Review Prompt 실행
4. Verification Prompt 실행
5. 동일 plan 문서에 최종 상태/JSON 확정

## 검증 통과 기준

- Output Contract O1~O5 전부 pass
- Verification JSON 스키마 키 누락 없음
- verdict 값이 `go|pending|no-go` 중 하나
- SoT 위반 0건
- O3에 3단계 검증(정규화 [0,1] -> 가중합 [0,1] -> 최종 [0,100]) 명시
- NFR-1~6 -> PHASE1 섹션 매핑표 Verification에 포함

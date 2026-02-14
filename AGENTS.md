# Housing Project - Codex Instructions

## Plan Execute 규칙 (필수 준수)

Plan Execute 작업 수행 시 반드시 `docs/plan/PLAN_OPERATION_GUIDE.md`를 읽고 따른다.

### Plan Mode 부트스트랩

1. Prompt Pack 기반 실행은 **Plan mode**에서 시작한다
2. 실행 시작 시점에 plan 문서를 먼저 생성한다 (초기 상태: `in_progress`)
3. Execution → Review → Verification 결과를 같은 문서에 누적 기록한다
4. 종료 시 `결과/결정` 섹션에서 상태를 `done | partial | blocked | cancelled | superseded`로 확정한다

### 핵심 규칙 요약

1. **문서 생성**: Plan Execute 수행 시마다 `docs/plan/` 아래에 문서 1건 생성
2. **파일명**: `YYYY-MM-DD_codex_<topic>.md` (핸드오프 시 `handoff`)
3. **필수 섹션 5개**: 목표, 범위, 작업 단계, 검증 기준, 결과/결정 — 누락 금지
4. **커밋**: feature 단위로 커밋 메시지를 **제안**하고, 사용자 승인 후에만 커밋 실행
5. **상태**: `in_progress`(초기) → `done | partial | blocked | cancelled | superseded`(종료) 확정. `blocked`/`partial`이면 후속 액션 필수

### Git 커밋 규칙

- 작업 완료 후 변경된 feature 단위로 커밋을 **제안**한다 (직접 실행 금지)
- 사용자가 승인하면 커밋을 실행한다
- 커밋 메시지 형식:

```
<type>(<scope>): <subject>

<detailed description>

- 변경 사항 1
- 변경 사항 2
```

- `<type>`: `feat | fix | docs | refactor | test | chore`
- `<scope>`: 변경 대상 (예: `phase0`, `plan`, `prompt-pack`)
- `<subject>`: 한줄 요약 (50자 이내)
- `<detailed description>`: 변경 이유와 주요 내용을 상세히 기술

### 자체 점검

작업 완료 전 아래 항목을 반드시 확인한다:

- [ ] 파일명 규칙 충족
- [ ] 필수 섹션 5개 존재
- [ ] SoT 참조 문구 포함
- [ ] 결과/결정에 상태와 후속 액션 포함
- [ ] YAML frontmatter 포함 (plan-id, status, phase) — template-version >= 1.1에 한함
- [ ] depends-on 참조 plan의 condition 평가 충족 확인 (해당 시)

---

## SoT(정본) 보호 규칙

각 PHASE 문서는 고유한 SoT 범위를 가진다. **해당 문서 외의 장소에서 SoT 항목을 중복 정의하거나 무단 변경하지 않는다.**

| SoT 범위                                 | 유일한 수정 지점        |
| ---------------------------------------- | ----------------------- |
| FR/NFR, KPI 정의/게이트, 법무 체크리스트 | `docs/PHASE0_ground.md` |
| DB 스키마(S2), 스코어링 로직(S4)         | `docs/PHASE1_design.md` |

- SoT 항목을 변경할 때는 반드시 해당 PHASE 문서를 직접 수정한다
- 다른 문서에서는 "PHASE0 참조", "PHASE1 S4 참조" 등 링크로만 참조한다
- SoT 수정 시 사용자에게 변경 범위를 먼저 설명하고 승인을 받는다

## 법무/컴플라이언스 금지선

코드/문서/UI 텍스트 작성 시 다음을 **절대 생성하지 않는다**:

- **금지 문구**: "대출 가능 보장", "거래 성사 보장", "투자 수익 보장", "가장 안전한 지역 확정", "최적 투자 확정"
- **금지 행위**: 중개/알선 행위, 거래성사형 수수료 모델(CPA), 무단 크롤링 기반 매물 수집
- **"추천" 단독 사용 금지** → "분석 결과" 또는 "안내"로 대체
- 출처 없는 치안/학군 단정 표현 금지

## 기술 스택 컨벤션

| 항목       | 기준                                         |
| ---------- | -------------------------------------------- |
| 프레임워크 | Next.js (App Router)                         |
| 언어       | TypeScript **strict 모드** (`any` 사용 금지) |
| DB         | PostgreSQL + PostGIS                         |
| 캐시       | Redis                                        |
| 스타일     | 프로젝트 기존 컨벤션 따름                    |

- 위 스택 외의 기술을 도입하려면 사용자 승인 필수
- `any` 타입 사용 금지. 타입 추론이 불가능하면 `unknown`으로 시작하여 타입 가드를 적용

## 개인정보 비저장 원칙 (NFR-1)

- DB, 로그, APM 등 전체 파이프라인에 개인정보(PII)를 **저장하지 않는다**
- 코드 작성 시 사용자 입력을 DB에 저장하는 로직을 생성하지 않는다
- 로그에 PII가 포함될 수 있는 경우 마스킹 처리를 반드시 적용한다

## 데이터 거버넌스 (NFR-4)

- **크롤링 금지**: 웹 스크래핑/크롤링 코드를 작성하지 않는다
- **허용 데이터만 사용**: 공공 API, 정식 API, 제휴 데이터만 허용
- **출처 표기 필수**: 데이터를 표시할 때 출처/기준일을 반드시 함께 표기

## Legacy 문서 보호

- `docs/legacy_docs/`는 **읽기 전용** 참고 자료이다
- 이 디렉토리의 파일을 수정/삭제하지 않는다
- 필요 시 참조만 하고, 신규 내용은 해당 PHASE 문서나 plan 문서에 작성한다

## 언어 규칙

| 대상                  | 언어   |
| --------------------- | ------ |
| 문서 (`.md`)          | 한국어 |
| 커밋 메시지           | 한국어 |
| 코드 (변수명, 함수명) | 영어   |
| 주석                  | 영어   |

---

## 프로젝트 구조

- `docs/PHASE0_ground.md` ~ `docs/PHASE4_ship_learn.md`: 단계별 SoT 문서
- `docs/plan/`: Plan Execute 기록
- `docs/agentic-tools/prompt-packs/`: 프롬프트 팩
- `docs/legacy_docs/`: 레거시 문서 (읽기 전용 참고)

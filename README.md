# Housing Project

> 서울/경기/인천 맞벌이 신혼부부를 위한 데이터 기반 주거지 분석 안내 서비스

**현재 상태** — 기준일 2026-02-17: M1~M3 완료, M4(Polish + Ship) 진행 중

---

## 프로젝트 소개

맞벌이 신혼부부가 예산 범위 내에서 통근 시간, 보육 인프라, 치안 수준을 동시에 비교하기는 현실적으로 어렵습니다. 공공 데이터가 산재해 있고, 두 직장의 통근 경로를 함께 고려할 수 있는 도구가 부족합니다. 본 서비스는 공공/정식 API 데이터를 통합하여 이 문제를 해결합니다.

**핵심 기능**

- 역산 예산 계산: 소득 대비 적정 주거비를 역산하여 탐색 범위 설정
- 2직장 통근 분석: 두 직장의 통근 시간·경로를 동시에 산출
- 인프라 통합 평가: 보육·교육·치안·생활 인프라를 권역별로 정량 평가
- 설명 가능한 분석 결과 리포트: 상위 10개 권역에 대해 점수 산출 근거를 투명하게 제공

**Non-goals**

- 부동산 중개·알선 행위를 하지 않습니다
- 대출 승인 여부를 판단하지 않습니다
- 매물을 직접 제공하지 않습니다

> 본 서비스는 정보 제공 목적이며, 거래나 승인을 보장하지 않습니다.

상세 요구사항: [`docs/PHASE0_ground.md`](docs/PHASE0_ground.md) 참조

---

## 기술 스택

| 영역          | 기술                                   |
| ------------- | -------------------------------------- |
| 프레임워크    | Next.js 16.x (App Router)              |
| 언어          | TypeScript (strict 모드)               |
| UI            | React 19 + Tailwind CSS v4 + shadcn/ui |
| DB            | PostgreSQL 16 + PostGIS 3.4            |
| 캐시          | Redis 7                                |
| 인프라        | Docker Compose                         |
| 패키지 매니저 | pnpm                                   |
| 코드 품질     | ESLint 9 + Prettier + Husky            |

---

## 사전 요구사항

- Node.js >= 20
- pnpm >= 9
- Docker Desktop
- Git

---

## 시작하기

```bash
git clone <repository-url>
cd housing-project

# 환경변수 설정
cp .env.example .env
# .env 파일에서 공공 API 키를 직접 발급하여 입력 (PostgreSQL/Redis 기본값은 제공됨)

# 의존성 설치
pnpm install

# Docker 컨테이너 실행 (PostgreSQL + Redis)
docker compose up -d

# DB 마이그레이션
bash db/migrate.sh

# 개발 서버 실행
pnpm dev
```

> **migrate.sh 주의사항**: 초기 세팅 1회 실행 기준입니다. 재실행 시 `CREATE TABLE` 충돌이 발생합니다.
> 재초기화가 필요하면 `docker compose down -v` 후 `docker compose up -d` → `bash db/migrate.sh`를 수행하세요.

---

## 프로젝트 구조

```
housing-project/
├── src/
│   ├── app/            # Next.js App Router (라우트 + 페이지)
│   ├── components/     # UI 컴포넌트
│   │   ├── card/       # PropertyCard 등
│   │   ├── compare/    # 비교 페이지 컴포넌트
│   │   ├── complex/    # 단지 상세 컴포넌트
│   │   ├── feedback/   # Skeleton, Toast 등
│   │   ├── input/      # StepWizard, 입력 폼
│   │   ├── layout/     # CompareBar, Header 등
│   │   ├── map/        # KakaoMap, BottomSheet
│   │   ├── score/      # CircularGauge, ScoreBar
│   │   ├── trust/      # DataSourceTag, 면책 고지
│   │   └── ui/         # shadcn/ui 기반 공통 UI
│   ├── contexts/       # CompareContext 등 전역 상태
│   ├── db/             # Drizzle ORM 스키마 + 커넥션
│   ├── etl/            # ETL 어댑터 + 러너
│   ├── hooks/          # Custom Hooks
│   ├── lib/            # 유틸리티, 엔진, 포매터
│   ├── styles/         # 디자인 토큰
│   └── types/          # TypeScript 타입 정의
├── db/
│   ├── schema.sql      # DB 스키마 (PHASE1 S2 파생)
│   └── migrate.sh      # 마이그레이션 스크립트
├── docs/               # PHASE 문서 + Plan 기록
├── scripts/            # 유틸리티 스크립트
├── compose.yml         # Docker (PostgreSQL + Redis)
└── .env.example        # 환경변수 템플릿
```

---

## 주요 명령어

| 명령어                   | 설명                          |
| ------------------------ | ----------------------------- |
| `pnpm dev`               | 개발 서버 실행                |
| `pnpm build`             | 프로덕션 빌드                 |
| `pnpm start`             | 프로덕션 서버 실행            |
| `pnpm lint`              | ESLint 검사                   |
| `pnpm format`            | Prettier 포맷팅 적용          |
| `pnpm format:check`      | Prettier 포맷팅 검사          |
| `pnpm prepare`           | Husky Git hooks 설치          |
| `docker compose up -d`   | Docker 컨테이너 실행          |
| `docker compose down`    | Docker 컨테이너 중지          |
| `docker compose down -v` | Docker 컨테이너 + 볼륨 초기화 |
| `bash db/migrate.sh`     | DB 마이그레이션 실행          |

---

## 개발 워크플로

### 언어 규칙

| 대상                  | 언어   |
| --------------------- | ------ |
| 문서 (`.md`)          | 한국어 |
| 커밋 메시지           | 한국어 |
| 코드 (변수명, 함수명) | 영어   |
| 주석                  | 영어   |

### 커밋 메시지 형식

```
<type>(<scope>): <subject>

<detailed description>

- 변경 사항 1
- 변경 사항 2
```

- `<type>`: `feat | fix | docs | refactor | test | chore`
- `<scope>`: 변경 대상 (예: `phase2`, `plan`)
- `<subject>`: 한줄 요약 (50자 이내)

### SoT 보호 원칙

| SoT 범위                                 | 유일한 수정 지점        |
| ---------------------------------------- | ----------------------- |
| FR/NFR, KPI 정의/게이트, 법무 체크리스트 | `docs/PHASE0_ground.md` |
| DB 스키마(S2), 스코어링 로직(S4)         | `docs/PHASE1_design.md` |

다른 문서에서는 해당 PHASE 문서를 **참조만** 합니다 (중복 정의 금지).

---

## 문서 안내

| 문서                                                     | 설명                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| [`docs/PHASE0_ground.md`](docs/PHASE0_ground.md)         | 요구사항, KPI, 법무 체크리스트                                           |
| [`docs/PHASE1_design.md`](docs/PHASE1_design.md)         | DB 스키마, 스코어링 로직, 디자인 시스템                                  |
| [`docs/PHASE2_build.md`](docs/PHASE2_build.md)           | 구현 마일스톤 (M1~M4)                                                    |
| [`docs/PHASE3_verify.md`](docs/PHASE3_verify.md)         | 테스트, 성능, 보안 검증                                                  |
| [`docs/PHASE4_ship_learn.md`](docs/PHASE4_ship_learn.md) | 배포, 운영, 회고                                                         |
| [`docs/plan/`](docs/plan/)                               | Plan Execute 기록 (인덱스: [`docs/plan/README.md`](docs/plan/README.md)) |
| [`docs/design-system/`](docs/design-system/)             | 디자인 시스템 명세 + 쇼케이스                                            |
| [`CLAUDE.md`](CLAUDE.md)                                 | Claude Code 에이전트 지침                                                |
| [`AGENTS.md`](AGENTS.md)                                 | Codex 에이전트 지침                                                      |

---

## 컴플라이언스

- 본 서비스는 **정보 제공 목적**이며, 부동산 중개·알선을 하지 않습니다
- **개인정보 비저장** (NFR-1): DB, 로그, APM 전체 파이프라인에 PII를 저장하지 않습니다
- **크롤링 금지** (NFR-4): 공공 API, 정식 API만 사용합니다
- **출처 표기 필수**: 데이터 표시 시 출처와 기준일을 함께 표기합니다
- 금지 문구 및 상세 법무 체크리스트: [`docs/PHASE0_ground.md`](docs/PHASE0_ground.md) 참조

---

## 주요 기능

- **5단계 입력 퍼널**: 주거 유형 → 직장 위치 → 소득 정보 → 지출·가중치 → 분석 실행
- **분석 결과 지도/리스트**: 카카오맵 기반 지도 뷰 + 스크롤 리스트 (정렬/필터)
- **단지 상세 분석**: 5차원(예산/통근/보육/안전/학군) 점수 + 가격 이력 + 인프라 정보
- **단지 비교**: 최대 3개 단지 병렬 비교 (레이더 차트 + 테이블)
- **이벤트 트래킹**: GTM/GA4 연동 (10+ 이벤트 자동 추적)
- **컴플라이언스**: 5접점 면책 고지, 출처 표기, 금지 문구 자동 검사

## 현재 상태

> 기준일 2026-02-17 기준

**M1 (Foundation) 완료**

- Next.js 16.x + TypeScript strict 모드 초기 설정
- PostgreSQL 16 + PostGIS 3.4 Docker 인프라 구축
- DB 스키마 마이그레이션 + S7 디자인 토큰 Tailwind v4 매핑
- ESLint 9 + Prettier + Husky pre-commit 게이트

**M2 (Data + Engine) 완료**

- Drizzle ORM 스키마 + PostGIS customType + 커넥션 풀
- Mock 데이터 755건 + Seed 스크립트
- 예산/통근/보육/안전/학군 스코어링 엔진
- ETL 어댑터 5종 + Zod 검증 + API 라우트 3종

**M3 (Frontend) 완료**

- 5단계 입력 퍼널 (StepWizard + 동의 UI)
- 결과 페이지 (지도 + 리스트 + 정렬)
- 단지 상세 페이지 (/complex/[id])
- 비교 페이지 (/compare) — 레이더 차트 + 비교 테이블
- 이벤트 트래킹 (GTM/GA4) + 면책/컴플라이언스 UI

**다음 단계**: M4 (Polish + Ship)

---
plan-id: "2026-02-16_claude-code_m3-implementation-spec"
status: "done"
phase: "PHASE3"
template-version: "1.1"
work-type: "feature"
depends-on:
  - plan-id: "2026-02-16_claude-code_m2-orm-refactor"
    condition: "status == done"
---
# M3 Frontend 구현 상세 설계

## 목표

M3 마일스톤(Frontend) 구현에 앞서, 프론트엔드 코드 레벨의 상세 설계 문서를 작성한다. 5단계 입력 퍼널, 결과/상세/컨시어지 페이지, 신뢰/컴플라이언스 UI, 이벤트 트래킹 등 M3 전체 범위를 커버하는 구현 스펙을 완성하여, 이후 실제 코드 작성 시 참조 문서로 활용한다.

## 범위

- **수정 대상 SoT**: 없음 (SoT 참조만 수행)
- **SoT 참조**: PHASE0 S2(KPI/이벤트), S3(FR/NFR), S4(법무), PHASE1 S4(스코어링), S5(API), DESIGN_SYSTEM.md(디자인 시스템 상세)
- **선행 plan**: `2026-02-16_claude-code_m2-orm-refactor` (M2 ORM 리팩터 완료)
- **출력물**: 본 문서의 섹션 1~10

### M3 태스크 범위 (PHASE2_build.md 참조)

1. 랜딩 페이지 (서비스 소개 + 면책 고지)
2. StepWizard 5단계 입력 (DS SoT 기준)
3. ConsentForm (필수/선택 동의 분리)
4. 결과 페이지 (KakaoMap + PropertyCard 리스트)
5. ScoreBar 컴포넌트 (점수 분해 시각화)
6. DataSourceTag (출처/기준일 표시)
7. ExternalLinkCTA (외부 이동 고지)
8. 단지 상세 페이지 (컨시어지 리포트)
9. 이용약관/개인정보처리방침 페이지
10. DisclaimerBanner + footer 링크

---

## 작업 단계

### 섹션 1. 아키텍처 개요

#### 1.1 디렉토리 구조

M2 Data+Engine에서 확립된 기존 구조 위에 M3에서 추가되는 파일 트리이다. 기존 M2 파일(`src/app/api/`, `src/db/`, `src/lib/engines/`, `src/lib/validators/`, `src/types/`, `src/etl/`)은 그대로 유지한다.

```
src/
├── app/
│   ├── (main)/                           # 메인 레이아웃 그룹 (Header/Footer 공유)
│   │   ├── layout.tsx                    # Header + Footer + DisclaimerBanner
│   │   ├── page.tsx                      # / 랜딩 페이지 (SSG)
│   │   ├── search/
│   │   │   └── page.tsx                  # /search 5단계 입력 위저드 (CSR)
│   │   ├── results/
│   │   │   └── page.tsx                  # /results 분석 결과 (SSR)
│   │   ├── complex/
│   │   │   └── [id]/
│   │   │       └── page.tsx              # /complex/[id] 단지 상세 (ISR 1h)
│   │   ├── terms/
│   │   │   └── page.tsx                  # /terms 이용약관 (SSG)
│   │   ├── privacy/
│   │   │   └── page.tsx                  # /privacy 개인정보처리방침 (SSG)
│   │   └── location-terms/
│   │       └── page.tsx                  # /location-terms 위치정보 이용약관 (SSG)
│   ├── api/                              # (기존 M2) API Routes
│   │   ├── recommend/route.ts
│   │   ├── apartments/[id]/route.ts
│   │   └── health/route.ts
│   ├── layout.tsx                        # (수정) 루트 레이아웃 — Pretendard 폰트 + providers
│   └── globals.css                       # (수정) 디자인 토큰 import 추가
├── components/
│   ├── layout/
│   │   ├── Header.tsx                    # 상단 헤더 (로고 + 네비게이션)
│   │   ├── Footer.tsx                    # 하단 푸터 (면책 + 링크)
│   │   └── DisclaimerBanner.tsx          # 입력 플로우 면책 배너
│   ├── score/
│   │   ├── CircularGauge.tsx             # 종합 점수 원형 게이지 (SVG)
│   │   ├── ScoreBar.tsx                  # 카테고리별 수평 바 차트
│   │   └── ScoreBadge.tsx               # 점수 등급 배지 (sm/md/lg)
│   ├── card/
│   │   ├── PropertyCard.tsx              # 단지 카드 (결과 리스트 단위)
│   │   └── CardSelector.tsx             # 정렬 칩 바 (종합/예산/통근순)
│   ├── input/
│   │   ├── StepWizard.tsx               # 5단계 위저드 컨테이너
│   │   ├── steps/
│   │   │   ├── Step1TradeChild.tsx       # Step 1: 주거형태 + 자녀계획
│   │   │   ├── Step2Jobs.tsx            # Step 2: 직장1 + 직장2
│   │   │   ├── Step3Income.tsx          # Step 3: 합산연봉 + 보유현금
│   │   │   ├── Step4Loans.tsx           # Step 4: 대출 + 월예산 + 가중치
│   │   │   └── Step5Analysis.tsx        # Step 5: 분석 중 애니메이션
│   │   ├── AmountInput.tsx              # 금액 입력 (빠른 버튼 + 직접 입력)
│   │   └── AddressSearch.tsx            # 주소 검색 (Kakao Address SDK)
│   ├── map/
│   │   ├── KakaoMap.tsx                 # KakaoMap 래퍼 컴포넌트
│   │   └── MapMarker.tsx                # 3상태 지도 마커
│   ├── trust/
│   │   ├── TrustBadge.tsx               # 신뢰 배지 (Full/Mini)
│   │   ├── DataSourceTag.tsx            # 출처 태그 (인라인)
│   │   ├── ExternalLinkCTA.tsx          # 외부 링크 CTA + 모달
│   │   ├── ConsentForm.tsx              # 동의 폼 (필수/선택 분리)
│   │   └── SafetySection.tsx            # 안전 편의시설 현황 섹션
│   ├── feedback/
│   │   ├── Toast.tsx                    # 토스트 알림
│   │   ├── Skeleton.tsx                 # 스켈레톤 로딩
│   │   └── Tooltip.tsx                  # 정보 툴팁 (ⓘ 아이콘)
│   └── ui/                              # (기존) shadcn/ui 컴포넌트
├── hooks/
│   ├── useStepForm.ts                   # StepWizard 상태 관리 훅
│   ├── useSessionStorage.ts             # sessionStorage 래퍼 훅
│   ├── useKakaoMap.ts                   # KakaoMap SDK 초기화 훅
│   ├── useKakaoAddress.ts               # Kakao Address SDK 훅
│   └── useTracking.ts                   # 이벤트 트래킹 훅
├── lib/
│   ├── tracking.ts                      # 이벤트 트래킹 유틸 (10개 이벤트)
│   ├── kakao.ts                         # Kakao SDK 초기화 헬퍼
│   ├── score-utils.ts                   # 점수 등급 판정 유틸 (색상/라벨 매핑)
│   ├── format.ts                        # 금액/날짜 포매팅 유틸
│   ├── constants.ts                     # UI 상수 (스텝 정의, 면책 문구 등)
│   ├── engines/                         # (기존 M2)
│   ├── validators/                      # (기존 M2)
│   ├── redis.ts                         # (기존 M2)
│   ├── logger.ts                        # (기존 M2)
│   └── utils.ts                         # (기존 M2) cn() 유틸
├── types/
│   ├── api.ts                           # (기존 M2) API 타입
│   ├── engine.ts                        # (기존 M2) 엔진 타입
│   ├── db.ts                            # (기존 M2) DB 타입
│   ├── index.ts                         # (기존 M2) 배럴 export
│   └── ui.ts                            # (신규) UI 전용 타입 (Step, ScoreGrade 등)
├── styles/
│   └── tokens.css                       # (기존) 디자인 토큰 CSS 변수
├── db/                                  # (기존 M2)
├── etl/                                 # (기존 M2)
└── __tests__/
    ├── components/
    │   ├── CircularGauge.test.tsx        # 원형 게이지 단위 테스트
    │   ├── ScoreBar.test.tsx             # 수평 바 차트 단위 테스트
    │   ├── PropertyCard.test.tsx         # 단지 카드 단위 테스트
    │   ├── AmountInput.test.tsx          # 금액 입력 단위 테스트
    │   ├── ConsentForm.test.tsx          # 동의 폼 단위 테스트
    │   └── ExternalLinkCTA.test.tsx      # 외부 링크 CTA 단위 테스트
    ├── hooks/
    │   ├── useStepForm.test.ts           # 스텝 폼 훅 테스트
    │   └── useSessionStorage.test.ts     # 세션 스토리지 훅 테스트
    ├── pages/
    │   ├── search.test.tsx               # 입력 페이지 통합 테스트
    │   └── results.test.tsx              # 결과 페이지 통합 테스트
    └── compliance/
        ├── disclaimer.test.ts            # 면책 5접점 테스트
        └── forbidden-ui-phrases.test.ts  # UI 금지 문구 스캔 테스트
```

**파일 수 집계**: 신규 추가 파일 48개 + 기존 파일 수정 2개

| 구분 | 신규 파일 수 |
|------|-------------|
| 페이지 (`src/app/(main)/`) | 8 |
| 레이아웃 (`src/components/layout/`) | 3 |
| 스코어 (`src/components/score/`) | 3 |
| 카드 (`src/components/card/`) | 2 |
| 입력 (`src/components/input/`) | 8 |
| 지도 (`src/components/map/`) | 2 |
| 신뢰/컴플라이언스 (`src/components/trust/`) | 5 |
| 피드백 (`src/components/feedback/`) | 3 |
| 훅 (`src/hooks/`) | 5 |
| 라이브러리 (`src/lib/`) | 5 |
| 타입 (`src/types/`) | 1 |
| 테스트 (`src/__tests__/`) | 10 |
| 기존 파일 수정 | 2 |
| **합계** | **57** |

#### 1.2 신규 의존성

M3에서 새로 추가할 패키지 목록이다. 기존 `package.json`의 의존성은 유지한다.

##### dependencies (런타임)

| 패키지명 | 버전 | 선택 근거 |
|----------|------|----------|
| `react-hook-form` | `^7.56.0` | 폼 상태 관리. 비제어 컴포넌트 기반, 리렌더링 최소화, TypeScript strict 호환 |
| `@hookform/resolvers` | `^5.0.0` | react-hook-form + Zod 통합. 기존 `recommendRequestSchema` 재사용 가능 |

> **미추가 근거**: `framer-motion` — CSS 애니메이션 + Web Animations API로 충분. M4에서 성능 이슈 발생 시 도입 평가. `kakao-maps-sdk` — Kakao Maps JS SDK를 `<Script>` 태그로 직접 로드 (공식 React 래퍼 미제공, 커뮤니티 래퍼 TypeScript 타입 불완전).

##### devDependencies (개발/테스트)

| 패키지명 | 버전 | 선택 근거 |
|----------|------|----------|
| `@testing-library/jest-dom` | `^6.6.0` | DOM 매칭 확장. `toBeInTheDocument`, `toHaveTextContent` 등 |
| `@testing-library/user-event` | `^14.6.0` | 사용자 인터랙션 시뮬레이션. click, type, tab 등 |
| `jsdom` | `^26.1.0` | Vitest 환경용 DOM 구현체 |

##### 설치 명령

```bash
# dependencies
pnpm add react-hook-form @hookform/resolvers

# devDependencies
pnpm add -D @testing-library/jest-dom @testing-library/user-event jsdom
```

#### 1.3 데이터 흐름도 (5단계 퍼널)

```
  Landing (/)
      |
      | (1) CTA 클릭: "분석 시작하기"
      |     [event: landing_unique_view]
      v
  ┌─────────────────────────────────────────────┐
  │  Search (/search)                            │
  │  StepWizard (CSR, 단일 URL)                  │
  │                                              │
  │  Step 1: tradeType + childPlan               │
  │    → sessionStorage 저장                     │
  │    → [event: min_input_start]                │
  │         ↓                                    │
  │  Step 2: job1 + job2 (AddressSearch)          │
  │    → Kakao Address API 호출                  │
  │    → sessionStorage 저장 (주소 텍스트만)      │
  │    → [event: consent_shown]                  │
  │         ↓                                    │
  │  Step 3: income + cash (AmountInput)          │
  │    → [TrustBadge Full 표시]                  │
  │    → sessionStorage 저장                     │
  │         ↓                                    │
  │  Step 4: loans + monthlyBudget + weightProfile│
  │    → [TrustBadge Mini 표시]                  │
  │    → [event: consent_accepted + policy_version]│
  │    → sessionStorage 저장                     │
  │    → [event: min_input_complete]             │
  │         ↓                                    │
  │  Step 5: 분석 중 애니메이션 (4단계 시퀀스)    │
  │    → POST /api/recommend 호출                │
  │    → 응답 수신 → sessionStorage 결과 저장    │
  │    → router.push('/results')                 │
  └──────────────┬──────────────────────────────┘
                 │
                 v
  ┌─────────────────────────────────────────────┐
  │  Results (/results)                          │
  │  [event: result_view]                        │
  │                                              │
  │  ┌──────────────┐  ┌────────────────────┐   │
  │  │  KakaoMap     │  │  PropertyCard List  │   │
  │  │  (MapMarker)  │◄►│  (CardSelector)     │   │
  │  │  양방향 싱크   │  │  DataSourceTag      │   │
  │  └──────────────┘  └────────────────────┘   │
  │                                              │
  │  DisclaimerBanner + DataSourceTag 메타       │
  └──────────────┬──────────────────────────────┘
                 │
                 │ 카드 클릭
                 v
  ┌─────────────────────────────────────────────┐
  │  Detail (/complex/[id])                      │
  │  [event: concierge_unique_view]              │
  │                                              │
  │  Hero: CircularGauge (80-96px)               │
  │  ScoreBar 5종 (budget/commute/childcare/     │
  │               safety/school)                 │
  │  SafetySection (안전 편의시설 현황)           │
  │  ExternalLinkCTA                             │
  │    → [event: outlink_click]                  │
  │    → [event: concierge_contact_click]        │
  │    → [event: inquiry_click]                  │
  │                                              │
  │  재무 면책 고지 (DS S5.5)                    │
  └─────────────────────────────────────────────┘
```

#### 1.4 상태 관리 전략

| 계층 | 용도 | 구현 |
|------|------|------|
| **sessionStorage** | 입력 폼 데이터 (Step 1~4), 분석 결과 캐시 | `useSessionStorage` 훅 |
| **React useState** | UI 로컬 상태 (현재 스텝, 모달 열림, 선택 마커) | 컴포넌트 로컬 |
| **React useRef** | KakaoMap 인스턴스, 스크롤 위치 | DOM 참조 |
| **URL searchParams** | 결과 페이지 정렬 옵션, 상세 페이지 ID | Next.js `useSearchParams` |

> **상태 관리 라이브러리 미도입 근거**: M3 범위에서 전역 상태 공유 필요성이 낮음. 입력 → 결과 → 상세 단방향 흐름이며, sessionStorage로 페이지 간 데이터 전달 충분. M4에서 비교/찜 기능 추가 시 Zustand 도입 평가.

#### 1.5 PII 비저장 아키텍처 (NFR-1)

> **SoT 참조**: `docs/PHASE0_ground.md` NFR-1

```
  사용자 입력 (cash, income, loans, job1, job2)
      │
      ├── sessionStorage 저장 (브라우저 메모리)
      │     └── 탭/브라우저 닫기 시 자동 삭제
      │
      ├── POST /api/recommend 전송 (HTTPS)
      │     └── 서버: 계산 후 즉시 폐기 (DB/로그 미저장)
      │     └── pii-guard: 로그에 PII 마스킹 (src/lib/logger.ts)
      │
      ├── 결과(recommendations)만 sessionStorage 저장
      │     └── PII 미포함 (aptName, score, address만)
      │
      └── localStorage 사용 금지
            └── 세션 종료 후에도 잔존할 수 있으므로 금지
```

**구현 가드레일**:

- `localStorage.setItem` 호출 금지 (린트 룰 또는 코드 리뷰 체크)
- sessionStorage 키 프리픽스: `hc_` (housing-concierge)
- 저장 항목 화이트리스트:
  - `hc_step_data`: Step 1~4 입력값 (세션 종료 시 자동 삭제)
  - `hc_results`: 분석 결과 JSON (PII 미포함)
  - `hc_consent`: 동의 상태 + policy_version

---

### 섹션 2. 라우팅 & 페이지 설계

#### 2.1 Next.js App Router 라우팅 맵

> **SoT 참조**: `docs/design-system/DESIGN_SYSTEM.md` S4.1 사이트맵

| # | URL | 페이지 | 렌더링 | 인증 | 데이터 소스 |
|---|-----|--------|--------|------|-------------|
| 1 | `/` | 랜딩 | SSG | 불필요 | 정적 콘텐츠 |
| 2 | `/search` | 조건 입력 (5스텝 위저드) | CSR | 불필요 | sessionStorage + Kakao Address API |
| 3 | `/results` | 분석 결과 (지도 + 리스트) | SSR | 불필요 | `POST /api/recommend` 응답 (sessionStorage 캐시) |
| 4 | `/complex/[id]` | 단지 상세 | ISR (1h) | 불필요 | `GET /api/apartments/:id` |
| 5 | `/terms` | 이용약관 | SSG | 불필요 | 정적 MDX/텍스트 |
| 6 | `/privacy` | 개인정보처리방침 | SSG | 불필요 | 정적 MDX/텍스트 |
| 7 | `/location-terms` | 위치정보 이용약관 | SSG | 불필요 | 정적 MDX/텍스트 |

**M3 제외 → M4 이후 페이지**:
- `/compare` (단지 비교) — ComparisonCard, RadarChart 필요
- `/board/[id]` (공유 보드) — 인증 + 커플 협업 기능 필요
- `/mypage` (마이페이지) — 인증 필요
- `/auth` (로그인/회원가입) — 인증 시스템 필요
- `/guide` (주거 가이드) — 콘텐츠 기획 필요

#### 2.2 각 페이지 역할 및 URL 파라미터

##### 1. 랜딩 (`/`)

| 항목 | 설명 |
|------|------|
| 역할 | 서비스 소개, 핵심 가치 전달, 입력 퍼널 진입 유도 |
| URL 파라미터 | 없음 |
| 데이터 소스 | 정적 콘텐츠 |
| 주요 컴포넌트 | Hero 섹션, CTA 버튼, Footer (면책 접점 1) |
| 이벤트 | `landing_unique_view` |

##### 2. 조건 입력 (`/search`)

| 항목 | 설명 |
|------|------|
| 역할 | 5단계 위저드로 사용자 조건 수집 |
| URL 파라미터 | 없음 (스텝은 컴포넌트 내부 상태) |
| 데이터 소스 | sessionStorage (이전 입력값 복원), Kakao Address API |
| 주요 컴포넌트 | StepWizard, AmountInput, AddressSearch, ConsentForm, TrustBadge |
| 이벤트 | `min_input_start`, `consent_shown`, `consent_accepted`, `min_input_complete` |

##### 3. 분석 결과 (`/results`)

| 항목 | 설명 |
|------|------|
| 역할 | Top 10 분석 결과를 지도 + 카드 리스트로 표시 |
| URL 파라미터 | `?sort=score|budget|commute` (정렬 기준, 선택) |
| 데이터 소스 | sessionStorage 캐시 (최초: `POST /api/recommend` 호출) |
| 주요 컴포넌트 | KakaoMap, MapMarker, PropertyCard, CardSelector, DataSourceTag, DisclaimerBanner |
| 이벤트 | `result_view` |

##### 4. 단지 상세 (`/complex/[id]`)

| 항목 | 설명 |
|------|------|
| 역할 | 개별 단지의 상세 분석 정보 + 외부 매물 링크 |
| URL 파라미터 | `[id]`: 단지 ID (정수) |
| 데이터 소스 | `GET /api/apartments/:id` (ISR 1시간 캐시) |
| 주요 컴포넌트 | CircularGauge (Hero), ScoreBar x5, SafetySection, ExternalLinkCTA, DataSourceTag |
| 이벤트 | `concierge_unique_view`, `concierge_contact_click`, `inquiry_click`, `outlink_click` |

##### 5~7. 법률 페이지 (`/terms`, `/privacy`, `/location-terms`)

| 항목 | 설명 |
|------|------|
| 역할 | 법률 문서 정적 표시 |
| URL 파라미터 | 없음 |
| 데이터 소스 | 정적 텍스트 |
| 주요 컴포넌트 | 문서 렌더러, Footer |

#### 2.3 레이아웃 구조

```
┌─────────────────────────────────────────┐
│  RootLayout (src/app/layout.tsx)         │
│  - <html lang="ko">                     │
│  - Pretendard Variable 폰트 로드         │
│  - ThemeProvider (next-themes)           │
│  - Kakao SDK <Script> 태그              │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │  MainLayout (src/app/(main)/layout) │ │
│  │                                     │ │
│  │  ┌──────────────────────────────┐   │ │
│  │  │  Header                       │   │ │
│  │  │  - 로고 (홈 링크)             │   │ │
│  │  │  - /search, /results 에서 숨김 │   │ │
│  │  └──────────────────────────────┘   │ │
│  │                                     │ │
│  │  ┌──────────────────────────────┐   │ │
│  │  │  {children}                   │   │ │
│  │  │  (각 페이지 콘텐츠)           │   │ │
│  │  └──────────────────────────────┘   │ │
│  │                                     │ │
│  │  ┌──────────────────────────────┐   │ │
│  │  │  Footer                       │   │ │
│  │  │  - 면책 문구 (접점 1)          │   │ │
│  │  │  - 약관/정책 링크              │   │ │
│  │  │  - 서비스명 + 저작권           │   │ │
│  │  └──────────────────────────────┘   │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**DisclaimerBanner**: `/search` 페이지 진입 시 상단 1회 표시 (면책 접점 2). "입력하신 정보는 분석 목적으로만 사용되며 거래 연결에 사용되지 않습니다".

---

### 섹션 3. 컴포넌트 상세 설계

#### 3.1 컴포넌트 매핑 테이블

> **SoT 참조**: `docs/design-system/DESIGN_SYSTEM.md` S3 컴포넌트 명세

DS에 정의된 28개 컴포넌트 중 M3 범위 17종과 M4 이후 8종으로 분류한다.

##### M3 대상 17종

| # | DS 정식 명칭 | 파일 경로 | 역할 |
|---|-------------|----------|------|
| 1 | CircularGauge | `components/score/CircularGauge.tsx` | 종합 점수 원형 게이지 |
| 2 | ScoreBar | `components/score/ScoreBar.tsx` | 카테고리별 수평 바 |
| 3 | ScoreBadge | `components/score/ScoreBadge.tsx` | 점수 등급 배지 |
| 4 | PropertyCard | `components/card/PropertyCard.tsx` | 결과 리스트 단지 카드 |
| 5 | CardSelector | `components/card/CardSelector.tsx` | 정렬 칩 바 |
| 6 | StepWizard | `components/input/StepWizard.tsx` | 5단계 입력 위저드 |
| 7 | AmountInput | `components/input/AmountInput.tsx` | 금액 입력 + 빠른 버튼 |
| 8 | AddressSearch | `components/input/AddressSearch.tsx` | Kakao 주소 검색 |
| 9 | MapMarker | `components/map/MapMarker.tsx` | 3상태 지도 마커 |
| 10 | TrustBadge | `components/trust/TrustBadge.tsx` | 신뢰 배지 (Full/Mini) |
| 11 | DataSourceTag | `components/trust/DataSourceTag.tsx` | 출처 태그 |
| 12 | ExternalLinkCTA | `components/trust/ExternalLinkCTA.tsx` | 외부 링크 + 모달 |
| 13 | ConsentForm | `components/trust/ConsentForm.tsx` | 동의 폼 |
| 14 | SafetySection | `components/trust/SafetySection.tsx` | 안전 편의시설 현황 |
| 15 | Toast | `components/feedback/Toast.tsx` | 토스트 알림 |
| 16 | Skeleton | `components/feedback/Skeleton.tsx` | 스켈레톤 로딩 |
| 17 | Tooltip | `components/feedback/Tooltip.tsx` | 정보 툴팁 |

##### M3 제외 → M4 이후 8종

| # | DS 정식 명칭 | 제외 사유 |
|---|-------------|----------|
| 1 | RadarChart | 비교 기능 (M4) 전용 |
| 2 | ComparisonCard | 비교 기능 (M4) 전용 |
| 3 | MiniPreviewCard | 마커 탭 프리뷰, 비교 기능과 연동 (M4) |
| 4 | BottomNav | 5탭 네비게이션, 인증/비교/MY 기능 필요 (M4) |
| 5 | BottomSheet | 3단 바텀시트, 모바일 UX 고도화 (M4) |
| 6 | CompareBar | 비교 바, 비교 기능 전용 (M4) |
| 7 | Clustering | 지도 클러스터링, 대량 데이터 최적화 (M4) |
| 8 | Legend | 지도 범례, 클러스터링과 함께 (M4) |

#### 3.2 Plan 명칭 → DS 정식 명칭 매핑

> PHASE2_build.md의 M3 체크리스트에서 사용된 명칭을 DS SoT 정식 명칭으로 매핑한다.

| PHASE2 명칭 (Plan) | DS 정식 명칭 (SoT) | 비고 |
|---------------------|---------------------|------|
| BudgetInput | **AmountInput** | DS S3.4: 금액 입력 + 빠른 버튼 |
| JobInput | **AddressSearch** | DS S3.4: Kakao 주소 검색 API |
| StepForm (3단계) | **StepWizard (5단계)** | DS S3.4: 5스텝 구성이 SoT |
| ResultCard | **PropertyCard** | DS S3.2: 단지 카드 |
| ScoreBreakdown | **ScoreBar** (복수) | DS S3.1: 카테고리별 수평 바 |
| SourceBadge | **DataSourceTag** | DS S3.6: 출처 태그 |
| OutlinkButton | **ExternalLinkCTA** | DS S3.6: 외부 링크 + 모달 |

> **충돌 해소**: PHASE2_build.md는 "StepForm 3단계"로 기술하나, DS SoT는 5 UI sub-step을 정의한다. DS S7 충돌 해소 기록 #2에 따라 **5 UI sub-step in `/search`** 채택.

#### 3.3 개별 컴포넌트 상세 스펙

##### CircularGauge

> **SoT 참조**: DS S3.1

```typescript
// src/components/score/CircularGauge.tsx

interface CircularGaugeProps {
  /** 0-100 score value */
  score: number;
  /** Visual size variant */
  size: "card" | "hero" | "mini";
  /** Enable count-up animation */
  animated?: boolean;
}
```

| 속성 | card | hero | mini |
|------|------|------|------|
| 크기 | 64px | 80-96px | 36-48px |
| 숫자 크기 | 20px Bold | 32px Bold | 14px SemiBold |
| 스트로크 | 4px | 6px | 3px |
| 애니메이션 | 800ms easeOutExpo | 1200ms easeOutExpo | 없음 |

구현: SVG `<circle>` + `stroke-dasharray/dashoffset` 트랜지션. CSS `@keyframes count-up` 또는 `requestAnimationFrame` 기반.

##### ScoreBar

> **SoT 참조**: DS S3.1

```typescript
// src/components/score/ScoreBar.tsx

interface ScoreBarProps {
  /** Category label (e.g., "예산 적합도") */
  label: string;
  /** 0-100 normalized score */
  score: number;
  /** Icon element */
  icon?: React.ReactNode;
  /** Compact variant (6px height) */
  compact?: boolean;
}
```

| 속성 | 값 |
|------|------|
| 높이 | 8px (compact: 6px) |
| 코너 | `rounded-full` |
| 트랙 | `neutral-200` (`#E7E5E4`) |
| 필 색상 | Score 5등급 컬러 (score 값에 따라 자동 판정) |
| 애니메이션 | width transition 500ms ease-out |

##### ScoreBadge

> **SoT 참조**: DS S3.1

```typescript
// src/components/score/ScoreBadge.tsx

interface ScoreBadgeProps {
  /** 0-100 score value */
  score: number;
  /** Size variant */
  size: "sm" | "md" | "lg";
}
```

등급 판정 로직 (`src/lib/score-utils.ts`):

```typescript
// src/lib/score-utils.ts

export type ScoreGrade = "excellent" | "good" | "average" | "belowAvg" | "poor";

export interface GradeInfo {
  grade: ScoreGrade;
  label: string;       // Korean label
  badge: string;       // A+, A, B, C, D
  color: string;       // HEX
  bgColor: string;     // 10% opacity background
}

export function getScoreGrade(score: number): GradeInfo {
  if (score >= 80) return { grade: "excellent", label: "매우 좋음", badge: "A+", color: "#1565C0", bgColor: "#1565C01A" };
  if (score >= 60) return { grade: "good", label: "좋음", badge: "A", color: "#2196F3", bgColor: "#2196F31A" };
  if (score >= 40) return { grade: "average", label: "보통", badge: "B", color: "#B0BEC5", bgColor: "#B0BEC51A" };
  if (score >= 20) return { grade: "belowAvg", label: "미흡", badge: "C", color: "#EF6C00", bgColor: "#EF6C001A" };
  return { grade: "poor", label: "부족", badge: "D", color: "#D84315", bgColor: "#D843151A" };
}
```

> **WCAG 1.4.1**: Score 등급은 색상만이 아닌 텍스트 라벨(A+/A/B/C/D)을 반드시 병행 표시.

##### PropertyCard

> **SoT 참조**: DS S3.2

```typescript
// src/components/card/PropertyCard.tsx

interface PropertyCardProps {
  /** Recommendation item from API response */
  item: RecommendationItem;
  /** Whether card is currently selected (map sync) */
  isSelected?: boolean;
  /** Click handler for navigation to detail */
  onClick?: () => void;
  /** Hover handler for map marker sync */
  onHover?: () => void;
}
```

카드 레이아웃 구조 (DS S3.2 전사):

```
┌──────────────────────────────────────────┐
│  [1] 순위배지   단지명          [게이지64px] │
│  ──────────────────────────────────────── │
│  주소 (12px 보조)                         │
│  세대수 · 준공 · 면적 (11px dot 구분)      │
│  ──────────────────────────────────────── │
│  매매 실거래가: 3억 2,000만               │
│  전세 실거래가: 1억 8,000만               │
│  ──────────────────────────────────────── │
│  ┌─────────────┐  ┌─────────────┐       │
│  │ 💰 예산 82   │  │ 🚇 통근 71   │       │
│  ├─────────────┤  ├─────────────┤       │
│  │ 🏫 보육 65   │  │ 🛡️ 안전 78   │       │
│  └─────────────┘  └─────────────┘       │
│  ──────────────────────────────────────── │
│  직장1: 35분 · 직장2: 42분               │
│  [약점: 학군 점수가 평균 이하]  (FR-5)    │
│  ──────────────────────────────────────── │
│  rounded-2xl p-4 bg-surface border       │
│  border-border shadow-sm                 │
└──────────────────────────────────────────┘
```

- 상위 3위: 코랄(`#F97316`) 배경 + 흰 텍스트 순위 배지
- 4위 이하: 회색 배경 순위 배지
- whyNot (FR-5): 카드 하단에 약점 1줄 표시

##### CardSelector

> **SoT 참조**: DS S3.2

```typescript
// src/components/card/CardSelector.tsx

type SortOption = "score" | "budget" | "commute";

interface CardSelectorProps {
  selected: SortOption;
  onChange: (option: SortOption) => void;
}
```

| 정렬 옵션 | 라벨 | 정렬 기준 |
|-----------|------|----------|
| `score` | 종합 점수순 | `finalScore` 내림차순 (기본) |
| `budget` | 예산 적합도순 | `dimensions.budget` 내림차순 |
| `commute` | 통근 시간순 | `max(commuteTime1, commuteTime2)` 오름차순 |

- 선택: `#0891B2` 배경 + 흰 텍스트
- 미선택: 아웃라인 스타일

##### StepWizard

> **SoT 참조**: DS S3.4

```typescript
// src/components/input/StepWizard.tsx

interface StepWizardProps {
  /** Initial step (0-indexed), default 0 */
  initialStep?: number;
  /** Callback when all steps complete */
  onComplete: (data: RecommendRequest) => void;
}
```

상세 스텝 구성은 섹션 4에서 기술.

##### AmountInput

> **SoT 참조**: DS S3.4

```typescript
// src/components/input/AmountInput.tsx

interface AmountInputProps {
  /** Field label */
  label: string;
  /** Current value in 만원 */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Quick increment buttons */
  quickButtons?: Array<{ label: string; amount: number }>;
  /** Maximum allowed value */
  max?: number;
  /** Tooltip text for info icon */
  tooltip?: string;
  /** Error message from form validation */
  error?: string;
}
```

기본 빠른 입력 버튼:
- `+1,000만` (+1000)
- `+5,000만` (+5000)
- `+1억` (+10000)

표시: `font-variant-numeric: tabular-nums`, 쉼표 구분, "만원" 단위. 음수 입력 차단.

##### AddressSearch

> **SoT 참조**: DS S3.4

```typescript
// src/components/input/AddressSearch.tsx

interface AddressSearchProps {
  /** Field label */
  label: string;
  /** Current address string */
  value: string;
  /** Change handler — returns full address string */
  onChange: (address: string) => void;
  /** Whether the field is required */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
}
```

- API: Kakao 주소 검색 API (PHASE1 S1 SoT)
- Kakao Address SDK 팝업 방식 (인라인 임베드 대비 구현 용이)
- 선택 결과에서 `roadAddress` 또는 `jibunAddress` 추출
- 좌표(`lat`, `lng`)는 분석 요청 시에만 서버에서 지오코딩 (클라이언트에서 좌표 미저장)

##### MapMarker

> **SoT 참조**: DS S3.5

```typescript
// src/components/map/MapMarker.tsx

interface MapMarkerProps {
  /** Marker position */
  position: { lat: number; lng: number };
  /** Score for color grading */
  score: number;
  /** Current marker state */
  state: "default" | "selected" | "visited";
  /** Label text (score value) */
  label: string;
  /** Click handler */
  onClick?: () => void;
}
```

| 상태 | 배경 | 텍스트 | 크기 | 그림자 |
|------|------|--------|------|--------|
| Default | `#FFFFFF` | Score 등급 컬러 | 1.0x (30-34px) | `0 2px 8px rgba(0,0,0,0.12)` |
| Selected | Score 등급 컬러 | `#FFFFFF` | 1.15x | `0 4px 16px {color}40` |
| Visited | `#FFFFFF` (70% opacity) | Score 등급 컬러 | 1.0x | `0 1px 4px rgba(0,0,0,0.08)` |

구현: Kakao Maps `CustomOverlay` 사용 (HTML 기반 마커). `kakao.maps.CustomOverlay`로 React 컴포넌트를 마커로 렌더링.

##### TrustBadge

> **SoT 참조**: DS S3.6

```typescript
// src/components/trust/TrustBadge.tsx

interface TrustBadgeProps {
  variant: "full" | "mini";
}
```

| 변형 | 위치 | 구성 |
|------|------|------|
| Full | Step 3 상단 | 인라인 배너: `brand-50` 배경 + 자물쇠 아이콘 + "입력 정보는 분석 후 즉시 삭제됩니다" + 부연 |
| Mini | Step 3, 4 하단 | 1줄: "이 금액은 분석 후 즉시 삭제됩니다" |

> **가드레일**: "개인정보를 안전하게 보호합니다"(추상적) 대신 "분석 후 즉시 삭제"(구체적 행동) 명시.

##### DataSourceTag

> **SoT 참조**: DS S3.6

```typescript
// src/components/trust/DataSourceTag.tsx

type DataSourceType = "public" | "transit" | "childcare" | "date";

interface DataSourceTagProps {
  type: DataSourceType;
  /** Custom label override */
  label?: string;
  /** Reference date for "date" type */
  date?: string;
}
```

기본 라벨 매핑:

| type | 아이콘 | 라벨 |
|------|--------|------|
| `public` | 📊 | 공공데이터 기반 분석 결과 |
| `transit` | 🚇 | 대중교통 경로 기준 |
| `childcare` | 🏫 | 사회보장정보원 |
| `date` | 📅 | 기준일 {date} |

##### ExternalLinkCTA

> **SoT 참조**: DS S3.6, S5.4

```typescript
// src/components/trust/ExternalLinkCTA.tsx

interface ExternalLinkCTAProps {
  /** Target URL */
  href: string;
  /** Target site name (e.g., "네이버 부동산") */
  siteName: string;
  /** Tracking event callback */
  onOutlinkClick?: () => void;
}
```

동작:
1. 버튼 표시: "외부 매물 보러가기 ↗ {siteName}"
2. 하단 부가 텍스트: "외부 사이트로 이동합니다" (12px 보조 색상)
3. 클릭 시 **모달 필수 표시** (면책 접점 4):
   - 이동 대상 사이트명 명시
   - 정보 제공 주체가 외부임 명시
   - "본 서비스는 정보 분석 플랫폼이며 부동산 중개 서비스가 아닙니다"
   - 확인/취소 양쪽 선택지
4. 확인 시: `target="_blank" rel="noopener noreferrer"` 링크 열기
5. 이벤트: `outlink_click`

> **가드레일**: "바로 문의" / "바로 연결" / "전화하기" 사용 금지 → "외부 페이지로 이동"

##### ConsentForm

> **SoT 참조**: DS S3.6

```typescript
// src/components/trust/ConsentForm.tsx

interface ConsentState {
  required: boolean;      // [필수] 개인정보 수집·이용
  optional: boolean;      // [선택] 정밀 분석 추가
  location: boolean;      // [필수] 위치정보 이용
  policyVersion: string;  // e.g., "1.0.0"
}

interface ConsentFormProps {
  value: ConsentState;
  onChange: (state: ConsentState) => void;
  /** When all required consents are given */
  onAllRequired: (valid: boolean) => void;
}
```

상세 설계는 섹션 4에서 기술.

##### SafetySection

> **SoT 참조**: DS S3.6, S5.2

```typescript
// src/components/trust/SafetySection.tsx

interface SafetySectionProps {
  /** Safety detail from API */
  safety: SafetyDetail | null;
}
```

- 섹션 타이틀: **"안전 편의시설 현황"** (절대 "치안 점수", "범죄율" 사용 금지)
- 지표 표시: CCTV 수, 가로등 밀집도, 경찰서 거리, 비상벨 수 (시설 수량/거리)
- 비교: "서울시 평균 대비", "수도권 상위 N%"
- 색상 규칙 (빨강 사용 금지):
  - 80%+ (충분): 파랑 `#1976D2`
  - 60-79% (보통): 앰버 `#FFC107`
  - 60% 미만 (부족): 진회색 `#757575`
- **금지 표현**: "범죄율 높음", "위험 지역", "치안 열악", 원시 범죄 데이터 직접 노출, 순위형 비하

##### Toast

> **SoT 참조**: DS S3.7

```typescript
// src/components/feedback/Toast.tsx

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
}
```

| 속성 | 값 |
|------|------|
| 진입 | slide-up 200ms ease-out |
| 유지 | 2000ms |
| 퇴장 | fade-out 150ms |
| 위치 | 하단 중앙 |

##### Skeleton

> **SoT 참조**: DS S3.7

```typescript
// src/components/feedback/Skeleton.tsx

interface SkeletonProps {
  /** Width (CSS value) */
  width?: string;
  /** Height (CSS value) */
  height?: string;
  /** Border radius */
  rounded?: "sm" | "md" | "lg" | "full";
  /** Custom className */
  className?: string;
}
```

| 속성 | 값 |
|------|------|
| 배경 | `#E7E5E4` |
| 하이라이트 | `#FAFAF9` |
| 애니메이션 | shimmer sweep, linear, 1500ms 반복 |

##### Tooltip

> **SoT 참조**: DS S3.7

```typescript
// src/components/feedback/Tooltip.tsx

interface TooltipProps {
  /** Tooltip content */
  content: string;
  /** Trigger element (usually info icon) */
  children: React.ReactNode;
}
```

| 속성 | 값 |
|------|------|
| 트리거 | 아이콘 탭 (ⓘ) |
| 배경 | `#1C1917` (웜 다크) |
| 텍스트 | `#FFFFFF` |
| 3단계 공개 | ⓘ → 1줄 요약 → 요인 기여도 → 전체 방법론 |

---

### 섹션 4. 입력 폼 & 검증 설계

#### 4.1 StepWizard 5단계 흐름

> **SoT 참조**: DS S3.4 StepWizard, S7 충돌 해소 #2 (5 UI sub-step 채택)

```
URL: /search (단일 경로, 스텝은 컴포넌트 내부 상태)

┌─────────────────────────────────────────────┐
│  Progress Indicator (4단계 표시, Step 5 = 로딩)│
│  ● ─── ○ ─── ○ ─── ○                        │
│  Step 1                                      │
├─────────────────────────────────────────────┤

Step 1: "우리 부부는요" (~25초)
├── tradeType: 매매/전세/월세 (이모지+라벨 카드 3개)
│   → 🏠 매매 | 📋 전세 | 💳 월세
└── childPlan: 자녀 계획 (이모지+라벨 카드 3개)
    → 🍼 계획 있음 | 🤔 고민 중 | ❌ 계획 없음

    ↓ "다음" CTA

Step 2: "출퇴근 정보" (~40초)
├── job1: 직장1 주소 (AddressSearch, 필수)
│   → Kakao Address SDK 팝업
└── job2: 직장2 주소 (AddressSearch, 선택)
    → "두 번째 직장은 선택사항입니다" 안내

    ↓ "다음" CTA

Step 3: "소득과 자산" (~30초)
├── [TrustBadge Full] "입력 정보는 분석 후 즉시 삭제됩니다"
├── income: 합산 연봉 (AmountInput, 만원)
│   → 빠른 버튼: +1,000만 / +5,000만 / +1억
└── cash: 보유 현금 (AmountInput, 만원)
    → 빠른 버튼: +1,000만 / +5,000만 / +1억
├── [TrustBadge Mini] "이 금액은 분석 후 즉시 삭제됩니다"

    ↓ "다음" CTA

Step 4: "부채와 예산" (~30초)
├── loans: 기존 대출 상환액 (AmountInput, 만원/월)
│   → 빠른 버튼: +10만 / +50만 / +100만
├── monthlyBudget: 월 주거비 상한 (AmountInput, 만원/월)
│   → 빠른 버튼: +50만 / +100만 / +200만
├── weightProfile: 가중치 프로필 (CardSelector 3개)
│   → ⚖️ 균형형 | 💰 예산 중심 | 🚇 통근 중심
├── [ConsentForm] 필수/선택 동의
├── [TrustBadge Mini]

    ↓ "분석 시작" CTA (필수 동의 미체크 시 비활성)

Step 5: "분석 중..." (~7초)
├── 4단계 순차 애니메이션:
│   1. 🏘️ "입력 조건 분석 중..." (1200ms)
│   2. 🚇 "통근 경로 계산 중..." (1400ms)
│   3. 📊 "예산 적합도 시뮬레이션 중..." (1600ms)
│   4. 🗺️ "조건 부합 단지 탐색 중..." (1800ms)
├── POST /api/recommend 병렬 호출
└── 응답 수신 → router.push('/results')
```

#### 4.2 Zod 스키마 재사용

> **SoT 참조**: `src/lib/validators/recommend.ts` (M2 구현 완료)

기존 `recommendRequestSchema`를 React Hook Form에서 직접 재사용한다. Step 4 완료 시점에 전체 필드를 한 번에 검증한다.

```typescript
// src/hooks/useStepForm.ts

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recommendRequestSchema, type ValidatedRecommendRequest } from "@/lib/validators/recommend";

// Extended schema for frontend-only fields (childPlan)
const frontendExtendedSchema = recommendRequestSchema.extend({
  childPlan: z.enum(["planned", "considering", "none"]),
});

export type StepFormData = z.infer<typeof frontendExtendedSchema>;

export function useStepForm() {
  const form = useForm<StepFormData>({
    resolver: zodResolver(frontendExtendedSchema),
    mode: "onBlur",           // Validate on blur (not onChange — performance)
    defaultValues: {
      tradeType: "jeonse",
      childPlan: "considering",
      job1: "",
      job2: "",
      cash: 0,
      income: 0,
      loans: 0,
      monthlyBudget: 0,
      weightProfile: "balanced",
    },
  });

  // Session restoration on mount
  // Step navigation state
  // Submission handler

  return { form, currentStep, goNext, goBack, isSubmitting };
}
```

**스텝별 검증 전략**:

| Step | 검증 시점 | 검증 필드 | 검증 방식 |
|------|----------|----------|----------|
| 1 | "다음" 클릭 | `tradeType`, `childPlan` | 선택 필수 (enum 검증) |
| 2 | "다음" 클릭 | `job1` (필수), `job2` (선택) | 문자열 길이 1-200 |
| 3 | "다음" 클릭 | `income`, `cash` | 정수, 0 이상, 최댓값 제한 |
| 4 | "분석 시작" 클릭 | `loans`, `monthlyBudget`, `weightProfile` + 전체 | Zod 전체 스키마 검증 |
| 5 | - | - | 검증 없음 (애니메이션 + API 호출) |

#### 4.3 React Hook Form 통합 패턴

```typescript
// Step 컴포넌트 내부 패턴 예시 (Step3Income.tsx)

interface Step3Props {
  form: UseFormReturn<StepFormData>;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Income({ form, onNext, onBack }: Step3Props) {
  const { control, trigger } = form;

  const handleNext = async () => {
    const valid = await trigger(["income", "cash"]);
    if (valid) {
      // Save to sessionStorage
      saveToSession("hc_step_data", form.getValues());
      onNext();
    }
  };

  return (
    <div>
      <TrustBadge variant="full" />

      <Controller
        name="income"
        control={control}
        render={({ field, fieldState }) => (
          <AmountInput
            label="합산 연봉"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            tooltip="부부 합산 세전 연봉을 입력해주세요"
            quickButtons={[
              { label: "+1,000만", amount: 1000 },
              { label: "+5,000만", amount: 5000 },
              { label: "+1억", amount: 10000 },
            ]}
          />
        )}
      />

      {/* cash field similarly */}

      <TrustBadge variant="mini" />

      <div className="fixed bottom-0 inset-x-0 bg-surface/80 backdrop-blur-lg px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <button onClick={onBack}>이전</button>
        <button onClick={handleNext}>다음</button>
      </div>
    </div>
  );
}
```

#### 4.4 Kakao Address SDK 통합

```typescript
// src/hooks/useKakaoAddress.ts

interface KakaoAddressResult {
  roadAddress: string;      // Road-name address
  jibunAddress: string;     // Lot-number address
  zonecode: string;         // Postal code
}

export function useKakaoAddress() {
  const openAddressSearch = useCallback((): Promise<KakaoAddressResult> => {
    return new Promise((resolve, reject) => {
      // daum.Postcode SDK popup
      new (window as unknown as { daum: { Postcode: new (config: unknown) => unknown } })
        .daum.Postcode({
          oncomplete: (data: KakaoAddressResult) => {
            resolve(data);
          },
          onclose: () => {
            reject(new Error("Address search cancelled"));
          },
        }).open();
    });
  }, []);

  return { openAddressSearch };
}
```

SDK 로드: `src/app/layout.tsx`에서 `<Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />`

#### 4.5 ConsentForm 설계

> **SoT 참조**: DS S3.6 ConsentForm

```
┌─────────────────────────────────────────────┐
│  개인정보 수집·이용 동의                      │
│                                              │
│  ☑ [필수] 개인정보 수집·이용 동의             │
│     직장 권역, 예산 범위 | 세션 종료 시 삭제   │
│     [전문 보기]                               │
│                                              │
│  ☐ [선택] 정밀 분석 추가 동의                  │
│     보유 현금, 상세 소득 | 세션 종료 시 삭제   │
│     [전문 보기]                               │
│                                              │
│  ☑ [필수] 위치정보 이용 동의                   │
│     직장 주소 → 좌표 변환 | 좌표 미저장       │
│     [전문 보기]                               │
│                                              │
│  동의 정책 버전: v1.0.0                       │
│  철회 안내: 브라우저 탭을 닫으면 즉시 삭제     │
└─────────────────────────────────────────────┘
```

- 필수(2건) 미체크 시 "분석 시작" CTA 비활성 (`disabled`)
- 선택 동의 없이도 기본 분석 가능 (정밀 분석 필드는 빈 값으로 전송)
- `policy_version`은 `consent_accepted` 이벤트 속성으로 기록 (PHASE0 S2 참조)
- 철회 경로: 브라우저 탭/창 닫기 → sessionStorage 자동 삭제

#### 4.6 입력값 비저장 흐름 (NFR-1)

```
사용자 입력
    │
    ├── Step 1~4: sessionStorage("hc_step_data") 저장
    │     ├── 브라우저 메모리 (탭 스코프)
    │     ├── 동일 탭 내 페이지 이동 시 유지 (뒤로가기 대응)
    │     └── 탭/브라우저 닫기 시 자동 삭제
    │
    ├── Step 5: POST /api/recommend 전송
    │     ├── HTTPS 전송 (TLS 1.2+)
    │     ├── 서버: 계산 완료 후 request body 폐기
    │     ├── DB 미저장, 로그 미저장 (pii-guard)
    │     └── 응답: recommendations (PII 미포함)
    │
    ├── 결과 수신: sessionStorage("hc_results") 저장
    │     └── PII 미포함 (aptName, score, address만)
    │
    └── localStorage 사용 금지
          └── 세션 종료 후 잔존 방지
```

---

### 섹션 5. 결과 페이지 & 지도 설계

#### 5.1 Progressive Reveal Sequence

> **SoT 참조**: DS S2.5

결과 페이지 진입 시 점수 로딩 애니메이션:

| 단계 | 시간 | 내용 | 이징 |
|------|------|------|------|
| 1 | 0-300ms | PropertyCard 스켈레톤 shimmer | linear, 1500ms 반복 |
| 2 | 300-500ms | CircularGauge 종합 점수 카운트업 (0→N) | `easeOutExpo` `cubicBezier(0.16, 1, 0.3, 1)` |
| 3 | 500-800ms | 카테고리 점수 순차 fade-in | stagger 100ms 간격 |
| 4 | 800ms+ | ScoreBar 프로그레스 바 확장 | ease-out 500ms |

구현 방식: CSS `@keyframes` + `animation-delay` 기반 stagger. JavaScript `requestAnimationFrame` 대비 GPU 가속 활용.

```css
/* Score count-up easing */
@keyframes countUp {
  from { --score-value: 0; }
  to { --score-value: var(--target-score); }
}

/* Stagger fade-in */
.score-item:nth-child(1) { animation-delay: 500ms; }
.score-item:nth-child(2) { animation-delay: 600ms; }
.score-item:nth-child(3) { animation-delay: 700ms; }
.score-item:nth-child(4) { animation-delay: 800ms; }
```

#### 5.2 PropertyCard 레이아웃 (결과 리스트)

> **SoT 참조**: DS S3.2, PHASE0 FR-5 (Why-Not 표시)

결과 리스트 구성:

```
┌─────────────────────────────────────────────┐
│  [결과 상단 메타 영역]                        │
│  [📊 공공데이터 기반 분석 결과]                │
│  [🚇 대중교통 경로 기준]                      │
│  [📅 기준일 2026.02.01]                       │
│  [참고용 정보]                                │
│  ──────────────────────────────────────────── │
│  [CardSelector: 종합 점수순 | 예산 | 통근]     │
│  ──────────────────────────────────────────── │
│  PropertyCard #1 (상위 3: 코랄 배지)          │
│  PropertyCard #2                              │
│  PropertyCard #3                              │
│  ... (최대 10개)                              │
│  ──────────────────────────────────────────── │
│  "입력 조건 수정하기" 링크 (→ /search)         │
└─────────────────────────────────────────────┘
```

- 최대 10건 표시 ("더 보기" 미적용 — Top 10 분석 결과 안내)
- 무한 스크롤 미채택 (DS S4.3)
- whyNot (FR-5): 각 카드 하단에 약점 1줄 표시 (있는 경우)

#### 5.3 KakaoMap 양방향 싱크

> **SoT 참조**: DS S3.5

```typescript
// src/hooks/useKakaoMap.ts

interface UseKakaoMapOptions {
  containerId: string;
  center: { lat: number; lng: number };
  level: number;
}

interface UseKakaoMapReturn {
  map: kakao.maps.Map | null;
  isLoaded: boolean;
  setCenter: (lat: number, lng: number) => void;
  addMarker: (marker: MarkerData) => void;
  removeAllMarkers: () => void;
  selectMarker: (aptId: number) => void;
}
```

양방향 싱크 구현:

| 방향 | 트리거 | 동작 |
|------|--------|------|
| 카드 → 지도 | PropertyCard `onHover` | 해당 마커 `selected` 상태로 전환 |
| 카드 → 지도 | PropertyCard `onClick` | 지도 중심 이동 + 마커 `selected` |
| 지도 → 카드 | MapMarker `onClick` | 해당 PropertyCard로 스크롤 + 하이라이트 |
| 지도 이동 | 지도 팬/줌 | M3에서는 자동 재검색 미구현 (M4 대상) |

> **M3 범위 제한**: 지도 팬/줌 시 자동 재검색(바운딩 박스 갱신)은 M4에서 구현. M3에서는 Top 10 결과의 마커만 표시.

#### 5.4 반응형 레이아웃

> **SoT 참조**: DS S2.4

##### 모바일 (< 1024px)

```
┌─────────────────────────┐
│  KakaoMap (전체 너비)     │
│  (높이: 50vh)            │
│                          │
├─────────────────────────┤
│  CardSelector            │
│  PropertyCard #1         │
│  PropertyCard #2         │
│  ...                     │
│  (스크롤)                │
└─────────────────────────┘
```

> M3에서 3단 바텀시트(BottomSheet)는 미구현. 대신 지도 아래에 카드 리스트를 세로로 배치. M4에서 BottomSheet로 전환.

##### 데스크톱 (>= 1024px)

```
┌────────────────────────┬──────────────────────────────────┐
│  리스트 패널 (40%)      │  KakaoMap (60%)                  │
│  min-width: 480px       │                                  │
│                         │                                  │
│  CardSelector           │  MapMarker x N                   │
│  PropertyCard #1        │                                  │
│  PropertyCard #2        │                                  │
│  ...                    │                                  │
│  (스크롤)               │                                  │
└────────────────────────┴──────────────────────────────────┘
```

구현: `grid grid-cols-1 lg:grid-cols-[minmax(480px,2fr)_3fr]`

---

### 섹션 6. 상세 & 컨시어지 페이지 설계

#### 6.1 단지 상세 페이지 (`/complex/[id]`)

> **SoT 참조**: DS S4.3 Detail

```
┌─────────────────────────────────────────────┐
│  [뒤로가기]   단지 상세                       │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Hero 섹션                            │   │
│  │  ┌──────────┐  단지명                 │   │
│  │  │ Circular │  주소                   │   │
│  │  │ Gauge    │  세대수 · 준공 · 면적   │   │
│  │  │ 80-96px  │  ScoreBadge (A+)       │   │
│  │  └──────────┘                         │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ── 점수 상세 ──                              │
│  ScoreBar: 💰 예산 적합도    ████████░░  82  │
│  ScoreBar: 🚇 통근 편의성    ███████░░░  71  │
│  ScoreBar: 🏫 보육 환경      ██████░░░░  65  │
│  ScoreBar: 🛡️ 안전 편의시설   ███████░░░  78  │
│  ScoreBar: 📚 학군 환경      █████░░░░░  52  │
│                                              │
│  ── 통근 정보 ──                              │
│  직장1 (서울 강남구): 35분                    │
│  직장2 (서울 영등포구): 42분                  │
│  [🚇 대중교통 경로 기준] [📅 기준일 2026.02]  │
│                                              │
│  ── 실거래가 이력 ──                          │
│  매매 최근 실거래: 5억 2,000만 (2026.01)      │
│  전세 최근 실거래: 2억 8,000만 (2026.01)      │
│  [📊 국토교통부 실거래가 공개시스템]          │
│  [📅 기준일 2026.01]                          │
│                                              │
│  ── 보육시설 현황 ──                          │
│  반경 800m 내 보육시설: 7곳                   │
│  [🏫 사회보장정보원]                          │
│                                              │
│  ── 안전 편의시설 현황 ──  (SafetySection)     │
│  CCTV: 서울시 평균 대비 120% (충분, 파랑)     │
│  가로등: 수도권 상위 30% (충분, 파랑)         │
│  경찰서: 1.2km (보통, 앰버)                  │
│  비상벨: 3개 (보통, 앰버)                    │
│                                              │
│  ── 재무 면책 ──                              │
│  "참고용 시뮬레이션이며 실제 대출 승인을      │
│   보장하지 않습니다"                          │
│  [📊 공공데이터 기반 분석 결과]                │
│                                              │
│  ── 외부 매물 ──                              │
│  [ExternalLinkCTA]                           │
│  "외부 매물 보러가기 ↗ 네이버 부동산"         │
│  "외부 사이트로 이동합니다" (12px)            │
│                                              │
└─────────────────────────────────────────────┘
```

#### 6.2 데이터 소스: `GET /api/apartments/:id`

> **SoT 참조**: `src/types/api.ts` `ApartmentDetailResponse`

상세 페이지에서 사용하는 API 응답 필드 매핑:

| UI 영역 | API 필드 | 타입 |
|---------|----------|------|
| Hero - 단지명 | `apartment.aptName` | `string` |
| Hero - 주소 | `apartment.address` | `string` |
| Hero - 세대수/준공/면적 | `apartment.householdCount`, `builtYear`, `areaMin~areaMax` | `number | null` |
| ScoreBar 5종 | 결과 페이지 sessionStorage 캐시의 `dimensions` | `DimensionScores` |
| 통근 정보 | `commute.toGbd`, `toYbd`, `toCbd`, `toPangyo` | `number | null` |
| 실거래가 이력 | `apartment.prices[]` | `PriceHistoryItem[]` |
| 보육시설 | `nearby.childcare.count`, `items[]` | `number`, `NearbyChildcareItem[]` |
| 안전 편의시설 | `nearby.safety` | `SafetyDetail | null` |
| 출처/기준일 | `sources.priceDate`, `safetyDate` | `string`, `string | null` |

> **참고**: ScoreBar 5종의 dimension 점수는 `/api/apartments/:id` 응답에 포함되지 않음. 결과 페이지에서 sessionStorage에 캐시된 `RecommendationItem`의 카테고리별 점수를 사용하거나, 상세 페이지에서 원시 지표로부터 프론트엔드에서 재계산. M3에서는 sessionStorage 캐시 우선 방식 채택.

#### 6.3 재무 면책 고지

> **SoT 참조**: DS S5.5

예산 관련 데이터가 표시되는 모든 위치에 면책 고지 추가:

- **예산 적합도 ScoreBar 하단**: "참고용 시뮬레이션이며 실제 대출 승인을 보장하지 않습니다"
- **비단정 표현 3-bucket**:
  - 안정적 (budget score >= 60): "참고 범위 이내"
  - 다소 부담 (budget score 30-59): "다소 부담될 수 있는 범위"
  - 적극적 (budget score < 30): "적극적인 재무 계획이 필요한 범위"
- 각 bucket 옆에 면책 병기

---

### 섹션 7. 컴플라이언스 & 신뢰 UI 설계

#### 7.1 면책 5접점 체크리스트

> **SoT 참조**: DS S5.3

| # | 위치 | 톤 | 빈도 | 구현 컴포넌트 | 문구 |
|---|------|-----|------|-------------|------|
| 1 | 랜딩 하단 (모든 페이지 푸터) | 소프트 | 상시 | `Footer.tsx` | "본 서비스는 공공데이터 기반 정보 분석 플랫폼입니다 · 부동산 중개·알선·자문 서비스가 아닙니다" |
| 2 | 입력 플로우 시작 시 배너 | 중립 | 1회 | `DisclaimerBanner.tsx` | "입력하신 정보는 분석 목적으로만 사용되며 거래 연결에 사용되지 않습니다" |
| 3 | 결과 상단 메타 태그 | 컨텍스트 내장형 | 결과 확인 시 | `DataSourceTag.tsx` 배열 | `[📊 공공데이터 기반 분석 결과] [📅 기준일 2026.02.01] [참고용 정보]` |
| 4 | 외부 링크 클릭 모달 | 명시적 | 매 클릭 | `ExternalLinkCTA.tsx` 모달 | "본 서비스는 정보 분석 플랫폼이며 부동산 중개 서비스가 아닙니다. 매물 정보의 정확성은 해당 외부 사이트에서 확인해주세요." |
| 5 | 이용약관 | 법률 문서 | 동의 시 | `/terms/page.tsx` | 제2조: 서비스 성격 정의 (공인중개사법 제2조 인용) |

#### 7.2 금지 용어 → 대체어 매핑 (UI 적용)

> **SoT 참조**: DS S5.1

M3 프론트엔드 코드/문구에서 반드시 준수할 매핑:

##### 서비스 포지셔닝 용어

| 금지 | 대체 | 적용 위치 |
|------|------|----------|
| 추천 | 분석 결과 안내 | 전체 UI 텍스트 |
| 알선 | 정보 연결 | Footer, 약관 |
| 중개 | 정보 분석 | Footer, 약관, 면책 |
| 매물 추천 | 조건 맞춤 단지 탐색 | 결과 페이지 |
| 최적 매물 | 분석 상위 단지 | 결과 카드 |
| 맞춤 매물 | 조건 부합 단지 | 결과 카드 |

##### CTA 용어

| 금지 | 대체 | 적용 위치 |
|------|------|----------|
| 매물 문의 | 외부 매물 보러가기 | ExternalLinkCTA |
| 상담 신청 | 외부 사이트에서 확인 | 상세 페이지 |
| 중개사 연결 | 주변 중개사무소 정보 | - |
| 바로 문의 / 바로 연결 / 전화하기 | 외부 페이지로 이동 | ExternalLinkCTA 모달 |

##### 금융 용어

| 금지 | 대체 | 적용 위치 |
|------|------|----------|
| 대출 가능 | 예상 대출 범위 (참고용) | 예산 관련 UI |
| 대출 승인 가능 | 참고용 시뮬레이션 결과 | 상세 페이지 |
| 예산 적정 | 참고 범위 이내 | ScoreBar 라벨 |
| 투자 수익률 | 과거 실거래가 변동 추이 | 상세 페이지 |
| **대출 가능 보장** | **(사용 금지 - 대체 없음)** | - |
| **거래 성사 보장** | **(사용 금지 - 대체 없음)** | - |
| **투자 수익 보장** | **(사용 금지 - 대체 없음)** | - |

##### 치안 표현

| 금지 | 대체 | 적용 위치 |
|------|------|----------|
| 범죄율 높음 | 안전 편의시설 현황 | SafetySection |
| 위험 지역 | 안전 인프라 보통 | SafetySection |
| 치안 열악 | CCTV·가로등 보강 여지 | SafetySection |
| 가장 안전한 | 안전 인프라 상위 | SafetySection |
| **가장 안전한 지역 확정** | **(사용 금지 - 대체 없음)** | - |
| **최적 투자 확정** | **(사용 금지 - 대체 없음)** | - |

#### 7.3 TrustBadge 배치 계획

| 위치 | 변형 | 문구 |
|------|------|------|
| Step 3 상단 | Full | "입력 정보는 분석 후 즉시 삭제됩니다" + 부연 텍스트 |
| Step 3 하단 | Mini | "이 금액은 분석 후 즉시 삭제됩니다" |
| Step 4 하단 | Mini | "이 금액은 분석 후 즉시 삭제됩니다" |

#### 7.4 컴플라이언스 자동 테스트

```typescript
// src/__tests__/compliance/forbidden-ui-phrases.test.ts

const FORBIDDEN_PHRASES = [
  "대출 가능 보장",
  "거래 성사 보장",
  "투자 수익 보장",
  "가장 안전한 지역 확정",
  "최적 투자 확정",
  "추천합니다",        // "추천" 단독 사용 금지
  "매물 추천",
  "바로 문의",
  "바로 연결",
  "전화하기",
  "범죄율 높음",
  "위험 지역",
  "치안 열악",
];

// Scan all .tsx files in src/components/ and src/app/
// for forbidden phrases — fail if any found
```

---

### 섹션 8. 이벤트 트래킹 설계

#### 8.1 추적 이벤트 10종

> **SoT 참조**: `docs/PHASE0_ground.md` S2 KPI 계측 스펙

| # | 이벤트명 | 설명 | 트리거 위치 | 필수 속성 |
|---|---------|------|------------|----------|
| 1 | `landing_unique_view` | 랜딩 페이지 고유 방문 | `/` 페이지 마운트 | - |
| 2 | `min_input_start` | 최소 입력 시작 | Step 1 진입 시 | - |
| 3 | `min_input_complete` | 최소 입력 완료 | Step 4 "분석 시작" 클릭 시 | - |
| 4 | `result_view` | 분석 결과 페이지 노출 | `/results` 페이지 마운트 | - |
| 5 | `concierge_unique_view` | 컨시어지 리포트 고유 조회 | `/complex/[id]` 페이지 마운트 | `aptId` |
| 6 | `concierge_contact_click` | 컨시어지 문의 클릭 | 상세 페이지 CTA 클릭 | `aptId` |
| 7 | `inquiry_click` | 컨시어지 리포트 내 문의 CTA 클릭 | 상세 페이지 문의 CTA 클릭 | `aptId` |
| 8 | `outlink_click` | 외부 매물 링크 클릭 | ExternalLinkCTA 확인 클릭 | `aptId`, `targetUrl` |
| 9 | `consent_shown` | 동의 UI 노출 | ConsentForm 렌더링 시 | - |
| 10 | `consent_accepted` | 동의 완료 | 필수 동의 체크 완료 시 | **`policy_version`** (필수) |

> **`consent_accepted` 이벤트의 `policy_version`**: PHASE0 S2 주석에 따라 `policy_version`은 `consent_accepted` 이벤트의 속성(property)으로 기록한다.

#### 8.2 구현 패턴

```typescript
// src/lib/tracking.ts

type TrackingEvent =
  | { name: "landing_unique_view" }
  | { name: "min_input_start" }
  | { name: "min_input_complete" }
  | { name: "result_view" }
  | { name: "concierge_unique_view"; aptId: number }
  | { name: "concierge_contact_click"; aptId: number }
  | { name: "inquiry_click"; aptId: number }
  | { name: "outlink_click"; aptId: number; targetUrl: string }
  | { name: "consent_shown" }
  | { name: "consent_accepted"; policyVersion: string };

/**
 * Track an analytics event.
 * M3: console.log + dataLayer push (GA4 ready).
 * M4: Google Analytics gtag() integration.
 */
export function trackEvent(event: TrackingEvent): void {
  // Development: console log
  if (process.env.NODE_ENV === "development") {
    console.log("[Track]", event.name, event);
  }

  // GA4 dataLayer push (when GA is configured)
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: event.name,
      ...event,
    });
  }
}
```

```typescript
// src/hooks/useTracking.ts

/**
 * Hook for page-level tracking with unique view deduplication.
 */
export function useTracking(eventName: string, properties?: Record<string, unknown>) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      trackEvent({ name: eventName, ...properties } as TrackingEvent);
      hasTracked.current = true;
    }
  }, [eventName]);
}
```

#### 8.3 KPI 대시보드 연동 준비

| KPI | 이벤트 분자 | 이벤트 분모 | 목표 | 비고 |
|-----|-----------|-----------|------|------|
| 컨시어지 CTR | `concierge_contact_click` | `concierge_unique_view` | >= 20% | PHASE0 S2 |
| 입력 완료율 | `min_input_complete` | `min_input_start` | >= 50% | PHASE0 S2 |
| 결과-문의 전환율 | `inquiry_click` | `result_view` | >= 8% (go) | PHASE0 S2 |
| 결과 노출률 | `result_view` | `min_input_complete` | >= 70% | PHASE0 S2 |

---

### 섹션 9. 파일 맵 & 세션 분할

#### 9.1 전체 파일 트리 (신규/수정)

| # | 파일 경로 | 유형 | 용도 | 의존 |
|---|----------|------|------|------|
| 1 | `src/app/layout.tsx` | 수정 | Pretendard 폰트 + Kakao SDK Script | - |
| 2 | `src/app/globals.css` | 수정 | 애니메이션 keyframes 추가 | tokens.css |
| 3 | `src/app/(main)/layout.tsx` | 신규 | Header + Footer + DisclaimerBanner 래퍼 | #4, #5, #6 |
| 4 | `src/components/layout/Header.tsx` | 신규 | 상단 헤더 | - |
| 5 | `src/components/layout/Footer.tsx` | 신규 | 하단 푸터 (면책 접점 1) | constants.ts |
| 6 | `src/components/layout/DisclaimerBanner.tsx` | 신규 | 입력 플로우 면책 배너 (접점 2) | constants.ts |
| 7 | `src/app/(main)/page.tsx` | 신규 | 랜딩 페이지 | #4, #5, tracking |
| 8 | `src/app/(main)/search/page.tsx` | 신규 | 입력 위저드 페이지 | StepWizard |
| 9 | `src/app/(main)/results/page.tsx` | 신규 | 결과 페이지 | KakaoMap, PropertyCard |
| 10 | `src/app/(main)/complex/[id]/page.tsx` | 신규 | 상세 페이지 | CircularGauge, ScoreBar |
| 11 | `src/app/(main)/terms/page.tsx` | 신규 | 이용약관 | - |
| 12 | `src/app/(main)/privacy/page.tsx` | 신규 | 개인정보처리방침 | - |
| 13 | `src/app/(main)/location-terms/page.tsx` | 신규 | 위치정보 이용약관 | - |
| 14 | `src/components/score/CircularGauge.tsx` | 신규 | 종합 점수 원형 게이지 | score-utils |
| 15 | `src/components/score/ScoreBar.tsx` | 신규 | 카테고리별 수평 바 | score-utils |
| 16 | `src/components/score/ScoreBadge.tsx` | 신규 | 점수 등급 배지 | score-utils |
| 17 | `src/components/card/PropertyCard.tsx` | 신규 | 단지 카드 | CircularGauge, ScoreBadge |
| 18 | `src/components/card/CardSelector.tsx` | 신규 | 정렬 칩 바 | - |
| 19 | `src/components/input/StepWizard.tsx` | 신규 | 5단계 위저드 컨테이너 | useStepForm |
| 20 | `src/components/input/steps/Step1TradeChild.tsx` | 신규 | Step 1 | - |
| 21 | `src/components/input/steps/Step2Jobs.tsx` | 신규 | Step 2 | AddressSearch |
| 22 | `src/components/input/steps/Step3Income.tsx` | 신규 | Step 3 | AmountInput, TrustBadge |
| 23 | `src/components/input/steps/Step4Loans.tsx` | 신규 | Step 4 | AmountInput, ConsentForm |
| 24 | `src/components/input/steps/Step5Analysis.tsx` | 신규 | Step 5 | - |
| 25 | `src/components/input/AmountInput.tsx` | 신규 | 금액 입력 | format.ts |
| 26 | `src/components/input/AddressSearch.tsx` | 신규 | 주소 검색 | useKakaoAddress |
| 27 | `src/components/map/KakaoMap.tsx` | 신규 | 지도 래퍼 | useKakaoMap |
| 28 | `src/components/map/MapMarker.tsx` | 신규 | 3상태 마커 | score-utils |
| 29 | `src/components/trust/TrustBadge.tsx` | 신규 | 신뢰 배지 | - |
| 30 | `src/components/trust/DataSourceTag.tsx` | 신규 | 출처 태그 | - |
| 31 | `src/components/trust/ExternalLinkCTA.tsx` | 신규 | 외부 링크 + 모달 | tracking |
| 32 | `src/components/trust/ConsentForm.tsx` | 신규 | 동의 폼 | tracking |
| 33 | `src/components/trust/SafetySection.tsx` | 신규 | 안전 편의시설 현황 | - |
| 34 | `src/components/feedback/Toast.tsx` | 신규 | 토스트 알림 | - |
| 35 | `src/components/feedback/Skeleton.tsx` | 신규 | 스켈레톤 로딩 | - |
| 36 | `src/components/feedback/Tooltip.tsx` | 신규 | 정보 툴팁 | - |
| 37 | `src/hooks/useStepForm.ts` | 신규 | 스텝 폼 상태 관리 | react-hook-form, zod |
| 38 | `src/hooks/useSessionStorage.ts` | 신규 | sessionStorage 래퍼 | - |
| 39 | `src/hooks/useKakaoMap.ts` | 신규 | KakaoMap SDK 초기화 | kakao.ts |
| 40 | `src/hooks/useKakaoAddress.ts` | 신규 | Kakao Address SDK | - |
| 41 | `src/hooks/useTracking.ts` | 신규 | 이벤트 트래킹 | tracking.ts |
| 42 | `src/lib/tracking.ts` | 신규 | 트래킹 유틸 | - |
| 43 | `src/lib/kakao.ts` | 신규 | Kakao SDK 헬퍼 | - |
| 44 | `src/lib/score-utils.ts` | 신규 | 점수 등급 판정 | - |
| 45 | `src/lib/format.ts` | 신규 | 금액/날짜 포매팅 | - |
| 46 | `src/lib/constants.ts` | 신규 | UI 상수 (면책 문구 등) | - |
| 47 | `src/types/ui.ts` | 신규 | UI 전용 타입 | - |
| 48 | `src/__tests__/components/CircularGauge.test.tsx` | 신규 | 테스트 | - |
| 49 | `src/__tests__/components/ScoreBar.test.tsx` | 신규 | 테스트 | - |
| 50 | `src/__tests__/components/PropertyCard.test.tsx` | 신규 | 테스트 | - |
| 51 | `src/__tests__/components/AmountInput.test.tsx` | 신규 | 테스트 | - |
| 52 | `src/__tests__/components/ConsentForm.test.tsx` | 신규 | 테스트 | - |
| 53 | `src/__tests__/components/ExternalLinkCTA.test.tsx` | 신규 | 테스트 | - |
| 54 | `src/__tests__/hooks/useStepForm.test.ts` | 신규 | 테스트 | - |
| 55 | `src/__tests__/hooks/useSessionStorage.test.ts` | 신규 | 테스트 | - |
| 56 | `src/__tests__/pages/search.test.tsx` | 신규 | 통합 테스트 | - |
| 57 | `src/__tests__/pages/results.test.tsx` | 신규 | 통합 테스트 | - |
| 58 | `src/__tests__/compliance/disclaimer.test.ts` | 신규 | 면책 접점 테스트 | - |
| 59 | `src/__tests__/compliance/forbidden-ui-phrases.test.ts` | 신규 | 금지 문구 스캔 | - |

#### 9.2 구현 세션 분할 (권장)

| 세션 | 파일 범위 | 예상 시간 | 선행 조건 |
|------|----------|----------|----------|
| **S1: 기반 인프라** | #1-6, #42-47 | 2-3h | M2 ORM 리팩터 완료 |
| **S2: 스코어 컴포넌트** | #14-16, #48-49 | 2h | S1 완료 |
| **S3: 입력 컴포넌트** | #25-26, #37-40, #51 | 3h | S1 완료 |
| **S4: 신뢰/컴플라이언스** | #29-33, #52-53 | 2-3h | S1 완료 |
| **S5: StepWizard & 입력 페이지** | #8, #19-24 | 3-4h | S2, S3, S4 완료 |
| **S6: 카드 & 결과 페이지** | #9, #17-18, #27-28, #50, #57 | 3-4h | S2, S5 완료 |
| **S7: 상세 페이지** | #10 | 2h | S2, S4, S6 완료 |
| **S8: 법률 & 랜딩 페이지** | #7, #11-13 | 1-2h | S1 완료 |
| **S9: 피드백 컴포넌트** | #34-36 | 1h | S1 완료 |
| **S10: 통합 테스트 & 컴플라이언스** | #54-56, #58-59 | 2-3h | S5-S8 완료 |

**세션 의존 관계 DAG**:

```
S1 (기반)
├── S2 (스코어)
├── S3 (입력)
├── S4 (신뢰)
├── S8 (법률/랜딩)
└── S9 (피드백)

S2 + S3 + S4
└── S5 (StepWizard)

S2 + S5
└── S6 (카드/결과)

S2 + S4 + S6
└── S7 (상세)

S5 + S6 + S7 + S8
└── S10 (통합 테스트)
```

---

### 섹션 10. 리스크 & 완화 방안

| # | 리스크 | 영향 | 확률 | 완화 방안 |
|---|--------|------|------|----------|
| 1 | **Kakao Maps JS SDK 로드 실패** | 결과 페이지 지도 미표시 | 중 | Fallback UI (카드 리스트만 표시) + 에러 바운더리. CDN 장애 시 사용자에게 "지도를 불러올 수 없습니다" 안내 |
| 2 | **Kakao Address SDK 팝업 차단** | 주소 검색 불가 | 중 | 팝업 차단 감지 → 인라인 임베드 모드 폴백. 또는 텍스트 직접 입력 허용 |
| 3 | **sessionStorage 용량 초과** | 결과 데이터 저장 실패 (5-10MB 제한) | 하 | Top 10 결과만 저장 (약 5-10KB). 초과 시 이전 데이터 삭제 후 재저장 |
| 4 | **API 응답 지연 (p95 > 2초)** | Step 5 애니메이션 종료 후 대기 | 중 | 애니메이션 최소 7초로 설정하여 대부분의 API 호출 완료 시간 확보. 10초 초과 시 타임아웃 + 재시도 안내 |
| 5 | **모바일 터치 타겟 미달** | 접근성 위반 (WCAG 2.5.5) | 중 | 모든 인터랙티브 요소 최소 44x44px 터치 영역 확보. 테스트 단계에서 크롬 DevTools 터치 시뮬레이션 검증 |
| 6 | **Score 색상 대비 미달** | 색약 사용자 구분 불가 | 하 | 텍스트 라벨(A+/A/B/C/D) 필수 병행 (WCAG 1.4.1). 색상만으로 정보 전달 금지 |
| 7 | **PII 유출 (sessionStorage 잔존)** | NFR-1 위반 | 하 | sessionStorage 사용 (탭 스코프, 자동 삭제). localStorage 사용 금지. `beforeunload` 이벤트에서 추가 삭제 로직 |
| 8 | **금지 문구 노출** | 법무 컴플라이언스 위반 | 중 | CI 테스트에 금지 문구 스캔 포함 (`forbidden-ui-phrases.test.ts`). 코드 리뷰 시 문구 체크리스트 사용 |
| 9 | **면책 접점 누락** | 법무 컴플라이언스 위반 | 중 | 5접점 체크리스트 테스트 (`disclaimer.test.ts`). 각 접점의 DOM 존재 여부 자동 검증 |
| 10 | **react-hook-form + Zod 스키마 불일치** | 런타임 검증 실패 | 하 | M2의 `recommendRequestSchema`를 `frontendExtendedSchema`로 확장하여 재사용. 타입 레벨에서 불일치 컴파일 에러 발생 |

---

## 검증 기준

- [ ] 10개 섹션 전부 작성됨 (빈 섹션 없음)
- [ ] 모든 컴포넌트의 TypeScript 인터페이스(Props)가 코드 블록으로 정의됨
- [ ] DS SoT 28개 컴포넌트 중 M3 대상 17종과 M4 제외 8종이 명확히 분류됨
- [ ] Plan 명칭 → DS 정식 명칭 매핑 테이블 7건 포함
- [ ] StepWizard 5단계 구성이 DS SoT와 일치 (PHASE2의 3단계가 아닌 5단계)
- [ ] 기존 Zod 스키마(`recommendRequestSchema`) 재사용 패턴 명시됨
- [ ] PII 비저장 정책이 프론트엔드 관점에서 명시됨 (sessionStorage only, localStorage 금지)
- [ ] 면책 5접점 체크리스트가 구현 컴포넌트와 매핑됨
- [ ] 금지 문구 목록 + 대체 문구 매핑이 UI 적용 위치와 함께 포함됨
- [ ] 이벤트 10종의 트리거 위치 + 필수 속성 + `policy_version` 명시됨
- [ ] 파일 맵 57개 파일의 경로/유형/용도/의존관계 완성됨
- [ ] 구현 세션 분할(10세션)과 의존 관계 DAG 포함됨
- [ ] 리스크 항목 10건별 구체적 완화 방안 포함됨

---

## 결과/결정

- **상태**: `done`
- **주요 성과**: M3 Frontend 구현 상세 설계 완성 (10섹션, 59파일 맵, 1781줄)
- **후속 액션**: M3 구현 세션 실행 완료 → `2026-02-16_claude-code_m3-frontend-implementation` 참조

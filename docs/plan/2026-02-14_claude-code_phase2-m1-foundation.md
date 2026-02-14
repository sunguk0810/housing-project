<!-- template v1.1 -->
---
plan-id: "2026-02-14_claude-code_phase2-m1-foundation"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "feature"
depends-on:
  - plan-id: "2026-02-14_claude-code_phase1-design-verification"
    condition: "verdict == go"
---

# Plan Execute: PHASE2 M1 Foundation — Milestone Planning + Codex Task Generation

## 목표

PHASE1 설계 검증 verdict `go` (Run 2) 확정으로 PHASE2 Build 진입 조건이 충족되었다. M1 Foundation 마일스톤의 **태스크 분해 + Codex 태스크 프롬프트 생성**을 수행하여, 후속 코드 구현 세션을 위한 실행 계획을 문서화한다.

## 범위

- In Scope:
  - M1 Foundation 태스크 분해 (T1~T6, 6건)
  - M1 Codex 태스크 프롬프트 작성 (T3, T4, T5, T6 — 4건)
  - M1 Output Contract 정의 (M1-O1~O4)
  - 의존성 그래프 및 실행 순서 문서화
  - Plan README 인덱스 항목 추가
- Out of Scope:
  - 실제 코드 구현 (T1~T6 코드 작업은 별도 세션에서 수행)
  - PHASE1_design.md / PHASE0_ground.md SoT 수정
- 참조 SoT:
  - `docs/PHASE2_build.md` > Section 2 (M1 Foundation 체크리스트), Section 3 (SoT 준수 체크리스트), Section 4 (환경 변수)
  - `docs/PHASE1_design.md` > S1 (아키텍처), S2 (DB Schema), S7 (디자인 토큰)
  - `docs/design-system/design-tokens.css` (디자인 토큰 정본 CSS)
  - `docs/PHASE0_ground.md` (FR/NFR/KPI/법무)
  - `docs/plan/PLAN_OPERATION_GUIDE.md` (plan 운영 규칙)
- 선행 plan: `2026-02-14_claude-code_phase1-design-verification` (condition: verdict == go — Run 2에서 충족)

## 작업 단계

### Step 1: M1 Output Contract 정의

PHASE2_build.md Section 2 M1 체크리스트를 기반으로 검증 가능한 Output Contract 4건을 정의한다.

| ID | 항목 | 검증 방법 |
|----|------|----------|
| M1-O1 | Next.js + TypeScript strict + Tailwind + shadcn/ui | `pnpm build` pass |
| M1-O2 | `db/schema.sql`이 PHASE1 S2와 1:1 대응, PostGIS 활성화 | S2 테이블 6개 + 인덱스 6개 대조 |
| M1-O3 | PHASE1 S7 디자인 토큰이 Tailwind 설정에 반영 | Tailwind v3: `tailwind.config.ts` / v4: `globals.css @theme` 토큰 값 대조 |
| M1-O4 | `.env.example` + ESLint/Prettier + `pnpm lint` pass | `pnpm lint` 실행 |

**결과**: Output Contract 4건 정의 완료.

### Step 2: M1 태스크 분해

PHASE2_build.md M1 체크리스트 9개 항목을 6개 태스크로 그룹화하고, 에이전트 할당/의존성/산출물을 정의한다.

#### 태스크 분해 표

| # | 태스크명 | 에이전트 | 참조 SoT | 산출물 | 선행 |
|---|---------|---------|---------|--------|------|
| T1 | Next.js 프로젝트 초기화 + TypeScript strict | Claude Code | PHASE1 S1 | `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/` | - |
| T2 | Tailwind + shadcn/ui 설정 | Claude Code | PHASE1 S1, S7 | `tailwind.config.ts`, `components.json`, `src/lib/utils.ts` | T1 |
| T3 | 디자인 토큰 Tailwind 반영 | Codex | PHASE1 S7, `design-tokens.css` | `tailwind.config.ts` 확장, `src/styles/tokens.css` | T2 |
| T4 | DB 스키마 + PostGIS + 마이그레이션 | Codex | PHASE1 S2 | `db/schema.sql`, `db/migrate.sh` | - (독립) |
| T5 | ESLint + Prettier + .env.example | Codex | PHASE2 §4, NFR-6 | `.eslintrc.json`, `.prettierrc`, `.env.example` | T1 |
| T6 | Husky + pre-commit hook + check-sot.sh | Codex | PHASE2 §3 | `.husky/pre-commit`, `scripts/check-sot.sh` | T5 |

#### Output Contract 매핑

| OC | 관련 태스크 |
|----|-----------|
| M1-O1 | T1 + T2 + T3 |
| M1-O2 | T4 |
| M1-O3 | T3 |
| M1-O4 | T5 + T6 |

#### 의존성 그래프

```
T1 (Next.js init) ──┬── T2 (Tailwind+shadcn) ── T3 (디자인 토큰)
                    └── T5 (ESLint/Prettier/.env) ── T6 (Husky/hook)
T4 (DB 스키마) ──── (독립, 병렬 실행 가능)
```

**결과**: 6건 태스크 분해 완료. OC 매핑으로 M1-O1~O4 전체 커버 확인.

### Step 3: 향후 실행 순서 정의

코드 구현 세션에서의 실행 순서를 Phase A/B/C로 구분한다 (이 plan의 범위 밖).

**Phase A — Claude Code 직접 실행** (대화형 CLI, 별도 세션):
1. T1: Next.js 프로젝트 초기화
   - 기존 루트에 `docs/`, `.gitignore`, `CLAUDE.md`, `AGENTS.md`가 존재하므로 **임시 디렉토리에 scaffold 후 파일을 루트로 이동**하는 전략 사용 (직접 `.`에 create하면 충돌/중단 위험)
   - `tsconfig.json`에 `"strict": true` 확인
   - `pnpm build` 통과 확인
2. T2: Tailwind + shadcn/ui 설정
   - `pnpm dlx shadcn@latest init`
   - Tailwind 버전에 따라 분기:
     - **v3**: `tailwind.config.ts`의 `theme.extend`에 토큰 반영 (T3에서)
     - **v4**: `src/app/globals.css`의 `@theme` 블록에 토큰 반영 (T3에서)
   - `pnpm build` 통과 확인

**Phase B — Codex 태스크 전달** (Phase A 완료 후):
- T4는 독립적이므로 Phase A와 병렬 가능 (DB 스키마는 Next.js 의존 없음)
- T3: Phase A에서 확인된 Tailwind 버전에 맞춰 적용 방식 결정 후 전달
- T5: Phase A 완료 후 전달
- T6: T5 완료 후 전달

**Phase C — Code Review + Verification** (PHASE2 Prompt Pack 프롬프트 3, 4 사용):
- `pnpm build` + `pnpm lint` 실행
- Milestone Verification Prompt로 M1-O1~O4 판정

**결과**: 실행 순서 3단계 정의 완료.

### Step 4: M1 Codex 태스크 프롬프트 작성

Codex 위임 태스크 4건(T3, T4, T5, T6)의 상세 프롬프트를 작성한다. PHASE2_build.md의 Codex 태스크 프롬프트 템플릿(§1)을 준수하며, 각 태스크에 체크리스트 + 실행 명령을 포함한다.

**결과**: 4건 Codex 태스크 프롬프트 작성 완료 (아래 `### M1 Codex 태스크` 섹션 참조).

### Step 5: Plan README 갱신

`docs/plan/README.md`에 본 plan 항목을 #12로 추가한다.

**결과**: 갱신 완료.

### Step 6: 자체 검증

아래 검증 기준에 따라 검증 수행.

---

### M1 태스크 분해

(Step 2에서 정의한 태스크 분해 표, OC 매핑, 의존성 그래프 참조)

### M1 Codex 태스크

#### Codex Task 1: 디자인 토큰 Tailwind 반영 (T3)

```
## 작업: PHASE1 S7 디자인 토큰을 Tailwind 설정에 반영
## 참조 문서: docs/PHASE1_design.md > S7, docs/design-system/design-tokens.css

## 구현 범위
- 수정 파일: Tailwind v3 → tailwind.config.ts / v4 → src/app/globals.css (@theme 블록)
- 신규 파일: src/styles/tokens.css
- 비수정 파일: docs/PHASE1_design.md (SoT 읽기만), docs/design-system/design-tokens.css (읽기만)

## Tailwind 버전 분기
- **판정 기준**: package.json의 tailwindcss 버전 번호 우선 (3.x → v3, 4.x → v4)
- **v3** (tailwindcss ^3.x): tailwind.config.ts의 theme.extend에 아래 토큰 반영
- **v4** (tailwindcss ^4.x): design-tokens.css 섹션2 @theme 블록을 globals.css에 반영
- T2(Claude Code) 실행 시 확인된 버전에 따라 결정

## 상세 요구사항 (v3 기준 — v4는 design-tokens.css 섹션2 참조)

### tailwind.config.ts — theme.extend에 토큰 반영 (v3)

Colors:
  brand: { 50:#CFFAFE, 100:#A5F3FC, 200:#67E8F9, 300:#22D3EE, 400:#06B6D4,
           500:#0891B2, 600:#0E7490, 700:#155E75, 800:#164E63, 900:#0C4A6E }
  accent: { DEFAULT:#F97316, dark:#C2410C }
  neutral: { 50:#FAFAF9, 100:#F5F5F4, 200:#E7E5E4, 300:#D6D3D1, 400:#A8A29E,
             500:#78716C, 600:#57534E, 700:#44403C, 800:#292524, 900:#1C1917 }
  success:#059669, warning:#D97706, error:#DC2626
  score: { excellent:#1565C0, good:#42A5F5, average:#90A4AE, below:#FF8A65, poor:#D84315 }
  safety: { sufficient:#4CAF50, moderate:#FF9800, lacking:#9E9E9E }
  surface: { DEFAULT:#FFFFFF, elevated:#FAFAF9 }

Font Family:
  sans: ["Pretendard Variable", "Pretendard", "Noto Sans KR", system-ui, -apple-system, sans-serif]

Font Size (name: [size, { lineHeight, fontWeight, letterSpacing }]):
  caption: ['0.75rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '-0.02em' }]
  body-sm: ['0.875rem', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '-0.02em' }]
  body: ['1rem', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '-0.02em' }]
  subtitle: ['1.0625rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '-0.02em' }]
  title: ['1.25rem', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.03em' }]
  heading: ['1.5rem', { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.03em' }]

Border Radius:
  sm:6px, md:8px, lg:12px, xl:16px, full:9999px

Box Shadow:
  sm: 0 1px 2px rgba(0,0,0,0.05)
  base: 0 2px 8px rgba(0,0,0,0.08)
  md: 0 4px 12px rgba(0,0,0,0.10)
  lg: 0 8px 24px rgba(0,0,0,0.12)

Screens:
  xs:360px, sm:640px, md:768px, lg:1024px, xl:1280px

### src/styles/tokens.css — CSS 변수 정의
  design-tokens.css 섹션1(:root) + 섹션3(semantic light/dark) 복사.
  Pretendard Variable CDN @import 포함.

### src/app/globals.css — tokens.css import 추가
  @import '../styles/tokens.css'; 추가. shadcn CSS와 충돌 방지.

## 체크리스트
- [ ] 개인정보(연봉/주소)가 로그/DB에 저장되지 않는가
- [ ] 중개 오인 문구("추천" 대신 "분석 결과")를 사용하지 않는가
- [ ] 공공데이터 출처 표기가 포함되었는가
- [ ] TypeScript strict 모드 통과하는가
- [ ] primary #0891B2, accent #F97316, background #FAFAF9, text #1C1917 정확한 HEX인가
- [ ] font-family 순서: Pretendard Variable > Pretendard > Noto Sans KR > system-ui > -apple-system > sans-serif
      (design-tokens.css:31 정본과 동일)
- [ ] breakpoints: xs=360px / lg=1024px / xl=1280px 포함
- [ ] border-radius: card=16px(xl), button=12px(lg), bar=9999px(full)

## 실행 명령
pnpm build
pnpm lint
```

#### Codex Task 2: DB 스키마 + PostGIS + 마이그레이션 (T4)

```
## 작업: db/schema.sql + PostGIS 초기화 + 마이그레이션 스크립트
## 참조 문서: docs/PHASE1_design.md > S2 (DB Schema SoT)

## 구현 범위
- 신규 파일: db/schema.sql, db/migrate.sh
- 비수정 파일: docs/PHASE1_design.md (SoT 읽기만)

## 상세 요구사항

### db/schema.sql — PHASE1 S2를 1:1 SQL 파일화

상단: CREATE EXTENSION IF NOT EXISTS postgis;

6개 테이블 (S2 정의 그대로):
1. apartments (id SERIAL PK, apt_code VARCHAR(20) NOT NULL UNIQUE, apt_name TEXT NOT NULL,
   address TEXT NOT NULL, location GEOMETRY(Point,4326) NOT NULL, built_year INTEGER,
   household_count INTEGER, area_min FLOAT, area_max FLOAT,
   created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())
2. apartment_prices (id SERIAL PK, apt_id INTEGER REFERENCES apartments(id),
   trade_type VARCHAR(10) CHECK (trade_type IN ('sale','jeonse')), year INTEGER, month INTEGER,
   average_price NUMERIC, deal_count INTEGER, created_at TIMESTAMPTZ DEFAULT NOW())
3. childcare_centers (id SERIAL PK, name TEXT NOT NULL, address TEXT,
   location GEOMETRY(Point,4326) NOT NULL, capacity INTEGER,
   current_enrollment INTEGER, evaluation_grade VARCHAR(10),
   created_at TIMESTAMPTZ DEFAULT NOW())
4. schools (id SERIAL PK, name TEXT NOT NULL,
   school_level VARCHAR(10) CHECK (school_level IN ('elem','middle','high')),
   location GEOMETRY(Point,4326) NOT NULL, achievement_score NUMERIC,
   assignment_area GEOMETRY(Polygon,4326), created_at TIMESTAMPTZ DEFAULT NOW())
5. safety_stats (id SERIAL PK, region_code VARCHAR(10) NOT NULL, region_name TEXT,
   crime_rate NUMERIC, cctv_density NUMERIC, police_station_distance NUMERIC,
   streetlight_density NUMERIC, shelter_count INTEGER, calculated_score NUMERIC,
   data_date DATE, created_at TIMESTAMPTZ DEFAULT NOW())
6. commute_grid (id SERIAL PK, grid_id VARCHAR(20) NOT NULL,
   location GEOMETRY(Point,4326) NOT NULL, to_gbd_time INTEGER,
   to_ybd_time INTEGER, to_cbd_time INTEGER, to_pangyo_time INTEGER,
   calculated_at TIMESTAMPTZ DEFAULT NOW())

6개 인덱스:
1. idx_apartments_location ON apartments USING GIST(location)
2. idx_apartment_prices_apt_id ON apartment_prices(apt_id)
3. idx_childcare_location ON childcare_centers USING GIST(location)
4. idx_schools_location ON schools USING GIST(location)
5. idx_safety_stats_region ON safety_stats(region_code)
6. idx_commute_grid_location ON commute_grid USING GIST(location)

하단: SoT 출처 주석 (-- Source of Truth: docs/PHASE1_design.md > S2)

### db/migrate.sh — 마이그레이션 실행 스크립트
  DATABASE_URL 환경변수 로드 (.env fallback), psql로 schema.sql 실행.
  chmod +x 실행 권한 부여.

## 체크리스트
- [ ] 개인정보(연봉/주소)가 로그/DB에 저장되지 않는가 (스키마에 PII 컬럼 없음)
- [ ] 중개 오인 문구("추천" 대신 "분석 결과")를 사용하지 않는가
- [ ] 공공데이터 출처 표기가 포함되었는가
- [ ] TypeScript strict 모드 통과하는가 (해당 없음 — SQL/bash)
- [ ] schema.sql이 PHASE1 S2와 정확히 1:1인가 (테이블 6 + 인덱스 6)
- [ ] PostGIS 확장 CREATE EXTENSION IF NOT EXISTS postgis 포함
- [ ] apartments에 GEOMETRY(Point,4326) + GIST 인덱스
- [ ] apartment_prices에 FK(apt_id→apartments), CHECK(trade_type)
- [ ] schools에 CHECK(school_level IN('elem','middle','high'))

## 실행 명령
cat db/schema.sql | head -5
wc -l db/schema.sql
bash -n db/migrate.sh
```

#### Codex Task 3: ESLint + Prettier + .env.example (T5)

```
## 작업: ESLint + Prettier 설정 + .env.example 생성
## 참조 문서: docs/PHASE2_build.md > Section 4 (환경 변수), docs/PHASE1_design.md > S1 (아키텍처)

## 구현 범위
- 수정 파일: .eslintrc.json (또는 eslint.config.mjs), package.json (scripts)
- 신규 파일: .prettierrc, .prettierignore, .env.example
- 비수정 파일: docs/PHASE2_build.md (읽기만)

## 상세 요구사항

### ESLint — Next.js 기본 확장 + strict 강화
  next/core-web-vitals, next/typescript 확장.
  @typescript-eslint/no-explicit-any: "error" (any 사용 금지).
  @typescript-eslint/no-unused-vars: "error".
  필요 패키지: pnpm add -D.

### .prettierrc
  { "semi": true, "trailingComma": "all", "singleQuote": true,
    "printWidth": 100, "tabWidth": 2, "arrowParens": "always",
    "endOfLine": "lf", "plugins": ["prettier-plugin-tailwindcss"] }
  pnpm add -D prettier prettier-plugin-tailwindcss.

### .prettierignore
  node_modules, .next, out, build, dist, pnpm-lock.yaml, *.md

### .env.example (PHASE2 Section 4 그대로)
  DATABASE_URL=postgresql://user:pass@localhost:5432/housing
  REDIS_URL=redis://localhost:6379
  MOLIT_API_KEY=, MOHW_API_KEY=, MOE_API_KEY=, MOIS_API_KEY=
  KAKAO_REST_API_KEY=, KAKAO_JS_KEY=, ODSAY_API_KEY=
  NEXT_PUBLIC_GA_ID=

### package.json scripts 확인/추가
  "format": "prettier --write .", "format:check": "prettier --check ."

## 체크리스트
- [ ] 개인정보(연봉/주소)가 로그/DB에 저장되지 않는가
- [ ] 중개 오인 문구("추천" 대신 "분석 결과")를 사용하지 않는가
- [ ] 공공데이터 출처 표기가 포함되었는가
- [ ] TypeScript strict 모드 통과하는가
- [ ] .env.example이 PHASE2 Section 4와 1:1 대응 (10개 키)
- [ ] .env.example에 실제 시크릿 값 없음
- [ ] no-explicit-any: "error" 규칙 포함
- [ ] prettier-plugin-tailwindcss devDependencies 포함

## 실행 명령
pnpm build
pnpm lint
pnpm format:check
```

#### Codex Task 4: Husky + pre-commit hook + check-sot.sh (T6)

```
## 작업: Husky + pre-commit hook + SoT 검사 스크립트
## 참조 문서: docs/PHASE2_build.md > Section 3 (SoT 자동 검사)

## 구현 범위
- 신규 파일: .husky/pre-commit, scripts/check-sot.sh
- 수정 파일: package.json ("prepare": "husky")
- 비수정 파일: docs/PHASE2_build.md (읽기만)

## 상세 요구사항

### Husky 설치
  pnpm add -D husky
  package.json: "prepare": "husky"
  pnpm exec husky init

### .husky/pre-commit
  bash scripts/check-sot.sh
  pnpm lint

### scripts/check-sot.sh — SoT 위반 검사
  PHASE0 전용 키워드 (PHASE0 SoT에만 정의 허용):
    concierge_contact_click, concierge_unique_view, inquiry_click,
    min_input_complete, min_input_start, result_view,
    landing_unique_view, outlink_click, consent_shown, consent_accepted
    → 금지 대상 파일:
      docs/PHASE1_design.md, docs/PHASE2_build.md,
      docs/PHASE3_verify.md, docs/PHASE4_ship_learn.md

  PHASE1 전용 키워드 (PHASE1 SoT에만 정의 허용):
    CREATE TABLE, scoring_weight, normalize_score,
    commute_grid, safety_stats, childcare_centers
    → 금지 대상 파일:
      docs/PHASE0_ground.md, docs/PHASE2_build.md,
      docs/PHASE3_verify.md, docs/PHASE4_ship_learn.md

  **오탐 방지 — 2단계 필터링**:
  1단계 — awk 상태 기반 fenced code block 제외:
    ```로 시작하는 라인으로 in_fence 토글.
    in_fence==1인 라인은 검사하지 않음.
    → PHASE2_build.md:112~118 (규칙 설명 코드블록) 안전 제외.
  2단계 — 파일별 고정 예외 (화이트리스트):
    docs/PHASE4_ship_learn.md → `result_view` + 같은 라인에 `>= *[0-9]` 패턴이
      동반될 때만 예외 (KPI 판정 기준의 수치 임계값 참조).
      예: `result_view >= 100건` → 예외 허용.
      예: `result_view 이벤트를 정의한다` → 위반 검출.
      예: `result_view KPI 판정` → 위반 검출 (숫자 임계값 없음).
  참고: 넓은 텍스트 패턴(`참조` 단독 등)은 사용하지 않음 (실제 위반 은폐 방지).
  필터링 후 잔여 매치가 있으면 위반(exit 1), 없으면 통과(exit 0).
  존재하지 않는 파일은 skip (PHASE3/4 미생성 시).
  검사 제외: docs/plan/, docs/design-system/, docs/legacy_docs/, src/.
  chmod +x scripts/check-sot.sh.

## 체크리스트
- [ ] 개인정보(연봉/주소)가 로그/DB에 저장되지 않는가
- [ ] 중개 오인 문구("추천" 대신 "분석 결과")를 사용하지 않는가
- [ ] 공공데이터 출처 표기가 포함되었는가
- [ ] TypeScript strict 모드 통과하는가 (해당 없음 — bash)
- [ ] PHASE0 전용 키워드 10개 모두 포함
- [ ] PHASE1 전용 키워드 6개 모두 포함
- [ ] 위반 시 exit 1로 커밋 차단
- [ ] npm/npx 미사용 (pnpm exec husky 사용)

## 실행 명령
bash scripts/check-sot.sh
ls -la .husky/pre-commit
pnpm build
pnpm lint
```

---

## 주의사항

1. **기존 파일 보존 전략**: 프로젝트 루트에 `docs/`, `.gitignore`, `CLAUDE.md`, `AGENTS.md`가 이미 존재. `pnpm create next-app .`은 기존 파일과 충돌/중단 위험이 크므로, **임시 디렉토리에 scaffold → 필요 파일만 루트로 이동 → `.gitignore` 수동 병합** 전략을 사용한다.
2. **Tailwind 버전 분기**: `create-next-app@latest`의 Tailwind 버전(v3 vs v4)에 따라 토큰 적용 방식이 달라짐. `design-tokens.css`에 v3(`theme.extend`) + v4(`@theme`) 모두 준비됨. **판정 기준**: `package.json`의 `tailwindcss` 버전 번호 우선 (v3: `3.x`, v4: `4.x`). 보조 확인으로 `tailwind.config.ts` 존재 여부 + `@theme` 블록 사용 여부 대조. T2 실행 시 확인된 버전에 따라 T3 Codex 태스크의 적용 방식을 결정한다.
3. **check-sot.sh false positive 방지**: (1) 금지 대상 파일을 키워드 세트별 명시적 목록으로 고정, (2) awk 상태 기반으로 fenced code block 구간을 완전 제외 (PHASE2_build.md:112~118 처리), (3) 파일별 고정 예외 화이트리스트 (PHASE4_ship_learn.md: `result_view` + `>= *[0-9]` 동반 시만 예외). 넓은 텍스트 패턴 미사용으로 실제 위반 은폐 방지. 미생성 파일(PHASE3/4)은 skip.

## 검증 기준

### A. 세션 검증 (이번 세션 — 문서 산출 완료 판정)

| # | 기준 | 판정 |
|---|------|------|
| 1 | plan 문서에 태스크 분해 표가 존재하고 T1~T6 6건 기록 | pass |
| 2 | plan 문서에 Codex 태스크가 존재하고 4건(T3, T4, T5, T6) 기록 | pass |
| 3 | 태스크 분해 표의 OC 매핑이 M1-O1~O4를 빠짐없이 커버 | pass |
| 4 | Codex 태스크 각각에 체크리스트 + 실행 명령 포함 | pass |
| 5 | plan 문서 필수 섹션 5개 + YAML frontmatter 존재 | pass |
| 6 | README.md에 본 plan 항목 #12 추가 | pass |

### 검증 상세

**기준 1**: Step 2 태스크 분해 표에 T1~T6 6건 기록 완료. 태스크명/에이전트/참조 SoT/산출물/선행 모두 기재.

**기준 2**: M1 Codex 태스크 섹션에 Codex Task 1(T3 디자인 토큰), Codex Task 2(T4 DB 스키마), Codex Task 3(T5 ESLint/Prettier), Codex Task 4(T6 Husky/hook) — 4건 기록 완료.

**기준 3**: OC 매핑 테이블:
- M1-O1 → T1+T2+T3 (Next.js + Tailwind + 디자인 토큰)
- M1-O2 → T4 (DB 스키마)
- M1-O3 → T3 (디자인 토큰 Tailwind 반영)
- M1-O4 → T5+T6 (ESLint/Prettier + Husky)
전체 커버 확인.

**기준 4**: 4건 Codex 태스크 모두 `## 체크리스트` + `## 실행 명령` 포함 확인.

**기준 5**: 필수 섹션 — 목표, 범위, 작업 단계, 검증 기준, 결과/결정 모두 존재. YAML frontmatter에 plan-id, status, phase, template-version 포함.

**기준 6**: README.md에 #12 항목 추가 완료.

### B. 후속 구현 검증 (코드 구현 세션에서 수행 — 이번 세션 범위 밖)

| # | 기준 | 판정 방법 |
|---|------|----------|
| 1 | M1-O1: Next.js + TS strict + Tailwind + shadcn/ui | `pnpm build` pass |
| 2 | M1-O2: `db/schema.sql` ↔ PHASE1 S2 1:1 | 테이블 6 + 인덱스 6 대조 |
| 3 | M1-O3: S7 토큰 Tailwind 반영 | 토큰 값(#0891B2 등) 대조 |
| 4 | M1-O4: ESLint/Prettier/.env.example | `pnpm lint` pass + 10개 키 확인 |
| 5 | check-sot.sh 통과 | `bash scripts/check-sot.sh` exit 0 |
| 6 | npm/npx 미사용 | `rg -n '\b(npm\|npx)\b' src/ scripts/ .husky/ package.json --glob '*.config.*'` → 0건 (docs/ 제외) |

## 결과/결정

- **상태**: `done`
- **핵심 결과**:
  - M1 Foundation 태스크 분해 6건 (T1~T6) 완료
  - M1 Codex 태스크 프롬프트 4건 (T3, T4, T5, T6) 작성 완료
  - M1 Output Contract 4건 (M1-O1~O4) 정의, OC 매핑으로 전체 커버 확인
  - 의존성 그래프 + 3단계 실행 순서 (Phase A/B/C) 문서화 완료
- **미해결 이슈**: 없음
- **보정 사항**: frontmatter status를 본문/인덱스와 정합시킴 (상태 전이 누락 보정, 2026-02-14)
- **다음 액션**:
  1. Phase A: Claude Code 세션에서 T1(Next.js 초기화) + T2(Tailwind+shadcn) 실행
  2. Phase B: Codex에 T3~T6 태스크 전달 (T4는 Phase A와 병렬 가능)
  3. Phase C: Code Review + Milestone Verification 수행

## 체크리스트

- [x] 파일명 규칙 충족 (`2026-02-14_claude-code_phase2-m1-foundation.md`)
- [x] 필수 섹션 5개 존재 (목표, 범위, 작업 단계, 검증 기준, 결과/결정)
- [x] SoT 참조 경로 포함 (`docs/PHASE2_build.md`, `docs/PHASE1_design.md`, `docs/design-system/design-tokens.css`)
- [x] 결과/결정에 상태와 후속 액션 포함
- [x] YAML frontmatter 포함 (plan-id, status, phase, template-version)
- [x] depends-on 참조 plan의 condition 평가 충족 확인 (verdict == go — Run 2에서 충족)

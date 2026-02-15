# PHASE1 디자인 시스템 대안 리서치 Prompt Pack

이 문서는 디자인 시스템의 컬러/타이포/토큰/컴포넌트 4개 축 대안 리서치를 위한 표준 프롬프트 묶음입니다.

## 목적

- 현재 확정된 디자인 시스템의 **컬러/타이포/토큰 전략** 3개 축에 대해 체계적 대안을 리서치한다.
- 기존 25개 컴포넌트 외에 **구현에 필요한 신규 컴포넌트 갭**을 도출한다.
- 구현 착수 전 최종 의사결정의 정량적 근거를 확보한다.

## 정본 참조

- SoT: `docs/PHASE0_ground.md` (FR/NFR/법무), `docs/PHASE1_design.md` S2/S4/S7
- 참고 문서 (SoT 아님): `docs/design-system/DESIGN_SYSTEM.md`, `docs/design-system/design-tokens.css`

## 실행 전 제약 사항

- **SoT 보호**: 리서치 결과는 `docs/plan/` 하위에만 기록. SoT 문서 직접 수정 금지
- **Legacy 보호**: `docs/legacy_docs/` 읽기 전용 참조만
- **컴플라이언스**: Safety 색상 빨강 금지, 금지 용어, 면책 5접점 등 기존 가드레일 유지
- **기술 스택**: Tailwind v4 + Next.js App Router 기반 유지
- **지도 API**: Kakao Maps JS SDK 고정 (PHASE1 S1 SoT)

## 실행 순서

| 순서 | 프롬프트 | 병렬 가능 | 선행 조건 |
|------|---------|----------|----------|
| 1 | Prompt Pack 1: 컬러 팔레트 대안 리서치 | O | 없음 |
| 2 | Prompt Pack 2: 타이포그래피 대안 리서치 | O | 없음 |
| 3 | Prompt Pack 3: 디자인 토큰 및 다크모드 리서치 | O | 없음 |
| 4 | Prompt Pack 4: 컴포넌트 갭 및 라이브러리 리서치 | O | 없음 |
| 5 | Prompt Pack 5: 종합 스코어카드 산출 | X | 1-4 완료 필수 |

> 순서 1-4는 독립적이므로 **병렬 실행** 가능.
> 순서 5는 1-4 결과를 모두 입력해야 하므로 **마지막에 실행**.

## 의사결정 스코어카드 기준 (100점 만점)

| 기준 | 가중치 | 측정 방법 |
|------|--------|----------|
| **접근성 (Accessibility)** | 35점 | WCAG AA 대비율 충족률, 색맹 시뮬레이션 통과 여부 |
| **브랜드 적합도 (Brand Fit)** | 25점 | 감성 키워드 매칭도(신뢰/따뜻함), 경쟁사 차별화 거리 |
| **구현 비용 (Implementation Cost)** | 20점 | 변경 필요 파일 수, 컴포넌트 영향도, 러닝커브 |
| **다크모드 호환 (Dark Mode)** | 20점 | 다크 배경 대비율, 등급색 가시성, 지도 오버레이 호환 |

**의사결정 컷오프**:
- 현재안 >= 75점: **유지** (변경 불필요)
- 대안이 현재안보다 15점+ 상회: **변경 권장**
- 차이 < 15점: **부분 개선** 검토

## 출력 규칙

- 모든 수치에 **출처 링크 + 기준일** 100% 표기 (NFR-4 대응)
- 비교 테이블 형태로 정리
- 최종 의견 포함 (현재안 유지/변경 권장/부분 개선)

---

## Prompt Pack 1: 컬러 팔레트 대안 리서치

```markdown
## 리서치 요청: 프롭테크 서비스 컬러 팔레트 대안 분석

### 배경
신혼부부 대상 수도권 주거 분석 서비스(정보 분석 플랫폼)의 디자인 시스템 컬러 팔레트 대안을 리서치해주세요.

### 현재 컬러 시스템
- **Primary**: #0891B2 (Warm Teal Blue, Tailwind cyan-600 계열)
  - 9단계 스케일: 50(#CFFAFE) ~ 900(#0C4A6E)
  - 선정 근거: 블루 일변도 프롭테크(직방 #326CF9, 토스 #0064FF, Zillow #006AFF)와 차별화 + 신뢰+따뜻함 동시 전달
- **Accent**: #F97316 (Coral Orange) — CTA/하이라이트용
  - 텍스트용 어두운 변형: #C2410C (AA 준수)
- **Neutral**: Stone 계열 (웜 뉴트럴)
  - 배경: #FAFAF9 (순백 대체), 텍스트: #1C1917 (순흑 대체)
- **Score 5등급** (블루-오렌지 다이버징, 색맹 안전):
  - Excellent(80-100): #1565C0 | Good(60-79): #42A5F5 | Average(40-59): #90A4AE | Below(20-39): #FF8A65 | Poor(0-19): #D84315
- **Safety 전용**: 충분 #4CAF50(녹) / 보통 #FF9800(주황) / 부족 #9E9E9E(회색) — 빨강 사용 금지 (컴플라이언스)

### 리서치 항목 (정량 데이터 필수)

1. **Primary 컬러 대안 2종 비교**
   - 대안 A: Deep Teal/Emerald 계열 (예: #0D9488 Teal-600, #059669 Emerald-600)
   - 대안 B: Slate Blue 계열 (예: #3B82F6 Blue-500, #6366F1 Indigo-500)
   - 각 대안에 대해:
     - WCAG AA 대비율 (#FFFFFF, #FAFAF9, #1C1917 배경 대비)
     - 다크모드 배경(#0F172A) 위 대비율
     - 한국 프롭테크/핀테크 경쟁사와의 색상 거리 (유사 서비스 사용 여부)
     - 감성 키워드 매칭도 (신뢰, 따뜻함, 전문성)

2. **Accent 조합 적합성**
   - Teal + Coral(#F97316) vs Teal + Amber(#F59E0B) vs Teal + Rose(#F43F5E)
   - 보색/분할보색/유사색 이론 기반 조화도
   - CTA 버튼 색상이 전환율에 미치는 영향 관련 연구/사례

3. **Score 등급 컬러 스케일**
   - 현재 블루-오렌지 다이버징 vs 단일 색조 순차(Sequential) 스케일
   - Protanopia, Deuteranopia, Tritanopia 3종 색맹 시뮬레이션 시 5단계 구분 가능성
   - ColorBrewer, Carto 등 검증된 팔레트 라이브러리의 추천 조합

4. **2025-2026 프롭테크/핀테크 컬러 트렌드**
   - 한국: 토스, 카카오뱅크, 당근, 네이버 최신 디자인 시스템/리브랜딩
   - 글로벌: Zillow, Redfin, Trulia, Niche 최신 변경 사항
   - 디자인 시스템 컬러 트렌드 (Radix, shadcn/ui, MUI 등)

### 출력 형식
- 모든 수치에 출처 링크 + 기준일 표기
- 비교 테이블 형태로 정리
- 최종 의견 포함 (현재안 유지/변경 권장/부분 개선)
```

---

## Prompt Pack 2: 타이포그래피 대안 리서치

```markdown
## 리서치 요청: 한글 웹폰트 및 타이포그래피 시스템 대안 분석

### 배경
신혼부부 대상 주거 분석 서비스의 타이포그래피 시스템 대안을 리서치해주세요.
모바일 퍼스트(390px 기준), 가격 정보 표시가 핵심인 프롭테크 서비스입니다.

### 현재 타이포그래피 시스템
- **서체**: Pretendard Variable v1.3.9 (Dynamic Subset, CDN)
  - 선정 근거: 한국 정부 KRDS 기본 서체, 한글 11,172자 완성형, Inter 기반 숫자, SIL OFL
  - font-family: "Pretendard Variable", "Pretendard", "Noto Sans KR", system-ui, sans-serif
- **Type Scale** (6단계):
  - Caption(12px/500/1.4) | Body-sm(14px/400/1.5) | Body(16px/400/1.6) | Subtitle(17-18px/600/1.4) | Title(20px/600/1.3) | Heading(24px/700/1.25)
  - letter-spacing: -0.02em (Caption~Subtitle), -0.03em (Title~Heading)
- **가격 표시**: font-variant-numeric: tabular-nums, weight 본문+1단계

### 리서치 항목 (정량 데이터 필수)

1. **한글 웹폰트 3종 비교**
   - Pretendard Variable (현재) vs Wanted Sans vs Noto Sans KR Variable
   - 비교 기준:
     - CDN 파일 크기 (woff2 Variable, gzip 후)
     - 로딩 성능: 초기 로드 시간, Dynamic Subset 지원 여부
     - Weight 범위 및 단계 수
     - 한글 커버리지 (완성형 11,172자 vs KS X 1001 서브셋 2,350자)
     - 숫자/가격 렌더링 품질 (tabular figures 지원, 쉼표/원화 기호 처리)
     - Google Fonts CDN 지원 여부
     - 라이선스
   - 가능하면 실제 로딩 벤치마크 데이터나 비교 사례 포함

2. **타입 스케일 최적화**
   - 현재 6단계 vs 7-8단계 확장 (Display 32px, Hero 40px 추가)
   - Modular Scale 비율 기반 접근 (1.125 Major Second vs 1.2 Minor Third vs 1.25 Major Third)
   - 한글 KRDS 접근성 권고: 본문 최소 16px, 줄높이 150%+
   - 모바일 390px 화면에서의 실제 렌더링 여유 분석

3. **가격 표시 전용 폰트 전략**
   - 옵션 A: Pretendard 단독 (tabular-nums, weight+1)
   - 옵션 B: 숫자 전용 서브폰트 (Inter, JetBrains Mono 숫자만)
   - 옵션 C: 가변 폰트 축(wght+wdth) 활용 숫자 최적화
   - 토스 Product Sans의 금융 숫자 디자인 전략 분석
   - 한국 원화(₩) 표시, 쉼표 구분, "억/만원" 단위 혼합 시 가독성

4. **2025-2026 한글 타이포그래피 트렌드**
   - 정부 KRDS v2 업데이트 사항
   - 가변 폰트(Variable Font) 활용 트렌드
   - 한/영/숫자 다국어 혼합 환경 최적화 사례

### 출력 형식
- 모든 수치에 출처 링크 + 기준일 표기
- 비교 테이블 형태로 정리
- 최종 의견 포함 (현재안 유지/변경 권장/부분 개선)
```

---

## Prompt Pack 3: 디자인 토큰 및 다크모드 리서치

```markdown
## 리서치 요청: 디자인 토큰 관리 및 다크모드 구현 전략 비교

### 배경
Next.js App Router + Tailwind CSS v4 기반 프롭테크 서비스의 디자인 토큰 관리 및 다크모드 전략을 리서치해주세요.
소규모 팀(1-3명)이 유지보수 가능한 수준이어야 합니다.

### 현재 토큰 시스템
- **관리 방식**: 수동 CSS Custom Properties + Tailwind v4 `@theme` 지시어 (JS 설정 파일 없음)
- **파일 구조**:
  - `design-tokens.css`: 런타임 `:root` CSS 변수 (50+ 토큰)
  - `@theme {}` 블록: Tailwind 빌드 컨텍스트용 토큰 (주석 처리, 프로젝트 생성 시 활성화)
- **시맨틱 토큰** (현재 6개):
  - Light: --color-surface(#FFFFFF), --color-surface-elevated(#FAFAF9), --color-on-surface(#1C1917), --color-on-surface-muted(#78716C), --color-border(#E7E5E4), --color-primary(brand-500)
  - Dark: --color-surface(#0F172A), --color-on-surface(#F1F5F9) 등 `.dark` 클래스 토글
- **다크모드**: `.dark` CSS 클래스 + CSS 변수 오버라이드
- **도구**: 별도 토큰 관리 도구 없음, Figma 연동 없음

### 리서치 항목

1. **토큰 관리 도구/워크플로 비교** (소규모 팀 관점)
   - 현재: 수동 CSS 관리
   - 대안 A: Style Dictionary (Amazon, 멀티플랫폼 출력)
   - 대안 B: Tokens Studio (Figma Variables 연동)
   - 대안 C: Tailwind v4 @theme 네이티브만 고도화 (도구 추가 없이)
   - 비교 기준: 러닝커브(시간), Figma-코드 싱크, CI/CD 통합, 소규모 팀 적합성, 커뮤니티/문서 성숙도

2. **시맨틱 토큰 아키텍처 대안**
   - 현재: 2-tier (Global + Semantic)
   - 대안: 3-tier (Global - Alias - Component)
   - 참고 시스템: Shopify Polaris, GitHub Primer, Radix Themes, MUI, Chakra UI의 토큰 구조
   - Score 5등급/Safety 3단계 전용 시맨틱 토큰 필요성
   - 토큰 네이밍 컨벤션 비교

3. **다크모드 구현 전략 비교**
   - 현재: `.dark` 클래스 토글 + CSS 변수
   - 대안 A: `prefers-color-scheme` 미디어 쿼리 우선 + 수동 오버라이드
   - 대안 B: next-themes 라이브러리 + CSS 변수 (시스템 설정 자동 감지 + 수동 토글)
   - 대안 C: Tailwind v4 `@custom-variant dark` 활용
   - 점수 등급 컬러(블루-오렌지 다이버징)의 다크모드 가시성 문제
   - 지도(Kakao Maps) 위 마커의 다크모드 호환성 이슈

4. **2025-2026 디자인 토큰 업계 트렌드**
   - W3C Design Tokens Community Group (DTCG) 표준화 진행 상황
   - Figma Variables API 활용 패턴
   - 멀티브랜드/화이트라벨 토큰 아키텍처
   - CSS Custom Properties vs CSS @property 활용 트렌드

### 출력 형식
- 모든 도구/라이브러리에 GitHub 링크, Star 수, 최종 업데이트일 표기
- 비교 테이블 형태로 정리
- 최종 의견 포함 (현재안 유지/변경 권장/부분 개선)
```

---

## Prompt Pack 4: 컴포넌트 갭 및 라이브러리 리서치

```markdown
## 리서치 요청: React 컴포넌트 라이브러리 및 구현 전략 비교

### 배경
Next.js 16 + Tailwind v4 + shadcn/ui 기반 프롭테크 서비스에서 컴포넌트 구현 전략을 리서치해주세요.
현재 설치된 패키지: shadcn 3.8.4, @radix-ui 1.4.3, lucide-react, class-variance-authority, clsx, tailwind-merge, tw-animate-css

### 구현 필요 컴포넌트 (26개, 우선순위별)

**Must (17개)**: Button, ProgressIndicator, SelectionCard, FormField, FilterChipBar, MapViewToggle, EmptyState, SortChip, CommuteCard, PriceHistoryChart, ComparisonTable, Modal/Dialog, Footer, Icon시스템, FavoriteButton, LoginPrompt, MetaTagBar

**Should (8개)**: InfoBanner, LoadMoreButton, ScoreDetailPanel, StickyHeader, HighlightCell, Badge, ShareButton, Divider

**Could (1개)**: ImageCarousel

### 리서치 항목

1. **shadcn/ui 활용 전략**
   - 위 26개 컴포넌트 중 shadcn/ui에서 바로 사용 가능한 것
   - shadcn/ui 컴포넌트를 커스터마이징해서 사용할 수 있는 것
   - 완전히 자체 구현해야 하는 것 (도메인 특화)
   - shadcn/ui + Tailwind v4 호환성 현황 (2026년 기준)

2. **Recharts vs 대안 차트 라이브러리**
   - PriceHistoryChart, RadarChart 구현용
   - Recharts vs Nivo vs Victory vs Tremor vs Chart.js
   - 비교 기준: 번들 사이즈, React 18+ 호환, SSR 지원, 접근성, 커스터마이징 자유도

3. **바텀시트/드로어 라이브러리**
   - 3단 넌모달 바텀시트 구현용
   - Vaul (shadcn/ui Drawer) vs react-bottom-sheet vs 자체 CSS scroll-snap
   - 비교 기준: 넌모달 지원, 제스처 핸들링, 성능, 접근성

4. **지도 마커 오버레이 구현**
   - Kakao Maps JS SDK 위에 커스텀 React 마커 오버레이
   - react-kakao-maps-sdk vs 직접 SDK 래핑
   - 클러스터링: Supercluster vs 자체 구현
   - 100+ 마커 성능 최적화 전략

5. **프롭테크/핀테크 오픈소스 UI 킷 사례**
   - 참고할 만한 오픈소스 프로젝트 (부동산/금융 UI 킷)
   - 디자인 시스템 구축 참고: Radix Themes, Mantine, Ark UI 등

### 출력 형식
- 모든 라이브러리에 npm 패키지명, 번들 사이즈, GitHub Star 수, 최종 업데이트일 표기
- shadcn 활용 가능/커스터마이징/자체 구현 3분류 테이블
- 최종 의견 포함
```

---

## Prompt Pack 5: 종합 스코어카드 산출 (1-4 완료 후)

```markdown
## 리서치 종합: 디자인 시스템 대안 의사결정 스코어카드

### 배경
아래 4개 축의 리서치 결과를 종합하여 의사결정 스코어카드를 산출해주세요.

### 입력
- 축 1 결과: `docs/plan/2026-02-15_claude-code_phase1-color-palette-alternatives.md`
- 축 2 결과: `docs/plan/2026-02-15_claude-code_phase1-typography-research.md`
- 축 3 결과: `docs/plan/2026-02-15_claude-code_phase2-design-token-darkmode-research.md`
- 축 4 결과: `docs/plan/2026-02-15_claude-code_phase2-component-library-research.md`

### 스코어카드 기준 (100점 만점)

| 기준 | 가중치 | 측정 방법 |
|------|--------|----------|
| 접근성 (Accessibility) | 35점 | WCAG AA 대비율 충족률, 색맹 시뮬레이션 통과 여부 |
| 브랜드 적합도 (Brand Fit) | 25점 | 감성 키워드 매칭도(신뢰/따뜻함), 경쟁사 차별화 거리 |
| 구현 비용 (Implementation Cost) | 20점 | 변경 필요 파일 수, 컴포넌트 영향도, 러닝커브 |
| 다크모드 호환 (Dark Mode) | 20점 | 다크 배경 대비율, 등급색 가시성, 지도 오버레이 호환 |

### 의사결정 컷오프
- 현재안 >= 75점: 유지 (변경 불필요)
- 대안이 현재안보다 15점+ 상회: 변경 권장
- 차이 < 15점: 부분 개선 검토

### 요청 출력
1. 축별(컬러/타이포/토큰) 현재안 vs 대안 스코어카드 테이블
2. 컴포넌트 갭 우선순위 최종 확정 (Must 17개의 구현 순서)
3. 종합 의견: 유지/변경/부분 개선 판정 + 구체적 액션 아이템
4. 리스크 및 주의사항

### 제약 사항 (반드시 유지)
- Safety 색상에 빨강 사용 금지
- "추천" 단독 사용 금지 (-> "분석 결과 안내")
- 면책 5접점 유지
- Kakao Maps JS SDK 고정
- Tailwind v4 + Next.js App Router 기반 유지
```

---

## 실행 결과 참조

| Prompt Pack | 실행 결과 문서 | 상태 |
|-------------|---------------|------|
| Pack 1 (컬러) | `docs/plan/2026-02-15_claude-code_phase1-color-palette-alternatives.md` | done |
| Pack 2 (타이포) | `docs/plan/2026-02-15_claude-code_phase1-typography-research.md` | done |
| Pack 3 (토큰/다크) | `docs/plan/2026-02-15_claude-code_phase2-design-token-darkmode-research.md` | done |
| Pack 4 (컴포넌트) | `docs/plan/2026-02-15_claude-code_phase2-component-library-research.md` | done |
| Pack 5 (스코어카드) | `docs/plan/2026-02-15_claude-code_phase1-design-system-scorecard.md` | done |

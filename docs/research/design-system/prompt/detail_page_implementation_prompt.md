# /detail/[id] 페이지 구현 플랜 요청 프롬프트 (Claude Code용)

> **사용 방법**: 아래 프롬프트를 Claude Code에 전달할 때,
> 참조 파일들을 프로젝트 내에 배치한 후 사용하세요.

---

## 사전 준비: 파일 배치

```
docs/design-system/
├── DESIGN_SYSTEM.md              ← 디자인 시스템 전체 명세 (SoT)
├── design-tokens.css             ← CSS 토큰 정의
├── design_brief.md               ← 통합 디자인 브리프 (§5-3 상세 화면 설계)

docs/research/design-system/
├── ref_5-1_detail_page_analysis.md       ← 단지 상세 페이지 분석
├── ref_2-1_circular_gauge_analysis.md    ← 게이지/등급 분석 (Hero 게이지 재참조)
└── images/
    ├── niche_desktop_detail_overview.png
    ├── niche_desktop_detail_overview_2.png
    ├── niche_desktop_detail_category.png
    ├── niche_desktop_detail_category_2.png
    ├── toss_mobile_stock-detail.jpeg
    ├── toss_mobile_stock_detail_2.jpeg
    ├── zigbang_mobile_complex-detail.jpeg
    ├── zigbang_mobile_complex-detail_2.jpeg
    ├── zigbang_mobile_complext-detail_3.jpeg
    ├── hogangnono_desktop_price-chart.png
    ├── hogangnono_desktop_price-chart2.png
    └── apple_health_detail.jpeg
```

---

## 프롬프트

```
# /detail/[id] 페이지 구현 플랜 작성

## 컨텍스트

지금부터 집콕신혼 서비스의 `/detail/[id]` (단지 상세) 페이지 구현 플랜을 작성해줘.
이 페이지는 `/results` 리스트에서 단지를 선택했을 때 진입하는 상세 화면으로,
종합 점수 + 4개 카테고리별 점수 분해 + 실거래 데이터 + 통근 정보를 보여줘.

## 페이지 핵심 구조

- **Hero 영역**: 단지명 + Hero 게이지(80-96px) + 종합 등급 + 주소 + 핵심 스펙
- **탭 내비게이션**: 개요 / 예산 / 통근 / 보육 / 안전 (4-5개)
- **카테고리별 상세**: 각 탭에서 점수 분해 + 근거 데이터 + 인사이트
- **실거래 섹션**: 가격 추이 차트 + 실거래 테이블
- **CTA**: "비교에 추가" / "보드에 저장"

## 반드시 읽어야 할 파일 (순서대로)

1. `docs/design-system/DESIGN_SYSTEM.md` — 디자인 시스템 전체 명세 (SoT)
2. `docs/design-system/design-tokens.css` — CSS 토큰 정의
3. `docs/design-system/design_brief.md` — §5-3 상세 화면 설계
4. `docs/research/design-system/ref_5-1_detail_page_analysis.md` — 단지 상세 레퍼런스 분석
5. `docs/research/design-system/ref_2-1_circular_gauge_analysis.md` — 게이지 레퍼런스 (Hero 게이지 재참조)
6. `docs/research/design-system/images/` — 레퍼런스 스크린샷

## 플랜 작성 규칙

### 구조

플랜은 다음 구조로 작성해:

1. **컴포넌트 트리**: /detail/[id] 페이지를 구성하는 전체 컴포넌트 계층도
2. **구현 순서**: 의존성 기반으로 어떤 컴포넌트를 먼저 만들어야 하는지
3. **Hero 영역 상세**:
   - 단지명 + 주소 + 핵심 스펙(세대수·준공·면적) 배치
   - Hero 게이지(80-96px) 위치와 크기
   - 종합 등급 라벨 (A+/A/B/C/D)
   - CTA 버튼 ("비교에 추가" / "보드에 저장")
4. **탭 내비게이션 상세**:
   - 탭 목록과 URL 연동 (hash 또는 searchParams)
   - 선택/비선택 스타일 (brand-500 언더라인)
   - sticky 동작 (스크롤 시 고정)
5. **카테고리별 탭 콘텐츠**: 각 탭(예산/통근/보육/안전)의 구성 요소
   - 카테고리 점수 + 미니 게이지
   - "1줄 인사이트" 텍스트 (Apple Health 인사이트 카드 패턴)
   - 근거 데이터 시각화 (수평 바, Key-Value 테이블, 미니 차트)
   - ⓘ Progressive Disclosure (1줄 요약 → 상세 → 방법론)
6. **실거래 데이터 섹션**:
   - 가격 추이 꺾은선 차트 (Recharts)
   - 기간 탭 (1년/3년/5년/전체 — 토스 기간 탭 패턴)
   - 실거래 테이블 (날짜 + 가격 + 면적 + 층수)
   - 출처 표기 "[국토부 실거래 2026.01]"
7. **통근 정보 섹션**:
   - 직장1/직장2까지 통근 시간 표시
   - 대중교통 노선 정보 (호갱노노 패턴)
8. **면책 문구 배치**: 컴플라이언스 5접점 중 해당 접점
9. **반응형**: 모바일(단일 컬럼 스크롤) / 데스크톱(넓은 여백, 최대 너비 제한)
10. **데이터 흐름**: API → 컴포넌트 간 데이터 전달 구조
11. **검증 체크리스트**

### 디자인 원칙 (위반 금지)

- **색상/간격/타이포**: 반드시 `design-tokens.css`의 CSS Custom Property 사용
- **Tailwind 클래스**: `DESIGN_SYSTEM.md` §6.3의 패턴 준수
- **컴플라이언스**: `DESIGN_SYSTEM.md` §5의 금지 용어/표현 절대 사용 금지
  - "추천" → "분석 결과 안내"
  - 안전 섹션에서 빨강 사용 금지
  - 실거래 데이터 출처 반드시 표기
- **접근성**: 점수 시각화에 색상만 사용 금지 → 텍스트 라벨(A+/A/B/C/D) 병행 필수
- **점수 색상**: 5등급 블루→오렌지 다이버징 (#1565C0 → #D84315), 적녹색 사용 금지

### 레퍼런스 적용 규칙

`ref_5-1_detail_page_analysis.md`의 "Agent 전달용 요약" 섹션을 확인하고:
- **"가져올 것"** 항목 → 구현에 반영
  - 특히: Niche 등급 그리드, 토스 레인지 바+기간 탭, Apple Health 인사이트 카드 패턴
- **"무시할 것"** 항목 → 절대 따라가지 않기
  - 특히: Niche 그린 등급색, 직방 전화 CTA, 호갱노노 2컬럼 사이드패널
- **"신규 인사이트"** 항목 → 플랜에 포함 여부 판단하여 근거와 함께 명시
  - 특히: Apple Health식 인사이트 카드, 실거래 신고가 배지, 탭 vs 스크롤 결정

### 기술 제약

- Next.js 16.x App Router (RSC + Client Component 구분 명시)
  - 정적 데이터(단지 기본 정보) → RSC
  - 인터랙티브(탭 전환, 차트, 게이지 애니메이션) → Client Component
- React 19 + TypeScript strict
- Tailwind CSS v4 (`@theme` 토큰 사용)
- shadcn/ui 컴포넌트 활용 가능 (Tabs, Tooltip 등)
- 차트: Recharts (꺾은선 차트, 레인지 바)
- 점수 게이지: 순수 SVG (라이브러리 미사용) — /results의 CircularGauge 재사용
- 지도: Kakao Maps JS SDK (통근 경로 표시 시)

## 기대 산출물

1. `/detail/[id]` 페이지의 **컴포넌트 트리 + 파일 구조**
2. **Hero 영역** 구현 상세 (게이지 배치, 등급, 스펙 레이아웃)
3. **탭 내비게이션** 구현 상세 (sticky, URL 연동, 스타일)
4. **카테고리별 탭 콘텐츠** 각각의 구현 상세 (시각화, 인사이트, 데이터)
5. **실거래 차트 + 테이블** 구현 상세 (Recharts 설정, 기간 탭)
6. **구현 순서** (단계별, 의존성 표시)
7. **검증 체크리스트** (디자인 토큰, 컴플라이언스, 접근성, 면책 문구)

플랜만 작성하고, 코드 구현은 하지 마. 플랜 승인 후 단계별로 구현할 거야.
```
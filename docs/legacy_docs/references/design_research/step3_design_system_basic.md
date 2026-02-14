# 신혼부부 주거 추천 앱 디자인 시스템 파운데이션 리서치

**신뢰감·따뜻함·명쾌함을 동시에 전달하는 모바일 퍼스트 프롭테크 디자인 시스템의 핵심 의사결정을 위한 기술 리서치 보고서입니다.** 한글 웹폰트로는 Pretendard(9 weight, 정부 KRDS 채택)를, 컬러는 **웜 틸 블루(#0891B2) + 코랄 악센트(#F97316)** 조합을 권장하며, 점수 시각화에는 수평 바 스코어 + 블루-오렌지 다이버징 5단계 스케일이 375px 모바일 화면에 최적입니다. Tailwind CSS v4의 `@theme` 지시어와 시멘틱 토큰 기반 다크모드 설정을 포함한 전체 구현 가이드를 아래에 정리했습니다.

---

## 1. 한글 웹폰트: Pretendard가 최적의 선택인 이유

### 5개 후보 폰트 종합 비교

| 기준 | Pretendard | Noto Sans KR | SUIT | Wanted Sans | Spoqa Han Sans Neo |
|---|---|---|---|---|---|
| **Weight 수** | **9단계** + Variable(45–920) | 9단계 + Variable | 9단계 + Variable | 7단계(400–950) | **5단계**(100–700) |
| **한글 글자 수** | **11,172자** (완성형 전체) | **11,172자+** | 2,625자 ⚠️ | 11,172자 | 2,574자 ⚠️ |
| **Google Fonts** | ✗ | ✅ | ✗ | ✗ | ✗ |
| **숫자 렌더링** | ★★★★ (Inter 기반) | ★★★ | ★★★ | ★★★★ | **★★★★★** (금융 특화) |
| **소형 가독성(12–14px)** | **★★★★★** | ★★★★ | ★★★★ | ★★★★ | ★★★★ |
| **라이선스** | SIL OFL (무료) | SIL OFL (무료) | SIL OFL (무료) | SIL OFL (무료) | SIL OFL (무료) |

**Pretendard**는 Inter(영문) + Noto Sans CJK(한글) 기반으로 제작자 길형진이 개발했으며, **2024년 4월 한국 정부 UI/UX 디자인 시스템(KRDS)의 기본 서체로 채택**되었습니다. 다이나믹 서브셋 방식으로 로딩 성능이 우수하고, Apple SD Gothic Neo와 유사한 전각폭(emSize=2048 기준 1770)으로 사용자 친숙도가 높습니다.

**SUIT와 Spoqa Han Sans Neo는 한글 글자 수가 2,500~2,600자 수준**으로 KS X 1001 서브셋 기반입니다. 사용자 입력(주소, 채팅)이 있는 앱에서는 미지원 글자가 발생할 수 있어 주의가 필요합니다. Spoqa Han Sans Neo는 **숫자 렌더링 품질이 5개 중 가장 우수**하여 가격 표시에는 최적이지만, weight가 5단계(Thin/Light/Regular/Medium/Bold)로 제한되어 타이포그래피 계층 표현에 한계가 있습니다.

**CDN 설정 코드:**
```html
<!-- Pretendard 가변 다이나믹 서브셋 (권장) -->
<link rel="stylesheet" as="style" crossorigin
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
```

### 한국 프롭테크/핀테크 앱 폰트 사용 현황

업계의 폰트 전략은 크게 세 갈래로 나뉩니다.

| 유형 | 대표 앱 | 사용 폰트 |
|---|---|---|
| **전용 커스텀 서체** | 토스(Toss Product Sans), 당근(Karrot Sans), 카카오뱅크 | 브랜드 차별화, 비공개 라이선스 |
| **시스템 폰트** | 직방, 호갱노노, 뱅크샐러드 | Apple SD Gothic Neo / Noto Sans CJK KR |
| **웹폰트(Noto Sans KR)** | 네이버 부동산 | 크로스 플랫폼 일관성 |

**토스**는 산돌/이도타입과 협업하여 금융 맥락에 특화된 Toss Product Sans를 개발했습니다. 숫자·영문을 한글보다 약간 크고 두껍게 디자인하여 ₩ 기호, 쉼표, 퍼센트 등 금융 기호의 가독성을 높였습니다. 커스텀 서체 개발 예산이 없는 프로젝트에는 **Pretendard가 업계 표준 대안**입니다.

### 모바일 한글 타이포그래피 핵심 수치

한글은 자음+모음 조합으로 한 글자 내 획수가 영문보다 많아 **동일 px에서 가독성이 더 낮습니다**. 영문 최소 12px 기준이라면 한글은 **13–14px 이상**을 권장합니다.

| 용도 | 크기 | Weight | line-height | letter-spacing |
|---|---|---|---|---|
| Caption/Label | 11–12px | Medium(500) | 1.4 | -0.02em |
| Body Small | 13–14px | Regular(400) | 1.5 | -0.02em |
| **Body** | **15–16px** | **Regular(400)** | **1.6** | **-0.02em** |
| Subtitle | 17–18px | SemiBold(600) | 1.4 | -0.02em |
| Title | 20–22px | SemiBold(600) | 1.3 | -0.03em |
| Heading | 24–28px | Bold(700) | 1.25 | -0.03em |

KRDS 정부 디자인 시스템은 **최소 본문 16px, 줄높이 150% 이상**을 접근성 권고사항으로 명시합니다. 가격 표시(₩3억 2,000만)에는 **tabular figures(고정폭 숫자)** 사용, 숫자 weight를 본문보다 **1단계 두껍게** 처리하는 것을 권장합니다.

---

## 2. 신뢰와 따뜻함을 동시에 전달하는 컬러 시스템

### 주요 프롭테크/핀테크 앱 브랜드 컬러

| 서비스 | 주 색상 | HEX 코드 | 출처 신뢰도 |
|---|---|---|---|
| **토스 (Toss)** | 블루 | **#0064FF** | ✅ 공식(brand.toss.im, PANTONE 2175 C) |
| **Zillow** | 블루 | **#006AFF** | ✅ 공식 디자인 시스템 |
| **Redfin** | 레드(오번) | **#A02021** | ✅ 공식(press.redfin.com) |
| **직방** | 블루 | #326CF9 | 앱 아이콘 추정 |
| **호갱노노** | 퍼플 | #7B61FF | 앱 아이콘 추정 |
| **뱅크샐러드** | 틸 그린 | #00C4B4 | 앱 UI 추정 |
| **카카오뱅크** | 옐로 | #FFCD00 | 브랜드 가이드라인 |
| **당근** | 오렌지 | **#FF6F0F** | ✅ 공식(2023 리브랜딩) |
| **네이버** | 그린 | **#03C75A** | ✅ 공식 브랜드 컬러 |

프롭테크 시장에서 **블루는 이미 직방·토스·Zillow가 점령**한 색상입니다. 신혼부부 주거추천 앱의 감성 키워드인 신뢰(블루 계열) + 따뜻함(웜 톤)을 동시에 전달하려면, **웜 틸 블루(Teal Blue)** 또는 **블루 Primary + 코랄 Accent** 조합으로 차별화하는 것이 효과적입니다.

### 추천 컬러 팔레트: 웜 틸 블루 + 코랄

**Primary 팔레트 (틸 블루 계열):**

| 단계 | HEX | 용도 |
|---|---|---|
| 50 | #CFFAFE | 밝은 배경, 태그 |
| 100 | #A5F3FC | 서브 배경 |
| 200 | #67E8F9 | 호버 상태 |
| 300 | #22D3EE | 비활성 요소 |
| 400 | #06B6D4 | 보조 버튼 |
| **500** | **#0891B2** | **주 브랜드 색상** |
| 600 | #0E7490 | 호버/액티브 |
| **700** | **#155E75** | **텍스트 사용 가능 (흰 배경 대비 ~5.5:1 AA✅)** |
| 800 | #164E63 | 강조 텍스트 |
| 900 | #0C4A6E | 최 어두운 텍스트 |

**Accent/Secondary (코랄 계열):** CTA 버튼과 하이라이트에 #F97316(오렌지), 텍스트용 어두운 변형 #C2410C(AA 준수). **배경은 순백(#FFFFFF) 대신 웜 화이트(#FAFAF9, Tailwind Stone-50)** 를 사용하여 따뜻한 톤을 유지합니다. 주요 텍스트에도 순수 블랙 대신 **웜 다크(#1C1917)** 를 적용합니다.

### WCAG AA 대비 요구사항과 따뜻한 팔레트 적용

WCAG AA 기준은 **일반 텍스트 4.5:1, 큰 텍스트(18pt+) 3:1, UI 컴포넌트 3:1** 입니다. 따뜻한 색상(오렌지, 옐로, 코랄)은 흰 배경에서 대비가 낮으므로 주의가 필요합니다.

- 순수 오렌지 #FF6B00 → 흰 배경 대비 약 **3.5:1 (AA 실패)**
- 어두운 오렌지 #C85400 → 흰 배경 대비 **4.5:1 (AA 통과)**

핵심 원칙: **따뜻한 색상은 배경·장식·CTA 배경에만 사용**하고, 텍스트에는 반드시 어두운 변형을 사용합니다. 밝은 베이지(#FFF8F0) 배경 위에는 #1A1A1A(대비 ~18:1)가 안전합니다.

### 5단계 점수 시각화 컬러 스케일

**블루-오렌지 다이버징 (색맹 안전, 추천):**

| 등급 | 한국어 | HEX | 비고 |
|---|---|---|---|
| Excellent | 매우 좋음 | **#1565C0** (딥 블루) | 적녹색맹 안전 |
| Good | 좋음 | **#42A5F5** (라이트 블루) | |
| Average | 보통 | **#90A4AE** (뉴트럴 그레이블루) | |
| Below Avg | 미흡 | **#FF8A65** (소프트 오렌지) | |
| Poor | 부족 | **#D84315** (딥 오렌지/레드) | |

전통적 적-녹 스케일은 **남성의 약 8%가 적녹색맹**이므로 사용을 금지합니다. ColorBrewer의 RdBu(Red-Blue) 또는 PuOr(Purple-Orange) 다이버징 팔레트가 색맹 안전 대안입니다. **반드시 색상 외에 텍스트 레이블(A+, B, C, D, F)이나 아이콘을 병행**하여 색상만으로 정보를 전달하지 않아야 합니다(WCAG 1.4.1).

---

## 3. Tailwind CSS v4 디자인 시스템 구현 가이드

### v3 → v4 핵심 변경점

Tailwind v4는 **JavaScript 설정 파일 대신 CSS 내 `@theme` 지시어**로 디자인 토큰을 정의합니다. Lightning CSS(Rust) 기반 엔진으로 **풀 빌드 5배, 증분 빌드 100배+ 빠릅니다.**

```css
/* app.css — Tailwind v4 엔트리 */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css');
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  /* 한국어 폰트 */
  --font-sans: "Pretendard Variable", "Noto Sans KR", system-ui, sans-serif;

  /* 브랜드 컬러 스케일 */
  --color-brand-50:  #CFFAFE;
  --color-brand-500: #0891B2;
  --color-brand-700: #155E75;
  --color-brand-900: #0C4A6E;

  /* 한글 최적화 타이포 스케일 */
  --text-caption: 0.75rem;              /* 12px */
  --text-caption--line-height: 1.125rem;
  --text-body-sm: 0.875rem;             /* 14px */
  --text-body-sm--line-height: 1.375rem;
  --text-body: 1rem;                    /* 16px */
  --text-body--line-height: 1.625rem;   /* 한글은 1.6배 이상 */
  --text-title: 1.25rem;               /* 20px */
  --text-title--line-height: 1.875rem;
  --text-heading: 1.5rem;              /* 24px */
  --text-heading--line-height: 2.125rem;
}
```

### 시멘틱 토큰 기반 다크모드 (권장 패턴)

컴포넌트마다 `dark:` prefix를 일일이 붙이는 대신, **CSS 변수로 시멘틱 토큰을 정의하면 자동 전환**됩니다.

```css
:root {
  --color-surface: #ffffff;
  --color-surface-elevated: #f8fafc;
  --color-on-surface: #0f172a;
  --color-on-surface-muted: #64748b;
  --color-border: #e2e8f0;
  --color-primary: var(--color-brand-500);
}
.dark {
  --color-surface: #0f172a;
  --color-surface-elevated: #1e293b;
  --color-on-surface: #f1f5f9;
  --color-on-surface-muted: #94a3b8;
  --color-border: #334155;
  --color-primary: var(--color-brand-400);
}

/* v4 다크모드 variant 선언 */
@custom-variant dark (&:where(.dark, .dark *));
```

이렇게 하면 컴포넌트에서 `bg-surface text-on-surface border-border`만 사용하면 라이트/다크가 자동 전환됩니다.

### 핵심 컴포넌트 Tailwind 클래스 패턴

**스코어 카드:**
```jsx
<div className="rounded-2xl bg-surface-elevated p-4 shadow-sm border border-border">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-title-sm font-semibold text-on-surface">주거 안전 점수</h3>
    <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-caption font-medium text-success">
      상위 12%
    </span>
  </div>
  <div className="flex items-baseline gap-1 mb-3">
    <span className="text-display font-bold text-brand-500">87</span>
    <span className="text-body-sm text-on-surface-muted">/100점</span>
  </div>
  <div className="w-full h-2 rounded-full bg-brand-100 overflow-hidden">
    <div className="h-full rounded-full bg-brand-500 transition-all duration-500"
         style={{ width: '87%' }} />
  </div>
</div>
```

**비교 카드 (모바일 가로스크롤 → 데스크톱 그리드):**
```jsx
<div className="@container">
  <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory
                  @md:grid @md:grid-cols-3 @md:overflow-visible
                  pb-4 -mx-4 px-4 @md:mx-0 @md:px-0">
    {properties.map(p => (
      <div className="flex-none w-[280px] snap-start @md:w-auto @md:flex-1
                      rounded-xl border border-border bg-surface p-4">
        {/* 매물 정보 */}
      </div>
    ))}
  </div>
</div>
```

### 스페이싱과 터치 타겟

Tailwind의 기본 **4px 베이스**(1단위 = 0.25rem)가 모바일 UI에 최적입니다. 카드 패딩에는 `p-4`(16px), 리스트 아이템 간격에는 `gap-2`(8px) 또는 `gap-3`(12px)를 사용합니다. **터치 타겟은 WCAG 2.5.5 기준 최소 44×44px**, Google Material은 48×48dp를 권장합니다.

```jsx
{/* 아이콘 버튼: 시각적으로 20px이어도 터치 영역은 44px */}
<button className="min-h-11 min-w-11 flex items-center justify-center">
  <HeartIcon className="w-5 h-5" />
</button>

{/* 하단 고정 CTA: safe-area-inset 대응 */}
<div className="fixed bottom-0 inset-x-0 bg-surface/80 backdrop-blur-lg
                px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
  <button className="w-full min-h-12 rounded-xl bg-primary text-on-primary font-semibold">
    매물 상담 신청
  </button>
</div>
```

---

## 4. 점수 시각화: 수평 바가 모바일에서 가장 효과적

### 시각화 유형별 375px 화면 적합도

| 시각화 | 모바일 적합도 | 최적 용도 | 최소 크기 |
|---|---|---|---|
| **수평 바 스코어** | **★★★★★** | 카테고리별 비교(5–6개) | 343px 사용 가능(양쪽 16px 패딩 제외) |
| 레터 그레이드 배지 | ★★★★☆ | 빠른 스캔, 카테고리 옆 배치 | 24–48px |
| 원형 게이지 | ★★★☆☆ | **종합 점수 1개** 강조 | 최소 80px (60px 이하 숫자 읽기 어려움) |
| 레이더 차트 | ★★★☆☆ | 다차원 패턴 비교(5–7축) | 최소 200×200px |
| 도넛 차트 | ★★★☆☆ | 카테고리 비중 표현 | 5개 이하 카테고리 |

**375px 모바일 최적 조합은**: 상단에 **원형 게이지(80–100px) + 큰 숫자(32px Bold)**로 종합 점수를 강조하고, 하단에 **수평 바 스코어 리스트**로 카테고리별(교통·환경·교육·편의·안전·가격) 점수를 나열하는 구조입니다. 수평 바는 높이 **8–12px, 라운드 코너 4px, 바 간격 12–16px**을 권장합니다.

### 레퍼런스 앱 점수 UI 분석

**Niche.com**은 종합 등급(A+~D-)을 상단에 크게 표시하고 아래에 12개 카테고리를 리스트로 나열합니다. A+ 그린(~#1A9641)부터 D 레드(~#D7191C)까지 의미적 색상을 사용합니다.

**Walk Score**는 0–100 숫자를 크게 중앙 배치하고 "Walker's Paradise", "Very Walkable" 등 설명 라벨을 조합합니다. Walk Score, Transit Score, Bike Score 3종을 나란히 표시하는 구조입니다.

**토스 신용점수**는 **반원형 게이지 + 큰 숫자** 조합으로, 다크 배경 위에 밝은 숫자와 게이지를 배치합니다. 점수 상승 시 **축하 애니메이션**을 적용하여 CVR 21.9% 상승 효과를 기록했습니다. 자체 인터랙션 라이브러리 **'Rally'**로 iOS/Android/Web 공통 스펙을 구현합니다.

---

## 5. 지도 마커: 가격 라벨 핀 + 점수 색상 코딩

### 주요 부동산 앱 마커 디자인 비교

**Zillow**은 가격 기반 핀(price-based pins)으로 마커 위에 매물 가격을 직접 표시합니다. 블루/화이트/그레이 기반의 차분한 색상이 특징입니다. **Redfin**은 브랜드 레드를 활용하며 "new"(그린), "open"(핑크), "favorite"(레드) 태그로 상태를 구분합니다. **네이버 부동산**은 줌 레벨에 따라 시/구/동 → 단지명 → 개별 매물로 하이어라키가 전환되며, "매 9.5억", "전 5억"처럼 매매가/전세가를 직접 표시합니다. **호갱노노**는 아파트 단지별 실거래가와 가격 변동률을 색상으로 차별화합니다.

### 가격 라벨 핀 구현 사양

```css
.price-marker {
  background: #ffffff;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 12–14px;
  font-weight: 600;
  color: #263238;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  min-height: 28px;
  white-space: nowrap;
}
.price-marker::after {  /* 하단 삼각형 포인터 */
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #ffffff;
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
}
```

**마커 크기**: 시각적 아이콘은 **30–34px**이되, 터치 영역(padding 포함)은 **44–48px** 확보. 마커 상태는 Default(흰 배경) → Selected(브랜드 블루 배경 + 흰 텍스트, 1.2배 scale) → Visited(투명도 70%) 3단계로 구분합니다.

주거 추천 앱에서는 **점수별 색상 코딩**(고점수=진한 브랜드 블루, 저점수=연한 블루/그레이)이 가격별 코딩보다 서비스 목적에 부합합니다.

### 클러스터링 전략

**100개 이상 마커** 시 DOM 기반 렌더링에서 성능 저하가 시작됩니다. **Supercluster**(mapbox, 클라이언트 GeoJSON 기반)가 가장 빠르며, **네이버 지도 JS API v3의 MarkerClustering 유틸리티**와 조합할 수 있습니다.

| 줌 레벨 | 표시 단위 | 클러스터링 |
|---|---|---|
| 7–10 (도/시) | 지역별 대형 클러스터 | 원형 카운터(40–60px) |
| 11–13 (구/동) | 중간 클러스터 | 매물 수 표시 |
| 14+ (단지/거리) | **개별 마커** | 가격 라벨 핀 |

최적화 핵심: 뷰포트 내 마커만 렌더링, 줌 변경 시 **debounce 200–300ms**, Web Worker에서 클러스터링 계산 분리.

---

## 6. 모바일 레이아웃: 바텀 시트 + 390px 기준 설계

### 바텀 시트 3단 스냅 시스템

Google Maps 스타일 바텀 시트는 **COLLAPSED → ANCHOR → EXPANDED** 3단계를 사용합니다.

| 상태 | 화면 비율 | 높이 | 표시 콘텐츠 |
|---|---|---|---|
| **Peek** | ~25% | 100–160px | 드래그 핸들(40×4px), 검색바, 매물 수("32건") |
| **Half** | ~50% | 350–400px | 리스트 카드 2–3개(썸네일+가격+주소+점수) |
| **Expanded** | ~90% | 상단 safe area 제외 | 전체 리스트 스크롤, 정렬/필터 |

직방과 호갱노노는 **지도 중심 UI**에 바텀 시트 또는 별도 탭으로 리스트를 제공합니다. 웹 구현에는 **Vaul(shadcn/ui Drawer, Radix 기반)** 또는 **pure-web-bottom-sheet(CSS scroll snap 기반, zero-JS 드래그)**를 권장합니다.

### 반응형 브레이크포인트

한국 2030세대에서 iPhone 점유율이 높으므로 **390px 기준 디자인** 후 360~430px까지 가변 대응합니다.

```css
/* 모바일 퍼스트 브레이크포인트 */
xs: 360px   /* 소형 모바일, Tailwind 커스텀 추가 */
sm: 640px   /* Tailwind 기본 (600px으로 변경 가능) */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 — 스플릿 뷰 시작 */
xl: 1280px  /* 대형 데스크톱 */
```

### 데스크톱 스플릿 레이아웃

| 비율 | 사용 예시 | 특징 |
|---|---|---|
| **60% 지도 / 40% 리스트** | Zillow, Redfin | 가장 일반적, 지도 중심 |
| 50% / 50% | Trulia, Realtor.com | 균등 분할 |
| 40% 리스트 / 60% 지도 | 직방 웹 | 리스트 정보 비중 높음 |

**최소 리스트 패널 너비**는 카드 1열 기준 320–400px, 정보 충분 표시를 위해 **480px+** 를 권장합니다. 모바일→데스크톱 전환은 1024px에서 바텀 시트가 좌측 사이드 패널로 재배치되는 구조입니다.

---

## 7. 마이크로 인터랙션: 핵심 타이밍과 이징 값

### 점수 로딩 시퀀스 (Progressive Reveal)

| 단계 | 시간 | 내용 | 이징 |
|---|---|---|---|
| 1 | 0–300ms | 스켈레톤 shimmer | linear, 1500ms 반복 |
| 2 | 300–500ms | 종합 점수 카운트업(0→85) | `cubicBezier(0.16, 1, 0.3, 1)` (easeOutExpo) |
| 3 | 500–800ms | 카테고리 점수 순차 fade-in | staggerChildren: 100ms |
| 4 | 800ms+ | 프로그레스 바 확장 | ease-out |

**카운트업 구현 (Framer Motion):**
```jsx
animate(count, target, {
  duration: 1.2,
  ease: [0.16, 1, 0.3, 1]  // easeOutExpo
});
```

### 전체 인터랙션 타이밍 레퍼런스

| 인터랙션 | 지속시간 | 이징 |
|---|---|---|
| 바텀 시트 스냅 | 300–400ms | `spring(stiffness: 400, damping: 30)` |
| 마커 탭 프리뷰 카드 | 200–300ms | `cubicBezier(0.33, 1, 0.68, 1)` |
| 스켈레톤 shimmer | 1500ms 반복 | linear |
| 카운트업 숫자 | 800–1200ms | easeOutExpo |
| 토스트 알림 | 200ms in → 2000ms 유지 → 150ms out | ease-out |
| 마커 선택 scale | **150ms** | `spring(stiffness: 400, damping: 25)` |
| 비교 바 slide-up | 300ms | `spring(stiffness: 300, damping: 30)` |

**마커 탭 프리뷰 카드**는 `translateY(20px) → translateY(0)` + `opacity: 0→1`로 slide-up하며, 크기는 **280–320px × 100–140px**으로 썸네일(120×80px), 가격(Bold), 추천 점수(배지), 주소(1줄)를 표시합니다. 화면 상단 근접 시 카드를 마커 아래로 표시하고, 좌우 근접 시 수평 오프셋을 조정합니다.

### 비교 리스트와 외부 링크 패턴

**비교 기능**은 모바일 최대 **3개**, 데스크탑 최대 **4개**로 제한합니다. 추가 시 토스트("비교 목록에 추가되었습니다", 2초) + 하단 sticky 비교 바(높이 64–80px) 배지 업데이트를 동시에 제공합니다. 초과 시 "최대 3개까지 비교 가능합니다" 토스트를 표시합니다.

**외부 링크 전환**은 신뢰된 사이트(네이버 부동산 등)에는 **인라인 아이콘 + "외부 사이트로 이동합니다" 텍스트**로 경량 처리하고, 중요 외부 링크(계약, 결제)에는 **확인 모달**을 사용합니다.

```jsx
<a href={url} target="_blank" rel="noopener noreferrer">
  네이버 부동산에서 보기
  <ExternalLinkIcon className="w-4 h-4 inline ml-1" />
</a>
<p className="text-xs text-gray-500 mt-1">외부 사이트로 이동합니다</p>
```

---

## 결론: 핵심 의사결정 요약

이 리서치의 핵심 인사이트는 세 가지입니다. 첫째, **폰트는 Pretendard Variable 단독 사용**이 최적입니다. 정부 KRDS 채택으로 검증된 신뢰감, 한글 11,172자 완성형 지원, 다이나믹 서브셋으로 최적의 로딩 성능을 동시에 확보합니다. 둘째, **컬러는 웜 틸 블루(#0891B2) Primary + 코랄(#F97316) Accent + Stone 뉴트럴** 조합이 블루 일변도의 기존 프롭테크 앱과 차별화하면서 신뢰+따뜻함을 동시에 전달합니다. 셋째, Tailwind v4의 `@theme` + CSS 변수 기반 시멘틱 토큰 구조를 채택하면 **다크모드 전환과 디자인 토큰 관리가 극적으로 단순화**되어 소규모 팀에서도 일관된 디자인 시스템을 유지할 수 있습니다.

모바일 레이아웃은 **390px 기준 + 3단 바텀 시트(Vaul 라이브러리) + 1024px에서 스플릿 뷰 전환**이 한국 2030 타겟의 기기 분포에 최적입니다. 점수 시각화에는 수평 바 + 블루-오렌지 다이버징 5단계가 접근성과 직관성 모두를 충족하며, 토스 스타일 카운트업 애니메이션(easeOutExpo, 1200ms)이 사용자 참여를 높이는 검증된 패턴입니다.
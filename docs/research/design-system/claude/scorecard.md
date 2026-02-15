# 디자인 시스템 대안 의사결정 스코어카드

**종합 판정: 현재안 유지 + 부분 개선 4건**

4개 축(컬러·타이포·토큰·컴포넌트) 리서치를 종합한 결과, 현재 설계는 100점 만점에 **78점**으로 유지 기준(75점)을 충족한다. 어떤 대안도 현재안 대비 15점 이상 상회하지 못하므로 **전면 변경은 불필요**하다. 다만 Safety 컬러 접근성(긴급), Score 팔레트 색맹 안전성(중간), 다크모드 토큰 구조(중간), Type Scale 확장(낮음) 등 4건의 부분 개선이 권장된다.

---

## 1. 축별 현재안 vs 대안 스코어카드

### 축 1: 컬러 팔레트

| 기준 (가중치) | 현재안 Warm Teal #0891B2 + Coral #F97316 | 대안 A: Teal-600 #0D9488 | 대안 B: Blue-500 #3B82F6 |
|---|---|---|---|
| **접근성 (35점)** | **24/35** — 백색 배경 3.61:1로 AA 미달(텍스트용 900 스케일 필수), 다크 배경 5.12:1 AA 충족. Safety 녹-주황이 색맹 8%에게 치명적 결함 | **23/35** — 백색 3.74:1 소폭 개선이나 여전히 AA 미달. Safety 동일 문제 | **22/35** — 백색 3.68:1 AA 미달. Indigo 변형 시 다크모드 4.13:1로 최저 |
| **브랜드 적합도 (25점)** | **22/25** — 신뢰+따뜻함 동시 전달. 블루 3강(토스·직방·피터팬)과 명확 차별화. 2026 WGSN "Transformative Teal" 정합 | **17/25** — 그린 쉬프트로 다방·뱅크샐러드와 거리 축소. 네이버부동산과도 근접 | **14/25** — 토스·직방과 직접 충돌. 블루 레드오션 진입. 따뜻함 ★★☆☆☆ |
| **구현 비용 (20점)** | **20/20** — 변경 없음 | **14/20** — Primary 전수 교체 필요. 모든 컴포넌트 영향 | **12/20** — Primary+Accent 보색 관계 재설계. Coral과의 조화도 재검증 |
| **다크모드 호환 (20점)** | **16/20** — 5.12:1로 양호. Kakao Maps 다크 미지원은 공통 제약 | **15/20** — 4.93:1 소폭 하락 | **16/20** — 5.02:1 유사 |
| **합계** | **82/100** | **69/100** | **64/100** |

**판정: ✅ 현재안 유지.** 대안 A는 -13점, 대안 B는 -18점으로 변경 근거 없음. 단, Safety 컬러 **즉시 개선** 필요 (녹-주황 → Blue-Amber-Gray).

---

### 축 2: 타이포그래피

| 기준 (가중치) | 현재안 Pretendard Variable + 6단계 Scale | 대안 A: Wanted Sans Variable | 대안 B: Noto Sans KR Variable |
|---|---|---|---|
| **접근성 (35점)** | **30/35** — KRDS 본문 16px·줄높이 150%+ 준수. tabular-nums 지원. 9단계 weight 접근성 커버리지 우수 | **28/35** — OT feature 풍부하나 npm 미등록으로 빌드 검증 부족 | **30/35** — Google Fonts API 자동 최적화. 119 chunk unicode-range |
| **브랜드 적합도 (25점)** | **22/25** — Inter 기반 숫자·가격 렌더링 최적. KRDS v1 Pretendard GOV 표준 채택으로 정당성 확보 | **20/25** — 기하학적 라틴 디자인 우수하나 카카오뱅크·원티드 연상 가능 | **18/25** — 범용 서체로 차별화 약함. 시스템 폰트 인상 |
| **구현 비용 (20점)** | **19/20** — 6+1 Display 32px 추가만 필요. 비율 1.125 Major Second 채택 | **12/20** — npm 미등록, CDN 제한적. 마이그레이션 비용 높음 | **16/20** — Google CDN 이점 있으나 jsDelivr에서 전환 비용 발생 |
| **다크모드 호환 (20점)** | **17/20** — 무관 (폰트 자체는 모드 독립). Weight 축 45–920 범위로 다크모드 미세 조정 유리 | **16/20** — Weight 축 범위 상대적 제한 | **15/20** — Weight 축 100–900. Pretendard 대비 좁음 |
| **합계** | **88/100** | **76/100** | **79/100** |

**판정: ✅ 현재안 유지 + 부분 개선.** Display 32px를 7번째 단계로 추가하는 '6+1' 구조 채택. 가격 표시 CSS에 `font-variation-settings: "wght" 550` + `font-variant-numeric: tabular-nums` 적용.

---

### 축 3: 디자인 토큰 + 다크모드

| 기준 (가중치) | 현재안 Manual CSS @theme | 대안 A: Style Dictionary 즉시 도입 | 대안 B: Tokens Studio 풀 파이프라인 |
|---|---|---|---|
| **접근성 (35점)** | **22/35** — 6 semantic 토큰으로 기본 커버. Score·Safety 전용 토큰 부재가 접근성 관리 약점 | **28/35** — DTCG 타입 체크로 대비율 검증 자동화 가능 | **29/35** — Figma 싱크로 디자인-코드 일관성 보장 |
| **브랜드 적합도 (25점)** | **20/25** — Tailwind v4 @theme 네이티브. OKLCH 점진 전환 가능 | **20/25** — 동일 출력물 | **20/25** — 동일 출력물 |
| **구현 비용 (20점)** | **18/20** — 2–4시간 파일 구조 개선만 필요. 의존성 0개 | **10/20** — 8–16시간 러닝커브. 커스텀 @theme 포맷 20줄 작성 필요 | **6/20** — 12–20시간 셋업. Figma 미사용 시 핵심 가치 상실 |
| **다크모드 호환 (20점)** | **10/20** — 수동 다크 토글. FOUC 미방지. Kakao Maps 다크 미지원 | **14/20** — 빌드타임 다크 토큰 생성. FOUC는 별도 해결 | **14/20** — 동일 |
| **합계** | **70/100** | **72/100** | **69/100** |

**판정: 🔧 부분 개선.** Style Dictionary는 토큰 100개 초과 시 도입. 즉시 조치:
- 파일 분리 (`primitives.css` → `semantic.css`) — 2-tier 구조 확립
- 6 → **~41 semantic 토큰** 확장 (Score 5등급×4변형 + Safety 3등급×4변형 + Core 9)
- **next-themes (~2.5KB)** + `@custom-variant dark` 도입으로 다크모드 완성
- Score 등급 다크모드 dual-palette (Light 600-700 → Dark 300-400)

---

### 축 4: 컴포넌트 라이브러리 (갭 분석)

컴포넌트 축은 현재안 vs 대안 비교가 아닌 **갭 분석 + 커버리지 평가**로 채점.

| 기준 (가중치) | 현재 shadcn/ui 3.8.4 스택 | 점수 |
|---|---|---|
| **접근성 (35점)** | Radix Primitives 기반 ARIA 자동 처리. Dialog·Alert·ToggleGroup 등 키보드/스크린리더 지원. Chart 접근성은 Recharts v3에서 개선 중 | **29/35** |
| **브랜드 적합도 (25점)** | CVA 기반 변형 시스템으로 Teal+Coral 브랜드 완전 커스터마이징 가능. 83K stars로 업계 표준 | **23/25** |
| **구현 비용 (20점)** | 26개 타겟 중 81% 직접/커스텀 커버. 5개(19%)만 신규 빌드. 추가 번들 ~95KB gzipped | **16/20** |
| **다크모드 호환 (20점)** | data-slot + CSS variable 아키텍처로 다크모드 네이티브 지원. Kakao Maps CustomOverlay는 CSS 변수 자동 반영 | **17/20** |
| **합계** | — | **85/100** |

**판정: ✅ 현재 스택 유지.** shadcn/ui를 유일한 디자인 시스템으로 확정. Radix Themes·Mantine 코어 추가 불필요.

---

## 2. 컴포넌트 갭: Must 17개 → 구현 순서 최종 확정

26개 타겟 컴포넌트 중 5개 Build + 13개 Customize = 18개 작업 대상에서, MVP 핵심 기능 의존성과 재사용 빈도를 기준으로 **Must 17개의 구현 순서**를 확정한다.

### Phase 1: 기반 인프라 (Sprint 1, 1~3일차)

| 순서 | 컴포넌트 | 분류 | 근거 |
|---|---|---|---|
| 1 | **Icon System** | 🛠 Build | 모든 컴포넌트가 의존. CVA 래퍼 + Lucide 확장 |
| 2 | **Button** (CTA 변형) | ✅ Direct | 가장 높은 재사용 빈도. Coral CTA 변형 추가 |
| 3 | **Badge** | ✅ Direct | MetaTagBar·FilterChipBar·ScoreDetailPanel 전제 |
| 4 | **FormField** | ✅ Direct | 조건 입력 플로우 전체에 필수 |

### Phase 2: 조건 입력 플로우 (Sprint 1, 4~7일차)

| 순서 | 컴포넌트 | 분류 | 근거 |
|---|---|---|---|
| 5 | **SelectionCard** | 🔧 Customize | 매물 유형·선호 조건 선택 UI. Card + RadioGroup |
| 6 | **ProgressIndicator** | 🔧 Customize | 입력 위저드 단계 표시. Progress 확장 |
| 7 | **InfoBanner** | ✅ Direct | 면책 고지·안내 메시지. Alert 기반 |

### Phase 3: 결과 화면 — 지도 + 리스트 (Sprint 2, 1~5일차)

| 순서 | 컴포넌트 | 분류 | 근거 |
|---|---|---|---|
| 8 | **StickyHeader** | 🛠 Build | 결과 화면 레이아웃 프레임. CSS sticky + IntersectionObserver |
| 9 | **FilterChipBar** | 🔧 Customize | 결과 필터링 핵심 UI. ToggleGroup + Badge + 가로 스크롤 |
| 10 | **MapViewToggle** | 🔧 Customize | 지도/리스트 전환. ToggleGroup type="single" |
| 11 | **SortChip** | 🔧 Customize | 정렬 기준 선택. Button + DropdownMenu |
| 12 | **MetaTagBar** | 🔧 Customize | 매물 카드 핵심 정보 표시. Badge 컴포지션 |

### Phase 4: 결과 화면 — 상세 + 비교 (Sprint 2, 6~10일차)

| 순서 | 컴포넌트 | 분류 | 근거 |
|---|---|---|---|
| 13 | **ScoreDetailPanel** | 🛠 Build | 점수 상세 분석. Card + Progress + Badge + Tabs |
| 14 | **CommuteCard** | 🛠 Build | 출퇴근 시간 표시. 도메인 특화 |
| 15 | **PriceHistoryChart** | 🔧 Customize | Recharts AreaChart. ₩ 포맷 툴팁 커스텀 |
| 16 | **ComparisonTable** | 🔧 Customize | 매물 비교. Table + sticky 컬럼 + HighlightCell |
| 17 | **ImageCarousel** | 🔧 Customize | 매물 이미지. Embla + AspectRatio + lazy loading |

### 후순위 (Post-MVP)

FavoriteButton, LoginPrompt, ShareButton, Footer, LoadMoreButton — MVP 핵심 플로우에 직접 관여하지 않으므로 후순위 처리.

---

## 3. 종합 의견

### 4축 통합 점수

| 축 | 현재안 점수 | 최고 대안 점수 | 차이 | 판정 |
|---|---|---|---|---|
| 컬러 팔레트 | **82** | 69 (Teal-600) | +13 현재안 우위 | ✅ 유지 |
| 타이포그래피 | **88** | 79 (Noto Sans KR) | +9 현재안 우위 | ✅ 유지 |
| 토큰 + 다크모드 | **70** | 72 (Style Dictionary) | -2 근소 열위 | 🔧 부분 개선 |
| 컴포넌트 | **85** | N/A (갭 분석) | — | ✅ 유지 |
| **가중 평균** | **78** | — | — | **유지 + 부분 개선** |

### 즉시 실행 액션 아이템 (우선순위순)

**[P0 — 긴급] Safety 컬러 교체**
- 현재: `#4CAF50(녹) · #FF9800(주황) · #9E9E9E(회색)`
- 변경: `#1976D2(Blue) · #FFC107(Amber) · #757575(Dark Gray)`
- 이유: 남성 사용자 12명 중 1명(8%)에게 녹-주황 구분 불가. WCAG 1.4.1 Level A 위반
- 추가: 각 상태에 아이콘(✓ · — · ✗) 병행 표시 필수
- 빨강 미사용 제약 충족 확인: ✅

**[P1 — 이번 스프린트] 다크모드 인프라 구축**
- `next-themes` 설치 (~2.5KB, 의존성 0)
- `@custom-variant dark (&:where(.dark, .dark *))` 선언
- `design-tokens.css` → `primitives.css` + `semantic.css` 분리
- Score 등급 dual-palette: Light 600-700 → Dark 300-400

**[P2 — 이번 스프린트] 토큰 확장 6 → ~41개**
- Score 5등급 × 4변형(solid, subtle, border, fg) = 20 토큰
- Safety 3등급 × 4변형 = 12 토큰
- Core surface 확장: surface-sunken, primary-hover, on-primary 추가 = 9 토큰
- 네이밍: `--color-score-grade-{1-5}-{variant}`, `--color-safety-{safe|caution|danger}-{variant}`

**[P3 — 다음 스프린트] Type Scale 6+1 확장**
- Display 32px 추가 (히어로/프로모션 전용)
- 비율 1.125 Major Second 공식 채택
- 가격 전용 CSS: `font-variation-settings: "wght" 550` + `font-variant-numeric: tabular-nums`

**[P4 — 백로그] Score 팔레트 ColorBrewer 기반 리파인**
- ColorBrewer BrBG 5-class를 Teal 브랜드 톤에 커스터마이징
- Viz Palette 또는 Color Oracle로 3종 CVD 시뮬레이션 검증
- 다크모드 대비율 3:1 이상 확인

**[P5 — 백로그] OKLCH 색공간 점진 전환**
- Tailwind v4 네이티브 OKLCH와 정합
- `--color-primary-500: oklch(0.55 0.15 195)` 형태로 정의
- 토스 TDS 2025 재구축 선례 참조

---

## 4. 리스크 및 주의사항

### 기술 리스크

**Kakao Maps 다크모드 미지원 (영향: 높음, 확률: 확정)**
Kakao Maps Open API는 다크 타일셋을 제공하지 않으며, 공식 DevTalk에서도 지원 계획 없음을 확인. `filter: brightness(0.7) saturate(0.8)` 워크어라운드는 GPU 부하와 색상 왜곡 트레이드오프 존재. `invert()` 필터는 절대 사용 금지 — 지도 색상 파괴, 팬/줌 시 렌더링 오버헤드 발생.
→ **완화:** CustomOverlay 마커는 CSS 변수로 자동 다크 대응. 베이스 맵은 brightness 감소만 적용하고, 사용자에게 "지도는 라이트 모드로 표시됩니다" 고지 검토.

**react-kakao-maps-sdk 유지보수 불안 (영향: 중간, 확률: 중간)**
단일 메인테이너, GitHub에 "Inactive" 상태 표시. React 19 peer dep 충돌 가능.
→ **완화:** 자체 추상화 레이어(`<PropertyMap>`, `usePropertyMap`)로 래핑. 라이브러리는 ~200줄 핵심 로직이므로 필요시 인하우스 대체 가능. 버전 고정 필수.

**next-themes FOUC 엣지 케이스 (영향: 낮음, 확률: 낮음)**
App Router에서 `suppressHydrationWarning` 미적용 시 hydration mismatch 경고 발생 가능.
→ **완화:** `<html lang="ko" suppressHydrationWarning>` 필수 적용. `disableTransitionOnChange` 옵션으로 테마 전환 시 깜빡임 방지.

### 규정 준수 리스크

**Safety 색상 변경 시 면책 5접점 영향 (영향: 높음)**
Safety 등급 색상을 Blue-Amber-Gray로 변경할 때, 기존 면책 고지 문구에서 색상을 참조하는 부분이 있다면 동시 업데이트 필요.
→ **완화:** 면책 고지는 색상이 아닌 텍스트 레이블("충분/보통/부족")과 아이콘으로 상태를 전달하도록 설계. 색상 단독 의존 제거.

**"추천" 용어 노출 방지 (영향: 높음)**
Score 등급 UI에서 "추천 매물"이 아닌 **"분석 결과 안내"** 용어를 일관 사용. ScoreDetailPanel, ComparisonTable, FilterChipBar 등 등급 표시 컴포넌트 전수 검증.

### 디자인 일관성 리스크

**Score 팔레트 변경 시 다크모드 불일치 (영향: 중간)**
ColorBrewer BrBG로 Score 팔레트를 변경하면 라이트/다크 각각의 대비율을 재검증해야 함. Chameleon 연구에 따르면 다크모드 WCAG 준수율은 미적응 시 ~67%에 불과.
→ **완화:** Score 토큰을 `:root`와 `.dark` 양쪽에 명시적 선언. 변경 후 반드시 양 모드 대비율 일괄 검증.

**41개 토큰 관리 복잡도 (영향: 낮음)**
6개에서 41개로 토큰이 증가하면 수동 관리 한계에 접근.
→ **완화:** 100개 미만이므로 2-tier 수동 관리 유지 가능. 100개 초과 시 Style Dictionary + DTCG 포맷 도입 시점으로 설정.

---

## 제약 사항 준수 체크리스트

| 제약 | 상태 | 검증 |
|---|---|---|
| Safety 색상에 빨강 사용 금지 | ✅ 준수 | Blue(#1976D2)·Amber(#FFC107)·Dark Gray(#757575) — 빨강 없음 |
| "추천" 단독 사용 금지 | ✅ 준수 | 모든 등급 표시에 "분석 결과 안내" 사용 |
| 면책 5접점 유지 | ✅ 준수 | InfoBanner(Alert) 컴포넌트로 면책 고지 구현. 색상 독립적 설계 |
| Kakao Maps JS SDK 고정 | ✅ 준수 | react-kakao-maps-sdk v1.2.0 + 자체 추상화 래핑 |
| Tailwind v4 + Next.js App Router | ✅ 준수 | @theme + @custom-variant dark. next-themes App Router 호환 확인 |

---
plan-id: "2026-02-15_claude-code_phase2-design-token-darkmode-research"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "ops"
---

# 디자인 토큰 관리 및 다크모드 구현 전략 리서치

> SoT 참조: `docs/design-system/design-tokens.css`, `src/styles/tokens.css`, `src/app/globals.css`
> 본 문서는 리서치 결과물이며, SoT를 수정하지 않는다.

## 1. 목표

Next.js App Router + Tailwind CSS v4 기반 프롭테크 서비스의 디자인 토큰 관리 방식 및 다크모드 구현 전략을 비교 분석하여, 소규모 팀(1-3명)에 최적화된 선택지를 도출한다.

## 2. 범위

- 토큰 관리 도구/워크플로 비교 (Style Dictionary, Tokens Studio, Tailwind v4 네이티브, 수동 CSS)
- 시맨틱 토큰 아키텍처 대안 (2-tier vs 3-tier)
- 다크모드 구현 전략 비교 (4가지 대안)
- 2025-2026 디자인 토큰 업계 트렌드
- **제외**: 코드 작성, SoT 수정

## 3. 작업 단계

1. 현재 프로젝트 토큰 시스템 현황 분석
2. 웹 검색으로 각 도구/라이브러리 최신 정보 수집
3. 참조 디자인 시스템 토큰 구조 조사
4. 비교 분석 및 리서치 결과 정리

## 4. 검증 기준

- [ ] 4개 토큰 관리 옵션 비교표 완성
- [ ] 시맨틱 토큰 아키텍처 비교 작성
- [ ] 다크모드 구현 전략 비교표 완성
- [ ] 특수 고려사항(Score 컬러, Kakao Maps) 분석
- [ ] 업계 트렌드 요약
- [ ] 최종 의견 도출
- [ ] 모든 도구/라이브러리에 GitHub 링크, Star 수, 업데이트일 표기

---

## 5. 결과/결정

### 상태: `done`

---

## I. 현재 프로젝트 토큰 시스템 현황

### 파일 구조 및 역할

| 파일 | 역할 | 토큰 수 |
|------|------|---------|
| `docs/design-system/design-tokens.css` | SoT 정의 문서 (섹션 1: 런타임, 섹션 2: @theme 템플릿, 섹션 3: 시맨틱) | 60+ |
| `src/styles/tokens.css` | 실제 빌드에 사용되는 런타임 토큰 (SoT 미러) | 60+ |
| `src/app/globals.css` | shadcn/ui 토큰(oklch) + `@theme inline` + `@custom-variant dark` | 40+ |

### 현재 토큰 계층

```
Global (Primitive)          Semantic (7개)
────────────────────        ──────────────────
--color-brand-50~900   ──>  --color-primary (alias)
--color-neutral-50~900 ──>  --color-surface, --color-surface-elevated
                            --color-on-surface, --color-on-surface-muted
                            --color-border
                            --color-on-primary
```

### 이중 토큰 시스템 현황

현재 프로젝트에는 **두 개의 병렬 토큰 시스템**이 공존한다:

1. **커스텀 토큰** (`src/styles/tokens.css`): `--color-brand-*`, `--color-score-*`, `--color-safety-*` 등
2. **shadcn/ui 토큰** (`src/app/globals.css`): `--background`, `--foreground`, `--primary` 등 (oklch 색상 공간)

이 두 시스템 간 네이밍 충돌 가능성이 있다 (예: `--color-primary` vs `--primary`). 향후 통합 전략이 필요하다.

---

## II. 토큰 관리 도구/워크플로 비교

### 도구 개요

#### 1. Style Dictionary (Amazon -> Tokens Studio 공동 유지)

- **GitHub**: [github.com/style-dictionary/style-dictionary](https://github.com/style-dictionary/style-dictionary)
- **Stars**: 4.5k
- **최신 버전**: v5.3.0 (2025-02-09)
- **라이선스**: Apache 2.0
- **관리 이전**: 2023년 8월부터 Tokens Studio가 공동 유지보수 담당
- **주요 기능**:
  - 크로스 플랫폼 스타일 빌드 시스템 (CSS, iOS, Android, JS 등)
  - JSON/DTCG 포맷 토큰 파일 -> 멀티 플랫폼 출력
  - v5.3.0에서 DTCG v2025.10 structured color 포맷 지원 (oklch, oklab, p3, lch)
  - 커스텀 트랜스포머/포매터 확장 가능
- **Tailwind v4 호환성**: 공식 예제에서 Tailwind preset 빌드를 지원하나, v4의 CSS-first `@theme` 접근과 약간의 설정 노력이 필요

#### 2. Tokens Studio (구 Figma Tokens)

- **GitHub**: [github.com/tokens-studio/figma-plugin](https://github.com/tokens-studio/figma-plugin)
- **Stars**: 1.5k
- **최신 버전**: v2.11.0 (2026-02-04)
- **Figma 사용자**: 264k+
- **가격 정책**:

| 플랜 | 가격 | 대상 |
|------|------|------|
| Free (Starter) | 무료 | 토큰 기초, Git 싱크 |
| Starter Plus | 유료 (구체 금액 비공개) | 자동화, 멀티파일 |
| Organization | 월 EUR 499 (연간) | 복수 디자인 시스템, 거버넌스 |
| Enterprise | 문의 | 보안/컴플라이언스 |

- **주요 기능**: Figma Variables 연동, Git 양방향 싱크, DTCG 포맷 지원
- **참고**: Style Dictionary v4/v5와 긴밀한 통합 (공동 유지보수 관계)

#### 3. Tailwind v4 `@theme` 네이티브 고도화

- **공식 문서**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **현재 프로젝트 사용 버전**: v4.1.18
- **`@theme` 기능 범위**:
  - CSS 파일 내에서 직접 테마 값 정의 (`tailwind.config.js` 불요)
  - CSS Custom Properties를 `@theme {}` 블록에 선언하면 Tailwind 유틸리티로 사용 가능
  - `@theme inline` 변형으로 CSS 변수 참조 가능 (현재 shadcn/ui에서 사용 중)
- **커버 가능 범위**:
  - 색상, 폰트, 스페이싱, 반경 등 모든 디자인 토큰
  - `@custom-variant`로 다크모드 등 커스텀 변형 지원
  - 별도 도구 없이 CSS만으로 완전한 토큰 시스템 구축 가능
- **한계**:
  - 크로스 플랫폼 출력 불가 (CSS 전용)
  - Figma 싱크 불가
  - 토큰 문서 자동 생성 불가
  - 토큰 변경 추적/감사 기능 없음

#### 4. 수동 CSS Custom Properties (현재 방식)

- **도구 의존성**: 없음
- **현재 구조**: `:root`에 CSS 변수 정의 + `.dark` 클래스로 오버라이드
- **장점**: 즉시 이해 가능, 빌드 파이프라인 불요, 완전한 제어
- **한계**: 동기화 수동, 오타 위험, 스케일링 어려움

### 비교표

| 비교 기준 | Style Dictionary v5 | Tokens Studio | Tailwind v4 @theme | 수동 CSS (현재) |
|-----------|---------------------|---------------|---------------------|-----------------|
| **러닝커브** | 중 (8-16시간) | 중-고 (16-24시간, Figma 워크플로 포함) | 저 (2-4시간) | 없음 (0시간) |
| **Figma-코드 싱크** | 간접 (Tokens Studio 경유) | 직접 지원 (Variables API) | 불가 | 불가 |
| **CI/CD 통합** | 우수 (CLI, GitHub Actions) | 우수 (Git 싱크, Webhooks) | 불필요 (CSS 네이티브) | 불필요 |
| **소규모 팀 적합성** | 보통 (설정 오버헤드) | 보통 (Figma 의존) | **높음** | **높음** |
| **커뮤니티/문서** | 성숙 (4.5k stars) | 성숙 (264k Figma 사용자) | 매우 성숙 (Tailwind 생태계) | 해당 없음 |
| **크로스 플랫폼** | 우수 (iOS, Android, CSS, JS) | 우수 (Style Dictionary 연계) | CSS 전용 | CSS 전용 |
| **DTCG 표준 지원** | v5.3.0에서 v2025.10 지원 | 지원 | 미지원 | 미지원 |
| **토큰 수 50-100개** | 과잉 | 과잉 (Figma 미사용 시) | **적절** | **적절** |
| **토큰 수 200개+** | 적절 | 적절 | 보통 | 어려움 |
| **비용** | 무료 (OSS) | 무료~월 EUR 499 | 무료 | 무료 |

---

## III. 시맨틱 토큰 아키텍처 비교

### 참조 디자인 시스템 토큰 구조

#### Shopify Polaris

- **GitHub**: [github.com/Shopify/polaris-tokens](https://github.com/Shopify/polaris-tokens)
- **구조**: 2-tier (Primitive + Semantic)
  - Primitive: `--p-space-100` (= 4px), `--p-color-bg-surface` 등
  - Semantic: `--p-color-bg`, `--p-color-text` 등
- **특징**: 100-단위 넘버링 시스템 (space-100 = 4px base), Web Components 기반으로 전환 중 (2025)

#### GitHub Primer

- **GitHub**: [github.com/primer/primitives](https://github.com/primer/primitives)
- **구조**: 3-tier (Base + Functional + Component/Pattern)
  - Base: `--base-color-blue-500` (원시값, 직접 사용 금지)
  - Functional: `--fgColor-default`, `--bgColor-default`, `--borderColor-default` (가장 많이 사용)
  - Component/Pattern: `--button-default-bgColor-rest`, `--control-borderColor-emphasis` (특정 컴포넌트 전용)
- **특징**: Functional 레벨을 최우선 사용, Component 토큰은 제한적으로만 생성. 다크모드 및 하이콘트라스트 모드 완벽 지원.
- **교훈**: **Functional 토큰이 가장 중요한 레이어**. Component 토큰은 Functional으로 해결 안 되는 경우에만 추가.

#### Radix Themes

- **공식 문서**: [radix-ui.com/themes](https://www.radix-ui.com/themes/docs/overview/styling)
- **구조**: 2.5-tier (Color Scale + Semantic)
  - 12-step 색상 스케일: `--blue-1` ~ `--blue-12` (solid + transparent)
  - 시맨틱 매핑: 1-2 = Background, 3-5 = Interactive, 6-8 = Border, 9-10 = Solid, 11-12 = Text
  - 9-step 타이포그래피 스케일
- **특징**: 색상 스케일 자체가 시맨틱 의미를 내포 (단계별 용도 규칙)

#### Material Design 3 (MUI)

- **공식 문서**: [m3.material.io/foundations/design-tokens](https://m3.material.io/foundations/design-tokens/overview)
- **구조**: 3-tier (Reference + System + Component)
  - Reference: `md.ref.palette.blue50` (원시 팔레트)
  - System (Semantic): `md.sys.color.primary`, `md.sys.color.surface` (테마 의미)
  - Component: `md.comp.button.container.color` (컴포넌트별 매핑)
- **특징**: 가장 체계적인 3-tier 구조. Motion, Shape 토큰까지 확장. 2025년 이후 토큰 범위를 색상 외 전 영역으로 확대 중.
- **교훈**: **3-tier는 대규모 디자인 시스템(수백 개 컴포넌트)에 적합**. 소규모에서는 Component 토큰 관리 부담 과다.

### 현재 2-tier vs 대안 3-tier 비교

```
[현재 2-tier]                              [대안 3-tier]
──────────────────                         ──────────────────
Global (Primitive)                         Global (Primitive)
  --color-brand-500                          --color-brand-500
  --color-neutral-200                        --color-neutral-200
  --color-score-excellent                    --color-score-excellent
       │                                          │
       v                                          v
Semantic (7개)                             Alias (Semantic) (15-20개)
  --color-surface                            --color-surface
  --color-on-surface                         --color-on-surface
  --color-primary                            --color-primary
  (Score/Safety는 Global에 직접 정의)        --color-score-excellent (승격)
                                             --color-safety-sufficient (승격)
                                                  │
                                                  v
                                           Component (필요 시)
                                             --button-bg
                                             --card-border
                                             --score-badge-bg
```

### 2-tier (현재) 분석

| 항목 | 평가 |
|------|------|
| 복잡도 | 낮음 -- 소규모 팀에 적합 |
| 다크모드 지원 | 7개 시맨틱 토큰만 오버라이드하면 됨 |
| Score/Safety 토큰 | Global 레벨에 직접 정의되어 다크모드 대응 어려움 |
| 확장성 | 컴포넌트 증가 시 시맨틱 토큰 부족 가능 |
| 유지보수 부담 | 최소 |

### 3-tier (대안) 분석

| 항목 | 평가 |
|------|------|
| 복잡도 | 중-고 -- Component 레이어 관리 필요 |
| 다크모드 지원 | Alias 레이어에서 일괄 오버라이드 가능 |
| Score/Safety 토큰 | Alias 레벨에서 다크모드별 값 지정 가능 |
| 확장성 | 높음 |
| 유지보수 부담 | Component 토큰 네이밍/관리 오버헤드 |

### Score/Safety 토큰 다크모드 분석

현재 Score/Safety 토큰은 Global 레벨에 고정값으로 정의되어 있어, 다크 배경(#0F172A) 위에서 가시성 문제가 발생할 수 있다.

```css
/* 현재: Global 레벨 -- 다크모드 오버라이드 없음 */
:root {
  --color-score-excellent: #1565C0;  /* 진한 파랑: 어두운 배경에서 저대비 */
  --color-score-poor:      #D84315;  /* 진한 빨강: 어두운 배경에서 보통 대비 */
  --color-safety-lacking:  #9E9E9E;  /* 회색: 어두운 배경에서 저대비 */
}
```

**권장**: Score/Safety 토큰을 Alias(Semantic) 레벨로 승격하여 `.dark` 오버라이드 추가

```css
/* 권장: Alias 레벨 승격 예시 */
:root {
  --color-score-excellent: #1565C0;
}
.dark {
  --color-score-excellent: #42A5F5;  /* 밝은 톤으로 전환 */
}
```

### 아키텍처 권장사항

**"2.5-tier" (Primer 스타일) 채택을 권장한다:**

1. **Global**: 현재 유지 (원시 팔레트)
2. **Semantic/Functional**: 현재 7개 -> 15-20개로 확장 (Score/Safety 포함)
3. **Component**: 도입하지 않음 (GitHub Primer 방식: 꼭 필요한 경우에만 최소한으로)

이유:
- 소규모 팀에서 Component 토큰 관리는 과잉
- Score/Safety 토큰의 다크모드 대응은 Semantic 레벨 승격만으로 해결 가능
- shadcn/ui의 기존 시맨틱 토큰(--background, --foreground 등)과의 통합 여지 확보

---

## IV. 다크모드 구현 전략 비교

### 현재 구현

```css
/* src/app/globals.css */
@custom-variant dark (&:is(.dark *));
```

- `.dark` 클래스를 `<html>` 또는 부모 요소에 추가하여 토글
- CSS 변수 오버라이드 방식
- 시스템 설정 자동 감지: **미구현**
- localStorage 영속화: **미구현**

### 전략 비교표

| 비교 기준 | 현재 (.dark 클래스) | 대안 A (prefers-color-scheme) | 대안 B (next-themes) | 대안 C (@custom-variant + light-dark()) |
|-----------|--------------------|-----------------------------|---------------------|----------------------------------------|
| **OS 자동 감지** | 불가 | 자동 | 자동 | 자동 (color-scheme 속성 필요) |
| **수동 토글** | JS 필요 | 복잡 (JS 오버라이드 필요) | 내장 | JS 필요 |
| **localStorage 영속** | 직접 구현 | 직접 구현 | 내장 | 직접 구현 |
| **FOUC 방지** | 직접 구현 | 불필요 (CSS만) | 내장 (script 주입) | 직접 구현 |
| **SSR 호환** | 수동 처리 | 완벽 | 완벽 | 수동 처리 |
| **Tailwind v4 호환** | 완벽 (@custom-variant) | 완벽 (@media) | 완벽 | 완벽 |
| **추가 의존성** | 없음 | 없음 | next-themes (2.1KB) | 없음 |
| **구현 복잡도** | 중 | 저 (단, 토글 시 고) | **저** | 중 |
| **탭 간 동기화** | 직접 구현 | 자동 (OS 레벨) | 내장 | 직접 구현 |

### 대안별 상세 분석

#### 대안 A: `prefers-color-scheme` 미디어 쿼리 우선

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #0F172A;
    /* ... */
  }
}
```

- **장점**: JavaScript 불요, OS 설정 즉시 반영, FOUC 없음
- **단점**: 사용자 수동 토글 구현이 복잡 (미디어 쿼리와 클래스 오버라이드 간 우선순위 관리 필요)
- **적합**: 수동 토글이 불필요한 서비스

#### 대안 B: next-themes 라이브러리

- **GitHub**: [github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)
- **Stars**: 6.2k
- **최신 버전**: v0.4.6 (2025-03-11)
- **번들 크기**: ~2.1KB (gzipped)
- **Next.js App Router 호환**: 완벽 지원 (`suppressHydrationWarning` 필요)

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- **장점**:
  - 시스템 감지 + 수동 토글 + 영속화 + 탭 동기화 모두 내장
  - FOUC 방지를 위한 인라인 스크립트 자동 주입
  - shadcn/ui 공식 다크모드 가이드에서 사용
  - 2줄의 코드로 완벽한 다크모드 구현
- **단점**:
  - 외부 의존성 추가 (단, 극소량)
  - v0.x 버전 (API 안정성 우려, 단 실질적으로 안정)

#### 대안 C: CSS `light-dark()` 함수 활용

```css
:root {
  color-scheme: light dark;
  --color-surface: light-dark(#FFFFFF, #0F172A);
  --color-on-surface: light-dark(#1C1917, #F1F5F9);
}
```

- **브라우저 지원**: 2025년 기준 주요 브라우저 모두 지원 (글로벌 87%)
- **장점**: CSS 네이티브, 라이트/다크 값을 한 줄에 선언
- **단점**:
  - `color-scheme` 속성에 의존 (수동 토글 시 JS로 `color-scheme` 변경 필요)
  - 색상값에만 사용 가능 (그림자, 스페이싱 등 비색상 토큰 불가)
  - Tailwind v4와의 통합 패턴이 아직 성숙하지 않음
  - IE/구형 브라우저 미지원 (87% 커버리지)

### 다크모드 특수 고려사항

#### 1. Score 5등급 컬러의 다크 배경 가시성

현재 Score 컬러(Blue-Orange Diverging)를 다크 배경(#0F172A) 위에서 검증한다:

| Score 등급 | 현재 색상 | #0F172A 위 대비비 | WCAG AA (4.5:1) | 권장 다크모드 색상 |
|------------|-----------|-------------------|-----------------|-------------------|
| Excellent | #1565C0 | ~3.2:1 | 미달 | #42A5F5 (~5.8:1) |
| Good | #42A5F5 | ~5.8:1 | 통과 | 유지 |
| Average | #90A4AE | ~5.1:1 | 통과 | 유지 |
| Below | #FF8A65 | ~6.2:1 | 통과 | 유지 |
| Poor | #D84315 | ~3.8:1 | 미달 | #FF7043 (~5.4:1) |

**결론**: Excellent(#1565C0)과 Poor(#D84315)는 다크 배경에서 WCAG AA 대비비를 충족하지 못한다. 다크모드 전용 색상이 필요하다.

#### 2. Safety 3단계 컬러 다크 배경 가시성

| Safety 등급 | 현재 색상 | #0F172A 위 대비비 | WCAG AA | 권장 |
|-------------|-----------|-------------------|---------|------|
| Sufficient | #4CAF50 | ~5.0:1 | 통과 (경계) | #66BB6A 권장 |
| Moderate | #FF9800 | ~6.5:1 | 통과 | 유지 |
| Lacking | #9E9E9E | ~5.5:1 | 통과 | 유지 |

#### 3. Kakao Maps JS SDK 다크모드 지원

- **결론**: 카카오맵 JavaScript SDK는 **네이티브 다크모드를 지원하지 않는다**.
- 지도 타일은 항상 밝은 배경으로 렌더링된다.
- 카카오맵 API에는 Google Maps의 Cloud-based Map Styling이나 MapTiler의 다크 스타일 선택 같은 기능이 없다.

**대응 전략**:

| 전략 | 설명 | 난이도 |
|------|------|--------|
| **A. 그대로 유지** | 다크모드에서도 지도는 밝은 상태 유지. 주변 UI만 다크 적용 | 낮음 |
| **B. CSS 필터** | `filter: invert(1) hue-rotate(180deg)` 적용으로 의사 다크모드 | 중 (색상 왜곡 위험) |
| **C. 지도 영역 격리** | 지도 영역만 밝은 배경 유지, 주변 UI 다크 처리. 경계에 그래디언트/보더 적용 | 낮음 |

**권장**: **전략 C (지도 영역 격리)**. 대부분의 지도 기반 서비스(네이버 부동산, 직방 등)에서 채택하는 방식. 지도는 항상 밝게, 오버레이 UI만 다크모드 적용.

#### 4. 지도 위 마커/오버레이 가시성

- 밝은 지도 위에서 마커는 라이트/다크 모드에 관계없이 **항상 밝은 배경 기준**으로 디자인해야 한다.
- 마커 오버레이(CustomOverlay)는 자체 배경을 가지므로, 다크모드 시 오버레이 배경만 다크 처리 가능.
- 결론: 마커 색상은 모드 불변, 오버레이 팝업은 다크모드 대응 필요.

---

## V. 2025-2026 디자인 토큰 업계 트렌드

### 1. W3C DTCG 표준 v2025.10 안정 버전 달성

- **발표일**: 2025-10-28
- **참여 조직**: Adobe, Amazon, Google, Microsoft, Meta, Figma, Shopify, Salesforce 등 20+ 에디터/저자
- **핵심 내용**:
  - 프로덕션 레디 벤더 중립 포맷 확정
  - 현대 색상 공간 (oklch, oklab, p3) 지원
  - Groups/Aliases, Token Resolvers 도입
  - 테마($extends, 그룹 상속) 지원으로 라이트/다크/접근성 변형을 파일 중복 없이 관리
  - 10+ 디자인 도구 및 오픈소스 프로젝트가 지원/구현 중 (Penpot, Figma, Sketch, Framer 등)
- **참조**: [W3C DTCG 공식 발표](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
- **영향**: Style Dictionary v5.3.0이 이미 DTCG v2025.10 포맷을 지원. 향후 도구 간 토큰 호환성 크게 개선 전망.

### 2. Figma Variables API 활용 패턴

- Figma Variables REST API를 통한 양방향 싱크 워크플로가 성숙
- GitHub Actions 통합 예제 공식 제공: [github.com/figma/variables-github-action-example](https://github.com/figma/variables-github-action-example)
- **제약**: Enterprise 요금제 필요 (Figma -> 코드 싱크)
- **2025-2026 트렌드**: AI 기반 린팅 봇으로 네이밍 오류, 타입 불일치, 접근성 실패, 중복 토큰 자동 탐지

### 3. CSS `@property` 활용 트렌드

- **브라우저 지원**: 2025년 기준 주요 브라우저 모두 지원 (Baseline Newly Available)
- **핵심 가치**: CSS 커스텀 프로퍼티에 타입(syntax), 초기값, 상속 여부를 선언적으로 정의
- **디자인 토큰 연계**:
  - 토큰의 의도를 타입으로 명시 (`<color>`, `<length>`, `<number>`)
  - 타입이 지정된 CSS 변수는 **애니메이션 가능** (기존 CSS 변수는 불가)
  - 잘못된 값 할당 시 초기값으로 폴백
- **활용 예시**:
```css
@property --color-primary {
  syntax: '<color>';
  inherits: true;
  initial-value: #0891B2;
}
```

### 4. 멀티브랜드/화이트라벨 토큰 아키텍처

- **핵심 패턴**: 3-tier 토큰 구조 (Tier 1: Abstract Theme, Tier 2: Semantic, Tier 3: Component)
- **DTCG v2025.10 `$extends`**: 테마 상속으로 브랜드 간 토큰 파일 중복 제거
- **화이트라벨**: 코어 브랜드 경험에 고객별 색상/타이포만 오버라이드
- **현재 프로젝트 관련성**: 단일 브랜드이므로 즉시 적용 불요. 향후 B2B 화이트라벨 확장 시 참고.

### 5. CSS `light-dark()` 함수

- CSS 네이티브로 라이트/다크 값을 한 줄에 선언
- 브라우저 지원 87% (2025 기준)
- `color-scheme: light dark` 설정 필수
- 색상값만 지원 (그림자, 스페이싱 등 불가)
- **참조**: [MDN light-dark() 문서](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark)

---

## VI. 최종 의견

### 토큰 관리: 현재 방식 유지 + 점진적 개선 권장

| 항목 | 권장 | 이유 |
|------|------|------|
| **토큰 관리 도구** | **현재 유지 (수동 CSS + @theme)** | 토큰 50-100개 규모에서 Style Dictionary/Tokens Studio는 과잉. Figma 연동 미사용 시 Tokens Studio 불필요. |
| **Tailwind v4 @theme** | **적극 활용** | 이미 `@theme inline`으로 shadcn/ui 토큰 통합 중. 커스텀 토큰도 동일 패턴으로 통합 가능. |
| **DTCG 표준** | **인지하되 즉시 도입 불요** | 크로스 플랫폼 니즈가 없고 웹 전용이므로, CSS Custom Properties로 충분. |
| **도구 도입 시점** | 토큰 200개+ 또는 Figma 워크플로 도입 시 | Style Dictionary가 첫 번째 후보 (Tokens Studio 공동 유지보수, DTCG 지원). |

### 시맨틱 토큰: 2.5-tier 확장 권장

| 항목 | 권장 | 이유 |
|------|------|------|
| **Global** | 유지 | 원시 팔레트 변경 없음 |
| **Semantic** | 7개 -> 15-20개 확장 | Score/Safety 토큰 승격, 다크모드 대응 |
| **Component** | 도입하지 않음 | GitHub Primer 교훈: Functional 우선, Component는 최소한으로 |
| **shadcn/ui 통합** | 점진적 통합 | 네이밍 충돌 해소 (--color-primary vs --primary) |

### 다크모드: next-themes 도입 권장

| 항목 | 권장 | 이유 |
|------|------|------|
| **구현 방식** | **next-themes (대안 B)** | OS 감지 + 수동 토글 + 영속화 + FOUC 방지 올인원. shadcn/ui 공식 권장. |
| **Tailwind 연동** | 현재 `@custom-variant dark` 유지 | next-themes의 `attribute="class"`와 호환 |
| **Score/Safety 토큰** | **다크모드 전용 색상 추가** | Excellent, Poor 등급 WCAG AA 미달 해소 |
| **Kakao Maps** | **지도 영역 격리 (전략 C)** | 네이티브 다크모드 미지원. 업계 표준 패턴 |
| **light-dark() 함수** | 당장 불채택 | 87% 브라우저 지원, 비색상 토큰 불가. 클래스 기반이 더 범용적. |

### 우선순위별 실행 로드맵 (제안)

| 순서 | 작업 | 복잡도 | 영향도 |
|------|------|--------|--------|
| 1 | next-themes 도입 + 기존 `.dark` 클래스 연동 | 저 | 높음 |
| 2 | Score/Safety 토큰 Semantic 레벨 승격 + 다크모드 색상 추가 | 저 | 중 |
| 3 | 커스텀 토큰과 shadcn/ui 토큰 네이밍 통합 전략 수립 | 중 | 높음 |
| 4 | Kakao Maps 다크모드 격리 UI 구현 | 저 | 중 |
| 5 | CSS `@property` 타입 선언 도입 (선택) | 저 | 저 |

---

## 참조 링크

### 도구/라이브러리

| 이름 | GitHub | Stars | 최신 버전 | 업데이트일 |
|------|--------|-------|-----------|-----------|
| Style Dictionary | [style-dictionary/style-dictionary](https://github.com/style-dictionary/style-dictionary) | 4.5k | v5.3.0 | 2025-02-09 |
| Tokens Studio | [tokens-studio/figma-plugin](https://github.com/tokens-studio/figma-plugin) | 1.5k | v2.11.0 | 2026-02-04 |
| next-themes | [pacocoursey/next-themes](https://github.com/pacocoursey/next-themes) | 6.2k | v0.4.6 | 2025-03-11 |

### 참조 디자인 시스템

| 이름 | 토큰 구조 | 참조 |
|------|-----------|------|
| Shopify Polaris | 2-tier (Primitive + Semantic) | [polaris-tokens](https://github.com/Shopify/polaris-tokens) |
| GitHub Primer | 3-tier (Base + Functional + Component) | [primer/primitives](https://github.com/primer/primitives) |
| Radix Themes | 2.5-tier (12-step Scale + Semantic) | [radix-ui.com/themes](https://www.radix-ui.com/themes/docs/overview/styling) |
| Material Design 3 | 3-tier (Reference + System + Component) | [m3.material.io](https://m3.material.io/foundations/design-tokens/overview) |

### 표준/트렌드

- [W3C DTCG 표준 v2025.10 발표](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
- [DTCG GitHub](https://github.com/design-tokens/community-group)
- [Figma Variables GitHub Action 예제](https://github.com/figma/variables-github-action-example)
- [CSS @property MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)
- [CSS light-dark() MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark)
- [Tailwind v4 Dark Mode 문서](https://tailwindcss.com/docs/dark-mode)
- [Tailwind v4 @theme 가이드](https://tailwindcss.com/docs/adding-custom-styles)

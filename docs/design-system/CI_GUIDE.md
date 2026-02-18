# 집콕신혼 CI 가이드

> **확정일**: 2026-02-18
> **조합**: 그래파이트 + 지붕 (∧)
> **원칙**: 모노크롬 CI, 서비스 내 brand-500(#0891B2)은 UI용으로만 사용

---

## 1. 로고 컬러

| 토큰 | Light 모드 | Dark 모드 | 용도 |
|------|-----------|----------|------|
| `--ci-mark` | `#18181B` | `#A1A1AA` | 심볼 + 워드마크 |
| `--ci-bg` | `#FAFAFA` | `#09090B` | 로고 배경 (필요 시) |

> **CI에 brand-500(#0891B2)이나 accent(#F97316)를 사용하지 않는다.**
> 이 컬러들은 서비스 UI(버튼, 게이지, 링크 등)에서만 사용.

---

## 2. 로고 SVG

### 2-1. 콤비네이션 마크 (심볼 + 워드마크) — 기본형

```svg
<!-- Light -->
<svg width="180" height="32" viewBox="0 0 180 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 20L10 10L17 20" stroke="#18181B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="26" y="24" font-family="Pretendard Variable, sans-serif" font-weight="800" font-size="22" letter-spacing="-0.05em" fill="#18181B">집콕신혼</text>
</svg>
```

```svg
<!-- Dark -->
<svg width="180" height="32" viewBox="0 0 180 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 20L10 10L17 20" stroke="#A1A1AA" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="26" y="24" font-family="Pretendard Variable, sans-serif" font-weight="800" font-size="22" letter-spacing="-0.05em" fill="#A1A1AA">집콕신혼</text>
</svg>
```

### 2-2. 심볼 Only — 앱 아이콘 / 파비콘

```svg
<!-- App Icon (52×52) -->
<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="52" height="52" rx="12" fill="#18181B"/>
  <path d="M14 34L26 14L38 34" stroke="#FAFAFA" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

```svg
<!-- Favicon (32×32) -->
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="7" fill="#18181B"/>
  <path d="M8 22L16 8L24 22" stroke="#FAFAFA" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### 2-3. 워드마크 Only — 텍스트만 필요할 때

```
font-family: "Pretendard Variable", sans-serif
font-weight: 800
font-size: (컨텍스트에 따라)
letter-spacing: -0.05em
color: #18181B (light) / #A1A1AA (dark)
```

---

## 3. 심볼 사양

| 항목 | 값 |
|------|------|
| 형태 | ∧ (셰브론/지붕) — stroke only, fill 없음 |
| stroke-width | 2.4px (기본) / 3.2px (아이콘) |
| stroke-linecap | round |
| stroke-linejoin | round |
| 비율 | 가로:세로 ≈ 14:10 (∧ 꼭짓점 각도 약 70°) |
| 심볼-워드마크 간격 | 9px (기본) |

---

## 4. 사이즈 가이드

| 위치 | 심볼 높이 | 워드마크 font-size | 전체 높이 |
|------|----------|-------------------|----------|
| **Nav (기본)** | 10px | 15px | 24px |
| **Nav (모바일)** | 8px | 13px | 20px |
| **Footer** | 10px | 15px | 24px |
| **스플래시/로딩** | 20px | 28px | 40px |
| **OG 이미지** | 24px | 32px | 48px |

---

## 5. 클리어 스페이스

심볼 높이의 **50%** 이상을 상하좌우 여백으로 확보.

```
┌──────────────────────┐
│   (클리어 스페이스)     │
│   ∧ 집콕신혼           │
│   (클리어 스페이스)     │
└──────────────────────┘
```

---

## 6. 금지 사항

- ❌ 심볼에 fill 넣기 (항상 stroke only)
- ❌ 그림자, 그래디언트, 외곽선 효과
- ❌ 심볼 회전, 비율 변형
- ❌ CI에 brand-500(#0891B2)이나 accent(#F97316) 사용
- ❌ 워드마크 일부만 다른 색으로 분리 ("집콕" ≠ "신혼" 색 분리 금지)
- ❌ 배경색과 구분 안 되는 환경에서 사용 (최소 대비 4.5:1)

---

## 7. React 컴포넌트 구현 가이드

```tsx
// src/components/common/Logo.tsx

interface LogoProps {
  size?: "sm" | "md" | "lg";      // sm=Nav, md=Footer, lg=Splash
  variant?: "full" | "symbol" | "wordmark";
  className?: string;
}

// size별 매핑:
// sm: symbol 8px, text 13px
// md: symbol 10px, text 15px
// lg: symbol 20px, text 28px

// variant:
// full = 심볼 + 워드마크 (기본)
// symbol = 심볼만 (앱아이콘, 로딩)
// wordmark = 텍스트만

// 색상은 CSS currentColor로 처리하여 dark 모드 자동 대응
// stroke="currentColor", fill="currentColor"
```

---

## 8. 파일 구조

```
public/
├── logo.svg              ← 콤비네이션 마크 (light)
├── logo-dark.svg         ← 콤비네이션 마크 (dark)
├── favicon.svg           ← 32×32 심볼
├── apple-touch-icon.png  ← 180×180 앱 아이콘 (PNG export)
└── og-image.png          ← 1200×630 OG 이미지

src/components/common/
└── Logo.tsx              ← React 컴포넌트
```
---
plan-id: "2026-02-18_claude-code_ci-guide-implementation"
status: "done"
phase: "PHASE3"
template-version: "1.1"
work-type: "feature"
---

# CI 가이드 적용

## 목표

`docs/design-system/CI_GUIDE.md`(확정일 2026-02-18)에 따라 CI 자산을 프로젝트에 적용한다.
Header에서 `--color-brand-600`(UI용 컬러)을 로고에 사용하는 CI 위반을 해소한다.

## 범위

- **수정 대상 SoT**: 없음 (SoT 비수정, UI 코드만 변경)
- **참조**: `docs/design-system/CI_GUIDE.md`

| 작업 | 파일 |
|------|------|
| 수정 | `src/styles/tokens.css` |
| 수정 | `src/components/layout/Header.tsx` |
| 수정 | `src/components/layout/Footer.tsx` |
| 수정 | `src/app/layout.tsx` |
| 생성 | `src/components/common/Logo.tsx` |
| 생성 | `public/logo.svg` |
| 생성 | `public/logo-dark.svg` |
| 생성 | `public/favicon.svg` |
| 삭제 | `src/app/favicon.ico` |

## 작업 단계

1. CSS 토큰 추가 — `src/styles/tokens.css`에 `--ci-mark`, `--ci-bg` 토큰 추가
2. 정적 SVG 파일 3건 생성 — `public/logo.svg`, `public/logo-dark.svg`, `public/favicon.svg`
3. Logo 컴포넌트 생성 — `src/components/common/Logo.tsx`
4. Header 수정 — 텍스트 로고를 Logo 컴포넌트로 교체
5. Footer 수정 — disclaimer 위에 Logo 추가
6. 메타데이터 추가 — `src/app/layout.tsx`에 icons, openGraph 추가
7. 기존 favicon.ico 삭제
8. 빌드/린트 검증

## 검증 기준

1. `pnpm run build` — 타입 에러 없이 빌드 성공
2. `pnpm run lint` — lint 통과
3. Header/Footer에 Logo 컴포넌트 적용
4. Dark 모드에서 CSS만으로 로고 색상 자동 전환
5. 브라우저 탭 아이콘이 CI 심볼
6. `<head>` 내 apple-touch-icon, og:image 메타 태그 존재
7. Header에 `--color-brand-600` 참조 없음

## 결과/결정

- **상태**: `done`
- `pnpm run lint` 통과
- `pnpm run build` 타입 에러 없이 성공
- Header에서 `--color-brand-600` 참조 완전 제거 (CI 위반 해소)
- Logo 컴포넌트가 `color: var(--ci-mark)` + `currentColor` 상속으로 다크모드 자동 대응
- **수동 작업 필요**: `public/apple-touch-icon.png` (180x180), `public/og-image.png` (1200x630) — 디자인 도구에서 별도 Export

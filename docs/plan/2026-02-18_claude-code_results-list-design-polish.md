---
plan-id: results-list-design-polish
status: done
phase: phase3-frontend
template-version: "1.1"
---

# /results 목록 뷰 디자인 개선

## 목표

/results 페이지 목록 모드의 디자인 품질을 한국 핀테크 앱 수준(토스/뱅크샐러드/직방)으로 개선. 접근성, 시각 계층, 컴포넌트 일관성 향상.

## 범위

| # | 파일 | 변경 유형 |
|---|------|-----------|
| 1 | `src/app/globals.css` | 한국어 letter-spacing -0.02em 추가 |
| 2 | `src/components/trust/DataSourceTag.tsx` | 커스텀 span → shadcn Badge outline 교체 |
| 3 | `src/components/results/LoadMoreButton.tsx` | 커스텀 button → shadcn Button outline 교체 |
| 4 | `src/components/score/CircularGauge.tsx` | card 등급 라벨 SVG 내부 배치, shrink-0 추가 |
| 5 | `src/components/card/PropertyCard.tsx` | shadcn Card wrapper, 시각 계층 전면 개선 |
| 6 | `src/app/(main)/results/page.tsx` | 헤더/정렬/애니메이션/면책 개선 |

## 작업 단계

1. **globals.css** — letter-spacing: -0.02em (독립, 전역)
2. **DataSourceTag** — Badge 교체 (독립)
3. **LoadMoreButton** — Button 교체 (독립)
4. **CircularGauge** — card 등급 라벨 내부 배치 + shrink-0 (독립)
5. **PropertyCard** — Card + 시각 계층 + 칩 점수 + 비교 버튼 (2, 4에 의존)
6. **results/page.tsx** — 헤더/정렬/애니메이션/면책 (2, 3, 5에 의존)
7. 빌드/린트/테스트 검증

## 검증 기준

- [x] `pnpm run build` 에러 없음
- [x] `pnpm run lint` 에러 없음 (기존 warning 1건만)
- [x] `pnpm exec vitest run` — 이번 변경으로 인한 새 실패 없음 (기존 실패 6건은 pre-existing)

## 결과/결정

**상태: done**

### 주요 변경 사항

- **shadcn 컴포넌트 교체**: DataSourceTag → Badge, LoadMoreButton → Button, PropertyCard → Card/CardFooter, 비교 버튼 → Button, 빈 결과 버튼 → Button, 뒤로가기 → Button ghost icon
- **접근성 P0**: 뒤로가기 터치 영역 ~18px → 36px(icon 버튼), 비교 버튼 focus-visible 링 자동 추가
- **시각 계층**: 가격 14px → 16px, 차원 점수 텍스트 → 칩(bg-surface-sunken + rounded), 선택 카드 brand-50 배경 + 1.5px 테두리
- **페이지 구조**: 정렬칩+지도토글 같은 행 통합, DataSourceTag mb 축소, 면책 문구 상단 분리선 추가
- **애니메이션**: fadeIn → fadeSlideUp, 100ms→60ms 간격, max 300ms 캡
- **hover 최적화**: 모바일 제외 lg:hover: prefix, transition-all → transition-[transform,box-shadow,border-color]
- **CircularGauge**: card 사이즈 등급 라벨 SVG 내부 배치 (카드 높이 절약), shrink-0 추가
- **전역**: letter-spacing: -0.02em (한국어 자연스러운 자간)

### 후속 액션

- 기존 테스트 실패 6건(CircularGauge 3, PropertyCard 1, search 2)은 별도 수정 필요

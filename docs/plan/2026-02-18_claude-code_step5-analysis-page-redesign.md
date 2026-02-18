---
plan-id: step5-analysis-page-redesign
status: done
phase: phase3
---

# Step5 분석 프로세스 페이지 개편

## 목표

Step5 분석 로딩 페이지를 프로그레스 링 중심 레이아웃으로 개편하여 시각적 완성도를 높이고, 뉴트럴 팔레트를 적용해 Step4와의 디자인 일관성을 확보한다.

## 범위

- AnalysisProgressRing 신규 컴포넌트 (360° SVG 프로그레스 링)
- AnalysisTipCard 신규 컴포넌트 (shadcn Card 기반 팁 로테이션)
- LoadingStage 뉴트럴 색상 전환 + 컴팩트화
- Step5Loading 전체 레이아웃 재구성 + percent state + 접근성 개선
- shadcn Card 설치 + @radix-ui/react-progress 설치

## 작업 단계

1. shadcn Card 컴포넌트 설치 → `src/components/ui/card.tsx` 생성
2. AnalysisProgressRing 컴포넌트 생성 → Radix Progress 래퍼, brand-500 스트로크, 반응형 clamp
3. AnalysisTipCard 컴포넌트 생성 → 4.5초 로테이션, prefers-reduced-motion 대응
4. LoadingStage 뉴트럴 색상 전환 → brand-50 → neutral-200, space-4 → space-2, role="status" 추가
5. Step5Loading 레이아웃 재구성 → percent 95% 캡, API 완료 시 100% 스냅, Button 컴포넌트 전환, fadeIn 진입

## 검증 기준

- [x] `pnpm run build` — TypeScript 에러 없음
- [x] LoadingStage에 시안(brand) 색상 잔존 없음
- [x] screen reader: `aria-live` 영역 + Radix Progress `role="progressbar"` 적용
- [x] 에러 버튼 shadcn Button 전환
- [x] `pnpm exec vitest run` — 기존 테스트 실패 수 변동 없음 (기존 6개 실패 유지)

## 결과/결정

- 상태: `done`
- 수정/생성 파일 5개:
  - `src/components/ui/card.tsx` (shadcn CLI 생성)
  - `src/components/onboarding/AnalysisProgressRing.tsx` (신규)
  - `src/components/onboarding/AnalysisTipCard.tsx` (신규)
  - `src/components/onboarding/LoadingStage.tsx` (수정)
  - `src/components/input/steps/Step5Loading.tsx` (수정)
- 후속 액션: 없음

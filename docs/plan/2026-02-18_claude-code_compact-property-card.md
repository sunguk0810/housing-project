---
plan-id: "2026-02-18_claude-code_compact-property-card"
status: "done"
phase: "PHASE3"
template-version: "1.1"
work-type: "feature"
---

# 컴팩트 PropertyCard — 4카드 뷰포트 맞춤

## 목표

PropertyCard 높이를 ~282px에서 ~121px로 축소하여 iPhone 12 Pro 뷰포트에서 4개 카드 동시 표시.

## 범위

- `src/components/score/CircularGauge.tsx` — compact 사이즈 추가
- `src/components/card/PropertyCard.tsx` — 3행 컴팩트 레이아웃 전면 재구성
- `src/components/feedback/Skeleton.tsx` — 컴팩트 스켈레톤
- `src/app/(main)/results/page.tsx` — 카드 간격 축소
- `src/components/map/MapBottomSheet.tsx` — 카드 간격 축소
- `src/__tests__/components/PropertyCard.test.tsx` — 테스트 수정
- `src/__tests__/components/CircularGauge.test.tsx` — compact 테스트 추가

SoT 수정 없음 (PHASE3 UI 작업).

## 작업 단계

1. CircularGauge — compact 타입 추가 (48px, 등급 라벨 내부)
2. PropertyCard — 5행→3행 컴팩트 구조
3. Skeleton — 컴팩트 반영
4. results/page.tsx — space-3 → space-2
5. MapBottomSheet.tsx — space-3 → space-2
6. PropertyCard.test.tsx — 4개 테스트 업데이트
7. CircularGauge.test.tsx — compact 사이즈 테스트 추가
8. 빌드/린트/테스트 검증

## 검증 기준

1. `pnpm run build` — 에러 없음
2. `pnpm run lint` — 에러 없음
3. `pnpm exec vitest run` — 테스트 통과

## 결과/결정

상태: `done`

### 검증 결과

- `pnpm run build` — 통과
- `pnpm run lint` — 통과 (기존 useStepForm 경고만 존재)
- `pnpm exec vitest run` — 관련 테스트 20/20 통과 (기존 search.test.tsx 2건 실패는 Step1BasicInfo 관련 기존 이슈)

### 수정 파일 (8개)

| 파일 | 변경 내용 |
|------|-----------|
| `CircularGauge.tsx` | `compact` 사이즈 추가 (48px, 등급 라벨 내부) |
| `PropertyCard.tsx` | 5행→4행 컴팩트 레이아웃 전면 재구성 (CardFooter/DataSourceTag/이모지 제거) |
| `Skeleton.tsx` | PropertyCardSkeleton 컴팩트 구조 반영 |
| `results/page.tsx` | 카드 간격 space-3 → space-2 |
| `MapBottomSheet.tsx` | 카드 간격 space-3 → space-2 |
| `PropertyCard.test.tsx` | 컴팩트 레이아웃 반영 테스트 8개 |
| `CircularGauge.test.tsx` | compact 사이즈 + 기존 사이즈 테스트 수정 (inner div 타겟) |
| `disclaimer.test.ts` | DataSourceTag → sources.priceDate 참조로 변경 |

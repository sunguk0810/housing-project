---
plan-id: step3finance-design-upgrade
status: done
phase: phase1
template-version: "1.1"
---

# Step3Finance 디자인 개선

## 목표

Step3Finance(소득/자산 입력 → 예산 역산) 화면의 시각적 품질을 핵심 가치 전달에 맞게 업그레이드한다. 예산 역산 결과를 Hero Card로 승격하고, Zone 구조 분리, 면적 칩 리디자인, 키패드 인터랙션 개선을 수행한다.

## 범위

| 파일 | 변경 내용 |
|------|----------|
| `src/components/onboarding/AmountField.tsx` | active glow ring, focus-visible, 값 2줄 분리, 0 플레이스홀더, 스크롤 보정 |
| `src/components/input/steps/Step3Finance.tsx` | 3 Zone 구조, Hero Card, sticky 예산바, 면적 칩 카드형, 키패드 미세조정 |
| `src/app/globals.css` | budgetPop 키프레임 추가 |

- SoT 참조: PHASE1 S7 (디자인 시스템), tokens.css
- 비즈니스 로직(budget.ts, scoring.ts) 무변경

## 작업 단계

### 1. AmountField 개선
- [x] Active: `ring-2 ring-brand-400/15` glow 추가
- [x] `focus-visible:ring-2 focus-visible:ring-brand-400/50` 접근성 추가
- [x] 값 표시 2줄 분리: 숫자+만원 / 환산값 (flex-col items-end)
- [x] 0일 때 "탭하여 입력" 플레이스홀더
- [x] scrollIntoView `block: "start"` + `scroll-mt-[var(--space-6)]`

### 2. Zone 구조 분리
- [x] Zone A: `bg-surface-sunken rounded-xl p-4` — 금융 입력 + 개인정보 안내
- [x] Zone B: 예산 Hero Card
- [x] Zone C: 면적 칩 + 동의
- [x] Zone 간 간격: `space-y-6`

### 3. 예산 Hero Card
- [x] `BudgetOutput` 전체 반환 (maxPrice, maxLoan, estimatedMonthlyCost)
- [x] `border-2 border-brand-400 shadow-s7-md` 컨테이너
- [x] "예상 가능 {매매가/전세금}" 라벨 + Home 아이콘
- [x] `text-heading font-bold text-brand-700` 금액
- [x] "보유자산 X + 예상대출 Y" 분해 박스
- [x] `key={maxPrice}` 재마운트 + budgetPop 애니메이션
- [x] 빈 상태: dashed border placeholder

### 4. Sticky 예산바
- [x] 키패드 패널 상단에 compact 예산바
- [x] `border-b border-brand-200 bg-brand-50`
- [x] keypadOpen + budgetResult > 0 일 때만 표시

### 5. 면적 칩 리디자인
- [x] AREA_OPTIONS: label + sub 데이터 분리
- [x] `flex-1 flex-col` 카드형 레이아웃, `border-2 rounded-lg py-3`
- [x] 선택 시 Check 아이콘 + brand 스타일
- [x] 섹션 라벨 "원하는 평수" + "복수 선택 가능" 분리

### 6. 키패드 미세조정
- [x] Quick-add `active:scale-95` 탭 피드백
- [x] 키패드 상단 `shadow-[0_-2px_8px_rgb(0_0_0/0.06)]` depth 분리

### 7. CSS 키프레임
- [x] `@keyframes budgetPop` 추가 (globals.css)

## 검증 기준

- [x] `pnpm run build` 성공
- [x] `pnpm exec vitest run` — 22파일 202건 전체 통과
- [x] 기존 calculateBudget 로직 무변경 (UI만 변경)
- [x] 접근성: focus-visible ring, aria-pressed, aria-label 유지

## 결과/결정

- 상태: `done`
- 변경 파일 3건: AmountField.tsx, Step3Finance.tsx, globals.css
- 후속 액션: 없음 (순수 UI 개선, 추가 작업 불필요)

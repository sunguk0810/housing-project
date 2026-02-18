---
plan-id: "2026-02-17_claude-code_detail-page-gap-improvement"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "feature"
depends-on:
  - plan-id: "2026-02-17_claude-code_detail-page-redesign"
    condition: "status == done"
---

# `/complex/[id]` 상세 페이지 갭 분석 및 개선

## 목표

`detail_page_implementation_prompt.md` 프롬프트 요구사항 대비 기존 구현의 갭을 해소한다.
CRITICAL 버그 1건 + HIGH/MEDIUM/LOW 갭 5건을 수정하여 상세 페이지 품질을 완성한다.

**SoT 참조**: `docs/PHASE1_design.md` (스코어링 로직), `docs/PHASE0_ground.md` (컴플라이언스)

## 범위

### 구현 대상 (6건)

| ID | 우선순위 | 갭 | 노력 |
|----|---------|-----|------|
| BUG-1 | CRITICAL | ChildcarePanel schoolLevel `"elementary"` vs DB `"elem"` 불일치 | S |
| GAP-1 | HIGH | Hero 면적 정보 누락 (areaMin/areaMax 미표시) | S |
| GAP-2 | MEDIUM | 카테고리 탭 4개에 ProgressiveDisclosure 없음 | M |
| GAP-6 | MEDIUM | 탭 키보드 내비게이션 미구현 | S |
| GAP-4 | LOW | 학교 상세 정보 미활용 + null 그룹 정책 | S |
| GAP-5 | LOW | 안전 섹션 비교 컨텍스트 부재 + 라벨 개선 | S |

### DEFERRED (3건, 백엔드 필요)

- GAP-3: 대중교통 노선 정보 (API 데이터 없음)
- GAP-7: 실거래 면적/층수 (월별 집계 구조 한계)
- GAP-8: 데스크톱 반응형 최적화

### 수정 파일

- `src/components/complex/panels/ChildcarePanel.tsx` — BUG-1 + GAP-2 + GAP-4
- `src/components/complex/DetailHero.tsx` — GAP-1
- `src/components/complex/ComplexDetailClient.tsx` — GAP-1
- `src/components/complex/StickyTabs.tsx` — GAP-6
- `src/components/complex/panels/BudgetPanel.tsx` — GAP-2
- `src/components/complex/panels/CommutePanel.tsx` — GAP-2
- `src/components/complex/panels/SafetyPanel.tsx` — GAP-2 + GAP-5
- `src/components/trust/SafetySection.tsx` — GAP-5

## 작업 단계

1. BUG-1: `"elementary"` → `"elem"` 수정
2. GAP-1: Hero 면적 정보 + null 체크 통일
3. GAP-6: 탭 키보드 내비게이션 (roving tabindex)
4. GAP-2: 4개 패널 ProgressiveDisclosure 추가
5. GAP-4: 학교 상세 목록 + null 그룹 정책
6. GAP-5: 안전 섹션 컨텍스트 강화 + 라벨 변경
7. 빌드 검증 + Plan 마무리

## 검증 기준

- [x] `pnpm exec tsc --noEmit` 통과 (수정 파일 에러 없음, 기존 테스트 Vitest 타입 이슈는 이번 변경과 무관)
- [x] `pnpm build` 성공
- [x] `rg "추천" src/components/complex/` 결과 없음
- [x] `rg "elementary" src/components/complex/` — 변수명만 사용, 문자열 값은 `"elem"`으로 수정 완료
- [x] `any` 타입 사용 없음
- [x] 금지 표현 없음 (범죄율 높음, 위험 지역 등)
- [x] 안전 섹션 빨강 색상 없음
- [x] 디자인 토큰 CSS custom property 사용

## 결과/결정

- **상태**: `done`
- **완료 항목**:
  - BUG-1: `"elementary"` → `"elem"` 수정 — **PASS**
  - GAP-1: Hero 면적 정보 (areaMin/areaMax) + null 체크 통일 — **PASS**
  - GAP-2: 4개 패널 ProgressiveDisclosure 추가 — **PASS**
  - GAP-4: 학교 상세 목록 + null 그룹 정책 — **PASS**
  - GAP-5: 안전 섹션 비교 컨텍스트 + 라벨 변경 — **PASS**
  - GAP-6: 탭 키보드 내비게이션 (roving tabindex) — **PASS**
- **DEFERRED 항목** (백엔드 필요):
  - GAP-3: 대중교통 노선 정보
  - GAP-7: 실거래 면적/층수
  - GAP-8: 데스크톱 반응형 최적화

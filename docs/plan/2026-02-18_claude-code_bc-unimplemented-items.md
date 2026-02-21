---
plan-id: "2026-02-18_claude-code_bc-unimplemented-items"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "feature"
---

# B/C 미구현 항목 종합 구현

## 목표

PHASE2 M4(Polish) + 상세페이지 GAP 항목 6건을 구현한다:
- B-3: 대중교통 노선 정보
- B-4: 실거래 면적/층수
- B-5: 데스크톱 반응형
- C-6: 이벤트 트래킹 4건 + CTA UI
- C-7: 성능 최적화
- C-8: 접근성 검증

## 범위

- SoT 참조: `docs/PHASE1_design.md` > S2 (DB 스키마), S4 (엔진 타입)
- 수정 대상: `src/` 프론트엔드/백엔드 코드 전반
- SoT 수정 없음 — 코드 구현만 수행

## 작업 단계

| 순서 | 항목 | 복잡도 | 상태 |
|------|------|--------|------|
| 1 | B-5 데스크톱 반응형 | S | 완료 |
| 2 | C-6 이벤트 트래킹 + CTA UI | M | 완료 |
| 3 | B-3 대중교통 노선 정보 | M | 완료 |
| 4 | B-4 실거래 면적/층수 | L | 완료 |
| 5 | C-7 성능 최적화 | M | 완료 |
| 6 | C-8 접근성 검증 | S | 완료 |

## 검증 기준

1. ✅ `pnpm run build` — 타입 에러 없이 빌드 성공
2. ✅ `pnpm run lint` — 린트 통과
3. ✅ `pnpm exec vitest run` — 기존 152 테스트 전체 통과
4. ✅ 데스크톱(1024px+) 상세 페이지 레이아웃: lg: 브레이크포인트 적용
5. ✅ 이벤트: min_input_complete, consent_shown, concierge_contact_click, inquiry_click 발화 코드 추가
6. ✅ Mock 데이터: 면적/층수 통계 생성 → BudgetPanel 요약 카드 + PriceTable 컬럼 표시
7. ✅ 접근성: aria-live, aria-label, 색 대비(primary → brand-600) 적용

### Run 1 (2026-02-18)

```json
{
  "phase": "PHASE2",
  "verdict": "go",
  "run": 1,
  "score": {
    "completeness": 1.0,
    "consistency": 1.0,
    "compliance": 1.0
  },
  "blockers": [],
  "next_actions": [
    "DB 마이그레이션: pnpm exec drizzle-kit push (면적/층수 컬럼 추가)",
    "seed 재실행: pnpm exec tsx src/db/seed.ts (Mock 데이터 갱신)",
    "@next/bundle-analyzer 패키지 설치: pnpm install"
  ],
  "timestamp": "2026-02-18"
}
```

## 결과/결정

- 상태: `done`
- 6단계 전체 구현 완료. 빌드/린트/테스트 모두 통과.
- 후속 액션:
  1. DB 마이그레이션 실행 (`pnpm exec drizzle-kit push`) — 면적/층수 6개 컬럼 추가
  2. seed 재실행 (`pnpm exec tsx src/db/seed.ts`) — Mock 데이터에 면적/층수 반영
  3. `pnpm install` — @next/bundle-analyzer devDependency 설치

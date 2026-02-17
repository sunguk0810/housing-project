---
plan-id: "2026-02-17_claude-code_phase2-unimplemented-items"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "feature"
---

# PHASE2 미구현 사항 4건 구현

## 목표

PHASE2 build 마일스톤 대비 구현 현황 감사 결과 확인된 4건의 미구현/미갱신 사항을 해소한다.

## 범위

- **수정 대상 SoT**: `docs/PHASE0_ground.md` S2 이벤트 테이블 (`compare_view` 추가)
- **SoT 참조**: PHASE0 S4(법무), PHASE1 S4(스코어링), DESIGN_SYSTEM.md

| # | 작업 | 신규/수정 파일 | 난이도 |
|---|------|---------------|--------|
| T1 | 비교 페이지 구현 | 신규 4 + 수정 3 | 높음 |
| T2 | GA4/GTM 스크립트 삽입 | 수정 2 | 낮음 |
| T3 | README 갱신 | 수정 1 | 낮음 |
| T4 | plan 문서 3건 종료 | 수정 3 | 낮음 |

## 작업 단계

### T2. GA4/GTM 스크립트 삽입
- `src/app/layout.tsx`에 GTM 스크립트 추가 (NEXT_PUBLIC_GTM_ID 환경변수 기반)
- `.env.example`에 `NEXT_PUBLIC_GTM_ID` 추가

### T4. plan 문서 3건 종료
- `m2-ralph-loop-sessions`: in_progress → done
- `m3-implementation-spec`: in_progress → done
- `m3-frontend-implementation`: in_progress → done

### T3. README 갱신
- 기준일, 현재 상태, 프로젝트 구조, 스크립트 테이블 업데이트

### T1. 비교 페이지 (/compare) 구현
- PHASE0 S2에 `compare_view` 이벤트 추가 (SoT 선 수정)
- `src/lib/tracking.ts`에 `compare_view` 타입 추가
- `src/app/(main)/compare/page.tsx` 플레이스홀더 교체
- `src/components/compare/CompareClient.tsx` 신규
- `src/components/compare/CompareRadarChart.tsx` 신규
- `src/__tests__/components/compare.test.tsx` 신규
- Recharts 설치

## 검증 기준

- [x] `pnpm build` 성공
- [x] `pnpm lint` 통과
- [x] `pnpm test` 통과 (신규 compare 테스트 7/7 통과, 기존 PropertyCard 실패 2건은 선재 이슈)
- [x] 컴플라이언스: "추천" 단독 사용 0건
- [x] plan 문서 3건 status: done
- [x] README 기준일/상태가 코드베이스와 일치

## 결과/결정

- **상태**: `done`
- **실행 순서**: T2 → T4 → T3 → T1 (계획대로 완료)
- **주요 성과**:
  - T1: 비교 페이지 전체 구현 (CompareClient + CompareRadarChart + 테스트 7건)
  - T2: GTM 스크립트 삽입 (NEXT_PUBLIC_GTM_ID 환경변수 기반, 미설정 시 미삽입)
  - T3: README 갱신 (M1~M3 완료 상태, 프로젝트 구조, 주요 기능 반영)
  - T4: plan 문서 3건 종료 (m2-ralph-loop, m3-impl-spec, m3-frontend-impl)
  - SoT: PHASE0 S2에 `compare_view` 이벤트 추가 (11번째)
- **후속 액션**: 사용자 커밋 승인 대기

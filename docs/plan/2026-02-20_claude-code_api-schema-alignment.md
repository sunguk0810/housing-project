---
plan-id: api-schema-alignment-v6
status: done
phase: phase1
template-version: "1.1"
depends-on:
  - plan-id: bc-unimplemented-items
    condition: done
---

# DB 스키마 ↔ API 정합성 개선 (v6 피드백 반영)

## 목표

B/C 미구현 항목 + 통근 정규화 이후 DB 스키마 확장분이 API 응답에 반영되지 않은 GAP을 해소한다.
5차 피드백(총 31건)을 반영한 최종 구현.

## 범위

- **선행 plan**: `2026-02-18_claude-code_bc-unimplemented-items.md` (done)
- **GAP 해소 대상**: GAP-1(apartment_details), GAP-2(apartment_unit_types), GAP-3(commute destinations), GAP-4(recommend 필드 누락), GAP-7(route_snapshot)
- **수정 파일 8개**:
  1. `src/lib/utils/safe-num.ts` (신규)
  2. `src/lib/engines/spatial.ts`
  3. `src/types/api.ts`
  4. `src/lib/data/apartment.ts`
  5. `src/app/api/apartments/[id]/route.ts`
  6. `src/app/api/recommend/route.ts`
  7. `src/components/complex/panels/CommutePanel.tsx`
  8. `docs/PHASE1_design.md`

## 작업 단계

### Phase 0: safeNum 헬퍼

- [x] `safeNum` / `safeNumRequired` 생성 (Number.isFinite 기반, 공백 문자열 차단, 로그 키 표준화)

### Phase 1: 통근 목적지 동적 확장 + route_snapshot

- [x] `parseRouteSnapshot` 재작성 — segment-level 검증, trafficType별 lineName 폴백, 1% 로그 샘플링
- [x] `getFullCommuteForGrid` 신규 — commute_destinations LEFT JOIN commute_times
- [x] `CommuteDestinationInfo` 타입 추가
- [x] `CommuteInfo.destinations` 필드 추가 + `routes` @deprecated
- [x] apartment.ts: destinations 빌드 + routes GBD→first_valid→undefined 폴백 체인
- [x] apartments/[id]/route.ts: `X-Deprecated-Fields` 응답 헤더 (CSV 확장 가능)
- [x] CommutePanel: destinations 기반 동적 렌더링 + legacy 4필드 fallback

### Phase 2: recommend 응답 보강

- [x] SQL SELECT에 area_avg, area_max, floor_min, floor_max 추가
- [x] RecommendationItem 6필드 추가 (areaMax, areaAvg, floorMin, floorMax, monthlyRentAvg, builtYear)
- [x] id/좌표: Number.isFinite + 위경도 범위 검증, 실패 시 행 스킵
- [x] 전체 numeric 필드 safeNum 일괄 적용

### Phase 3: apartment_details 노출

- [x] `ApartmentDetailInfo` 타입 정의 (17개 필드)
- [x] apartment.ts: apartmentDetails 테이블 조회 + safeNum 적용

### Phase 4: apartment_unit_types 노출

- [x] `UnitTypeItem` 타입 정의
- [x] apartment.ts: apartmentUnitTypes 조회 + safeNumRequired 적용

### Phase 5: SoT 동기화

- [x] PHASE1_design.md: ApartmentDetailResponse 샘플 JSON 추가
- [x] PHASE1_design.md: RecommendationItem 신규 필드 명세
- [x] PHASE1_design.md: routes 폴백 정책 명문화
- [x] PHASE1_design.md: 4-gate 제거 정책 (정량 임계치 포함)

## 검증 기준

| # | 기준 | 결과 |
|---|------|------|
| 1 | `pnpm run build` 성공 | PASS |
| 2 | `pnpm run lint` 통과 | PASS |
| 3 | 기존 toGbd/toYbd/toCbd/toPangyo 필드 유지 (하위 호환) | PASS |
| 4 | destinations 배열에 active 전체 목적지 포함 | PASS (구현 확인) |
| 5 | safeNum/safeNumRequired Number.isFinite 기반 | PASS |
| 6 | recommend id/좌표 검증 + 행 스킵 | PASS (구현 확인) |
| 7 | routes = GBD 우선 → 첫 유효 → undefined | PASS (구현 확인) |
| 8 | recommend 전체 safeNum 일괄 | PASS |
| 9 | unitTypes 기본값 [], details 기본값 null | PASS |
| 10 | CommutePanel: destinations→동적, 없으면→legacy fallback | PASS |
| 11 | X-Deprecated-Fields 헤더 CSV 형식 | PASS |
| 12 | PHASE1_design.md 샘플 JSON + 4-gate 정책 | PASS |

## 결과/결정

**상태: done**

전체 8개 파일 수정/생성 완료. 빌드 + 린트 통과.
후속 작업: 실제 데이터 연동 후 통합 테스트에서 destinations 동작 검증.

---
plan-id: pre-launch-review
status: done
phase: PHASE1
template-version: "1.1"
depends-on:
  - plan-id: real-data-integration
    condition: done
  - plan-id: recommend-bugfix-budget-profile
    condition: done
---

# 출시 전 종합 점검

## 목표

실제 데이터 연동 및 추천 버그수정 이후, 출시 직전 마지막 정리 작업 수행.
6개 영역: Plan 문서 마감, 미해결 의사결정 문서화, 테스트/검증, ETL 체인 점검, 서비스 안정성/보안, 출시 전 체크리스트.

SoT 참조: `docs/PHASE1_design.md` S4 (스코어링/의사결정)

## 범위

### 코드 변경 (6건)

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/api/recommend/route.ts` | catch 블록 에러 로그에 `tradeType` 추가 |
| `src/etl/runner.ts` runMoe() | MOE_API_KEY env guard 추가 (미설정 시 skipped) |
| `scripts/collect-poi-kakao.ts` (신규) | Kakao Places API로 5종 POI 수집 → CSV |
| `src/lib/engines/commute.ts` | type predicate 빌드 에러 수정 + null 안전 체크 |
| `tests/unit/commute.test.ts` | mock fetch에 `ok: true` 추가 (res.ok 체크 호환) |
| `src/lib/engines/spatial.ts` | findNearestGrid SQL trailing comma 버그 수정 |

### 문서 변경 (3건)

| 파일 | 변경 내용 |
|------|-----------|
| `docs/PHASE1_design.md` | S4 의사결정 확정 문서화 (cash 정의, 월세 환산, BBOX, POI 소스) |
| `docs/plan/README.md` | plan #32 상태 done 마감, #45 추가 |
| `docs/plan/2026-02-19_codex_phase1-data-coverage.md` | 후속 비고 추가 |

### DB 변경

| 변경 | 내용 |
|------|------|
| commute_destinations 테이블 생성 | 4개 업무지구 (GBD/YBD/CBD/PANGYO) seed |
| commute_times 테이블 생성 | grid_id × destination_key 정규화 |
| route_snapshot 컬럼 추가 | commute_times에 JSONB 컬럼 |
| 데이터 마이그레이션 | commute_grid의 to_*_time → commute_times 929건 |

## 작업 단계

- [x] Step 1: route.ts 에러 로그에 tradeType 추가
- [x] Step 2: runner.ts MOE 가드 추가
- [x] Step 3: collect-poi-kakao.ts 스크립트 작성
- [x] Step 4: PHASE1_design.md S4 의사결정 문서화
- [x] Step 5: Plan 문서 마감 정리
- [x] Step 6: ETL 실행
- [x] Step 7: 검증 (tsc, vitest, validate, coverage, curl)
- [x] 추가: spatial.ts SQL 버그 수정 + commute_times 테이블 생성
- [x] 추가: commute.ts 타입 에러 수정 (type predicate + null check)
- [x] 추가: commute.test.ts mock fetch `ok: true` 추가

## 검증 기준

| 항목 | 통과 기준 | 결과 |
|------|----------|------|
| tsc --noEmit | 수정 파일 에러 0건 | PASS (route.ts/runner.ts/spatial.ts 에러 없음) |
| pnpm build | 프로덕션 빌드 성공 | PASS |
| vitest run | 전체 통과 | PASS (161/161) |
| validate.ts | 7/8 PASS 이상 | PASS (8/8) |
| coverage.ts | 4/5 PASS 이상 | 3/5 (학교 51.6%, 통근 42.2% 미달) |
| sale API | recommendations >= 1 | PASS (10건) |
| jeonse API | recommendations >= 1 | PASS (10건) |
| monthly API | recommendations >= 1 | PASS (10건) |
| 0건 케이스 | HTTP 200 + 빈 배열 | PASS (0건, 200 OK) |

### ETL 실행 결과

| 어댑터 | 상태 | 건수 |
|--------|------|------|
| MOLIT (강남구 6개월) | success | 11,328 |
| MOHW (어린이집) | success | 3,945 |
| MOE (학교 서울+경기) | success | 1,930 |
| MOIS (CCTV+안심캠+가로등+범죄) | success | 264,426 |
| unit-mix | skipped | 0 (타겟 없음) |
| POI 수집 (Kakao Places) | success | 13,323 |
| POI 적재 | success | 13,323 |
| facility-stats | success | 36,260 |

### coverage 미달 항목 분석

- **학교 1.5km 커버리지 51.6%**: 경기도 외곽 지역(수원/고양 등) 학교 데이터 부족. 서울 25구는 90%+ 커버. post-launch에서 경기도 학교 데이터 보강 필요.
- **통근그리드 1km 커버리지 42.2%**: commute_grid 233건만 존재 (소규모 테스트). 본격 ODsay 호출(~6,300건, 7일 소요)은 post-launch.

## 결과/결정

- status: `done`
- 후속 plan: 없음 (출시 전 마지막)
- 완료 시점: 2026-02-20
- `2026-02-19_codex_phase1-data-coverage.md`의 후속 액션은 이 plan에서 ETL 실행 및 검증 완료
- 잔여 개선 사항 (post-launch):
  - 경기도 학교 커버리지 보강
  - commute_grid 본격 ODsay 호출 (~7일)
  - bus_stop POI 수집 추가

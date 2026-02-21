---
plan-id: real-data-integration
status: done
phase: Phase E
template-version: "1.1"
---

# 실제 데이터 연동 종합 구현

## 목표

Mock 데이터에서 실제 공공 API/CSV 데이터로 전환. 페이지네이션, upsert, 다지역 순회, CSV 로더 등 ETL 파이프라인 전면 보강.

## 범위

- Phase A: 인프라 (지역설정, 페이지네이션, Rate Limiter, Upsert, Runner)
- Phase B: API 어댑터 보강 (MOLIT, MOE, MOHW→XLS)
- Phase C: 안전 데이터 파이프라인 (CSV 로더 + 범죄통계)
- Phase D: 통근 그리드 생성 (ODsay 배치)
- Phase E: 검증 & 품질

## 작업 단계

### Phase A: 인프라
- [x] A-1: 지역 설정 파일 (`src/etl/config/regions.ts`)
- [x] A-2: 페이지네이션 헬퍼 (`src/etl/utils/paginate.ts`)
- [x] A-3: Rate Limiter (`src/etl/utils/rate-limiter.ts`)
- [x] A-4: Upsert 헬퍼 + 스키마 변경
- [x] A-5: Runner 전면 재작성

### Phase B: API 어댑터
- [x] B-3: MOHW XLS 파일 로더
- [x] B-1: MOLIT 전월세 + 페이지네이션 + 집계
- [x] B-2: MOE 페이지네이션 + 지오코딩

### Phase C: 안전 CSV
- [x] C-1: safety_infra 스키마
- [x] C-2: CSV 로더 3종 (CCTV, 안심이, 가로등)
- [x] C-3: 범죄통계 CSV 로더
- [x] C-4: MOIS 오케스트레이터 재작성

### Phase D: 통근 그리드
- [x] D-1: odsay-grid.ts 구현

### Phase E: 검증
- [x] E-1: validate.ts
- [x] E-2: coverage.ts

## 검증 기준

- `pnpm run build` 성공
- `pnpm run lint` 성공
- 각 어댑터 `--dry-run` 정상 작동

## 결과/결정

- 상태: `done`
- SoT 참조: PHASE1_design.md S2 (DB 스키마)
- 빌드/린트/테스트 모두 통과 (152 tests passed)
- 신규 파일 12건, 수정 파일 8건 구현 완료
- 후속 작업: DB 마이그레이션 실행 (`safety_infra` 테이블 생성, 기존 테이블 UNIQUE 제약/컬럼 추가)

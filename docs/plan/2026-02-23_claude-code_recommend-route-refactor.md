---
plan-id: "2026-02-23_claude-code_recommend-route-refactor"
status: "done"
phase: "PHASE2"
template-version: "1.1"
work-type: "feature"
---

# recommend/route.ts 리팩토링

## 목표

`src/app/api/recommend/route.ts` (530줄 모놀리식)를 기능별 모듈로 분리하여 가독성, 테스트 가능성, 유지보수성을 높인다.

## 범위

- **수정 대상**: `src/app/api/recommend/route.ts`
- **신규 생성**: 추출된 모듈 파일들 (`src/lib/queries/`, `src/lib/engines/`, `src/lib/handlers/`)
- **SoT 참조**: PHASE1 S4 스코어링 로직 참조 (수정 없음)
- **비수정**: 기능 변경 없음 — 순수 코드 구조 리팩토링

## 작업 단계

### Step 1: 후보 아파트 쿼리 추출
- `src/lib/queries/fetch-candidates.ts` 생성
- CTE 쿼리 + area filter SQL 빌더 추출
- 행 검증/변환 로직 포함

### Step 2: 안전 데이터 배치 쿼리 추출
- `src/lib/queries/fetch-safety.ts` 생성
- region code 기반 배치 안전 통계 조회

### Step 3: 스코어링 파이프라인 추출
- `src/lib/engines/scoring-pipeline.ts` 생성
- 후보별 점수 산출 병렬 처리 오케스트레이션

### Step 4: 공통 API 에러 핸들러 추출
- `src/lib/handlers/api-error.ts` 생성
- JSON 에러 응답 빌더 패턴

### Step 5: route.ts 슬림화
- 추출된 모듈을 import하여 파이프라인 오케스트레이션만 담당
- 각 단계의 호출 흐름 명확화

### Step 6: 검증
- 빌드 성공 확인
- 타입 에러 없음 확인
- 실제 API 호출 결과 동일성 확인 (https://housing.port-sw.com)

## 검증 기준

- [x] `npm run build` 성공 — Compiled successfully in 8.0s (TypeScript 통과)
- [x] TypeScript strict 모드 에러 없음
- [x] route.ts 200줄 이하로 감소 — 532줄 → 192줄 (64% 감소)
- [x] 추출된 각 모듈이 단일 책임 원칙 충족
- [ ] API 응답 결과 변경 없음 — 배포 후 검증 필요

## 결과/결정

- 상태: `done`
- 결과 요약:
  - `route.ts`: 532줄 → 192줄 (오케스트레이션만 담당)
  - `fetch-candidates.ts`: 209줄 (CTE 쿼리 + area filter + 행 검증)
  - `fetch-safety.ts`: 53줄 (배치 안전 데이터 조회)
  - `scoring-pipeline.ts`: 191줄 (후보별 스코어링 병렬 처리)
  - `api-error.ts`: 115줄 (공통 에러 응답 + 로깅)
- 기능 변경 없음 — 순수 구조 리팩토링
- 후속 액션: 배포 후 API 동일성 검증

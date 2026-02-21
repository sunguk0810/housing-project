---
plan-id: "2026-02-20_claude-code_drizzle-baseline-reset"
status: "done"
phase: "PHASE1"
template-version: "1.1"
work-type: "infra"
---

# Drizzle ORM - DB 스키마 - 마이그레이션 SQL 정합성 복구

## 목표

Drizzle 마이그레이션 추적 시스템 (journal, snapshot, __drizzle_migrations) 정합성 복구.
Fresh Baseline 방식으로 기존 5개 마이그레이션을 아카이브하고, 현재 TS 스키마에서 단일 베이스라인을 생성하여 drizzle-kit 워크플로우를 정상화한다.

## 범위

- **수정 대상**: drizzle/ (journal, snapshot, SQL), __drizzle_migrations DB 테이블
- **신규**: scripts/sync-drizzle-baseline.ts (1회용 동기화 스크립트)
- **참조 (수정 없음)**: src/db/schema/index.ts, src/db/types/geometry.ts, drizzle.config.ts, src/db/connection.ts
- SoT 참조: PHASE1 S2 스키마 정의 (docs/PHASE1_design.md)

## 작업 단계

1. 사전 검증 (DB 스키마 + 추적 테이블 상태)
2. 기존 마이그레이션 아카이브
3. 베이스라인 마이그레이션 생성 (drizzle-kit generate)
4. 사전 상태 점검 + 해시 검증
5. 동기화 스크립트 작성 및 실행
6. 최종 검증 (migrate/generate/build)
7. 정리

## 검증 기준

- [x] `__drizzle_migrations` 보정 스크립트 안전 실행 (사전 해시 검증 + 트랜잭션 + 백업)
- [x] `drizzle-kit migrate` → "migrations applied successfully" (exit 0, 추가 행 없음)
- [x] `drizzle-kit generate` → "No schema changes, nothing to migrate" (파일 수 동일, journal 변경 없음)
- [x] `__drizzle_migrations`에 정확히 1건, hash=`7cb3d452...`
- [x] `_journal.json`에 정확히 1개의 엔트리 (tag=`0000_heavy_tarantula`)
- [x] `0000_snapshot.json`이 13개 테이블 + `geometry(Point, 4326)` + `geometry(Polygon, 4326)` 포함
- [x] `pnpm run build` 성공

## 결과/결정

- 상태: `done`
- 접근법: Fresh Baseline (패치 대비 복잡도 낮고 정합성 보장)
- 아카이브: `drizzle/_archived/20260220_105727_baseline_reset/` (기존 0000-0004 SQL + 스냅샷 + journal + DB 백업)
- 베이스라인: `drizzle/0000_heavy_tarantula.sql` (13테이블 전체)
- 1회용 스크립트: `scripts/sync-drizzle-baseline.ts` — 완료 후 삭제 가능
- 향후 워크플로우: TS 스키마 변경 → `drizzle-kit generate` → `drizzle-kit migrate`

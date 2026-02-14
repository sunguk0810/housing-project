---
plan-id: "2026-02-14_codex_phase1-schema-sql-migration"
status: "done"
phase: "PHASE1"
template-version: "1.1"
work-type: "infra"
---
# Plan Execute: phase1-schema-sql-migration

## 목표

PHASE1 설계 정본(`docs/PHASE1_design.md > S2`)을 기준으로 DB 스키마 SQL을 파생하고, 로컬 Docker 인프라(PostgreSQL+PostGIS/Redis) 및 마이그레이션 스크립트를 구현한다.

## 범위

- In Scope:
  - `compose.yml` 신규 작성 (PostGIS + Redis)
  - `.env.example`에 PostgreSQL/DATABASE_URL 기본값 추가
  - `db/schema.sql` 생성 (S2 테이블 6개 + 인덱스 6개 1:1)
  - `db/migrate.sh` 생성 (Docker exec 기반 스키마 적용)
  - 필수 검증 명령 실행 및 결과 기록
- Out of Scope:
  - `docs/PHASE1_design.md` 수정 (SoT 읽기 전용)
  - 애플리케이션 코드/TypeScript 변경
- 참조 SoT:
  - `docs/PHASE1_design.md > S2`

## 작업 단계

1. SoT S2 스키마를 SQL 파일로 1:1 파생한다.
2. Docker Compose로 PostGIS/Redis 로컬 인프라를 구성한다.
3. 마이그레이션 스크립트를 작성하고 실행 권한을 부여한다.
4. 정적 검증(`head`, `wc`, `bash -n`) 및 Docker 기반 동작 검증을 수행한다.
5. plan 상태를 최종 확정하고 인덱스(`docs/plan/README.md`)를 갱신한다.

## 검증 기준

1. `db/schema.sql` 상단에 `CREATE EXTENSION IF NOT EXISTS postgis;`가 존재한다.
2. S2 기준 테이블 6개, 인덱스 6개가 존재한다.
3. `db/migrate.sh`가 스크립트 기준 경로 계산 + docker exec 기반 적용 로직을 가진다.
4. `bash -n db/migrate.sh`가 통과한다.
5. `docker compose config --quiet`가 통과한다.

## 결과/결정

- 상태: `done`
- 실행 결과:
  - `compose.yml` 신규 작성: PostgreSQL/PostGIS(`postgis/postgis:16-3.4`) + Redis(`redis:7-alpine`) 구성
  - `.env.example` 보완: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL` 포함
  - `db/schema.sql` 신규 작성: SoT(`docs/PHASE1_design.md > S2`) 기반 테이블 6개 + 인덱스 6개 반영
  - `db/migrate.sh` 신규 작성: 스크립트 기준 경로 계산 + Docker exec 기반 마이그레이션
  - `db/migrate.sh` 실행 권한 부여 완료
- 검증 결과:
  - `cat db/schema.sql | head -5` 통과 (`CREATE EXTENSION IF NOT EXISTS postgis;` 확인)
  - `wc -l db/schema.sql` 결과: `89`
  - `bash -n db/migrate.sh` 통과
  - `rg -n "^CREATE TABLE " db/schema.sql | wc -l` 결과: `6`
  - `rg -n "^CREATE INDEX " db/schema.sql | wc -l` 결과: `6`
  - `docker compose config --quiet` 통과
  - `docker compose up -d` 1차 시도 시 로컬 `6379` 포트 점유로 Redis 바인딩 실패(환경 이슈) 확인
  - `docker compose exec -T postgres psql -U housing -d housing -c "SELECT PostGIS_Version();"` 통과 (`3.4`)
  - `bash db/migrate.sh` 실행 통과 (6개 테이블, 6개 인덱스 생성 로그 확인)
  - `docker compose exec -T postgres psql -U housing -d housing -c "\\dt"`에서 `public` 스키마 앱 테이블 6개 확인
  - `docker compose exec -T postgres ...` SQL 검증:
    - 앱 테이블 수 `6`
    - 앱 인덱스 수 `6`
  - `docker compose down`으로 검증 인프라 정리 완료
- 결정:
  - S2 정합성 유지를 위해 `CREATE TABLE IF NOT EXISTS`는 도입하지 않고 원문 구조를 유지함
  - 로컬 `psql` 의존성 제거를 위해 컨테이너 내부 `psql` 실행 경로를 채택함

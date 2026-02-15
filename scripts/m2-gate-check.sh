#!/usr/bin/env bash
# M2 Gate Check Script
# Usage: bash scripts/m2-gate-check.sh <phase-number>
# Phases: 0-5

set -euo pipefail

PHASE="${1:-}"

if [[ -z "$PHASE" ]]; then
  echo "Usage: bash scripts/m2-gate-check.sh <phase-number>"
  echo "  0 - Session 0: Environment setup"
  echo "  1 - Session 1: DB + ORM"
  echo "  2 - Session 2: Mock + Seed"
  echo "  3 - Session 3: Engine modules"
  echo "  4 - Session 4: ETL + API"
  echo "  5 - Session 5: Tests (Final M2 gate)"
  exit 1
fi

echo "========================================"
echo "  M2 Gate Check — Phase $PHASE"
echo "========================================"

EXIT_CODE=0

check_pass() {
  echo "  [PASS] $1"
}

check_fail() {
  echo "  [FAIL] $1"
  EXIT_CODE=1
}

# Common checks
check_tsc() {
  echo "[Check] TypeScript compilation..."
  if pnpm tsc --noEmit 2>/dev/null; then
    check_pass "pnpm tsc --noEmit"
  else
    check_fail "pnpm tsc --noEmit"
  fi
}

check_build() {
  echo "[Check] Next.js build..."
  if pnpm build 2>/dev/null 1>/dev/null; then
    check_pass "pnpm build"
  else
    check_fail "pnpm build"
  fi
}

check_no_any() {
  echo "[Check] No 'any' type usage in src/..."
  ANY_COUNT=$(grep -rn ': any' src/ --include="*.ts" --include="*.tsx" \
    | grep -v 'node_modules' \
    | grep -v '// eslint-disable' \
    | grep -v 'as any' \
    | grep -v '\.d\.ts' \
    || true)
  ANY_COUNT=$(echo "$ANY_COUNT" | grep -c '.' || true)
  if [[ "$ANY_COUNT" -eq 0 ]]; then
    check_pass "No 'any' types found"
  else
    check_fail "Found $ANY_COUNT 'any' type usage(s)"
    grep -rn ': any' src/ --include="*.ts" --include="*.tsx" \
      | grep -v 'node_modules' \
      | grep -v '// eslint-disable' \
      | grep -v '\.d\.ts' \
      | head -10
  fi
}

check_forbidden_phrases() {
  echo "[Check] No forbidden phrases in src/..."
  FORBIDDEN=(
    "대출 가능 보장"
    "거래 성사 보장"
    "투자 수익 보장"
    "가장 안전한 지역 확정"
    "최적 투자 확정"
  )
  for phrase in "${FORBIDDEN[@]}"; do
    MATCHES=$(grep -rn "$phrase" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)
    if [[ -n "$MATCHES" ]]; then
      check_fail "Forbidden phrase found: '$phrase'"
      echo "$MATCHES"
    fi
  done

  # Check solo "추천" usage (without proper context)
  RECOMMEND_SOLO=$(grep -rn "추천" src/ --include="*.ts" --include="*.tsx" 2>/dev/null \
    | grep -v "분석 결과" \
    | grep -v "근거" \
    | grep -v "출처" \
    | grep -v "기준일" \
    | grep -v "//" \
    | grep -v "import" \
    | grep -v "recommendations" \
    | grep -v "RecommendRequest" \
    | grep -v "RecommendResponse" \
    | grep -v "recommend" || true)
  if [[ -n "$RECOMMEND_SOLO" ]]; then
    check_fail "Solo '추천' usage (without context):"
    echo "$RECOMMEND_SOLO" | head -5
  else
    check_pass "No forbidden solo '추천' usage"
  fi
}

check_no_pii_columns() {
  echo "[Check] No PII columns in DB schema..."
  PII_PATTERNS=("income" "salary" "cash" "personal_id" "phone" "email" "resident_number" "ssn")
  for pat in "${PII_PATTERNS[@]}"; do
    FOUND=$(grep -in "$pat" src/db/schema/*.ts 2>/dev/null | grep -v '//' | grep -v 'import' || true)
    if [[ -n "$FOUND" ]]; then
      check_fail "Possible PII column '$pat' in schema:"
      echo "$FOUND"
    fi
  done
  check_pass "No PII columns in DB schema"
}

# Phase-specific checks
case "$PHASE" in
  0)
    echo "[Gate 0] Environment setup verification"
    echo "[Check] Docker services..."
    if docker compose exec postgres psql -U housing -d housing -c "SELECT PostGIS_Version();" 2>/dev/null 1>/dev/null; then
      check_pass "PostGIS is available"
    else
      check_fail "PostGIS is not available"
    fi
    if docker compose exec redis redis-cli ping 2>/dev/null | grep -q PONG; then
      check_pass "Redis is available"
    else
      check_fail "Redis is not available"
    fi
    check_tsc
    check_build
    echo "[Check] Dependencies..."
    for pkg in drizzle-orm postgres ioredis zod; do
      if grep -q "\"$pkg\"" package.json 2>/dev/null; then
        check_pass "Package $pkg installed"
      else
        check_fail "Package $pkg missing"
      fi
    done
    for pkg in drizzle-kit vitest @vitejs/plugin-react @types/geojson; do
      if grep -q "\"$pkg\"" package.json 2>/dev/null; then
        check_pass "Dev package $pkg installed"
      else
        check_fail "Dev package $pkg missing"
      fi
    done
    ;;

  1)
    echo "[Gate 1] DB + ORM schema verification"
    FILES=(
      "src/db/types/geometry.ts"
      "src/db/schema/apartments.ts"
      "src/db/schema/prices.ts"
      "src/db/schema/childcare.ts"
      "src/db/schema/schools.ts"
      "src/db/schema/safety.ts"
      "src/db/schema/commute.ts"
      "src/db/schema/relations.ts"
      "src/db/schema/index.ts"
      "src/db/connection.ts"
      "drizzle.config.ts"
    )
    echo "[Check] File existence (11 files)..."
    for f in "${FILES[@]}"; do
      if [[ -f "$f" ]]; then
        check_pass "$f"
      else
        check_fail "$f missing"
      fi
    done
    check_tsc
    check_no_any
    ;;

  2)
    echo "[Gate 2] Mock + Seed verification"
    FILES=(
      "src/db/mock/constants.ts"
      "src/db/mock/apartments.ts"
      "src/db/mock/prices.ts"
      "src/db/mock/childcare.ts"
      "src/db/mock/schools.ts"
      "src/db/mock/safety.ts"
      "src/db/mock/commute.ts"
      "src/db/seed.ts"
    )
    echo "[Check] File existence (8 files)..."
    for f in "${FILES[@]}"; do
      if [[ -f "$f" ]]; then
        check_pass "$f"
      else
        check_fail "$f missing"
      fi
    done
    check_tsc
    echo "[Check] Seed script execution..."
    if [ -f .env ]; then set -a; source .env; set +a; fi
    if pnpm exec tsx src/db/seed.ts 2>&1 | tail -5; then
      check_pass "Seed script executed"
    else
      check_fail "Seed script failed"
    fi
    echo "[Check] Record counts..."
    COUNTS=$(docker compose exec -T postgres psql -U housing -d housing -t -c "
      SELECT 'apartments:' || count(*) FROM apartments
      UNION ALL SELECT 'prices:' || count(*) FROM apartment_prices
      UNION ALL SELECT 'childcare:' || count(*) FROM childcare_centers
      UNION ALL SELECT 'schools:' || count(*) FROM schools
      UNION ALL SELECT 'safety:' || count(*) FROM safety_stats
      UNION ALL SELECT 'commute:' || count(*) FROM commute_grid;" 2>/dev/null || echo "DB query failed")
    echo "$COUNTS"
    ;;

  3)
    echo "[Gate 3] Engine modules verification"
    FILES=(
      "src/types/engine.ts"
      "src/lib/redis.ts"
      "src/lib/logger.ts"
      "src/lib/engines/normalize.ts"
      "src/lib/engines/budget.ts"
      "src/lib/engines/spatial.ts"
      "src/lib/engines/commute.ts"
      "src/lib/engines/scoring.ts"
      "src/lib/engines/index.ts"
    )
    echo "[Check] File existence (9 files)..."
    for f in "${FILES[@]}"; do
      if [[ -f "$f" ]]; then
        check_pass "$f"
      else
        check_fail "$f missing"
      fi
    done
    check_tsc
    check_no_any
    check_forbidden_phrases
    ;;

  4)
    echo "[Gate 4] ETL + Validators + API Routes verification"
    FILES=(
      "src/etl/types.ts"
      "src/etl/adapters/molit.ts"
      "src/etl/adapters/mohw.ts"
      "src/etl/adapters/moe.ts"
      "src/etl/adapters/mois.ts"
      "src/etl/adapters/kakao-geocoding.ts"
      "src/etl/runner.ts"
      "src/lib/validators/recommend.ts"
      "src/lib/validators/apartment.ts"
      "src/lib/validators/index.ts"
      "src/types/api.ts"
      "src/types/db.ts"
      "src/types/index.ts"
      "src/app/api/recommend/route.ts"
      "src/app/api/apartments/[id]/route.ts"
      "src/app/api/health/route.ts"
    )
    echo "[Check] File existence (16 files)..."
    for f in "${FILES[@]}"; do
      if [[ -f "$f" ]]; then
        check_pass "$f"
      else
        check_fail "$f missing"
      fi
    done
    check_tsc
    check_build
    check_no_any
    check_forbidden_phrases
    check_no_pii_columns
    ;;

  5)
    echo "[Gate 5] Tests (Final M2 gate)"
    FILES=(
      "vitest.config.ts"
      "tests/unit/budget.test.ts"
      "tests/unit/scoring.test.ts"
      "tests/unit/commute.test.ts"
      "tests/unit/spatial.test.ts"
      "tests/unit/validators.test.ts"
      "tests/integration/api.test.ts"
      "tests/compliance/compliance.test.ts"
      "tests/bench/recommend.bench.ts"
    )
    echo "[Check] File existence (9 files)..."
    for f in "${FILES[@]}"; do
      if [[ -f "$f" ]]; then
        check_pass "$f"
      else
        check_fail "$f missing"
      fi
    done
    echo "[Check] Vitest run..."
    if pnpm vitest run 2>&1; then
      check_pass "All tests passed"
    else
      check_fail "Some tests failed"
    fi
    check_no_any
    check_forbidden_phrases
    check_no_pii_columns
    echo ""
    echo "===== FINAL M2 VERIFICATION ====="
    echo "[Check] Total file count..."
    TOTAL=$(find src/db src/lib/engines src/lib/redis.ts src/lib/logger.ts src/lib/validators src/etl src/types src/app/api tests drizzle.config.ts vitest.config.ts -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
    echo "  Total M2 files: $TOTAL (target: 53, spec 52 - utils.ts existing + normalize.ts + constants.ts)"
    check_tsc
    check_build
    ;;

  *)
    echo "Unknown phase: $PHASE"
    echo "Valid phases: 0, 1, 2, 3, 4, 5"
    exit 1
    ;;
esac

echo ""
echo "========================================"
if [[ "$EXIT_CODE" -eq 0 ]]; then
  echo "  Gate $PHASE: PASSED"
else
  echo "  Gate $PHASE: FAILED"
fi
echo "========================================"

exit $EXIT_CODE

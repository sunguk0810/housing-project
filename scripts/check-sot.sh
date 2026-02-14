#!/usr/bin/env bash
set -euo pipefail

PHASE0_KEYWORDS=(
  "concierge_contact_click"
  "concierge_unique_view"
  "inquiry_click"
  "min_input_complete"
  "min_input_start"
  "result_view"
  "landing_unique_view"
  "outlink_click"
  "consent_shown"
  "consent_accepted"
)

PHASE1_KEYWORDS=(
  "CREATE TABLE"
  "scoring_weight"
  "normalize_score"
  "commute_grid"
  "safety_stats"
  "childcare_centers"
)

PHASE0_TARGET_FILES=(
  "docs/PHASE1_design.md"
  "docs/PHASE2_build.md"
  "docs/PHASE3_verify.md"
  "docs/PHASE4_ship_learn.md"
)

PHASE1_TARGET_FILES=(
  "docs/PHASE0_ground.md"
  "docs/PHASE2_build.md"
  "docs/PHASE3_verify.md"
  "docs/PHASE4_ship_learn.md"
)

violations=0

check_set() {
  local set_name="$1"
  shift

  local -a keywords=()
  while [[ "$1" != "--" ]]; do
    keywords+=("$1")
    shift
  done
  shift

  local -a files=("$@")

  for file in "${files[@]}"; do
    if [[ ! -f "$file" ]]; then
      echo "[SKIP] $file (not found)"
      continue
    fi

    # Exclude fenced code blocks using awk state toggling.
    while IFS=$'\t' read -r line_num line_content; do
      for keyword in "${keywords[@]}"; do
        if echo "$line_content" | grep -Fq -- "$keyword"; then
          if [[ "$file" == "docs/PHASE4_ship_learn.md" ]] && [[ "$keyword" == "result_view" ]]; then
            if echo "$line_content" | grep -Eq '>= *[0-9]+'; then
              continue
            fi
          fi

          echo "[SOT VIOLATION][$set_name] $keyword in $file:$line_num"
          violations=$((violations + 1))
        fi
      done
    done < <(
      awk '
        /^```/ { in_fence = !in_fence; next }
        in_fence { next }
        { printf("%d\t%s\n", NR, $0) }
      ' "$file"
    )
  done
}

check_set "PHASE0-only" "${PHASE0_KEYWORDS[@]}" -- "${PHASE0_TARGET_FILES[@]}"
check_set "PHASE1-only" "${PHASE1_KEYWORDS[@]}" -- "${PHASE1_TARGET_FILES[@]}"

if ((violations > 0)); then
  echo "SoT check failed: $violations violation(s)."
  exit 1
fi

echo "SoT check passed."
exit 0

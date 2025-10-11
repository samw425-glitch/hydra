#!/usr/bin/env bash
#
# Hydra Universal Runner
# Sequentially runs all *generate*, *spawn*, *test*, and *hydra* files.
# - Executes each file from its original directory (keeps context)
# - Streams output line-by-line with timestamps
# - Never aborts on errors
# - Logs to ./hydra_run/results.csv and ./hydra_run/combined.log
# - Skips non-runnable outputs (.csv, .json, .html, etc.)
#

set -u
WORKDIR="./hydra_run"
RESULTS_CSV="${WORKDIR}/results.csv"
COMBINED_LOG="${WORKDIR}/combined.log"
mkdir -p "$WORKDIR"

SEARCH_PATTERNS=("generate" "spawn" "test" "hydra-spawner" "hydra-spawn" "sub_gen" "hgenerate" "spawn_containers" "regenerate" "generate-redirects")
EXCLUDE_DIRS=("$(basename "$WORKDIR")" ".git" "node_modules" "vendor" "dist" "public")

timestamp() { date +"%Y-%m-%d %H:%M:%S"; }
ts_file() { date +"%Y%m%d_%H%M%S"; }

# Initialize results file
if [ ! -f "$RESULTS_CSV" ]; then
  echo "timestamp,filename,exit_code,duration_s" > "$RESULTS_CSV"
fi

echo "$(timestamp) [controller] Searching for files matching patterns..."
FOUND_FILES=()

for pattern in "${SEARCH_PATTERNS[@]}"; do
  while IFS= read -r f; do
    skip=false
    for ex in "${EXCLUDE_DIRS[@]}"; do
      [[ "$f" == *"/$ex/"* ]] && skip=true && break
    done
    [[ "$skip" == true ]] && continue
    [[ "$f" =~ \.(csv|json|html|log|txt)$ ]] && continue
    FOUND_FILES+=("$f")
  done < <(find . -type f -iname "*${pattern}*" 2>/dev/null)
done

# Deduplicate and sort list
mapfile -t FOUND_FILES < <(printf "%s\n" "${FOUND_FILES[@]}" | sort -u)
echo "$(timestamp) [controller] Found ${#FOUND_FILES[@]} file(s)."
echo -e "\n=== Running files sequentially (streaming output). Press Ctrl-C to abort gracefully. ===\n"

# Run each file
for f in "${FOUND_FILES[@]}"; do
  base=$(basename "$f")
  ext="${base##*.}"
  dir=$(dirname "$f")
  log_file="${WORKDIR}/${base//[^a-zA-Z0-9_.-]/_}_$(ts_file).log"

  echo "$(timestamp) [controller] Running $f ..."
  start=$(date +%s)

  (
    cd "$dir" || exit 1
    case "$ext" in
      sh) bash "$base" ;;
      js|cjs|mjs) node "$base" ;;
      py) python3 "$base" ;;
      *) echo "⚠️ Skipping unsupported file type: $ext" ;;
    esac
  ) 2>&1 | awk -v ts="$(timestamp)" '{print strftime("[%Y-%m-%d %H:%M:%S]"), $0; fflush();}' | tee "$log_file" >> "$COMBINED_LOG"

  exit_code=${PIPESTATUS[0]}
  end=$(date +%s)
  duration=$((end - start))
  echo "$(timestamp) [controller] Completed $base (exit_code=${exit_code}, duration=${duration}s)" | tee -a "$COMBINED_LOG"

  echo "$(timestamp),${base},${exit_code},${duration}" >> "$RESULTS_CSV"
done

echo -e "\n=== All runs complete ==="
echo "Results CSV: ${RESULTS_CSV}"
echo "Combined log: ${COMBINED_LOG}"
echo "Per-run logs: ${WORKDIR}/*.log"

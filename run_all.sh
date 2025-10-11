#!/usr/bin/env bash
set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$SCRIPT_DIR/scripts"
GEN_DIR="$SCRIPTS_DIR/gen"
LOGDIR="${SCRIPT_DIR}/logs"
RESULTS_CSV="${LOGDIR}/results.csv"
COMBINED_LOG="${LOGDIR}/combined.log"
mkdir -p "$LOGDIR"
timestamp() { date +"%Y-%m-%d %H:%M:%S"; }
echo "[$(timestamp)] [INFO] Starting full Hydra automation..." | tee -a "$COMBINED_LOG"
if [[ ! -d "$GEN_DIR" ]]; then
  echo "[$(timestamp)] [ERROR] Gen directory not found: $GEN_DIR" | tee -a "$COMBINED_LOG"
  exit 1
fi
shopt -s nullglob
scripts=( "$GEN_DIR"/*.sh )
shopt -u nullglob
if [[ ${#scripts[@]} -eq 0 ]]; then
  echo "[$(timestamp)] [WARN] No scripts found in $GEN_DIR (nothing to run)." | tee -a "$COMBINED_LOG"
  exit 0
fi
if [[ ! -f "$RESULTS_CSV" ]]; then
  echo "timestamp,script,exit_code" > "$RESULTS_CSV"
fi
for script in "${scripts[@]}"; do
  echo "[$(timestamp)] [INFO] Preparing to run: $script" | tee -a "$COMBINED_LOG"
  if [[ ! -x "$script" ]]; then
    chmod +x "$script" || {
      echo "[$(timestamp)] [ERROR] Failed to chmod +x $script" | tee -a "$COMBINED_LOG"
    }
  fi
  echo "[$(timestamp)] [INFO] Running $script ..." | tee -a "$COMBINED_LOG"
  start_ts="$(date +%s)"
  if output="$("$script" 2>&1)"; then
    exit_code=0
    echo "[$(timestamp)] [OK] $script completed successfully." | tee -a "$COMBINED_LOG"
  else
    exit_code=$?
    echo "[$(timestamp)] [FAIL] $script failed with exit code $exit_code." | tee -a "$COMBINED_LOG"
  fi
  end_ts="$(date +%s)"
  duration=$((end_ts - start_ts))
  safe_name="$(basename "$script" | sed 's/[^a-zA-Z0-9._-]/_/g')"
  out_file="$LOGDIR/${safe_name}.$(date +%Y%m%d%H%M%S).log"
  printf '%s\n' "$output" > "$out_file"
  echo "[$(timestamp)] [INFO] $script exit=$exit_code duration=${duration}s output_log=$out_file" | tee -a "$COMBINED_LOG"
  echo "$(date +"%Y-%m-%d %H:%M:%S"),$safe_name,$exit_code" >> "$RESULTS_CSV"
done
echo "[$(timestamp)] [INFO] Completed running gen scripts." | tee -a "$COMBINED_LOG"
exit 0

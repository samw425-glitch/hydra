#!/usr/bin/env bash
# inspect.sh - Hydra project file inspector & runner
# v1.0 - runs all generators/spawners/tests gracefully, logs output, CSV report

set -euo pipefail
IFS=$'\n\t'

WORKDIR="${PWD}"
OUTDIR="${WORKDIR}/hydra_run"
COMBINED_LOG="${OUTDIR}/combined.log"
RESULTS_CSV="${OUTDIR}/results.csv"

mkdir -p "$OUTDIR"

timestamp(){ date +"%Y-%m-%d %H:%M:%S"; }

# ------------------- helper functions -------------------

log_and_run(){
  local script="$1"
  shift
  local logfile="${OUTDIR}/$(basename "$script").log"
  local rotlog="${OUTDIR}/$(basename "$script")_$(date +%Y%m%d_%H%M%S).log"
  local exitcode=0

  echo -e "\n\n===== START: $script ($(timestamp)) =====" | tee -a "$COMBINED_LOG" "$logfile"
  echo "Running: $script $*" | tee -a "$COMBINED_LOG" "$logfile"

  # choose runner by extension
  case "$script" in
    *.sh) bash "$script" "$@" 2>&1 | tee -a "$COMBINED_LOG" "$logfile" || exitcode=$? ;;
    *.js|*.cjs|*.mjs) node "$script" "$@" 2>&1 | tee -a "$COMBINED_LOG" "$logfile" || exitcode=$? ;;
    *.py) python3 "$script" "$@" 2>&1 | tee -a "$COMBINED_LOG" "$logfile" || exitcode=$? ;;
    *) sh "$script" "$@" 2>&1 | tee -a "$COMBINED_LOG" "$logfile" || exitcode=$? ;;
  esac

  echo -e "\n===== END: $script exit=$exitcode ($(timestamp)) =====" | tee -a "$COMBINED_LOG" "$logfile"
  cp "$logfile" "$rotlog" 2>/dev/null || true

  # append to CSV
  local size mtime
  size=$(stat -c %s "$script" 2>/dev/null || echo 0)
  mtime=$(stat -c %y "$script" 2>/dev/null || echo "")
  printf '%s,%s,%s,%s,"%s",%s\n' \
    "$(basename "$script")" "$(basename "$script")" "$script" "$size" "$mtime" "$exitcode" >> "$RESULTS_CSV"

  echo "→ logged to $logfile (archived $rotlog). exit=$exitcode" | tee -a "$COMBINED_LOG"
}

# ------------------- run all scripts -------------------

cmd_run_all(){
  echo "===== RUN-ALL START $(timestamp) =====" | tee -a "$COMBINED_LOG"

  # init CSV
  printf "script,basename,path,size_bytes,mtime,exit_code\n" > "$RESULTS_CSV"

  # define execution order patterns
  local patterns=("hgenerate-*" "spawn-*" "generate-*" "run-*" "test-*" "*-spawn-*" "spawned-*")

  for pat in "${patterns[@]}"; do
    shopt -s nullglob
    for script in $pat; do
      [[ -f "$script" ]] || continue
      log_and_run "$script"
    done
    shopt -u nullglob
  done

  echo "===== RUN-ALL COMPLETE $(timestamp) =====" | tee -a "$COMBINED_LOG"
  echo "Combined log: $COMBINED_LOG"
  echo "Results CSV: $RESULTS_CSV"
}

# ------------------- CSV join helper -------------------

cmd_csv_join(){
  local out="${1:-results.csv}"
  local dir="${2:-.}"
  printf "name,size_bytes,mtime,type\n" > "$out"
  find "$dir" -maxdepth 1 -mindepth 1 -print0 \
    | while IFS= read -r -d '' f; do
        name=$(basename "$f")
        size=$(stat -c %s "$f" 2>/dev/null || echo 0)
        mtime=$(stat -c %y "$f" 2>/dev/null || echo "")
        ftype=$(file -b --mime-type "$f" 2>/dev/null || echo "")
        printf '%s,%s,"%s",%s\n' "$name" "$size" "$mtime" "$ftype"
      done >> "$out"
  echo "Wrote CSV -> $out"
}

# ------------------- dispatch -------------------

cmd="${1:-help}"; shift || true

case "$cmd" in
  run-all) cmd_run_all "$@";;
  run)
    if [[ "${1:-}" == "all" ]]; then
      shift
      cmd_run_all "$@"
    else
      echo "Please specify a script to run: ./inspect.sh run <script>"
      exit 1
    fi
    ;;
  csv-join) cmd_csv_join "$@";;
  help|--help|-h)
    sed -n '1,999p' "$0"
    ;;
  *)
    echo "Unknown command: $cmd"
    echo "Usage: $0 help"
    exit 2
    ;;
esac

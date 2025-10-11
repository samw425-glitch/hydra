#!/usr/bin/env bash
# run_all_live.sh - Live line-by-line execution of all scripts in hydra_run

WORKDIR="./hydra_run"
RESULTS_CSV="$WORKDIR/results.csv"
COMBINED_LOG="$WORKDIR/combined.log"
DEFAULT_DOMAIN="example.com"

mkdir -p "$WORKDIR"
touch "$RESULTS_CSV" "$COMBINED_LOG"

timestamp() { date +"%Y-%m-%d %H:%M:%S"; }

# Rename hgenerate-* to generate-*
for f in "$WORKDIR"/hgenerate-*; do
    [[ -f "$f" ]] || continue
    mv "$f" "${f/hgenerate-/generate-}"
done

# Function to run a single file live
run_file() {
    local file="$1"
    local basefile
    basefile=$(basename "$file")
    local logfile="$WORKDIR/${basefile}_$(date +"%Y%m%d_%H%M%S").log"

    echo -e "\033[1;34m[$(timestamp)] Running $basefile ...\033[0m" | tee -a "$COMBINED_LOG"

    if [[ "$file" == *.sh ]]; then
        bash -x "$file" 2>&1 | while IFS= read -r line; do
            echo "[$(timestamp)] $line" | tee -a "$logfile"
        done
    elif [[ "$file" == *.js || "$file" == *.cjs ]]; then
        node "$file" "$DEFAULT_DOMAIN" 2>&1 | while IFS= read -r line; do
            echo "[$(timestamp)] $line" | tee -a "$logfile"
        done
    else
        echo "[$(timestamp)] Skipping unknown file type: $file" | tee -a "$COMBINED_LOG"
        return
    fi

    # Capture exit code of the executed script
    local exit_code=${PIPESTATUS[0]}
    echo "[$(timestamp)] Completed $basefile (exit_code=$exit_code)" | tee -a "$COMBINED_LOG"
    echo "$(timestamp),$basefile,$exit_code,$logfile" >> "$RESULTS_CSV"
}

# Run all scripts in WORKDIR, ignoring logs, CSVs, etc.
shopt -s nullglob
for f in "$WORKDIR"/*; do
    [[ -f "$f" ]] || continue
    case "$f" in
        *.sh|*.js|*.cjs) run_file "$f" ;;
        *) echo "[$(timestamp)] Skipping non-script file: $f" | tee -a "$COMBINED_LOG" ;;
    esac
done

echo -e "\033[1;33m=== All done. Logs: $COMBINED_LOG, CSV: $RESULTS_CSV ===\033[0m"

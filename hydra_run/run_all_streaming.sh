#!/usr/bin/env bash
# run_all_live_human.sh - Line-by-line live execution with human-friendly timestamps

WORKDIR="./hydra_run"
RESULTS_CSV="$WORKDIR/results.csv"
COMBINED_LOG="$WORKDIR/combined.log"
DEFAULT_DOMAIN="example.com"

mkdir -p "$WORKDIR"
touch "$RESULTS_CSV" "$COMBINED_LOG"

# Human-readable timestamp
timestamp() { date +"%b %d %H:%M:%S"; }

# Rename hgenerate-* to generate-*
for f in "$WORKDIR"/hgenerate-*; do
    [[ -f "$f" ]] || continue
    mv "$f" "${f/hgenerate-/generate-}"
done

# Run a single file live
run_file() {
    local file="$1"
    local logfile="$WORKDIR/$(basename "$file")_$(date +"%Y%m%d_%H%M%S").log"

    echo -e "\033[1;34m[$(timestamp)] Running $file ...\033[0m" | tee -a "$COMBINED_LOG"

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

    local exit_code=${PIPESTATUS[0]}
    echo "[$(timestamp)] Completed $file (exit_code=$exit_code)" | tee -a "$COMBINED_LOG"
    echo "$(timestamp),$file,$exit_code,$logfile" >> "$RESULTS_CSV"
}

# Run all scripts in the folder
for f in "$WORKDIR"/*.{sh,js,cjs}; do
    [[ -f "$f" ]] || continue
    run_file "$f"
done

echo -e "\033[1;33m=== All done. Logs: $COMBINED_LOG, CSV: $RESULTS_CSV ===\033[0m"

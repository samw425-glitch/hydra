#!/usr/bin/env bash
#
# run_all_folder.sh
# 1) Rename hgenerate-* -> generate-*
# 2) Run all scripts in the folder sequentially
# 3) Log output and store results in CSV
#

set -u

WORKDIR="./hydra_run"
RESULTS_CSV="${WORKDIR}/results.csv"
COMBINED_LOG="${WORKDIR}/combined.log"
DEFAULT_DOMAIN="example.com"

mkdir -p "$WORKDIR"
touch "$RESULTS_CSV" "$COMBINED_LOG"

timestamp() { date +"%Y-%m-%d %H:%M:%S"; }
ts_file() { date +"%Y%m%d_%H%M%S"; }

# --- Rename hgenerate-* to generate-* ---
echo "=== Renaming hgenerate-* -> generate-* ==="
for f in "$WORKDIR"/hgenerate-*; do
    [[ -f "$f" ]] || continue
    new_name="${f/hgenerate-/generate-}"
    mv "$f" "$new_name"
    echo "$(timestamp) Renamed $f -> $new_name" | tee -a "$COMBINED_LOG"
done

# --- Function to run scripts ---
bash_or_node() {
    local file="$1"
    if [[ "$file" == *.sh ]]; then
        bash "$@"
    elif [[ "$file" == *.js || "$file" == *.cjs ]]; then
        node "$@"
    else
        echo "Skipping unknown file type: $file"
    fi
}

run_script() {
    local script="$1"
    local logfile="$WORKDIR/$(basename "$script")_$(ts_file).log"
    local start_ts=$(date +%s)

    echo -e "\033[1;34m[$(timestamp)] Running $script ...\033[0m" | tee -a "$COMBINED_LOG"

    # Provide default domain if script expects one
    if [[ "$script" == *sub_gen* || "$script" == *generate* || "$script" == *test* ]]; then
        bash_or_node "$script" "$DEFAULT_DOMAIN" | tee -a "$logfile"
    else
        bash_or_node "$script" | tee -a "$logfile"
    fi

    local exit_code=${PIPESTATUS[0]}
    local end_ts=$(date +%s)
    local duration=$((end_ts - start_ts))

    # Color-coded output
    if [[ $exit_code -eq 0 ]]; then
        echo -e "\033[1;32m[$(timestamp)] Completed $script (exit_code=$exit_code, duration=${duration}s)\033[0m" | tee -a "$COMBINED_LOG"
    else
        echo -e "\033[1;31m[$(timestamp)] Completed $script (exit_code=$exit_code, duration=${duration}s) ⚠\033[0m" | tee -a "$COMBINED_LOG"
    fi

    echo "$(timestamp),$script,$exit_code,$duration,$logfile" >> "$RESULTS_CSV"
}

# --- Collect all scripts in folder ---
FILES=()
while IFS= read -r f; do
    FILES+=("$f")
done < <(find "$WORKDIR" -maxdepth 1 -type f \( -iname "*" \) | sort)

# --- Run sequentially ---
for script in "${FILES[@]}"; do
    run_script "$script"
done

echo "=== All done. Results logged to $RESULTS_CSV and $COMBINED_LOG ==="

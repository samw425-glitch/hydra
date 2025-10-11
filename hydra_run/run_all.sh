#!/usr/bin/env bash
set -euo pipefail

WORKDIR="$(pwd)/scripts"
DATA_DIR="$(pwd)/data"
LOG_DIR="$(pwd)/logs"

mkdir -p "$LOG_DIR" "$DATA_DIR"

timestamp() { date +"%Y-%m-%d %H:%M:%S"; }

log() { echo "[$(timestamp)] $1"; }

# --- Step 1: Spawn containers ---
log "Starting container spawn..."
bash "$WORKDIR/spawn-spawn_containers.sh" 2>&1 | tee "$LOG_DIR/spawn_containers.log"

# Wait for CSV file to be generated
CSV_FILE="$DATA_DIR/spawned-containers.csv"
for i in {1..10}; do
    if [[ -f "$CSV_FILE" ]]; then
        log "Spawned containers CSV found."
        break
    fi
    log "Waiting for spawned containers CSV..."
    sleep 2
done
[[ -f "$CSV_FILE" ]] || { log "ERROR: CSV not found. Exiting."; exit 1; }

# --- Step 2: Generate webpage ---
log "Generating webpage..."
node "$WORKDIR/hgenerate-generate-webpage.js" "$CSV_FILE" 2>&1 | tee "$LOG_DIR/generate_webpage.log"

# --- Step 3: Generate redirects ---
log "Generating redirects..."
node "$WORKDIR/hgenerate-generate-redirects.js" "$CSV_FILE" 2>&1 | tee "$LOG_DIR/generate_redirects.log"

# --- Step 4: Regenerate Nginx config ---
CNAME_FILE="$DATA_DIR/cname_ready.txt"
if [[ ! -f "$CNAME_FILE" ]]; then
    log "Creating dummy cname_ready.txt for safety..."
    touch "$CNAME_FILE"
fi

log "Regenerating Nginx configs..."
bash "$WORKDIR/hgenerate-regenerate_nginx.sh" 2>&1 | tee "$LOG_DIR/regenerate_nginx.log"

# --- Step 5: Final report ---
log "All steps completed successfully."

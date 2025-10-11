#!/bin/bash
# start_500.sh
# Launch 50 instances each of 10 service types under PM2.
# Each instance gets a unique port based on the service base port.
#
# Usage:
#   chmod +x ~/hydra/scripts/start_500.sh
#   ~/hydra/scripts/start_500.sh

set -euo pipefail

BASE_DIR="$HOME/hydra/api-catalog"
LOG_DIR="$HOME/hydra/logs"
SCRIPT_DIR="$HOME/hydra/scripts"
mkdir -p "$LOG_DIR" "$BASE_DIR" "$SCRIPT_DIR"

# Ensure pm2 installed (install globally if missing)
if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 not found — installing globally (requires sudo)..."
  sudo npm install -g pm2
fi

# Number of instances per service
INSTANCES=50

# Base ports for each service (adjust if you want)
BASE_PORT_WORKER=5000
BASE_PORT_UPLOADER=6000
BASE_PORT_CLICKTRACKER=7000
BASE_PORT_CONTENTGEN=8000
BASE_PORT_UTM=9000
BASE_PORT_BACKLINK=10000
BASE_PORT_INDEXING=11000
BASE_PORT_WEBPAGE=3000    # single website typically one instance, but we will still create 50 as requested
BASE_PORT_API=4000
BASE_PORT_LANDING=4500

# Services and their base ports (name => base_port)
declare -A SERVICES
SERVICES=(
  ["worker"]=$BASE_PORT_WORKER
  ["click-tracker"]=$BASE_PORT_CLICKTRACKER
  ["uploader"]=$BASE_PORT_UPLOADER
  ["contentgen"]=$BASE_PORT_CONTENTGEN
  ["utm"]=$BASE_PORT_UTM
  ["backlinking"]=$BASE_PORT_BACKLINK
  ["indexing"]=$BASE_PORT_INDEXING
  ["webpage"]=$BASE_PORT_WEBPAGE
  ["api"]=$BASE_PORT_API
  ["landing"]=$BASE_PORT_LANDING
)

# Placeholder app content (plain Node http, no external deps)
read -r -d '' PLACEHOLDER <<'JS'
const http = require('http');
const url = require('url');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'service';

function json(res, obj, code=200){
  res.writeHead(code, {'Content-Type':'application/json'});
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  const path = url.parse(req.url).pathname || '/';
  if (path === '/health') return json(res, {service: SERVICE_NAME, status:'ok', port: PORT});
  if (path === '/status') return json(res, {service: SERVICE_NAME, status:'running', port: PORT});
  if (path === '/task') return json(res, {task: 'none', service: SERVICE_NAME});
  if (path === '/metrics') return json(res, {cpu: '0%', mem: '0mb', service: SERVICE_NAME});
  if (path === '/info') return json(res, {service: SERVICE_NAME, port: PORT});
  // default
  json(res, {service: SERVICE_NAME, path, port: PORT, message: 'placeholder'});
});

server.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} placeholder running on port ${PORT}`);
});
JS

# Function to ensure placeholder script exists
ensure_script() {
  local svc_dir="$BASE_DIR/$1"
  local script_path="$svc_dir/index.js"
  if [ ! -f "$script_path" ]; then
    mkdir -p "$svc_dir"
    echo "Creating placeholder for $1 -> $script_path"
    printf "%s\n" "$PLACEHOLDER" > "$script_path"
  fi
}

# Start instances
for svc in "${!SERVICES[@]}"; do
  base=${SERVICES[$svc]}
  echo "=== Starting service group: $svc  (base port $base) ==="
  for ((i=0;i<INSTANCES;i++)); do
    port=$((base + i))
    ensure_script "$svc"
    pm2_name="${svc}-${port}"
    # If already running with same pm2 name, skip (prevents duplicates)
    if pm2 describe "$pm2_name" >/dev/null 2>&1; then
      echo "Skipping existing pm2 process $pm2_name"
      continue
    fi
    pm2 start "$BASE_DIR/$svc/index.js" \
      --name "$pm2_name" \
      --output "$LOG_DIR/$pm2_name.out.log" \
      --error  "$LOG_DIR/$pm2_name.err.log" \
      --env PORT="$port" \
      --env SERVICE_NAME="$svc" \
      --no-autorestart
    echo "Started $pm2_name on port $port"
    # tiny pause to avoid overwhelming the system
    sleep 0.03
  done
done

# Save PM2 list so it resurrects on reboot
pm2 save

echo "✅ All services started (requested $INSTANCES instances each)."
echo "Check 'pm2 ls' and logs in $LOG_DIR"

#!/bin/bash
# start_hydra_optimized.sh - Optimized Hydra starter

set -euo pipefail

BASE_DIR="$HOME/hydra"
LOG_DIR="$BASE_DIR/logs"
mkdir -p "$LOG_DIR"

echo "🐉 Starting Optimized Hydra Ecosystem..."

# Services configuration
declare -A SERVICES
SERVICES=(
    ["orchestrator"]="api-catalog/orchestrator.js:8080:1"
    ["worker"]="api-catalog/worker/worker.js:5000:3"
    ["uploader"]="api-catalog/uploader/index.js:6000:3"
    ["click-tracker"]="api-catalog/click/server.js:7000:3"
    ["landing"]="api-catalog/landing/index.js:4500:2"
)

# Start services
for svc in "${!SERVICES[@]}"; do
    IFS=':' read -r script base_port instances <<< "${SERVICES[$svc]}"
    script_path="$BASE_DIR/$script"
    
    if [ ! -f "$script_path" ]; then
        echo "❌ Script not found: $script_path"
        continue
    fi
    
    echo "=== Starting $instances instances of $svc ==="
    for ((i=0; i<instances; i++)); do
        port=$((base_port + i))
        pm2_name="${svc}-${port}"
        
        # Check if service is already running
        if pm2 describe "$pm2_name" >/dev/null 2>&1; then
            echo "🔄 Restarting: $pm2_name"
            pm2 restart "$pm2_name"
        else
            pm2 start "$script_path" \
                --name "$pm2_name" \
                --output "$LOG_DIR/$pm2_name.out.log" \
                --error "$LOG_DIR/$pm2_name.err.log" \
                --env PORT="$port" \
                --no-autorestart
            echo "✅ Started: $pm2_name on port $port"
        fi
        sleep 0.2
    done
done

pm2 save
echo ""
echo "🐉 Hydra Ecosystem Started Successfully!"
echo "📊 Check: pm2 list"
echo "🌐 Test: curl http://localhost:5000"

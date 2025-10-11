#!/bin/bash
# start_hydra.sh - Complete Hydra service starter

set -euo pipefail

BASE_DIR="$HOME/hydra"
LOG_DIR="$BASE_DIR/logs"
mkdir -p "$LOG_DIR"

echo "🐉 Starting Hydra Ecosystem..."

# Stop any existing services
pm2 delete all 2>/dev/null || true

# Services configuration
declare -A SERVICES
SERVICES=(
    ["worker"]="api-catalog/worker/worker.js:5000"
    ["uploader"]="api-catalog/uploader/index.js:6000"
    ["click-tracker"]="api-catalog/click/server.js:7000"
    ["landing"]="api-catalog/landing/index.js:4500"
    ["orchestrator"]="orchestrator.js:8080"
)

# Number of instances for scalable services
SCALABLE_INSTANCES=5

# Start single-instance services first
echo "=== Starting Core Services ==="
for svc in orchestrator; do
    IFS=':' read -r script port <<< "${SERVICES[$svc]}"
    script_path="$BASE_DIR/$script"
    
    if [ ! -f "$script_path" ]; then
        echo "❌ Script not found: $script_path"
        continue
    fi
    
    pm2 start "$script_path" \
        --name "$svc" \
        --output "$LOG_DIR/$svc.out.log" \
        --error "$LOG_DIR/$svc.err.log" \
        --env PORT="$port" \
        --no-autorestart
    echo "✅ Started $svc on port $port"
done

# Start scalable services with multiple instances
echo "=== Starting Scalable Services ==="
for svc in worker uploader "click-tracker" landing; do
    IFS=':' read -r script base_port <<< "${SERVICES[$svc]}"
    script_path="$BASE_DIR/$script"
    
    if [ ! -f "$script_path" ]; then
        echo "❌ Script not found: $script_path"
        continue
    fi
    
    echo "--- Starting $SCALABLE_INSTANCES instances of $svc ---"
    for ((i=0; i<SCALABLE_INSTANCES; i++)); do
        port=$((base_port + i))
        pm2_name="${svc}-${port}"
        
        pm2 start "$script_path" \
            --name "$pm2_name" \
            --output "$LOG_DIR/$pm2_name.out.log" \
            --error "$LOG_DIR/$pm2_name.err.log" \
            --env PORT="$port" \
            --no-autorestart
            
        echo "✅ Started $pm2_name on port $port"
        sleep 0.1
    done
done

# Final setup
pm2 save
pm2 startup 2>/dev/null || true

echo ""
echo "🐉 Hydra Ecosystem Started!"
echo "📊 Check status: pm2 list"
echo "📋 Check logs: pm2 logs"
echo "🌐 Test endpoints:"
echo "   - Orchestrator: curl http://localhost:8080"
echo "   - Workers: curl http://localhost:5000"
echo "   - Uploaders: curl http://localhost:6000"
echo "   - Click Trackers: curl http://localhost:7000"
echo "   - Landing: curl http://localhost:4500"

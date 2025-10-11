#!/bin/bash
# Hydra Multi-Service Launcher
# Launches 100 instances each of click, landing, and worker services
# Logs go to logs/{service}/service-PORT.log

BASE_DIR="$(pwd)"
SERVICES=("click" "landing" "worker")
PORT_RANGES=(30000 31000 32000)
INSTANCES=100

# Ensure log directories exist
for SERVICE in "${SERVICES[@]}"; do
    mkdir -p "$BASE_DIR/logs/$SERVICE"
done

# Function to launch a service
launch_service() {
    local SERVICE=$1
    local START_PORT=$2
    for i in $(seq 0 $((INSTANCES-1))); do
        PORT=$((START_PORT + i))
        LOG_FILE="$BASE_DIR/logs/$SERVICE/$SERVICE-$PORT.log"
        echo "🚀 Starting $SERVICE instance on port $PORT → $LOG_FILE"

        # Node script path
        NODE_SCRIPT="$BASE_DIR/$SERVICE/server.js"

        if [ "$SERVICE" = "worker" ]; then
            NODE_SCRIPT="$BASE_DIR/$SERVICE/worker-simple.js"
        fi

        # Launch in background
        PORT=$PORT node "$NODE_SCRIPT" > "$LOG_FILE" 2>&1 &
    done
}

# Launch all services
for idx in "${!SERVICES[@]}"; do
    launch_service "${SERVICES[$idx]}" "${PORT_RANGES[$idx]}"
done

echo "🎉 Launched all services: click, landing, worker (100 ports each)"

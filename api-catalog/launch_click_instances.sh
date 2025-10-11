#!/bin/bash
# Hydra Click Tracker Multi-Port Launcher
# Launches 100 instances of click/server.js on ports 30000-30099
# Logs go to logs/click/click-PORT.log

CLICK_DIR="./click"
LOG_DIR="./logs/click"
START_PORT=30000
INSTANCES=100

mkdir -p "$LOG_DIR"

for i in $(seq 0 $((INSTANCES-1))); do
  PORT=$((START_PORT + i))
  LOG_FILE="$LOG_DIR/click-$PORT.log"

  echo "🚀 Starting click instance on port $PORT → $LOG_FILE"
  
  # Launch in background
  PORT=$PORT node "$CLICK_DIR/server.js" > "$LOG_FILE" 2>&1 &
done

echo "🎉 Launched $INSTANCES click instances (ports $START_PORT-$((START_PORT+INSTANCES-1)))"

#!/bin/bash
# start_all.sh — Hydra PM2 orchestrator

# Base ports
BASE_PORT_WORKER=5000
BASE_PORT_UPLOADER=6000
BASE_PORT_CLICKTRACKER=7000

# Number of instances
NUM_INSTANCES=50

# Paths to your service directories
WORKER_DIR="./worker"
UPLOADER_DIR="./uploader"
CLICKTRACKER_DIR="./clicktracker"

# Function to start a service in PM2
start_service() {
  local DIR=$1
  local BASE_PORT=$2
  local PREFIX=$3
  local NUM=$4

  for i in $(seq 0 $((NUM - 1))); do
    PORT=$((BASE_PORT + i))
    NAME="${PREFIX}-${i}"

    pm2 start "$DIR/index.js" \
      --name "$NAME" \
      --update-env \
      --env PORT=$PORT \
      --env NAME=$NAME \
      > /dev/null 2>&1

    echo "✅ Started $NAME on port $PORT"
  done
}

echo "🚀 Starting Workers..."
start_service $WORKER_DIR $BASE_PORT_WORKER "worker" $NUM_INSTANCES

echo "🚀 Starting Uploaders..."
start_service $UPLOADER_DIR $BASE_PORT_UPLOADER "uploader" $NUM_INSTANCES

echo "🚀 Starting ClickTrackers..."
start_service $CLICKTRACKER_DIR $BASE_PORT_CLICKTRACKER "clicktracker" $NUM_INSTANCES

echo "🎯 All services started. Check PM2 logs with 'pm2 logs'"

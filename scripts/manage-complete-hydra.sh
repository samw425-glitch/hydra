#!/bin/bash

# Check which docker compose command to use
if command -v docker-compose > /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version > /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "❌ Error: Docker Compose not found"
    exit 1
fi

case "$1" in
  "start")
    echo "🚀 Starting Complete Hydra Ecosystem (9 services)..."
    $DOCKER_COMPOSE_CMD -f ~/hydra/docker-compose.complete.yml up -d
    ;;
  "stop")
    echo "🛑 Stopping Complete Hydra Ecosystem..."
    $DOCKER_COMPOSE_CMD -f ~/hydra/docker-compose.complete.yml down
    ;;
  "status")
    echo "📊 Complete Hydra Ecosystem Status:"
    $DOCKER_COMPOSE_CMD -f ~/hydra/docker-compose.complete.yml ps
    ;;
  "logs")
    echo "📋 Showing logs..."
    $DOCKER_COMPOSE_CMD -f ~/hydra/docker-compose.complete.yml logs -f
    ;;
  "test")
    echo "🧪 Testing all 9 services..."
    
    services=(
      "website:3000"
      "api:4000"
      "utm:9000"
      "backlinking:10000"
      "indexing:11000"
      "worker:12000"
      "click-tracker:13000"
      "uploader:14000"
      "orchestrator:8080"
    )
    
    for service in "${services[@]}"; do
      IFS=':' read -r name port <<< "$service"
      echo -n "🔍 $name: "
      if curl -s --connect-timeout 2 http://localhost:$port/health > /dev/null; then
        echo "✅"
      else
        curl -s --connect-timeout 2 http://localhost:$port/ > /dev/null && echo "✅ (root)" || echo "❌"
      fi
    done
    ;;
  *)
    echo "Usage: $0 {start|stop|status|test|logs}"
    echo ""
    echo "🌐 Complete Hydra Ecosystem (9 Services):"
    echo "   Website:      http://localhost:3000"
    echo "   API:          http://localhost:4000"
    echo "   UTM:          http://localhost:9000"
    echo "   Backlinking:  http://localhost:10000"
    echo "   Indexing:     http://localhost:11000"
    echo "   Worker:       http://localhost:12000"
    echo "   Click Tracker: http://localhost:13000"
    echo "   Uploader:     http://localhost:14000"
    echo "   Orchestrator: http://localhost:8080"
    ;;
esac

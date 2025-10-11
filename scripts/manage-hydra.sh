#!/bin/bash

case "$1" in
  "start")
    echo "🚀 Starting Hydra Ecosystem..."
    docker-compose -f ~/hydra/docker-compose.scaled.yml up -d
    ;;
  "stop")
    echo "🛑 Stopping Hydra Ecosystem..."
    docker-compose -f ~/hydra/docker-compose.scaled.yml down
    ;;
  "status")
    echo "📊 Hydra Ecosystem Status:"
    docker-compose -f ~/hydra/docker-compose.scaled.yml ps
    ;;
  "logs")
    echo "📋 Showing logs..."
    docker-compose -f ~/hydra/docker-compose.scaled.yml logs -f
    ;;
  "test")
    echo "🧪 Testing all services..."
    for port in 31000 31001 31002; do
      curl -s http://localhost:$port/ > /dev/null && echo "✅ Website $port" || echo "❌ Website $port"
    done
    for port in 41000 41001 41002; do
      curl -s http://localhost:$port/health > /dev/null && echo "✅ API $port" || echo "❌ API $port"
    done
    for port in 50000 50001 50002; do
      curl -s "http://localhost:$port/track?utm_source=test" > /dev/null && echo "✅ UTM $port" || echo "❌ UTM $port"
    done
    ;;
  *)
    echo "Usage: $0 {start|stop|status|logs|test}"
    echo ""
    echo "Your Hydra Services:"
    echo "🌐 Website: http://localhost:31000, 31001, 31002"
    echo "🚀 API:     http://localhost:41000, 41001, 41002"  
    echo "📊 UTM:     http://localhost:50000, 50001, 50002"
    ;;
esac

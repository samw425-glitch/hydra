#!/bin/bash

echo "🐉 HYDRA ECOSYSTEM STATUS DASHBOARD"
echo "==================================="
echo ""

# Container status
echo "📊 CONTAINER STATUS:"
docker-compose -f docker-compose.complete.yml ps

echo ""
echo "🌐 SERVICE ENDPOINTS:"
echo "===================="

services=(
  "🌐 Website|http://localhost:3000|Serves HTML content and web pages"
  "🚀 API|http://localhost:4000|REST API endpoints and data services"
  "📊 UTM Tracker|http://localhost:9000|Marketing parameter tracking"
  "🔗 Backlinking|http://localhost:10000|Link management and analysis"
  "📇 Indexing|http://localhost:11000|Search engine indexing monitoring"
  "👷 Worker|http://localhost:12000|Background job processing"
  "🖱️ Click Tracker|http://localhost:13000|Click analytics and tracking"
  "📤 Uploader|http://localhost:14000|File upload and processing"
  "🎼 Orchestrator|http://localhost:8080|Service coordination and management"
)

for service in "${services[@]}"; do
  IFS='|' read -r icon name url description <<< "$service"
  echo "$icon $name"
  echo "   URL: $url"
  echo "   Desc: $description"
  echo ""
done

echo "🎯 QUICK COMMANDS:"
echo "================="
echo "   Start all:    ~/hydra/scripts/manage-complete-hydra.sh start"
echo "   Stop all:     ~/hydra/scripts/manage-complete-hydra.sh stop"
echo "   Check status: ~/hydra/scripts/manage-complete-hydra.sh status"
echo "   Test all:     ~/hydra/scripts/manage-complete-hydra.sh test"
echo "   View logs:    ~/hydra/scripts/manage-complete-hydra.sh logs"

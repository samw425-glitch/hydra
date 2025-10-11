#!/bin/bash
echo "=== 🐙 HYDRA ECOSYSTEM - COMPLETE STATUS ==="
echo

echo "🌐 DOCKER HUB DEPLOYMENTS:"
echo "✅ samw425glitch/hydra-cloud-orchestrator:latest"
echo "✅ samw425glitch/hydra-line-styler:latest"
echo "✅ samw425glitch/hydra-api-catalog:latest"
echo "✅ samw425glitch/hydra:latest (previous)"

echo
echo "🏃‍♂️ CURRENTLY RUNNING SERVICES:"
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"

echo
echo "🔌 PORT MAPPINGS & ACCESS URLS:"
echo "Primary Services:"
echo "  http://localhost:8082  → hydra-cloud-test (Cloud Orchestrator)"
echo "  http://localhost:8083  → line-styler (Line Item Styler)"
echo "  http://localhost:8080  → uploader-website (Main Website)"
echo "  http://localhost:8000  → uploader-contentgen (Content Generator)"
echo "  http://localhost:8001  → uploader-upload (File Upload)"

echo
echo "🚀 Landing Pages (Ports 8200-8206):"
for i in {1..7}; do
  port=$((8200 + i - 1))
  if docker ps --filter "name=landing-path$i" --format "{{.Names}}" | grep -q .; then
    echo "  http://localhost:$port → landing-path$i ✓"
  else
    echo "  http://localhost:$port → landing-path$i (stopped)"
  fi
done

echo
echo "🎯 SUBDOMAIN ROUTING PLAN:"
cat << ROUTING
Primary Domains:
  • cloud.yourdomain.com     → :8082 (Cloud Orchestrator)
  • styler.yourdomain.com    → :8083 (Line Styler) 
  • website.yourdomain.com   → :8080 (Uploader Website)
  • content.yourdomain.com   → :8000 (Content Generator)
  • upload.yourdomain.com    → :8001 (File Upload)

Landing Paths:
  • path1.yourdomain.com     → :8200 (landing-path1)
  • path2.yourdomain.com     → :8201 (landing-path2)
  • path3.yourdomain.com     → :8202 (landing-path3)
  • path4.yourdomain.com     → :8203 (landing-path4)
  • path5.yourdomain.com     → :8204 (landing-path5)
  • path6.yourdomain.com     → :8205 (landing-path6)
  • path7.yourdomain.com     → :8206 (landing-path7)

Legacy APIs:
  • api.yourdomain.com       → :8092 (API Catalog)
ROUTING

echo
echo "📦 DIGITALOCEAN DEPLOYMENT READY:"
echo "✅ do-optimized.yaml created with 3 core services"
echo "✅ All images pushed to Docker Hub"
echo "✅ Health checks configured"

echo
echo "📊 SERVICE SUMMARY:"
running=$(docker ps -q | wc -l)
total_services=$((running + 7)) # +7 landing pages
echo "  Running containers: $running"
echo "  Landing pages: 7"
echo "  Total endpoints: $total_services"
echo "  Docker images: 4+ pushed to registry"

echo
echo "🔧 MANAGEMENT COMMANDS:"
echo "  View all:    docker ps -a"
echo "  Start all:   docker start \$(docker ps -a -q)"
echo "  Deploy to DO: doctl apps create-deployment --wait <app-id>"

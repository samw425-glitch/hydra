#!/bin/bash
echo "=== HYDRA COMPLETE SERVICE OVERVIEW ==="
echo

echo "🏢 RUNNING INFRASTRUCTURE:"
echo "✓ hydra-cloud-test    :8082 → Cloud orchestrator"
echo "✓ line-styler         :8083 → Line item styling service"  
echo "✓ uploader-website    :8080 → Main website"
echo "✓ uploader-contentgen :8000 → Content generation"
echo "✓ uploader-upload     :8001 → File upload service"
echo "✓ +4 background uploader services"

echo
echo "🚀 LANDING PAGES (New):"
for i in {1..7}; do
  port=$((8200 + i - 1))
  if docker ps --filter "name=landing-path$i" --format "{{.Names}}" | grep -q "landing-path$i"; then
    echo "✓ landing-path$i :$port → http://localhost:$port"
  else
    echo "○ landing-path$i :$port → (Not running)"
  fi
done

echo
echo "🌐 SUBDOMAIN ROUTING PLAN:"
echo "Primary Services:"
echo "  cloud.yourdomain.com     → :8082 (hydra-cloud-test)"
echo "  styler.yourdomain.com    → :8083 (line-styler)"
echo "  website.yourdomain.com   → :8080 (uploader-website)"
echo "  content.yourdomain.com   → :8000 (uploader-contentgen)"
echo "  upload.yourdomain.com    → :8001 (uploader-upload)"

echo
echo "Landing Page Paths:"
for i in {1..7}; do
  port=$((8200 + i - 1))
  echo "  path$i.yourdomain.com   → :$port (landing-path$i)"
done

echo
echo "📊 SERVICE SUMMARY:"
running_containers=$(docker ps -q | wc -l)
total_services=$((running_containers + 7)) # +7 landing pages
echo "  Running containers: $running_containers"
echo "  Landing pages: 7"
echo "  Total services: $total_services"

echo
echo "🔧 MANAGEMENT COMMANDS:"
echo "  View all:    docker ps -a"
echo "  View logs:   docker logs landing-path1"
echo "  Stop all:    docker stop \$(docker ps -q)"
echo "  Start all:   docker start \$(docker ps -a -q)"

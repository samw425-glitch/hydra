#!/bin/bash

echo "🐉📊 COMPLETE SERVICE OVERVIEW"
echo "================================"

# Hydra Services
echo -e "\n🐉 HYDRA SERVICES:"
docker ps --filter "name=hydra" --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"

# Uploader Services  
echo -e "\n📤 UPLOADER SERVICES:"
docker ps --filter "name=uploader" --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"

# Quick Access Links
echo -e "\n🔗 QUICK ACCESS LINKS:"
echo "  Orchestrator API: http://localhost:8082"
echo "  Line Item Styler: http://localhost:8083"
echo "  Upload Service:   http://localhost:8001"
echo "  ContentGen:       http://localhost:8000"
echo "  Website:          http://localhost:8080"

# Service Status
echo -e "\n📈 SERVICE STATUS:"
curl -s http://localhost:8082/api/status | jq -r '.active_services[] | "  ✅ \(.name) - port \(.port) - \(.status)"'

# Service Counts
echo -e "\n📊 SERVICE COUNTS:"
HYDRA_COUNT=$(docker ps --filter "name=hydra" --format "{{.Names}}" | wc -l)
UPLOADER_COUNT=$(docker ps --filter "name=uploader" --format "{{.Names}}" | wc -l)
TOTAL_COUNT=$(docker ps --format "{{.Names}}" | wc -l)
echo "  Hydra Services: $HYDRA_COUNT"
echo "  Uploader Services: $UPLOADER_COUNT"
echo "  Total Services: $TOTAL_COUNT"

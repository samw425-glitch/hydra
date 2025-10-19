#!/bin/bash
# restart-hydra.sh — cleanly resets and restarts all Hydra containers

echo "🧹 Cleaning up old Hydra containers and volumes..."
docker compose -f docker-compose-scaled.yml down --remove-orphans

echo "🧼 Pruning system to free space..."
docker system prune -af --volumes

echo "🚀 Rebuilding and launching Hydra ecosystem..."
docker compose -f docker-compose-scaled.yml up -d --build

echo "✅ Hydra ecosystem started successfully!"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

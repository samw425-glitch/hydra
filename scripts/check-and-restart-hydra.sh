#!/bin/bash
# check-and-restart-hydra.sh
# Checks Hydra services and restarts unhealthy containers

# Set your docker-compose file path
COMPOSE_FILE="$HOME/dev/hydra/docker-compose-scaled.yml"

echo "🔹 Checking Hydra containers..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Get unhealthy containers
UNHEALTHY=$(docker ps --filter "health=unhealthy" --format "{{.Names}}")

if [ -z "$UNHEALTHY" ]; then
    echo "✅ All containers are healthy!"
else
    echo "⚠️ Unhealthy containers detected:"
    echo "$UNHEALTHY"
    
    echo "Stopping and removing unhealthy containers..."
    docker rm -f $UNHEALTHY

    echo "Rebuilding and restarting Hydra..."
    docker compose -f "$COMPOSE_FILE" up -d --build

    echo "✅ Restart complete. Current container status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

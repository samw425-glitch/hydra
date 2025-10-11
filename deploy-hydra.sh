#!/bin/bash
set -e

echo "🚀 Deploying Hydra Complete Stack..."

# Build main hydra image
echo "[1/4] Building main Hydra image..."
docker build -t samw425/hydra:latest .

# Build landing page images
echo "[2/4] Building landing pages..."
for i in {1..7}; do
  docker build -t landing-path$i -f Dockerfile.landing .
done

# Start all services
echo "[3/4] Starting containers..."
# Start your main services (adjust these based on your actual service names)
docker-compose up -d  # if you have docker-compose.yml
# Or start individual containers as needed

# Start landing pages
for i in {1..7}; do
  port=$((8200 + i - 1))
  docker run -d --name landing-path$i -p $port:8080 landing-path$i
done

echo "[4/4] Deployment complete!"
echo "📊 Services running:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "🌐 Landing pages available at:"
for i in {1..7}; do
  port=$((8200 + i - 1))
  echo "  http://localhost:$port"
done

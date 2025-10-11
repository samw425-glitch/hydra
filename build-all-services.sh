#!/bin/bash
echo "=== BUILDING ALL HYDRA SERVICES ==="

# Build core services
echo "Building click-tracker..."
docker build -t samw425/hydra-click-tracker:latest -f Dockerfile.click .

echo "Building worker..."
docker build -t samw425/hydra-worker:latest -f Dockerfile.worker .

echo "Building landing pages..."
for i in {1..7}; do
  echo "Building landing-path$i..."
  docker build -t samw425/hydra-landing-path$i:latest -f Dockerfile.landing .
done

echo "=== BUILD COMPLETE ==="
docker images | grep samw425/hydra

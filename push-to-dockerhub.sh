#!/bin/bash

# Replace with your Docker Hub username
DOCKER_USERNAME="yourdockerhubusername"

echo "🐳 Pushing Hydra services to Docker Hub..."

services=(
  "website"
  "api" 
  "utm"
  "backlinking"
  "indexing"
  "worker"
  "click-tracker"
  "uploader"
  "orchestrator"
)

for service in "${services[@]}"; do
  echo "📦 Building and pushing $service..."
  
  # Build the image
  docker build -t $DOCKER_USERNAME/hydra-$service:latest ./api-catalog/$service
  
  # Push to Docker Hub
  docker push $DOCKER_USERNAME/hydra-$service:latest
  
  echo "✅ $service pushed successfully"
done

echo ""
echo "🎉 All services pushed to Docker Hub!"
echo "📋 Images:"
for service in "${services[@]}"; do
  echo "   - $DOCKER_USERNAME/hydra-$service:latest"
done

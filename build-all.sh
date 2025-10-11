#!/bin/bash

echo "🐳 Building All Hydra Docker Images..."
echo "======================================"

# Array of Dockerfile paths and their image names
declare -A dockerfiles=(
  ["./Dockerfile.cloud"]="hydra-cloud-orchestrator:latest"
  ["./templates/line-item-styler/Dockerfile.styler"]="hydra-line-styler:latest"
  ["./api-catalog/Dockerfile"]="hydra-api-catalog:latest"
)

for dockerfile in "${!dockerfiles[@]}"; do
  image=${dockerfiles[$dockerfile]}
  
  if [ -f "$dockerfile" ]; then
    echo "🏗️  Building $image from $dockerfile"
    docker build -t "$image" -f "$dockerfile" "$(dirname "$dockerfile")"
    echo "✅ Built: $image"
  else
    echo "❌ Missing: $dockerfile"
  fi
done

echo -e "\n📦 All Built Images:"
docker images | grep hydra

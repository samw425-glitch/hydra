#!/bin/bash

echo "🐳 Building All Hydra Docker Images (Fixed)..."
echo "=============================================="

# Array of Dockerfile paths and their image names
declare -A dockerfiles=(
  ["./Dockerfile.cloud"]="hydra-cloud-orchestrator:latest"
  ["./templates/line-item-styler/Dockerfile.styler"]="hydra-line-styler:latest"
  ["./api-catalog/Dockerfile.fixed"]="hydra-api-catalog:latest"
)

for dockerfile in "${!dockerfiles[@]}"; do
  image=${dockerfiles[$dockerfile]}

  if [ -f "$dockerfile" ]; then
    echo "🏗️  Building $image from $dockerfile"
    docker build -t "$image" -f "$dockerfile" "$(dirname "$dockerfile")"
    if [ $? -eq 0 ]; then
      echo "✅ Built: $image"
    else
      echo "❌ Failed to build: $image"
    fi
  else
    echo "❌ Missing: $dockerfile"
  fi
done

echo -e "\n📦 All Built Images:"
docker images | grep hydra | head -10

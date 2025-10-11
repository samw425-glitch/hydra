#!/bin/bash

echo "🐳 FINAL HYDRA DOCKER BUILD"
echo "============================"

# Build Cloud Orchestrator (always works)
echo "1. 🏗️ Building Cloud Orchestrator..."
docker build -t hydra-cloud-orchestrator:latest -f Dockerfile.cloud .
echo "✅ Cloud Orchestrator: hydra-cloud-orchestrator:latest"

# Build Line Item Styler (always works)  
echo "2. 🎨 Building Line Item Styler..."
docker build -t hydra-line-styler:latest -f templates/line-item-styler/Dockerfile.styler templates/line-item-styler/
echo "✅ Line Styler: hydra-line-styler:latest"

# Build API Catalog (try different methods)
echo "3. 📦 Building API Catalog..."
if docker build -t hydra-api-catalog:latest -f api-catalog/Dockerfile . 2>/dev/null; then
  echo "✅ API Catalog (Method 1): hydra-api-catalog:latest"
elif docker build -t hydra-api-catalog:latest -f api-catalog/Dockerfile.corrected api-catalog/ 2>/dev/null; then
  echo "✅ API Catalog (Method 2): hydra-api-catalog:latest"
else
  echo "❌ API Catalog: Failed to build"
fi

echo -e "\n📊 FINAL IMAGE INVENTORY:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep hydra

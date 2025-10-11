#!/bin/bash
echo "=== 🚀 DEPLOYMENT STATUS ==="

echo "1. DOCKER IMAGES:"
docker images | grep samw425glitch

echo -e "\n2. DIGITALOCEAN DROPLET:"
doctl compute droplet list --format "Name,PublicIPv4,Status,Memory,VCPUs"

echo -e "\n3. DIGITALOCEAN APPS:"
doctl apps list --format "Spec.Name,ActiveDeployment.Progress"

echo -e "\n4. GIT STATUS:"
git log --oneline -1

echo -e "\n🌐 ACCESS URLs (when deployed):"
echo "  Main App:      https://your-app.ondigitalocean.app"
echo "  Line Styler:   https://your-app.ondigitalocean.app/styler"
echo "  API Catalog:   https://your-app.ondigitalocean.app/api"

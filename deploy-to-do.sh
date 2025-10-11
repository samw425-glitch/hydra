#!/bin/bash

echo "🚀 Deploying Hydra to DigitalOcean..."

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl not installed. Please install DigitalOcean CLI first."
    echo "   Visit: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Authenticate with DigitalOcean
echo "🔐 Authenticating with DigitalOcean..."
doctl auth list

# Create or update the app
echo "📦 Creating/Updating DigitalOcean App..."
doctl apps create-deployment $(doctl apps list --format ID | head -1)

# Monitor deployment
echo "👀 Monitoring deployment..."
doctl apps list-deployments $(doctl apps list --format ID | head -1) --format ID,Progress,Created | head -5

echo ""
echo "🌐 Your app will be available at:"
doctl apps list --format "Default Ingress" | head -1

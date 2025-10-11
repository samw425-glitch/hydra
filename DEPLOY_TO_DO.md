# DigitalOcean App Platform Deployment

## Method 1: From Docker Hub (Recommended)

1. Go to: https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Choose "From Docker Hub"
4. Add these services:

### Service 1: Cloud Orchestrator
- **Container Registry**: Docker Hub
- **Image**: samw425glitch/hydra-cloud-orchestrator:latest
- **HTTP Port**: 8080
- **Route**: /

### Service 2: Line Styler
- **Container Registry**: Docker Hub
- **Image**: samw425glitch/hydra-line-styler:latest
- **HTTP Port**: 80  
- **Route**: /styler

### Service 3: API Catalog
- **Container Registry**: Docker Hub
- **Image**: samw425glitch/hydra-api-catalog:latest
- **HTTP Port**: 3000
- **Route**: /api

5. Click "Create Resources"

## Method 2: From GitHub Repository

1. Connect your GitHub account
2. Select your hydra repository
3. For each service, configure:
   - **Source Directory**: / (or specific service directory)
   - **Dockerfile Path**: Dockerfile.cloud / Dockerfile.landing / etc.
   - **Run Command**: node [service].js

## Your Droplet
You also have a droplet running:
- Name: ubuntu-s-1vcpu-1gb-sfo3-01
- ID: 523750874
- Status: new (wait for it to become "active")

You can SSH into it later for management:
  doctl compute ssh ubuntu-s-1vcpu-1gb-sfo3-01

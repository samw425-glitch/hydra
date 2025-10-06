# 🐉 Hydra - Multi-Head Container Orchestrator

Hydra is a Docker-based orchestration system that manages multiple service templates including landing pages, background workers, and API services.

## Project Structure

```
hydra/
├─ api-catalog/                 # Orchestrator API
│  ├─ package.json
│  ├─ orchestrator.js           # Main orchestrator code
│  ├─ Dockerfile                # API container
│  └─ .github/workflows/        # CI/CD pipeline
├─ templates/
│  ├─ landing/                  # Landing page template
│  ├─ worker/                   # Background worker template
│  └─ click-tracker/            # Click tracking service
└─ README.md
```

## Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies for API
cd api-catalog
npm install
```

### 2. Build Docker Images

```bash
# Build orchestrator
docker build -t hydra-orchestrator:latest -f api-catalog/Dockerfile api-catalog/

# Build templates
docker build -t hydra-landing:latest -f templates/landing/Dockerfile.landing templates/landing/
docker build -t hydra-worker:latest -f templates/worker/Dockerfile.worker templates/worker/
docker build -t hydra-click-tracker:latest -f templates/click-tracker/Dockerfile.click templates/click-tracker/
```

### 3. Run the Orchestrator

```bash
# Run locally for development
cd api-catalog
npm start

# Or run in Docker
docker run -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock hydra-orchestrator:latest
```

## API Endpoints

### Orchestrator API (Port 3000)

- `GET /health` - Health check
- `GET /api/templates` - List available templates
- `POST /api/deploy` - Deploy a new container
- `POST /api/stop/:containerId` - Stop a container
- `GET /api/containers` - List active containers

### Example: Deploy a Landing Page

```bash
curl -X POST http://localhost:3000/api/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "template": "landing",
    "config": {
      "env": ["ENV=production"]
    }
  }'
```

## Templates

### 1. Landing Page
Static website served by Nginx
- **Port**: 80
- **Tech**: HTML, CSS, JavaScript

### 2. Background Worker
Puppeteer-based screenshot worker
- **Tech**: Node.js, Puppeteer, Bull Queue
- **Requires**: Redis for queue management

### 3. Click Tracker
API service for tracking user clicks
- **Port**: 4000
- **Tech**: Node.js, Express

## Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Linux system with Docker socket access

### Running Locally

```bash
# Terminal 1: Start orchestrator
cd api-catalog
npm run dev

# Terminal 2: Build and test templates
docker build -t hydra-landing:latest -f templates/landing/Dockerfile.landing templates/landing/
```

## Production Deployment

1. Push images to a container registry
2. Deploy orchestrator with proper Docker socket access
3. Configure environment variables
4. Set up monitoring and logging

## Environment Variables

### Orchestrator
- `PORT` - API port (default: 3000)

### Worker
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port (default: 6379)

### Click Tracker
- `PORT` - Service port (default: 4000)

## Security Considerations

- Limit Docker socket access in production
- Use environment variables for sensitive data
- Implement authentication for API endpoints
- Use container resource limits
- Regular security updates for base images

## License

MIT

## Contributing

Pull requests welcome! Please ensure all tests pass and follow the existing code style.

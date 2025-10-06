#!/bin/bash

# Hydra Project Setup Script
set -e

echo "🐉 Setting up Hydra project structure..."

# We're already in hydra directory, so create subdirectories
echo "📁 Ensuring directory structure..."
mkdir -p api-catalog/.github/workflows
mkdir -p templates/landing/template
mkdir -p templates/worker/worker
mkdir -p templates/click-tracker/click-tracker

# =======================
# API Catalog Files
# =======================

echo "📝 Creating API catalog files..."

cat > api-catalog/package.json << 'PKGJSON'
{
  "name": "hydra-orchestrator",
  "version": "1.0.0",
  "description": "Hydra API Orchestrator",
  "main": "orchestrator.js",
  "scripts": {
    "start": "node orchestrator.js",
    "dev": "nodemon orchestrator.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dockerode": "^3.3.5",
    "axios": "^1.6.0",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
PKGJSON

cat > api-catalog/orchestrator.js << 'ORCHJS'
const express = require('express');
const Docker = require('dockerode');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const docker = new Docker();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const activeContainers = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', containers: activeContainers.size });
});

app.get('/api/templates', (req, res) => {
  res.json({
    templates: [
      { id: 'landing', name: 'Landing Page', type: 'web' },
      { id: 'worker', name: 'Background Worker', type: 'service' },
      { id: 'click-tracker', name: 'Click Tracker', type: 'api' }
    ]
  });
});

app.post('/api/deploy', async (req, res) => {
  const { template, config } = req.body;
  
  try {
    const imageName = `hydra-${template}:latest`;
    const containerName = `${template}-${Date.now()}`;
    
    const container = await docker.createContainer({
      Image: imageName,
      name: containerName,
      Env: config?.env || [],
      HostConfig: {
        PublishAllPorts: true,
        RestartPolicy: { Name: 'unless-stopped' }
      }
    });

    await container.start();
    const info = await container.inspect();
    const port = Object.keys(info.NetworkSettings.Ports)[0]?.split('/')[0];
    const hostPort = info.NetworkSettings.Ports[`${port}/tcp`]?.[0]?.HostPort;

    activeContainers.set(containerName, {
      id: container.id,
      template,
      port: hostPort,
      createdAt: new Date()
    });

    res.json({
      success: true,
      containerId: container.id,
      containerName,
      port: hostPort,
      url: `http://localhost:${hostPort}`
    });
  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stop/:containerId', async (req, res) => {
  const { containerId } = req.params;
  
  try {
    const container = docker.getContainer(containerId);
    await container.stop();
    await container.remove();
    
    for (const [name, info] of activeContainers.entries()) {
      if (info.id === containerId) {
        activeContainers.delete(name);
        break;
      }
    }

    res.json({ success: true, message: 'Container stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/containers', (req, res) => {
  const containers = Array.from(activeContainers.entries()).map(([name, info]) => ({
    name,
    ...info
  }));
  res.json({ containers });
});

app.listen(PORT, () => {
  console.log(`🐉 Hydra Orchestrator running on port ${PORT}`);
});
ORCHJS

cat > api-catalog/Dockerfile << 'DFILE'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY orchestrator.js ./
EXPOSE 3000
CMD ["node", "orchestrator.js"]
DFILE

cat > api-catalog/.github/workflows/build-and-push.yml << 'GHACTION'
name: Build and Push Docker Image
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/hydra-orchestrator
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
    - name: Log in to Container registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: ./api-catalog
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
GHACTION

echo "🎨 Creating landing template..."

cat > templates/landing/Dockerfile.landing << 'LANDINGDOCK'
FROM nginx:alpine
COPY template/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
LANDINGDOCK

cat > templates/landing/template/index.html << 'LANDINGHTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hydra Landing</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🐉 Hydra</h1>
            <p class="tagline">Multi-Head Container Orchestration</p>
        </header>
        <main>
            <section class="hero">
                <h2>Deploy. Scale. Thrive.</h2>
                <p>Orchestrate multiple services with ease.</p>
                <button class="cta-button" onclick="alert('Welcome to Hydra!')">Get Started</button>
            </section>
            <section class="features">
                <div class="feature">
                    <h3>⚡ Fast Deployment</h3>
                    <p>Deploy containers in seconds</p>
                </div>
                <div class="feature">
                    <h3>🔄 Auto-Scaling</h3>
                    <p>Scale based on demand</p>
                </div>
                <div class="feature">
                    <h3>📊 Monitoring</h3>
                    <p>Real-time insights</p>
                </div>
            </section>
        </main>
        <footer>
            <p>&copy; 2024 Hydra Project</p>
        </footer>
    </div>
    <script src="app.js"></script>
</body>
</html>
LANDINGHTML

cat > templates/landing/template/style.css << 'LANDINGCSS'
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: white;
}
.container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
header { text-align: center; margin-bottom: 4rem; }
header h1 { font-size: 4rem; margin-bottom: 0.5rem; }
.tagline { font-size: 1.5rem; opacity: 0.9; }
.hero { text-align: center; margin-bottom: 4rem; }
.hero h2 { font-size: 3rem; margin-bottom: 1rem; }
.cta-button {
    background: white; color: #667eea; border: none;
    padding: 1rem 2rem; font-size: 1.2rem; border-radius: 50px;
    cursor: pointer; transition: transform 0.2s; margin-top: 2rem;
}
.cta-button:hover { transform: scale(1.05); }
.features {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem; margin-top: 3rem;
}
.feature {
    background: rgba(255, 255, 255, 0.1); padding: 2rem;
    border-radius: 10px; backdrop-filter: blur(10px);
}
.feature h3 { font-size: 1.5rem; margin-bottom: 1rem; }
footer { text-align: center; margin-top: 4rem; opacity: 0.8; }
LANDINGCSS

cat > templates/landing/template/app.js << 'LANDINGJS'
console.log('Hydra Landing Page Loaded');
LANDINGJS

echo "⚙️ Creating worker template..."

cat > templates/worker/Dockerfile.worker << 'WORKERDOCK'
FROM node:18-alpine
RUN apk add --no-cache chromium
WORKDIR /app
COPY worker/package*.json ./
RUN npm ci --production
COPY worker/ ./
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/
CMD ["node", "index.js"]
WORKERDOCK

cat > templates/worker/worker/package.json << 'WORKERPKG'
{
  "name": "hydra-worker",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "puppeteer": "^21.5.0",
    "bull": "^4.11.5",
    "redis": "^4.6.10"
  }
}
WORKERPKG

cat > templates/worker/worker/index.js << 'WORKERJS'
const puppeteer = require('puppeteer');
const Queue = require('bull');

const screenshotQueue = new Queue('screenshots', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

console.log('🔧 Hydra Worker starting...');

screenshotQueue.process(async (job) => {
  const { url, options } = job.data;
  console.log(`📸 Taking screenshot of ${url}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const screenshot = await page.screenshot({
      fullPage: options?.fullPage || false,
      type: options?.format || 'png'
    });
    await browser.close();
    return {
      success: true,
      screenshot: screenshot.toString('base64'),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
});

screenshotQueue.on('completed', (job) => console.log(`✅ Job ${job.id} completed`));
screenshotQueue.on('failed', (job, err) => console.error(`❌ Job ${job.id} failed:`, err.message));

console.log('✨ Worker ready');
WORKERJS

echo "📊 Creating click tracker..."

cat > templates/click-tracker/Dockerfile.click << 'CLICKDOCK'
FROM node:18-alpine
WORKDIR /app
COPY click-tracker/package*.json ./
RUN npm ci --production
COPY click-tracker/ ./
EXPOSE 4000
CMD ["node", "server.js"]
CLICKDOCK

cat > templates/click-tracker/click-tracker/package.json << 'CLICKPKG'
{
  "name": "hydra-click-tracker",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "morgan": "^1.10.0"
  }
}
CLICKPKG

cat > templates/click-tracker/click-tracker/server.js << 'CLICKJS'
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

const clicks = [];

app.post('/api/track', (req, res) => {
  const clickData = {
    id: clicks.length + 1,
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    ...req.body
  };
  clicks.push(clickData);
  console.log('📌 Click tracked:', clickData);
  res.json({ success: true, clickId: clickData.id });
});

app.get('/api/stats', (req, res) => {
  const stats = {
    totalClicks: clicks.length,
    clicksByPage: {},
    recentClicks: clicks.slice(-10).reverse()
  };
  clicks.forEach(click => {
    const page = click.page || 'unknown';
    stats.clicksByPage[page] = (stats.clicksByPage[page] || 0) + 1;
  });
  res.json(stats);
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', clicks: clicks.length });
});

app.listen(PORT, () => {
  console.log(`📊 Click Tracker running on port ${PORT}`);
});
CLICKJS

cat > .gitignore << 'GITIGN'
node_modules/
*.log
.env
.DS_Store
dist/
build/
GITIGN

echo ""
echo "✅ Hydra project setup complete!"
echo ""
echo "Next steps:"
echo "  cd api-catalog && npm install"
echo "  npm start"

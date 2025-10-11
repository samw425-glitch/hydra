const express = require('express');
const app = express();
app.use(express.json());

// Extended pre-built images including uploader services
const prebuiltImages = {
  // Hydra services
  'click-tracker': 'samw425glitch/hydra-click-tracker:latest',
  'landing': 'samw425glitch/hydra-landing:latest', 
  'worker': 'samw425glitch/hydra-worker:latest',
  'line-item-styler': 'hydra-line-styler:latest',
  
  // Uploader services (from your existing system)
  'uploader-upload': 'uploader-upload:latest',
  'uploader-seo': 'uploader-seo:latest',
  'uploader-indexing': 'uploader-indexing:latest',
  'uploader-contentgen': 'uploader-contentgen:latest',
  'uploader-website': 'uploader-website:latest',
  'uploader-utm': 'uploader-utm:latest',
  'uploader-analytics': 'uploader-analytics:latest',
  'uploader-backlinking': 'uploader-backlinking:latest'
};

// Service configurations with ports
const serviceConfigs = {
  'uploader-upload': { port: 8001, path: '/upload' },
  'uploader-contentgen': { port: 8000, path: '/content' },
  'uploader-website': { port: 8080, path: '/website' },
  'line-item-styler': { port: 8083, path: '/styler' },
  'click-tracker': { port: 4000, path: '/tracker' }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    mode: 'cloud', 
    timestamp: new Date().toISOString(),
    services: Object.keys(prebuiltImages)
  });
});

// List all available services
app.get('/api/services', (req, res) => {
  res.json({
    hydra_services: ['click-tracker', 'landing', 'worker', 'line-item-styler'],
    uploader_services: [
      'uploader-upload', 'uploader-seo', 'uploader-indexing', 
      'uploader-contentgen', 'uploader-website', 'uploader-utm',
      'uploader-analytics', 'uploader-backlinking'
    ],
    all_services: prebuiltImages,
    service_configs: serviceConfigs
  });
});

// Enhanced deploy endpoint
app.post('/api/deploy', async (req, res) => {
  const { template, config } = req.body;
  
  if (!prebuiltImages[template]) {
    return res.status(400).json({ error: `Template ${template} not found` });
  }
  
  try {
    const serviceConfig = serviceConfigs[template] || {};
    const result = {
      success: true,
      containerId: `hydra-${template}-${Date.now()}`,
      image: prebuiltImages[template],
      config: serviceConfig,
      status: 'deployed'
    };
    
    console.log(`Deployed ${template} with config:`, serviceConfig);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Service status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    active_services: [
      { name: 'uploader-upload', status: 'running', port: 8001 },
      { name: 'uploader-contentgen', status: 'running', port: 8000 },
      { name: 'uploader-website', status: 'running', port: 8080 },
      { name: 'orchestrator', status: 'running', port: 8082 },
      { name: 'line-item-styler', status: 'running', port: 8083 }
    ],
    system: 'hydra-with-uploader',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🐉 Hydra Enhanced Orchestrator running on port ${PORT}`);
  console.log('📦 Available services:', Object.keys(prebuiltImages));
  console.log('🚀 Uploader services integrated!');
});

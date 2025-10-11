const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'orchestrator',
    port: PORT,
    status: 'running',
    description: 'Service orchestration and coordination',
    endpoints: ['/health', '/services', '/status']
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'orchestrator', timestamp: new Date().toISOString() });
});

app.get('/services', (req, res) => {
  res.json({
    managed_services: [
      'website', 'api', 'utm', 'backlinking', 'indexing',
      'worker', 'click-tracker', 'uploader', 'orchestrator'
    ],
    total_services: 9,
    status: 'operational'
  });
});

app.get('/status', (req, res) => {
  res.json({
    system_status: 'operational',
    active_services: 9,
    total_requests: 1245,
    uptime: process.uptime(),
    load_average: [1.2, 1.5, 1.8]
  });
});

app.listen(PORT, () => {
  console.log(`🎼 Orchestrator running on port ${PORT}`);
});

// ~/hydra/api-catalog/click/server.js

import express from 'express';
import os from 'os';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 💡 Each instance can register multiple routes
// You’ll eventually scale these to 100 ports via orchestrator.js or docker-compose

const routes = [
  '/track-click',
  '/get-stats',
  '/health',
  '/config',
  '/info'
];

// Example route setup (5 routes)
routes.forEach(route => {
  app.get(route, (req, res) => {
    res.json({
      service: 'click-tracker',
      route,
      instance: os.hostname(),
      port: PORT,
      timestamp: new Date().toISOString(),
      message: `✅ Route ${route} responding normally on port ${PORT}`
    });
  });
});

// Example POST route
app.post('/track-click', (req, res) => {
  const { userId, targetUrl } = req.body;
  console.log(`🖱️ Click from ${userId} on ${targetUrl}`);
  res.json({ status: 'ok', received: { userId, targetUrl } });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Click Tracker running on port ${PORT}`);
});

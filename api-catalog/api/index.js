const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// API routes
app.get('/', (req, res) => {
  res.json({
    service: 'api',
    port: PORT,
    status: 'running',
    endpoints: ['/data', '/users', '/health']
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api', timestamp: new Date().toISOString() });
});

app.get('/data', (req, res) => {
  res.json({ data: ['item1', 'item2', 'item3'], source: 'api' });
});

app.get('/users', (req, res) => {
  res.json({ users: ['user1', 'user2'], total: 2 });
});

app.listen(PORT, () => {
  console.log(`🚀 API Service running on port ${PORT}`);
});

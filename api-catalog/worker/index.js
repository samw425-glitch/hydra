const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

let jobsProcessed = 0;

app.get('/', (req, res) => {
  res.json({
    service: 'worker',
    port: PORT,
    status: 'running',
    description: 'Background job processing',
    endpoints: ['/health', '/stats', '/process']
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'worker', timestamp: new Date().toISOString() });
});

app.get('/stats', (req, res) => {
  res.json({
    jobs_processed: jobsProcessed,
    queue_size: 5,
    active_workers: 3,
    uptime: process.uptime()
  });
});

app.get('/process', (req, res) => {
  jobsProcessed++;
  res.json({
    job_id: Math.random().toString(36).substr(2, 9),
    status: 'processed',
    worker: PORT,
    total_processed: jobsProcessed
  });
});

app.listen(PORT, () => {
  console.log(`👷 Worker service running on port ${PORT}`);
});

const express = require('express');
const app = express();
const PORT = process.env.PORT || 6000;

app.use(express.json());

let uploadsProcessed = 0;

app.get('/', (req, res) => {
  res.json({
    service: 'uploader',
    port: PORT,
    status: 'running',
    description: 'File upload and processing',
    endpoints: ['/health', '/upload', '/stats']
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'uploader', timestamp: new Date().toISOString() });
});

app.get('/upload', (req, res) => {
  const { filename, type } = req.query;
  uploadsProcessed++;
  
  res.json({
    upload_id: Math.random().toString(36).substr(2, 9),
    filename: filename || 'document.pdf',
    type: type || 'file',
    status: 'uploaded',
    processed_at: new Date().toISOString(),
    total_uploads: uploadsProcessed
  });
});

app.get('/stats', (req, res) => {
  res.json({
    total_uploads: uploadsProcessed,
    storage_used: '2.3 GB',
    files_processed: uploadsProcessed,
    average_size: '4.2 MB'
  });
});

app.listen(PORT, () => {
  console.log(`📤 Uploader service running on port ${PORT}`);
});

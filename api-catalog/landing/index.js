const http = require('http');
const PORT = process.env.PORT || 4500;

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    service: 'landing',
    port: PORT,
    status: 'running',
    endpoint: req.url,
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`🌐 Landing service running on port ${PORT}`);
});

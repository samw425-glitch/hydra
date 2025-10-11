const http = require('http');
const PORT = process.env.PORT || 7000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    service: 'click-tracker',
    port: PORT,
    status: 'running',
    endpoint: req.url,
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`🖱️ Click tracker running on port ${PORT}`);
});

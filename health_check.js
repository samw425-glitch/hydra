const http = require('http');
const { execSync } = require('child_process');

// Try to get running ports from the orchestrator services dynamically
function getServicePorts() {
  let services = [];

  try {
    // List of service names from orchestrator
    const orchestrator = require('./cloud-orchestrator.js').services || [];
    
    orchestrator.forEach((svcName) => {
      // Use lsof to find listening ports for each service by name
      try {
        const cmd = `lsof -i -P -n | grep ${svcName} | grep LISTEN | awk '{print $9}' | sed 's/.*://g' | head -1`;
        const port = parseInt(execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim(), 10);
        if (!isNaN(port)) services.push({ name: svcName, port });
      } catch (_) {
        // service not found, skip
      }
    });

  } catch (err) {
    console.error('Could not load orchestrator services. Falling back to default ports.');
    // fallback list if orchestrator fails
    const defaultList = ['click-tracker', 'landing', 'worker'];
    defaultList.forEach((name, idx) => services.push({ name, port: 3001 + idx }));
  }

  return services;
}

const services = getServicePorts();
if (!services.length) {
  console.log('No running services found.');
  process.exit(0);
}

console.log('Checking services:');
services.forEach(svc => {
  const options = { hostname: 'localhost', port: svc.port, path: '/health', method: 'GET', timeout: 2000 };
  const req = http.request(options, res => console.log(`${svc.name} -> ${res.statusCode}`));

  req.on('error', err => console.log(`${svc.name} -> ERROR: ${err.message}`));
  req.on('timeout', () => { console.log(`${svc.name} -> TIMEOUT`); req.destroy(); });
  req.end();
});

const { execSync } = require('child_process');
const fs = require('fs');

const SERVICE_PORTS = {
  click: Array.from({ length: 100 }, (_, i) => 30000 + i),
  landing: Array.from({ length: 100 }, (_, i) => 31000 + i),
  worker: Array.from({ length: 100 }, (_, i) => 32000 + i)
};

const SERVICES = [
  { name: 'click', dockerfile: 'Dockerfile.click', context: 'click' },
  { name: 'landing', dockerfile: 'Dockerfile.landing', context: 'landing' },
  { name: 'worker', dockerfile: 'Dockerfile.worker', context: 'worker' }
].filter(s => fs.existsSync(s.dockerfile) && fs.existsSync(s.context));

function buildImage(service) {
  const tag = `hydra-${service.name}:latest`;
  console.log(`🔧 Building ${tag}...`);
  execSync(`docker build -t ${tag} -f ${service.dockerfile} .`, { stdio: 'inherit' });
  console.log(`✅ Built ${tag}`);
}

function runInstances(service) {
  const tag = `hydra-${service.name}:latest`;
  const ports = SERVICE_PORTS[service.name];

  ports.forEach(port => {
    const name = `${service.name}-${port}`;
    const cmd = `docker run -d -p ${port}:3000 --name ${name} ${tag}`;
    try {
      execSync(cmd, { stdio: 'ignore' });
      console.log(`🚀 Started ${name} on port ${port}`);
    } catch {
      console.error(`⚠️ Failed to start ${name} (port ${port})`);
    }
  });
}

function orchestrate() {
  console.log('🚀 Hydra Orchestrator: Building & Running Services...');
  SERVICES.forEach(s => {
    buildImage(s);
    runInstances(s);
  });
  console.log('🎉 All Hydra instances deployed!');
}

if (require.main === module) orchestrate();

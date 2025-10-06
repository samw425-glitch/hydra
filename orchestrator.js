// ~/hydra/orchestrator.js

import Docker from 'dockerode';
import path from 'path';
import fs from 'fs';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Define your templates
const templates = [
  { name: 'click-tracker', dockerfile: 'Dockerfile.click', port: 4000 },
  { name: 'landing', dockerfile: 'Dockerfile.landing', port: 4001 },
  { name: 'worker', dockerfile: 'Dockerfile.worker', port: 4002 }
];

// Build a single image
async function buildImage(template) {
  const dockerfilePath = path.resolve(template.dockerfile);
  if (!fs.existsSync(dockerfilePath)) {
    throw new Error(`Dockerfile not found: ${dockerfilePath}`);
  }

  console.log(`\n🚀 Building image for ${template.name}...`);

  const stream = await docker.buildImage(
    {
      context: path.resolve('./'),
      src: [template.dockerfile]
    },
    {
      t: `hydra-${template.name}:latest`,
      dockerfile: template.dockerfile
    }
  );

  await new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });

  console.log(`✅ Built image: hydra-${template.name}:latest`);
}

// Run container from built image
async function runContainer(template) {
  console.log(`💡 Starting container for ${template.name} on port ${template.port}...`);

  // Check if container exists, remove if so
  try {
    const existing = docker.getContainer(template.name);
    await existing.remove({ force: true });
  } catch (e) {
    // Ignore if container doesn't exist
  }

  const container = await docker.createContainer({
    name: template.name,
    Image: `hydra-${template.name}:latest`,
    Tty: true,
    HostConfig: {
      PortBindings: {
        "3000/tcp": [{ HostPort: template.port.toString() }]
      }
    },
    ExposedPorts: {
      "3000/tcp": {}
    }
  });

  await container.start();
  console.log(`✅ Container ${template.name} running at http://localhost:${template.port}`);
}

// Build all images sequentially
async function buildAll() {
  for (const tpl of templates) {
    await buildImage(tpl);
    await runContainer(tpl);
  }
}

// Run the orchestrator
buildAll()
  .then(() => console.log('\n🎉 All images built and containers started!'))
  .catch(err => {
    console.error('\n❌ Orchestrator error:', err);
    process.exit(1);
  });

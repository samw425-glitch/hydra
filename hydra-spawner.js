// hydra-spawner.js
import getPort from 'get-port';
import { exec } from 'child_process';

const BASE_PORT = 4000;
const MAX_PORT = 5000;
const IMAGES = [
  'hydra-click-tracker:latest',
  'hydra-click-tracker:latest'
];

// Generate an array of ports
function generatePortRange(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// Spawn a single container
async function spawnContainer(imageName) {
  const portRange = generatePortRange(BASE_PORT, MAX_PORT);
  const hostPort = await getPort({ port: portRange });

  return new Promise((resolve, reject) => {
    exec(`docker run -d -p ${hostPort}:4000 ${imageName}`, (err, stdout) => {
      if (err) return reject(err);
      const containerId = stdout.trim();
      console.log(`Container started: ${containerId} -> http://localhost:${hostPort}`);
      resolve({ containerId, hostPort });
    });
  });
}

// Main function
async function main() {
  console.log('Cleaning up old Hydra containers...');
  exec("docker ps -a -q --filter 'ancestor=hydra-click-tracker:latest'", (err, stdout) => {
    if (stdout) {
      const oldContainers = stdout.split('\n').filter(Boolean);
      if (oldContainers.length) {
        console.log('Stopping old containers...');
        exec(`docker stop ${oldContainers.join(' ')}`);
        exec(`docker rm ${oldContainers.join(' ')}`);
      }
    }
  });

  console.log('Spawning Hydra containers...');
  const runningContainers = [];

  for (const image of IMAGES) {
    try {
      const container = await spawnContainer(image);
      runningContainers.push(container);
    } catch (err) {
      console.error('Failed to spawn container:', err);
    }
  }

  console.log('\nRunning Hydra containers:');
  runningContainers.forEach(c => console.log(`- ${c.containerId}: http://localhost:${c.hostPort}`));
}

main();

import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { spawn } from 'child_process';
import path from 'path';
import getPort from 'get-port';

// Utility: sanitize Docker container names
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace invalid chars with dash
    .replace(/^-+|-+$/g, '');    // trim leading/trailing dashes
}

// CSV file
const csvFile = path.resolve('./topics.csv');
if (!fs.existsSync(csvFile)) {
  console.error('CSV file not found:', csvFile);
  process.exit(1);
}

// Parse CSV
const rawCSV = fs.readFileSync(csvFile, 'utf-8');
const records = parse(rawCSV, { columns: true, skip_empty_lines: true, trim: true });

console.log(`Found ${records.length} topics. Spawning containers...`);

// Retry helper
async function spawnContainer(record, attempt = 1) {
  try {
    const title = record.title;
    if (!title) return null;

    const containerName = 'hydra-' + slugify(title);-${Date.now().toString(36).slice(-4)}`;
    const port = await getPort({ port: getPort.makeRange(30000, 40000) });
    const image = 'hydra-click-tracker:latest'; // your Docker image

    return new Promise((resolve, reject) => {
      const dockerArgs = ['run', '-d', '--name', containerName, '-p', `${port}:80`, image];
      const proc = spawn('docker', dockerArgs);

      let stderr = '';
      proc.stdout.on('data', () => {
        console.log(`Spawned container "${containerName}" on port ${port}`);
      });
      proc.stderr.on('data', data => {
        stderr += data.toString();
      });
      proc.on('close', code => {
        if (code === 0) resolve({ containerName, port });
        else reject(new Error(stderr.trim()));
      });
    });

  } catch (err) {
    if (attempt < 3) {
      console.warn(`Retrying "${record.title}" (attempt ${attempt + 1})...`);
      return spawnContainer(record, attempt + 1);
    } else {
      console.error(`Failed to spawn "${record.title}" after 3 attempts:`, err.message);
      return null;
    }
  }
}

// Spawn all containers in parallel
(async () => {
  const results = await Promise.all(records.map(r => spawnContainer(r)));
  const successful = results.filter(r => r !== null);

  // Optional: log results to a JSON file
  fs.writeFileSync('spawned-containers.json', JSON.stringify(successful, null, 2));
  console.log(`Successfully spawned ${successful.length} containers. Details saved to spawned-containers.json`);
})();

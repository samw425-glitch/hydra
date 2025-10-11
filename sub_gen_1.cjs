#!/usr/bin/env node
const fs = require('fs');

// ====== CONFIG ======
// Optional adjectives to prepend to subdomain names
const adjectives = ["maximize", "learn", "strengthen", "boost", "discover", "master", "unlock", "optimize"];

const containersFile = 'spawned-containers.json';
const domain = process.argv[2];
if (!domain) {
    console.error("Usage: node sub_gen_1.js yourdomain.com");
    process.exit(1);
}

// ====== READ SPAWNED CONTAINERS ======
let containers;
try {
    containers = JSON.parse(fs.readFileSync(containersFile, 'utf-8'));
} catch (err) {
    console.error(`Error reading ${containersFile}:`, err.message);
    process.exit(1);
}

// ====== GENERATE SUBDOMAINS ======
const subdomains = containers.map((c, idx) => {
    let baseName = c.containerName.replace(/^hydra-/, '');
    const adjective = adjectives[idx % adjectives.length];
    const subdomain = `${adjective}-${baseName}`;
    return {
        fullURL: `http://${subdomain}.${domain}:${c.port}`,
        cname: `${subdomain}.${domain}`
    };
});

// ====== WRITE OUTPUT FILES ======
try {
    fs.writeFileSync('subdomains_output.txt', subdomains.map(s => s.fullURL).join('\n'));
    fs.writeFileSync('cname_ready.txt', subdomains.map(s => s.cname).join('\n'));
    console.log('✅ Subdomains generated: subdomains_output.txt & cname_ready.txt');
} catch (err) {
    console.error('Error writing output files:', err.message);
    process.exit(1);
}

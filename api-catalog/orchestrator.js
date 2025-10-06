const express = require("express");
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const PORT = 3000;
const TEMPLATES_DIR = path.join(__dirname, "../templates");

// Utility: find templates with Dockerfiles
function getTemplates() {
  return fs.readdirSync(TEMPLATES_DIR).filter((dir) => {
    const fullPath = path.join(TEMPLATES_DIR, dir);
    return fs.statSync(fullPath).isDirectory() &&
           fs.readdirSync(fullPath).some(file => file.startsWith("Dockerfile"));
  });
}

// Build images for all templates
function buildAllImages() {
  const templates = getTemplates();
  templates.forEach((template) => {
    const templatePath = path.join(TEMPLATES_DIR, template);
    const dockerfile = fs.readdirSync(templatePath)
                         .find(f => f.startsWith("Dockerfile"));
    console.log(`Building ${template} from ${dockerfile}...`);
    execSync(`docker build -t hydra-${template}:latest -f ${dockerfile} .`, {
      cwd: templatePath,
      stdio: "inherit"
    });
  });
}

// Keep track of running containers
let activeContainers = {};

// Endpoints
app.get("/health", (req, res) => res.send("OK"));

app.get("/api/templates", (req, res) => {
  res.json(getTemplates());
});

app.get("/api/containers", (req, res) => {
  res.json(activeContainers);
});

app.post("/api/deploy", (req, res) => {
  const { template, port, env } = req.body;
  if (!getTemplates().includes(template)) {
    return res.status(400).json({ error: "Template not found" });
  }

  const image = `hydra-${template}:latest`;
  const containerName = `hydra-${template}-${Date.now()}`;
  const envArgs = env ? env.map(e => `-e ${e}`).join(" ") : "";

  const runCmd = `docker run -d -p ${port}:${port} ${envArgs} --name ${containerName} ${image}`;
  const containerId = execSync(runCmd).toString().trim();
  activeContainers[containerName] = { id: containerId, template, port };

  res.json({ containerName, containerId });
});

app.post("/api/stop/:containerName", (req, res) => {
  const { containerName } = req.params;
  if (!activeContainers[containerName]) return res.status(404).json({ error: "Container not found" });

  execSync(`docker stop ${activeContainers[containerName].id}`);
  delete activeContainers[containerName];
  res.json({ stopped: containerName });
});

// Build all images at startup
buildAllImages();

app.listen(PORT, () => console.log(`🐉 Hydra Orchestrator running on port ${PORT}`));

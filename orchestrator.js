import showSplash from './splash.js';

(async () => {
    await showSplash();

    // --- Existing orchestrator code below ---
    console.log('🎉 Launched all workers!');
    // your worker startup code...
})();


// orchestrator.js
import figlet from "figlet";
import { exec } from "child_process";

// ----- Splash Screen -----
figlet.text("Hydra Orchestrator", {
  font: "Slant",
}, (err, data) => {
  if (err) {
    console.error("Figlet error:", err);
    return;
  }
  console.log(data);
  startWorkers();
});

// ----- Worker orchestration -----
function startWorkers() {
  const startPort = 32095;
  const workerCount = 5; // adjust how many workers you want

  for (let i = 0; i < workerCount; i++) {
    const port = startPort + i;
    const logPath = `/home/samunbunto/hydra/api-catalog/logs/worker/worker-${port}.log`;

    // This spawns a "dummy" worker; replace with your actual command
    const cmd = `echo "Starting worker on port ${port}" >> ${logPath}`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Worker ${port} error:`, error);
        return;
      }
      if (stderr) console.error(`Worker ${port} stderr:`, stderr);
      console.log(`🚀 Worker instance started on port ${port} → ${logPath}`);
    });
  }

  console.log("🎉 Launched all workers!");
}

module.exports = {
  apps: [
    {
      name: "cloud-orchestrator",
      script: "./cloud-orchestrator.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      }
    }
    // Add your other applications here when you find them
    // {
    //   name: "worker",
    //   script: "./worker.js",  // Update path when found
    //   instances: 1,
    //   autorestart: true
    // }
  ]
}

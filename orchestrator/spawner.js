// inside orchestrator/spawner.js
spawn("docker", [
  "run", "-d", "-p", "4005:4005", "--name", "hydra-redirect", "hydra-redirect:latest"
]);

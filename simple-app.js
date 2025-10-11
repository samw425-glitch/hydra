const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.json({
    name: "API Catalog",
    version: "1.0",
    status: "running",
    mode: "info-only",
    available_apis: [
      "click-tracker",
      "user-service", 
      "auth-service"
    ],
    note: "Full orchestration requires Kubernetes environment"
  });
});

app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.listen(PORT, () => {
  console.log(`🚀 API Catalog (Simple) running on port ${PORT}`);
});

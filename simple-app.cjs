const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.json({
    name: "API Catalog",
    version: "1.0",
    status: "running",
    mode: "simple",
    message: "API catalog service is running"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/api/templates", (req, res) => {
  res.json([
    { name: "click-tracker", description: "Click tracking service", status: "available" },
    { name: "user-service", description: "User management service", status: "available" }
  ]);
});

app.listen(PORT, () => {
  console.log(`🚀 Simple API Catalog running on port ${PORT}`);
});

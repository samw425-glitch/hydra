import express from "express";
const app = express();
const PORT = process.env.PORT || 4002;

app.get("/health", (req, res) => {
  res.json({ service: "worker", status: "ok", version: "v1.0.0" });
});

app.listen(PORT, () => console.log(`✅ Worker service running on port ${PORT}`));

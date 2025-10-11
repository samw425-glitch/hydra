import express from "express";
const app = express();
const PORT = process.env.PORT || 4001;

app.get("/health", (req, res) => {
  res.json({
    service: "landing",
    status: "ok",
    version: "v1.0.0",
  });
});

app.listen(PORT, () => console.log(`✅ Landing service running on port ${PORT}`));

import express from "express";

const app = express();
const PORT = 4000;

// In-memory store for clicks
const clicks = {};

// Middleware to log requests (optional, for debug)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: "click-tracker",
    status: "ok",
    version: "v1.1.0",
    message: "All systems go 🚀",
  });
});

// Track clicks
app.get("/track", (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Missing 'id' query parameter" });
  }
  clicks[id] = (clicks[id] || 0) + 1;
  res.json({ id, clicks: clicks[id], message: "Click recorded 👍" });
});

// Stats endpoint
app.get("/stats", (req, res) => {
  res.json({ totalClicks: clicks, message: "Click stats ready 📊" });
});

// Fun default route
app.get("/", (req, res) => {
  res.send(`<h1>Click-Tracker Online 🚀</h1>
            <p>Use <code>/track?id=YOUR_ID</code> to log a click.</p>
            <p>Check stats at <code>/stats</code>.</p>`);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Click-Tracker service running on port ${PORT}`);
});

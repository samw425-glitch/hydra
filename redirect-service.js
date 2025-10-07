// redirect-service.js
import express from "express";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4005;

app.use(cookieParser());
app.use(express.static("public"));
app.use(morgan("dev"));

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// --- Load or bootstrap affiliate links ---
const LINKS_FILE = path.join(DATA_DIR, "affiliate-links.json");
let linkMap = {};
if (fs.existsSync(LINKS_FILE)) {
  linkMap = JSON.parse(fs.readFileSync(LINKS_FILE, "utf-8"));
} else {
  linkMap = Object.fromEntries(
    Array.from({ length: 40 }).map((_, i) => [
      `r${i + 1}`,
      {
        url: `https://affiliate${i + 1}.example.com?utm_source=hydra`,
        name: `Affiliate ${i + 1}`,
        topic: ["hosting", "marketing", "automation", "contentgen", "tools"][i % 5],
      },
    ])
  );
  fs.writeFileSync(LINKS_FILE, JSON.stringify(linkMap, null, 2));
}

// --- Route: redirect tracker ---
app.get("/r/:id", (req, res) => {
  const { id } = req.params;
  const record = linkMap[id];
  if (!record) return res.status(404).send("Not found");

  const logEntry = {
    id,
    ts: new Date().toISOString(),
    ip: req.ip,
    ua: req.headers["user-agent"],
    referer: req.headers["referer"] || "",
    cookies: req.cookies || {},
    utm_source: req.query.utm_source || "",
  };

  fs.appendFileSync(path.join(DATA_DIR, "clicks.log"), JSON.stringify(logEntry) + "\n");

  if (!req.cookies.hydra_user) {
    res.cookie("hydra_user", uuidv4(), { maxAge: 86400000 * 365 });
  }

  res.redirect(302, record.url);
});

// --- Route: affiliate list dashboard ---
app.get("/", (req, res) => {
  const rows = Object.entries(linkMap)
    .map(
      ([id, l]) => `
      <tr>
        <td>${id}</td>
        <td>${l.name}</td>
        <td>${l.topic}</td>
        <td><a href="/r/${id}" target="_blank">Visit</a></td>
        <td>${l.url}</td>
      </tr>`
    )
    .join("");

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>Hydra Redirect Dashboard</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem; background: #f7f9fb; }
      h1 { text-align: center; margin-bottom: 0; }
      .nav { text-align: center; margin-bottom: 1rem; }
      a.nav-link { color: #007bff; text-decoration: none; margin: 0 0.5rem; }
      a.nav-link:hover { text-decoration: underline; }
      table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      th { background: #333; color: #fff; }
      tr:nth-child(even) { background: #f9f9f9; }
      a { color: #007bff; text-decoration: none; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <h1>Hydra Redirect Dashboard</h1>
    <div class="nav">
      <a href="/" class="nav-link">Home</a>
      <a href="/logs" class="nav-link">📊 View Logs</a>
    </div>
    <table>
      <thead><tr><th>ID</th><th>Name</th><th>Topic</th><th>Visit</th><th>Affiliate URL</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
  </html>
  `;
  res.send(html);
});

// --- Route: click logs dashboard ---
app.get("/logs", (req, res) => {
  const logFile = path.join(DATA_DIR, "clicks.log");
  if (!fs.existsSync(logFile)) return res.send("<h3>No clicks yet!</h3>");

  const lines = fs
    .readFileSync(logFile, "utf-8")
    .split("\n")
    .filter(Boolean)
    .slice(-500) // show last 500
    .map((l) => JSON.parse(l));

  const rows = lines
    .map(
      (l) => `
      <tr>
        <td>${l.ts}</td>
        <td>${l.id}</td>
        <td>${l.ip}</td>
        <td>${l.utm_source}</td>
        <td>${l.referer || "-"}</td>
        <td>${l.ua.slice(0, 80)}</td>
      </tr>`
    )
    .join("");

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>Hydra Analytics Logs</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem; background: #f0f2f5; }
      h1 { text-align: center; }
      .nav { text-align: center; margin-bottom: 1rem; }
      a.nav-link { color: #007bff; text-decoration: none; margin: 0 0.5rem; }
      a.nav-link:hover { text-decoration: underline; }
      table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
      th, td { border: 1px solid #ccc; padding: 6px; }
      th { background: #444; color: #fff; }
      tr:nth-child(even) { background: #fafafa; }
      td { word-break: break-word; }
    </style>
  </head>
  <body>
    <h1>📊 Hydra Click Analytics</h1>
    <div class="nav">
      <a href="/" class="nav-link">🏠 Home</a>
      <a href="/logs" class="nav-link">🔄 Refresh Logs</a>
    </div>
    <table>
      <thead><tr><th>Time</th><th>ID</th><th>IP</th><th>UTM Source</th><th>Referer</th><th>User Agent</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
  </html>
  `;
  res.send(html);
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 Hydra Redirect + Analytics running at http://localhost:${PORT}`);
});

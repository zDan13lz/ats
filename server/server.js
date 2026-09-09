// ══════════════════════════════════════
// server.js — Express entry point
// Routes: scan, parse, agent, export
// ══════════════════════════════════════

process.on("uncaughtException", function (err) {
  console.error("UNCAUGHT:", err);
});
process.on("unhandledRejection", function (err) {
  console.error("UNHANDLED:", err);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import scanRoutes from "./routes/scan.js";
import parseRoutes from "./routes/parse.js";
import agentRoutes from "./routes/agent.js";
import exportRoutes from "./routes/export.js";

dotenv.config({ path: "../.env" });
dotenv.config();

var app = express();
var PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ── Routes ──
app.use("/api/scan", scanRoutes);
app.use("/api/parse", parseRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/export", exportRoutes);

app.get("/api/health", function (req, res) {
  res.json({ status: "ok" });
});

// ── Serve built client in production ──
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var clientDist = path.join(__dirname, "..", "client", "dist");

import fs from "fs";
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", function (req, res) {
    res.sendFile(path.join(clientDist, "index.html"));
  });
  console.log("Serving client from " + clientDist);
}
// ── Start ──
app.listen(PORT, function () {
  console.log("ATS server running on http://localhost:" + PORT);
});
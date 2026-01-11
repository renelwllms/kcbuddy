require("dotenv").config();

const path = require("path");
const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const kidsRoutes = require("./routes/kids");
const choresRoutes = require("./routes/chores");
const submissionsRoutes = require("./routes/submissions");
const goalsRoutes = require("./routes/goals");
const storageRoutes = require("./routes/storage");

const app = express();
const port = process.env.PORT || 4000;
const host = process.env.HOST || "0.0.0.0";

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/kids", kidsRoutes);
app.use("/api/chores", choresRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/storage", storageRoutes);

const clientDist = path.join(__dirname, "..", "..", "client", "dist");
const uploadDir = path.join(__dirname, "..", "..", "uploads");

async function cleanupUploads() {
  try {
    const files = await fs.readdir(uploadDir);
    const now = Date.now();
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;

    await Promise.all(
      files.map(async (file) => {
        const fullPath = path.join(uploadDir, file);
        const stats = await fs.stat(fullPath);
        if (now - stats.mtimeMs > maxAgeMs) {
          await fs.unlink(fullPath);
        }
      })
    );
  } catch (err) {
    if (err.code !== "ENOENT") {
      // eslint-disable-next-line no-console
      console.warn("Upload cleanup failed", err.message);
    }
  }
}

cleanupUploads();
setInterval(cleanupUploads, 12 * 60 * 60 * 1000);

app.use("/uploads", express.static(uploadDir));
app.use(express.static(clientDist));
app.get("/app*", (req, res) => {
  res.sendFile(path.join(clientDist, "app", "index.html"));
});
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`KCBuddy server listening on ${host}:${port}`);
});

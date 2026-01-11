require("dotenv").config();

const path = require("path");
const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const kidsRoutes = require("./routes/kids");
const choresRoutes = require("./routes/chores");
const submissionsRoutes = require("./routes/submissions");
const goalsRoutes = require("./routes/goals");
const storageRoutes = require("./routes/storage");

const app = express();
const port = process.env.PORT || 4000;
const host = process.env.HOST || "0.0.0.0";
const trustProxy = Number(process.env.TRUST_PROXY || 0);

if (trustProxy) {
  app.set("trust proxy", trustProxy);
}

app.disable("x-powered-by");

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.SITE_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAllOrigins = process.env.NODE_ENV !== "production" && allowedOrigins.length === 0;

const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:"],
  connectSrc: ["'self'"],
  fontSrc: ["'self'", "data:"],
  workerSrc: ["'self'"],
  manifestSrc: ["'self'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  frameAncestors: ["'none'"],
  formAction: ["'self'"]
};

if (process.env.NODE_ENV === "production") {
  cspDirectives.upgradeInsecureRequests = [];
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: cspDirectives
    }
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowAllOrigins) {
        return callback(null, true);
      }
      if (!allowedOrigins.length) {
        return callback(null, false);
      }
      return callback(null, allowedOrigins.includes(origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json({ limit: "10mb" }));

const storageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/kids", kidsRoutes);
app.use("/api/chores", choresRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/storage", storageLimiter, storageRoutes);

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

app.use(
  "/uploads",
  express.static(uploadDir, {
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
      res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self' data:; sandbox");
    }
  })
);
app.use(express.static(clientDist));
const appIndex = path.join(clientDist, "app", "index.html");
app.get(/^\/app(\/|$)/, (req, res) => {
  res.sendFile(appIndex);
});
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`KCBuddy server listening on ${host}:${port}`);
});

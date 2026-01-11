const express = require("express");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const { requireAuth, requireRole } = require("../middleware/auth");
const { createPresignedUpload } = require("../storage/s3");

const router = express.Router();

router.use(requireAuth, requireRole("kid"));

const uploadRoot = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const allowedContentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

function sanitizePathSegment(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "");
}

function resolveUploadPath(filename) {
  const resolved = path.resolve(uploadRoot, filename);
  if (!resolved.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new Error("Invalid upload path");
  }
  return resolved;
}

async function detectFileType(buffer) {
  const { fileTypeFromBuffer } = await import("file-type");
  return fileTypeFromBuffer(buffer);
}

router.post("/presign", async (req, res) => {
  const { contentType } = req.body;

  if (!contentType) {
    return res.status(400).json({ error: "contentType is required" });
  }

  if (!allowedContentTypes.has(contentType)) {
    return res.status(400).json({ error: "Only image uploads are allowed" });
  }

  const id = crypto.randomUUID();
  const key = `families/${req.user.familyId}/kids/${req.user.userId}/${id}`;

  try {
    const { uploadUrl, publicUrl } = await createPresignedUpload({ key, contentType });
    return res.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    return res.status(500).json({ error: "Unable to create upload URL" });
  }
});

router.post("/upload", uploadLimiter, upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "photo is required" });
  }

  const buffer = req.file.buffer;

  try {
    const detected = await detectFileType(buffer);
    if (!detected || !allowedContentTypes.has(detected.mime)) {
      return res.status(400).json({ error: "Only jpeg, png, webp, or gif images are allowed" });
    }

    const ext = detected.ext === "jpeg" ? "jpg" : detected.ext;
    const id = crypto.randomUUID();
    const familyId = sanitizePathSegment(req.user.familyId);
    const userId = sanitizePathSegment(req.user.userId);
    if (!familyId || !userId) {
      return res.status(400).json({ error: "Invalid user context" });
    }
    const filename = `family-${familyId}-kid-${userId}-${id}.${ext}`;
    const destination = resolveUploadPath(filename);
    await fsp.writeFile(destination, buffer, { flag: "wx" });
    const publicUrl = `/uploads/${filename}`;
    return res.json({ photoUrl: publicUrl });
  } catch (err) {
    if (err && err.code === "EEXIST") {
      return res.status(500).json({ error: "Upload collision, try again" });
    }
    return res.status(500).json({ error: "Unable to save upload" });
  }
});

module.exports = router;

const express = require("express");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { requireAuth, requireRole } = require("../middleware/auth");
const { createPresignedUpload } = require("../storage/s3");

const router = express.Router();

router.use(requireAuth, requireRole("kid"));

const uploadRoot = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const id = crypto.randomUUID();
    cb(null, `family-${req.user.familyId}-kid-${req.user.userId}-${id}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    return cb(null, true);
  }
});

router.post("/presign", async (req, res) => {
  const { contentType } = req.body;

  if (!contentType) {
    return res.status(400).json({ error: "contentType is required" });
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

router.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "photo is required" });
  }

  const publicUrl = `/uploads/${req.file.filename}`;
  return res.json({ photoUrl: publicUrl });
});

module.exports = router;

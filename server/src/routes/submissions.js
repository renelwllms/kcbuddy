const express = require("express");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

const publicBase = (process.env.S3_PUBLIC_BASE_URL || "").replace(/\/+$/, "");

function isAllowedPhotoUrl(url) {
  if (typeof url !== "string" || url.trim() === "") {
    return false;
  }
  if (url.startsWith("/uploads/")) {
    return !url.includes("..");
  }
  if (publicBase) {
    return url.startsWith(`${publicBase}/`);
  }
  return false;
}

router.get("/", async (req, res) => {
  if (req.user.role === "kid") {
    const result = await pool.query(
      `SELECT submissions.id, submissions.status, submissions.photo_url, submissions.created_at, submissions.approved_at,
              chores.title, chores.reward_amount
       FROM submissions
       JOIN chores ON submissions.chore_id = chores.id
       WHERE submissions.kid_id = $1
       ORDER BY submissions.created_at DESC`,
      [req.user.userId]
    );

    return res.json({ submissions: result.rows });
  }

  const result = await pool.query(
    `SELECT submissions.id, submissions.status, submissions.photo_url, submissions.created_at, submissions.approved_at,
            kids.name AS kid_name, kids.id AS kid_id, chores.title, chores.reward_amount
     FROM submissions
     JOIN kids ON submissions.kid_id = kids.id
     JOIN chores ON submissions.chore_id = chores.id
     WHERE kids.family_id = $1
     ORDER BY submissions.created_at DESC`,
    [req.user.familyId]
  );

  return res.json({ submissions: result.rows });
});

router.post("/", requireRole("kid"), async (req, res) => {
  const { choreId, photoUrl } = req.body;

  if (!choreId || !photoUrl) {
    return res.status(400).json({ error: "choreId and photoUrl are required" });
  }

  if (!isAllowedPhotoUrl(photoUrl)) {
    return res.status(400).json({ error: "photoUrl must be from approved storage" });
  }

  const choreResult = await pool.query(
    "SELECT id FROM chores WHERE id = $1 AND family_id = $2",
    [choreId, req.user.familyId]
  );

  if (choreResult.rows.length === 0) {
    return res.status(404).json({ error: "Chore not found" });
  }

  const result = await pool.query(
    "INSERT INTO submissions (chore_id, kid_id, photo_url, status) VALUES ($1, $2, $3, 'pending') RETURNING id",
    [choreId, req.user.userId, photoUrl]
  );

  return res.status(201).json({ id: result.rows[0].id, status: "pending" });
});

router.post("/:id/approve", requireRole("parent"), async (req, res) => {
  const { decision } = req.body;
  const status = decision === "reject" ? "rejected" : "approved";

  const result = await pool.query(
    `UPDATE submissions
     SET status = $1, approved_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE NULL END,
         approver_id = $2
     WHERE id = $3
     AND EXISTS (
       SELECT 1 FROM kids WHERE kids.id = submissions.kid_id AND kids.family_id = $4
     )
     RETURNING id`,
    [status, req.user.userId, req.params.id, req.user.familyId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Submission not found" });
  }

  return res.json({ id: result.rows[0].id, status });
});

module.exports = router;

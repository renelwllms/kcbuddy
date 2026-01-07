const express = require("express");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const includeInactive = req.user.role === "parent" && req.query.includeInactive === "1";
  const query = includeInactive
    ? "SELECT id, title, reward_amount, description, category, active FROM chores WHERE family_id = $1 ORDER BY title"
    : "SELECT id, title, reward_amount, description, category, active FROM chores WHERE family_id = $1 AND active = TRUE ORDER BY title";

  const result = await pool.query(query, [req.user.familyId]);

  return res.json({ chores: result.rows });
});

router.post("/", requireRole("parent"), async (req, res) => {
  const { title, rewardAmount, description, category } = req.body;

  if (!title || rewardAmount == null) {
    return res.status(400).json({ error: "title and rewardAmount are required" });
  }

  const result = await pool.query(
    "INSERT INTO chores (family_id, title, reward_amount, description, category) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [req.user.familyId, title, rewardAmount, description || null, category || null]
  );

  return res.status(201).json({
    id: result.rows[0].id,
    title,
    rewardAmount,
    description: description || null,
    category: category || null
  });
});

router.put("/:id", requireRole("parent"), async (req, res) => {
  const { title, rewardAmount, description, category } = req.body;

  if (!title || rewardAmount == null) {
    return res.status(400).json({ error: "title and rewardAmount are required" });
  }

  const result = await pool.query(
    `UPDATE chores
     SET title = $1, reward_amount = $2, description = $3, category = $4
     WHERE id = $5 AND family_id = $6
     RETURNING id, title, reward_amount, description, category`,
    [title, rewardAmount, description || null, category || null, req.params.id, req.user.familyId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Chore not found" });
  }

  return res.json(result.rows[0]);
});

router.patch("/:id/status", requireRole("parent"), async (req, res) => {
  const { active } = req.body;

  if (typeof active !== "boolean") {
    return res.status(400).json({ error: "active must be a boolean" });
  }

  const result = await pool.query(
    "UPDATE chores SET active = $1 WHERE id = $2 AND family_id = $3 RETURNING id, title, reward_amount, description, category, active",
    [active, req.params.id, req.user.familyId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Chore not found" });
  }

  return res.json(result.rows[0]);
});

module.exports = router;

const express = require("express");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { generateLoginCode, hashLoginCode } = require("../utils/loginCodes");

const router = express.Router();

router.use(requireAuth, requireRole("parent"));

router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, avatar_url, goal_amount FROM kids WHERE family_id = $1 ORDER BY name",
    [req.user.familyId]
  );

  return res.json({ kids: result.rows });
});

router.post("/", async (req, res) => {
  const { name, avatarUrl, goalAmount } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  const loginCode = generateLoginCode("KID");
  const loginCodeHash = hashLoginCode(loginCode);
  const result = await pool.query(
    "INSERT INTO kids (family_id, name, login_code, avatar_url, goal_amount) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [req.user.familyId, name, loginCodeHash, avatarUrl || null, goalAmount || null]
  );

  return res.status(201).json({
    id: result.rows[0].id,
    name,
    loginCode,
    avatarUrl: avatarUrl || null,
    goalAmount: goalAmount || null
  });
});

router.put("/:id", async (req, res) => {
  const updates = [];
  const values = [];

  if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
    const name = (req.body.name || "").trim();
    if (!name) {
      return res.status(400).json({ error: "name cannot be empty" });
    }
    updates.push("name = $1");
    values.push(name);
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "goalAmount")) {
    updates.push(`goal_amount = $${values.length + 1}`);
    values.push(req.body.goalAmount);
  }

  if (Object.prototype.hasOwnProperty.call(req.body, "avatarUrl")) {
    updates.push(`avatar_url = $${values.length + 1}`);
    values.push(req.body.avatarUrl);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No updates provided" });
  }

  values.push(req.params.id, req.user.familyId);

  const result = await pool.query(
    `UPDATE kids SET ${updates.join(", ")}
     WHERE id = $${values.length - 1} AND family_id = $${values.length}
     RETURNING id, name, avatar_url, goal_amount`,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Kid not found" });
  }

  return res.json(result.rows[0]);
});

module.exports = router;

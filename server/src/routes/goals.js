const express = require("express");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/me", requireRole("kid"), async (req, res) => {
  const result = await pool.query(
    "SELECT goal_amount FROM kids WHERE id = $1",
    [req.user.userId]
  );

  return res.json({ goalAmount: result.rows[0]?.goal_amount || null });
});

router.put("/me", requireRole("kid"), async (req, res) => {
  const { goalAmount } = req.body;

  if (goalAmount == null || goalAmount <= 0) {
    return res.status(400).json({ error: "goalAmount must be greater than 0" });
  }

  await pool.query(
    "UPDATE kids SET goal_amount = $1 WHERE id = $2",
    [goalAmount, req.user.userId]
  );

  return res.json({ goalAmount });
});

router.get("/family", requireRole("parent"), async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, goal_amount FROM kids WHERE family_id = $1 ORDER BY name",
    [req.user.familyId]
  );

  return res.json({ goals: result.rows });
});

module.exports = router;
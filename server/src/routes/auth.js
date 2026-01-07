const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();

function generateCode(prefix) {
  const token = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${token}`;
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" });
}

router.post("/register", async (req, res) => {
  const { familyName, parentName } = req.body;

  if (!familyName || !parentName) {
    return res.status(400).json({ error: "familyName and parentName are required" });
  }

  const familyCode = generateCode("FAM");
  const parentCode = generateCode("PAR");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const familyResult = await client.query(
      "INSERT INTO families (name, family_code) VALUES ($1, $2) RETURNING id",
      [familyName, familyCode]
    );

    const familyId = familyResult.rows[0].id;

    const parentResult = await client.query(
      "INSERT INTO parents (family_id, name, login_code) VALUES ($1, $2, $3) RETURNING id",
      [familyId, parentName, parentCode]
    );

    await client.query("COMMIT");

    const token = signToken({
      role: "parent",
      familyId,
      userId: parentResult.rows[0].id
    });

    return res.status(201).json({
      token,
      family: { id: familyId, name: familyName, familyCode },
      parent: { name: parentName, loginCode: parentCode }
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return res.status(500).json({ error: "Unable to register family" });
  } finally {
    client.release();
  }
});

router.post("/code", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "code is required" });
  }

  const parentResult = await pool.query(
    "SELECT id, family_id, name FROM parents WHERE login_code = $1",
    [code]
  );

  if (parentResult.rows.length > 0) {
    const parent = parentResult.rows[0];
    const token = signToken({
      role: "parent",
      familyId: parent.family_id,
      userId: parent.id
    });

    return res.json({
      token,
      role: "parent",
      user: { id: parent.id, name: parent.name }
    });
  }

  const kidResult = await pool.query(
    "SELECT id, family_id, name, goal_amount, avatar_url FROM kids WHERE login_code = $1",
    [code]
  );

  if (kidResult.rows.length > 0) {
    const kid = kidResult.rows[0];
    const token = signToken({
      role: "kid",
      familyId: kid.family_id,
      userId: kid.id
    });

    return res.json({
      token,
      role: "kid",
      user: {
        id: kid.id,
        name: kid.name,
        goalAmount: kid.goal_amount,
        avatarUrl: kid.avatar_url
      }
    });
  }

  return res.status(401).json({ error: "Invalid code" });
});

module.exports = router;
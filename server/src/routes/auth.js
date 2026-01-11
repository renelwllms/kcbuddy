const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = rateLimit;
const { pool } = require("../db");
const { sendFamilyWelcomeEmail } = require("../services/email");
const { generateLoginCode, hashLoginCode, normalizeLoginCode } = require("../utils/loginCodes");

const router = express.Router();

function signToken(payload) {
  const options = {
    expiresIn:
      payload.role === "kid"
        ? process.env.JWT_EXPIRES_IN_KID || "4h"
        : process.env.JWT_EXPIRES_IN_PARENT || "12h"
  };

  if (process.env.JWT_ISSUER) {
    options.issuer = process.env.JWT_ISSUER;
  }

  if (process.env.JWT_AUDIENCE) {
    options.audience = process.env.JWT_AUDIENCE;
  }

  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

const authCodeIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

const authCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    const code = normalizeLoginCode(req.body?.code || "");
    const ipKey = ipKeyGenerator(req, res);
    return code ? `${ipKey}:${code}` : ipKey;
  }
});

router.post("/register", registerLimiter, async (req, res) => {
  const { familyName, parentName } = req.body;
  const email = typeof req.body.email === "string" ? req.body.email.trim() : "";

  if (!familyName || !parentName || !email) {
    return res.status(400).json({ error: "familyName, parentName, and email are required" });
  }

  const familyCode = generateLoginCode("FAM");
  const parentCode = generateLoginCode("PAR");
  const parentCodeHash = hashLoginCode(parentCode);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const familyResult = await client.query(
      "INSERT INTO families (name, family_code) VALUES ($1, $2) RETURNING id",
      [familyName, familyCode]
    );

    const familyId = familyResult.rows[0].id;

    const parentResult = await client.query(
      "INSERT INTO parents (family_id, name, email, login_code) VALUES ($1, $2, $3, $4) RETURNING id",
      [familyId, parentName, email, parentCodeHash]
    );

    await client.query("COMMIT");

    const token = signToken({
      role: "parent",
      familyId,
      userId: parentResult.rows[0].id
    });

    sendFamilyWelcomeEmail({
      to: email,
      familyName,
      familyCode,
      parentName,
      parentCode
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("Registration email failed:", err.message);
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

router.post("/code", authCodeIpLimiter, authCodeLimiter, async (req, res) => {
  const code = normalizeLoginCode(req.body?.code || "");

  if (!code) {
    return res.status(400).json({ error: "code is required" });
  }

  const codeHash = hashLoginCode(code);

  const parentResult = await pool.query(
    "SELECT id, family_id, name FROM parents WHERE login_code = $1",
    [codeHash]
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

  const legacyParentResult = await pool.query(
    "SELECT id, family_id, name FROM parents WHERE login_code = $1",
    [code]
  );

  if (legacyParentResult.rows.length > 0) {
    const parent = legacyParentResult.rows[0];
    await pool.query("UPDATE parents SET login_code = $1 WHERE id = $2", [codeHash, parent.id]);
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
    [codeHash]
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

  const legacyKidResult = await pool.query(
    "SELECT id, family_id, name, goal_amount, avatar_url FROM kids WHERE login_code = $1",
    [code]
  );

  if (legacyKidResult.rows.length > 0) {
    const kid = legacyKidResult.rows[0];
    await pool.query("UPDATE kids SET login_code = $1 WHERE id = $2", [codeHash, kid.id]);
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

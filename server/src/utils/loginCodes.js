const crypto = require("crypto");

function normalizeLoginCode(code) {
  if (typeof code !== "string") {
    return "";
  }
  return code.trim().toUpperCase();
}

function generateLoginCode(prefix) {
  const bytes = Number(process.env.LOGIN_CODE_BYTES) || 5;
  const token = crypto.randomBytes(bytes).toString("hex").toUpperCase();
  return `${prefix}-${token}`;
}

function hashLoginCode(code) {
  const secret = process.env.LOGIN_CODE_SECRET;
  if (!secret) {
    throw new Error("LOGIN_CODE_SECRET is required");
  }
  return crypto.createHmac("sha256", secret).update(code).digest("hex");
}

module.exports = {
  generateLoginCode,
  hashLoginCode,
  normalizeLoginCode
};

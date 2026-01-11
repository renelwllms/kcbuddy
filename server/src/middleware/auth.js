const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  try {
    const options = {};
    if (process.env.JWT_ISSUER) {
      options.issuer = process.env.JWT_ISSUER;
    }
    if (process.env.JWT_AUDIENCE) {
      options.audience = process.env.JWT_AUDIENCE;
    }
    req.user = jwt.verify(token, process.env.JWT_SECRET, options);
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid auth token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return next();
  };
}

module.exports = { requireAuth, requireRole };

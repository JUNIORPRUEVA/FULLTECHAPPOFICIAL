const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, message: "Token requerido" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload; // { userId, ownerId, role... }
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, message: "Token inválido" });
  }
}

module.exports = { requireAuth };

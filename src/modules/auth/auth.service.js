const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../../config/db");
const { env } = require("../../config/env");

function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

async function register({ nombre, usuario, email, password }) {
  const existing = await pool.query("SELECT id FROM usuarios WHERE usuario=$1", [usuario]);
  if (existing.rowCount > 0) {
    const err = new Error("Ese usuario ya existe");
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const created = await pool.query(
    `INSERT INTO usuarios (nombre, usuario, email, password_hash, rol, activo, creado_en)
     VALUES ($1, $2, $3, $4, 'admin', true, NOW())
     RETURNING id, nombre, usuario, email, rol, activo`,
    [nombre, usuario, email || null, password_hash]
  );

  const u = created.rows[0];
  const token = signToken({ userId: u.id, role: u.rol });

  return { user: u, token };
}

async function login({ usuario, password }) {
  const q = await pool.query(
    "SELECT id, nombre, usuario, email, password_hash, rol, activo FROM usuarios WHERE usuario=$1",
    [usuario]
  );

  if (q.rowCount === 0) {
    const err = new Error("Credenciales inválidas");
    err.statusCode = 401;
    throw err;
  }

  const u = q.rows[0];

  if (!u.activo) {
    const err = new Error("Usuario inactivo");
    err.statusCode = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) {
    const err = new Error("Credenciales inválidas");
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ userId: u.id, role: u.rol });

  return {
    user: { id: u.id, nombre: u.nombre, usuario: u.usuario, email: u.email, rol: u.rol, activo: u.activo },
    token,
  };
}

async function getProfile(userId) {
  const q = await pool.query(
    "SELECT id, nombre, usuario, email, rol, activo, creado_en FROM usuarios WHERE id = $1",
    [userId]
  );

  if (q.rowCount === 0) {
    const err = new Error("Usuario no encontrado");
    err.statusCode = 404;
    throw err;
  }

  return q.rows[0];
}

module.exports = { register, login, getProfile };

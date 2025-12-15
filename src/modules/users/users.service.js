const bcrypt = require("bcryptjs");
const { pool } = require("../../config/db");

async function getAllUsers() {
  const q = await pool.query(
    "SELECT id, nombre, usuario, email, rol, activo, creado_en FROM usuarios ORDER BY nombre",
    []
  );
  return q.rows;
}

async function getUserById(id) {
  const q = await pool.query(
    "SELECT id, nombre, usuario, email, rol, activo, creado_en FROM usuarios WHERE id = $1",
    [id]
  );
  if (q.rowCount === 0) {
    const err = new Error("Usuario no encontrado");
    err.statusCode = 404;
    throw err;
  }
  return q.rows[0];
}

async function createUser({ nombre, usuario, email, password, rol }) {
  const existing = await pool.query("SELECT id FROM usuarios WHERE usuario = $1", [usuario]);
  if (existing.rowCount > 0) {
    const err = new Error("Ese usuario ya existe");
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const created = await pool.query(
    `INSERT INTO usuarios (nombre, usuario, email, password_hash, rol, activo, creado_en)
     VALUES ($1, $2, $3, $4, $5, true, NOW())
     RETURNING id, nombre, usuario, email, rol, activo`,
    [nombre, usuario, email || null, password_hash, rol || 'user']
  );

  return created.rows[0];
}

async function updateUser(id, updates) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.nombre !== undefined) {
    fields.push(`nombre = $${paramIndex++}`);
    values.push(updates.nombre);
  }
  if (updates.usuario !== undefined) {
    fields.push(`usuario = $${paramIndex++}`);
    values.push(updates.usuario);
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(updates.email);
  }
  if (updates.rol !== undefined) {
    fields.push(`rol = $${paramIndex++}`);
    values.push(updates.rol);
  }
  if (updates.activo !== undefined) {
    fields.push(`activo = $${paramIndex++}`);
    values.push(updates.activo);
  }

  if (fields.length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  values.push(id);

  const q = await pool.query(
    `UPDATE usuarios SET ${fields.join(", ")}, actualizado_en = NOW() WHERE id = $${paramIndex}
     RETURNING id, nombre, usuario, email, rol, activo`,
    values
  );

  if (q.rowCount === 0) {
    const err = new Error("Usuario no encontrado");
    err.statusCode = 404;
    throw err;
  }

  return q.rows[0];
}

async function deleteUser(id) {
  const q = await pool.query(
    "DELETE FROM usuarios WHERE id = $1",
    [id]
  );

  if (q.rowCount === 0) {
    const err = new Error("Usuario no encontrado");
    err.statusCode = 404;
    throw err;
  }
}

async function changePassword(id, { oldPassword, newPassword }) {
  const q = await pool.query(
    "SELECT password_hash FROM usuarios WHERE id = $1",
    [id]
  );

  if (q.rowCount === 0) {
    const err = new Error("Usuario no encontrado");
    err.statusCode = 404;
    throw err;
  }

  const ok = await bcrypt.compare(oldPassword, q.rows[0].password_hash);
  if (!ok) {
    const err = new Error("Contraseña antigua incorrecta");
    err.statusCode = 400;
    throw err;
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    "UPDATE usuarios SET password_hash = $1, actualizado_en = NOW() WHERE id = $2",
    [newHash, id]
  );
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, changePassword };
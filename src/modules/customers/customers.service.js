const { pool } = require("../../config/db");

async function getAllCustomers() {
  const q = await pool.query(
    "SELECT id, nombre, telefono, email, direccion, tipo, categoria, estado, fecha_creado FROM clientes ORDER BY nombre",
    []
  );
  return q.rows;
}

async function getCustomerById(id) {
  const q = await pool.query(
    "SELECT id, nombre, telefono, email, direccion, tipo, categoria, estado, fecha_creado FROM clientes WHERE id = $1",
    [id]
  );
  if (q.rowCount === 0) {
    const err = new Error("Cliente no encontrado");
    err.statusCode = 404;
    throw err;
  }
  return q.rows[0];
}

async function createCustomer({ nombre, telefono, email, direccion, tipo, categoria, estado }) {
  const created = await pool.query(
    `INSERT INTO clientes (nombre, telefono, email, direccion, tipo, categoria, estado, fecha_creado)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING id, nombre, telefono, email, direccion, tipo, categoria, estado, fecha_creado`,
    [nombre, telefono, email || null, direccion || null, tipo || 'persona', categoria || 'general', estado || 'activo']
  );
  return created.rows[0];
}

async function updateCustomer(id, updates) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.nombre !== undefined) {
    fields.push(`nombre = $${paramIndex++}`);
    values.push(updates.nombre);
  }
  if (updates.telefono !== undefined) {
    fields.push(`telefono = $${paramIndex++}`);
    values.push(updates.telefono);
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(updates.email);
  }
  if (updates.direccion !== undefined) {
    fields.push(`direccion = $${paramIndex++}`);
    values.push(updates.direccion);
  }
  if (updates.tipo !== undefined) {
    fields.push(`tipo = $${paramIndex++}`);
    values.push(updates.tipo);
  }
  if (updates.categoria !== undefined) {
    fields.push(`categoria = $${paramIndex++}`);
    values.push(updates.categoria);
  }
  if (updates.estado !== undefined) {
    fields.push(`estado = $${paramIndex++}`);
    values.push(updates.estado);
  }

  if (fields.length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  values.push(id);

  const q = await pool.query(
    `UPDATE clientes SET ${fields.join(", ")} WHERE id = $${paramIndex}
     RETURNING id, nombre, telefono, email, direccion, tipo, categoria, estado, fecha_creado`,
    values
  );

  if (q.rowCount === 0) {
    const err = new Error("Cliente no encontrado");
    err.statusCode = 404;
    throw err;
  }

  return q.rows[0];
}

async function deleteCustomer(id) {
  const q = await pool.query(
    "DELETE FROM clientes WHERE id = $1",
    [id]
  );

  if (q.rowCount === 0) {
    const err = new Error("Cliente no encontrado");
    err.statusCode = 404;
    throw err;
  }
}

module.exports = { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
const { pool } = require("../../config/db");

async function getAllLeads(ownerId) {
  const q = await pool.query(
    "SELECT id, nombre, email, telefono, empresa, fuente, status, notas, created_at FROM leads WHERE owner_id = $1 ORDER BY created_at DESC",
    [ownerId]
  );
  return q.rows;
}

async function getLeadById(id, ownerId) {
  const q = await pool.query(
    "SELECT id, nombre, email, telefono, empresa, fuente, status, notas, created_at FROM leads WHERE id = $1 AND owner_id = $2",
    [id, ownerId]
  );
  if (q.rowCount === 0) {
    const err = new Error("Lead no encontrado");
    err.statusCode = 404;
    throw err;
  }
  return q.rows[0];
}

async function createLead({ nombre, email, telefono, empresa, fuente, notas }, ownerId) {
  const created = await pool.query(
    `INSERT INTO leads (nombre, email, telefono, empresa, fuente, notas, status, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6, 'nuevo', $7)
     RETURNING id, nombre, email, telefono, empresa, fuente, status, notas, created_at`,
    [nombre, email || null, telefono || null, empresa || null, fuente || null, notas || null, ownerId]
  );
  return created.rows[0];
}

async function updateLead(id, updates, ownerId) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.nombre !== undefined) {
    fields.push(`nombre = $${paramIndex++}`);
    values.push(updates.nombre);
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(updates.email);
  }
  if (updates.telefono !== undefined) {
    fields.push(`telefono = $${paramIndex++}`);
    values.push(updates.telefono);
  }
  if (updates.empresa !== undefined) {
    fields.push(`empresa = $${paramIndex++}`);
    values.push(updates.empresa);
  }
  if (updates.fuente !== undefined) {
    fields.push(`fuente = $${paramIndex++}`);
    values.push(updates.fuente);
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.notas !== undefined) {
    fields.push(`notas = $${paramIndex++}`);
    values.push(updates.notas);
  }

  if (fields.length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  values.push(id, ownerId);

  const q = await pool.query(
    `UPDATE leads SET ${fields.join(", ")} WHERE id = $${paramIndex} AND owner_id = $${paramIndex + 1}
     RETURNING id, nombre, email, telefono, empresa, fuente, status, notas, created_at`,
    values
  );

  if (q.rowCount === 0) {
    const err = new Error("Lead no encontrado");
    err.statusCode = 404;
    throw err;
  }

  return q.rows[0];
}

async function deleteLead(id, ownerId) {
  const q = await pool.query(
    "DELETE FROM leads WHERE id = $1 AND owner_id = $2",
    [id, ownerId]
  );

  if (q.rowCount === 0) {
    const err = new Error("Lead no encontrado");
    err.statusCode = 404;
    throw err;
  }
}

async function convertToCustomer(leadId, ownerId) {
  const lead = await getLeadById(leadId, ownerId);

  // Create customer
  const customer = await pool.query(
    `INSERT INTO clientes (nombre, email, telefono, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, email, telefono`,
    [lead.nombre, lead.email, lead.telefono, ownerId]
  );

  // Update lead status
  await pool.query(
    "UPDATE leads SET status = 'cerrado' WHERE id = $1",
    [leadId]
  );

  return customer.rows[0];
}

module.exports = { getAllLeads, getLeadById, createLead, updateLead, deleteLead, convertToCustomer };
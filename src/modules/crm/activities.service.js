const { pool } = require("../../config/db");

async function getActivitiesForLead(leadId, ownerId) {
  // First check if lead exists and belongs to owner
  const leadCheck = await pool.query(
    "SELECT id FROM leads WHERE id = $1 AND owner_id = $2",
    [leadId, ownerId]
  );
  if (leadCheck.rowCount === 0) {
    const err = new Error("Lead no encontrado");
    err.statusCode = 404;
    throw err;
  }

  const q = await pool.query(
    "SELECT id, tipo, descripcion, fecha, created_at FROM actividades WHERE lead_id = $1 ORDER BY created_at DESC",
    [leadId]
  );
  return q.rows;
}

async function createActivity(leadId, { tipo, descripcion, fecha }, userId, ownerId) {
  // Check lead
  const leadCheck = await pool.query(
    "SELECT id FROM leads WHERE id = $1 AND owner_id = $2",
    [leadId, ownerId]
  );
  if (leadCheck.rowCount === 0) {
    const err = new Error("Lead no encontrado");
    err.statusCode = 404;
    throw err;
  }

  const created = await pool.query(
    `INSERT INTO actividades (lead_id, usuario_id, tipo, descripcion, fecha)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, tipo, descripcion, fecha, created_at`,
    [leadId, userId, tipo, descripcion, fecha || new Date().toISOString()]
  );
  return created.rows[0];
}

async function deleteActivity(id, ownerId) {
  // Check ownership through lead
  const q = await pool.query(
    `DELETE FROM actividades 
     WHERE id = $1 AND lead_id IN (
       SELECT id FROM leads WHERE owner_id = $2
     )`,
    [id, ownerId]
  );

  if (q.rowCount === 0) {
    const err = new Error("Actividad no encontrada");
    err.statusCode = 404;
    throw err;
  }
}

module.exports = { getActivitiesForLead, createActivity, deleteActivity };
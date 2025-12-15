const { pool } = require("../../config/db");

async function getAllSales() {
  const q = await pool.query(
    `SELECT v.id, v.fecha, v.monto_total, v.cliente_id, c.nombre as cliente_nombre, u.nombre as vendedor_nombre
     FROM ventas v
     LEFT JOIN clientes c ON v.cliente_id = c.id
     LEFT JOIN usuarios u ON v.vendedor_id = u.id
     ORDER BY v.fecha DESC`,
    []
  );
  return q.rows;
}

async function getSaleById(id) {
  const saleQ = await pool.query(
    `SELECT v.id, v.fecha, v.monto_total, v.cliente_id, c.nombre as cliente_nombre, u.nombre as vendedor_nombre,
            v.utilidad_total, v.tipo_venta, v.forma_pago, v.notas
     FROM ventas v
     LEFT JOIN clientes c ON v.cliente_id = c.id
     LEFT JOIN usuarios u ON v.vendedor_id = u.id
     WHERE v.id = $1`,
    [id]
  );

  if (saleQ.rowCount === 0) {
    const err = new Error("Venta no encontrada");
    err.statusCode = 404;
    throw err;
  }

  return saleQ.rows[0];
}

async function createSale({ cliente_id, monto_total, tipo_venta, forma_pago, notas }, userId) {
  const created = await pool.query(
    `INSERT INTO ventas (cliente_id, vendedor_id, fecha, monto_total, tipo_venta, forma_pago, notas)
     VALUES ($1, $2, NOW(), $3, $4, $5, $6)
     RETURNING id, fecha, monto_total`,
    [cliente_id || null, userId, monto_total, tipo_venta || 'venta', forma_pago || 'efectivo', notas || null]
  );
  return created.rows[0];
}

async function deleteSale(id) {
  const q = await pool.query(
    "DELETE FROM ventas WHERE id = $1",
    [id]
  );

  if (q.rowCount === 0) {
    const err = new Error("Venta no encontrada");
    err.statusCode = 404;
    throw err;
  }
}

module.exports = { getAllSales, getSaleById, createSale, deleteSale };
const { pool } = require("../../config/db");

async function getAllQuotes() {
  const q = await pool.query(
    `SELECT q.id, q.codigo, q.fecha, q.total, q.estado, q.notas,
            q.cliente_id, c.nombre as cliente_nombre
     FROM cotizaciones q
     LEFT JOIN clientes c ON q.cliente_id = c.id
     ORDER BY q.fecha DESC`,
    []
  );
  return q.rows;
}

async function getQuoteById(id) {
  const quoteQ = await pool.query(
    `SELECT q.id, q.codigo, q.fecha, q.total, q.estado, q.notas,
            q.cliente_id, c.nombre as cliente_nombre
     FROM cotizaciones q
     LEFT JOIN clientes c ON q.cliente_id = c.id
     WHERE q.id = $1`,
    [id]
  );

  if (quoteQ.rowCount === 0) {
    const err = new Error("Cotización no encontrada");
    err.statusCode = 404;
    throw err;
  }

  const detailsQ = await pool.query(
    `SELECT dq.id, dq.producto_id, p.nombre as producto_nombre, dq.cantidad, dq.precio_unitario, dq.subtotal
     FROM detalle_cotizaciones dq
     JOIN productos p ON dq.producto_id = p.id
     WHERE dq.cotizacion_id = $1`,
    [id]
  );

  const quote = quoteQ.rows[0];
  quote.items = detailsQ.rows;

  return quote;
}

async function createQuote({ cliente_id, fecha_vencimiento, items, notas }, userId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Calculate total
    let total = 0;
    const itemDetails = [];

    for (const item of items) {
      const productQ = await client.query(
        "SELECT nombre, precio FROM productos WHERE id = $1",
        [item.producto_id]
      );

      if (productQ.rowCount === 0) {
        throw new Error(`Producto ${item.producto_id} no encontrado`);
      }

      const product = productQ.rows[0];
      const subtotal = product.precio * item.cantidad;
      total += subtotal;

      itemDetails.push({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: product.precio,
        subtotal,
      });
    }

    // Insert quote
    const quoteQ = await client.query(
      `INSERT INTO cotizaciones (cliente_id, usuario_id, fecha_vencimiento, monto_total, notas)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, fecha_emision, fecha_vencimiento, monto_total, estado`,
      [cliente_id || null, userId, fecha_vencimiento || null, total, notas || null]
    );

    const quote = quoteQ.rows[0];

    // Insert details
    for (const item of itemDetails) {
      await client.query(
        `INSERT INTO detalle_cotizaciones (cotizacion_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [quote.id, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
      );
    }

    await client.query('COMMIT');

    return { ...quote, items: itemDetails };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function updateQuoteStatus(id, estado) {
  const q = await pool.query(
    "UPDATE cotizaciones SET estado = $1 WHERE id = $2 RETURNING id, estado",
    [estado, id]
  );

  if (q.rowCount === 0) {
    const err = new Error("Cotización no encontrada");
    err.statusCode = 404;
    throw err;
  }

  return q.rows[0];
}

async function deleteQuote(id) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delete details first
    await client.query("DELETE FROM detalle_cotizaciones WHERE cotizacion_id = $1", [id]);

    // Delete quote
    const quoteQ = await client.query("DELETE FROM cotizaciones WHERE id = $1", [id]);

    if (quoteQ.rowCount === 0) {
      throw new Error("Cotización no encontrada");
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { getAllQuotes, getQuoteById, createQuote, updateQuoteStatus, deleteQuote };
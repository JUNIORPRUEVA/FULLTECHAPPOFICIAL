const { pool } = require("../../config/db");

/**
 * NOTA IMPORTANTE (para no volver a caer):
 * - En la BD la columna real es: cotizaciones.fecha
 * - Si tu frontend espera fecha_emision, se resuelve con ALIAS:
 *   q.fecha AS fecha_emision
 */

async function getAllQuotes() {
  const q = await pool.query(
    `
    SELECT
      q.id,
      q.codigo,
      q.fecha AS fecha_emision,
      q.fecha AS fecha,
      q.subtotal,
      q.descuento,
      q.itbis,
      q.total AS monto_total,
      q.total,
      q.estado,
      q.notas,
      q.cliente_id,
      c.nombre AS cliente_nombre
    FROM cotizaciones q
    LEFT JOIN clientes c ON q.cliente_id = c.id
    ORDER BY q.fecha DESC, q.id DESC
    `,
    []
  );

  return q.rows;
}

async function getQuoteById(id) {
  const quoteQ = await pool.query(
    `
    SELECT
      q.id,
      q.codigo,
      q.fecha AS fecha_emision,
      q.fecha AS fecha,
      q.subtotal,
      q.descuento,
      q.itbis,
      q.total AS monto_total,
      q.total,
      q.estado,
      q.notas,
      q.cliente_id,
      c.nombre AS cliente_nombre
    FROM cotizaciones q
    LEFT JOIN clientes c ON q.cliente_id = c.id
    WHERE q.id = $1
    LIMIT 1
    `,
    [id]
  );

  if (quoteQ.rowCount === 0) {
    const err = new Error("Cotización no encontrada");
    err.statusCode = 404;
    throw err;
  }

  // OJO: si en tu BD la tabla se llama diferente, cámbiala aquí.
  const detailsQ = await pool.query(
    `
    SELECT
      dq.id,
      dq.producto_id,
      p.nombre AS producto_nombre,
      dq.cantidad,
      dq.precio_unitario,
      dq.subtotal
    FROM detalle_cotizaciones dq
    LEFT JOIN productos p ON dq.producto_id = p.id
    WHERE dq.cotizacion_id = $1
    ORDER BY dq.id ASC
    `,
    [id]
  );

  const quote = quoteQ.rows[0];
  quote.items = detailsQ.rows;

  return quote;
}

/**
 * Crea cotización con:
 * - fecha_emision = NOW()
 * - subtotal = total calculado
 * - descuento=0, itbis=0 (ajusta si lo usas)
 *
 * IMPORTANTE:
 * - Removí fecha_vencimiento y monto_total porque en tu esquema real suelen NO existir.
 */
async function createQuote({ cliente_id, items, notas, codigo }, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Calcular total desde productos
    let subtotal = 0;
    const itemDetails = [];

    for (const item of items || []) {
      const productQ = await client.query(
        "SELECT nombre, precio, costo FROM productos WHERE id = $1",
        [item.producto_id]
      );

      if (productQ.rowCount === 0) {
        throw new Error(`Producto ${item.producto_id} no encontrado`);
      }

      const product = productQ.rows[0];
      const precioUnitario = Number(product.precio || 0);
      const cantidad = Number(item.cantidad || 0);

      const lineSubtotal = precioUnitario * cantidad;
      subtotal += lineSubtotal;

      itemDetails.push({
        producto_id: item.producto_id,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal: lineSubtotal,
      });
    }

    const descuento = 0;
    const itbis = 0;
    const total = subtotal - descuento + itbis;

    // Insert header (ajustado a columnas reales comunes)
    const quoteQ = await client.query(
      `
      INSERT INTO cotizaciones
        (codigo, cliente_id, usuario_id, owner_id, fecha, subtotal, descuento, itbis, total, notas, estado)
      VALUES
        ($1,     $2,         $3,        $4,      NOW(), $5,       $6,        $7,   $8,    $9,   'PENDIENTE')
      RETURNING
        id,
        codigo,
        fecha AS fecha_emision,
        fecha,
        subtotal,
        descuento,
        itbis,
        total AS monto_total,
        total,
        estado,
        notas,
        cliente_id
      `,
      [
        codigo || null,
        cliente_id || null,
        userId || null,
        String(userId || ""), // owner_id como string (si no lo usas, pon null)
        subtotal,
        descuento,
        itbis,
        total,
        notas || null,
      ]
    );

    const quote = quoteQ.rows[0];

    // Insert details
    for (const item of itemDetails) {
      await client.query(
        `
        INSERT INTO detalle_cotizaciones
          (cotizacion_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES
          ($1,            $2,         $3,       $4,             $5)
        `,
        [quote.id, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
      );
    }

    await client.query("COMMIT");
    return { ...quote, items: itemDetails };
  } catch (e) {
    await client.query("ROLLBACK");
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
    await client.query("BEGIN");

    await client.query("DELETE FROM detalle_cotizaciones WHERE cotizacion_id = $1", [id]);

    const quoteQ = await client.query("DELETE FROM cotizaciones WHERE id = $1", [id]);

    if (quoteQ.rowCount === 0) {
      const err = new Error("Cotización no encontrada");
      err.statusCode = 404;
      throw err;
    }

    await client.query("COMMIT");
    return { ok: true };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { getAllQuotes, getQuoteById, createQuote, updateQuoteStatus, deleteQuote };

const { pool } = require("../../config/db");

// ✅ Tablas reales en tu BD
const QUOTES_TABLE = "cotizaciones";
const DETAILS_TABLE = "cotizacion_detalle";

async function getAllQuotes() {
  const q = await pool.query(
    `
    SELECT
      q.id,
      q.codigo,
      q.fecha,
      q.fecha AS fecha_emision,         -- ✅ alias para compatibilidad (pero la columna real es fecha)
      q.subtotal,
      q.descuento,
      q.itbis,
      q.total,
      q.estado,
      q.notas,
      q.cliente_id,
      c.nombre AS cliente_nombre
    FROM ${QUOTES_TABLE} q
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
      q.fecha,
      q.fecha AS fecha_emision,
      q.subtotal,
      q.descuento,
      q.itbis,
      q.total,
      q.estado,
      q.notas,
      q.cliente_id,
      c.nombre AS cliente_nombre
    FROM ${QUOTES_TABLE} q
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

  const detailsQ = await pool.query(
    `
    SELECT
      d.id,
      d.cotizacion_id,
      d.producto_id,
      p.nombre AS producto_nombre,
      d.descripcion,
      d.cantidad,
      d.precio,
      d.costo,
      d.itbis,
      d.total
    FROM ${DETAILS_TABLE} d
    LEFT JOIN productos p ON d.producto_id = p.id
    WHERE d.cotizacion_id = $1
    ORDER BY d.id ASC
    `,
    [id]
  );

  const quote = quoteQ.rows[0];
  quote.items = detailsQ.rows;

  return quote;
}

/**
 * createQuote() ajustado a TU esquema real:
 * - cotizaciones: (codigo, cliente_id, fecha, subtotal, descuento, itbis, total, notas, estado, usuario_id)
 * - cotizacion_detalle: (cotizacion_id, producto_id, descripcion, cantidad, precio, costo, itbis, total)
 */
async function createQuote({ codigo, cliente_id, items = [], notas, descuento = 0, itbis = 0 }, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ Calculamos subtotal/total basado en items
    let subtotal = 0;

    const cleanItems = items.map((it) => {
      const cantidad = Number(it.cantidad ?? 0);
      const precio = Number(it.precio ?? it.precio_unitario ?? 0);
      const costo = Number(it.costo ?? 0);
      const itbisLinea = Number(it.itbis ?? 0);
      const totalLinea = Number(it.total ?? (cantidad * precio));

      subtotal += totalLinea;

      return {
        producto_id: it.producto_id ?? it.productoId ?? null,
        descripcion: (it.descripcion ?? "").toString(),
        cantidad,
        precio,
        costo,
        itbis: itbisLinea,
        total: totalLinea,
      };
    });

    const descuentoNum = Number(descuento ?? 0);
    const itbisNum = Number(itbis ?? 0);

    // total = subtotal - descuento + itbis
    const total = subtotal - descuentoNum + itbisNum;

    // ✅ Insert header con columnas reales
    const quoteQ = await client.query(
      `
      INSERT INTO ${QUOTES_TABLE}
        (codigo, cliente_id, fecha, subtotal, descuento, itbis, total, notas, estado, usuario_id)
      VALUES
        ($1,     $2,        NOW(), $3,       $4,        $5,    $6,    $7,    'PENDIENTE', $8)
      RETURNING
        id, codigo, fecha, fecha AS fecha_emision, subtotal, descuento, itbis, total, estado, notas, cliente_id
      `,
      [
        codigo ?? null,
        cliente_id ?? null,
        subtotal,
        descuentoNum,
        itbisNum,
        total,
        notas ?? null,
        userId ?? null,
      ]
    );

    const quote = quoteQ.rows[0];

    // ✅ Insert detalles en cotizacion_detalle (columnas reales)
    for (const item of cleanItems) {
      await client.query(
        `
        INSERT INTO ${DETAILS_TABLE}
          (cotizacion_id, producto_id, descripcion, cantidad, precio, costo, itbis, total)
        VALUES
          ($1,           $2,         $3,          $4,       $5,     $6,    $7,    $8)
        `,
        [
          quote.id,
          item.producto_id,
          item.descripcion,
          item.cantidad,
          item.precio,
          item.costo,
          item.itbis,
          item.total,
        ]
      );
    }

    await client.query("COMMIT");

    return { ...quote, items: cleanItems };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function updateQuoteStatus(id, estado) {
  const q = await pool.query(
    `UPDATE ${QUOTES_TABLE} SET estado = $1 WHERE id = $2 RETURNING id, estado`,
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

    await client.query(`DELETE FROM ${DETAILS_TABLE} WHERE cotizacion_id = $1`, [id]);

    const quoteQ = await client.query(`DELETE FROM ${QUOTES_TABLE} WHERE id = $1`, [id]);

    if (quoteQ.rowCount === 0) {
      const err = new Error("Cotización no encontrada");
      err.statusCode = 404;
      throw err;
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { getAllQuotes, getQuoteById, createQuote, updateQuoteStatus, deleteQuote };

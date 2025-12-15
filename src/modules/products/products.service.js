const { pool } = require("../../config/db");

async function getAllProducts() {
  const q = await pool.query(
    "SELECT id, nombre, categoria, costo, precio, cantidad, codigo_barra, imagen_url, estado, fecha_creado FROM productos ORDER BY nombre",
    []
  );
  return q.rows;
}

async function getProductById(id) {
  const q = await pool.query(
    "SELECT id, nombre, categoria, costo, precio, cantidad, codigo_barra, imagen_url, estado, fecha_creado FROM productos WHERE id = $1",
    [id]
  );
  if (q.rowCount === 0) {
    const err = new Error("Producto no encontrado");
    err.statusCode = 404;
    throw err;
  }
  return q.rows[0];
}

async function createProduct({ nombre, categoria, costo, precio, cantidad, codigo_barra, imagen_url, estado }) {
  const created = await pool.query(
    `INSERT INTO productos (nombre, categoria, costo, precio, cantidad, codigo_barra, imagen_url, estado, fecha_creado)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING id, nombre, categoria, costo, precio, cantidad, codigo_barra, imagen_url, estado, fecha_creado`,
    [nombre, categoria || 'General', costo || 0, precio || 0, cantidad || 0, codigo_barra || null, imagen_url || null, estado || 'activo']
  );
  return created.rows[0];
}

async function updateProduct(id, updates) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.nombre !== undefined) {
    fields.push(`nombre = $${paramIndex++}`);
    values.push(updates.nombre);
  }
  if (updates.categoria !== undefined) {
    fields.push(`categoria = $${paramIndex++}`);
    values.push(updates.categoria);
  }
  if (updates.costo !== undefined) {
    fields.push(`costo = $${paramIndex++}`);
    values.push(updates.costo);
  }
  if (updates.precio !== undefined) {
    fields.push(`precio = $${paramIndex++}`);
    values.push(updates.precio);
  }
  if (updates.cantidad !== undefined) {
    fields.push(`cantidad = $${paramIndex++}`);
    values.push(updates.cantidad);
  }
  if (updates.codigo_barra !== undefined) {
    fields.push(`codigo_barra = $${paramIndex++}`);
    values.push(updates.codigo_barra);
  }
  if (updates.imagen_url !== undefined) {
    fields.push(`imagen_url = $${paramIndex++}`);
    values.push(updates.imagen_url);
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
    `UPDATE productos SET ${fields.join(", ")} WHERE id = $${paramIndex}
     RETURNING id, nombre, categoria, costo, precio, cantidad, codigo_barra, imagen_url, estado, fecha_creado`,
    values
  );

  if (q.rowCount === 0) {
    const err = new Error("Producto no encontrado");
    err.statusCode = 404;
    throw err;
  }

  return q.rows[0];
}

async function deleteProduct(id) {
  const q = await pool.query(
    "DELETE FROM productos WHERE id = $1",
    [id]
  );

  if (q.rowCount === 0) {
    const err = new Error("Producto no encontrado");
    err.statusCode = 404;
    throw err;
  }
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
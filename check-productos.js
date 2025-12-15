const { pool } = require("./src/config/db");

async function checkProductsStructure() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'productos'
      ORDER BY ordinal_position
    `);
    console.log("📋 Estructura de tabla 'productos':");
    res.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
  } catch (err) {
    console.error("❌ Error al obtener estructura:", err.message);
  } finally {
    pool.end();
  }
}

checkProductsStructure();
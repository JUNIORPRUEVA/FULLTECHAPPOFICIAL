const { pool } = require("./src/config/db");

async function checkClientesStructure() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clientes'
      ORDER BY ordinal_position
    `);
    console.log("📋 Estructura de tabla 'clientes':");
    res.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
  } catch (err) {
    console.error("❌ Error al obtener estructura:", err.message);
  } finally {
    pool.end();
  }
}

checkClientesStructure();
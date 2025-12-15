const { pool } = require("./src/config/db");

async function testDB() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Conexión a base de datos exitosa:", res.rows[0]);
  } catch (err) {
    console.error("❌ Error en conexión a base de datos:", err.message);
  } finally {
    pool.end();
  }
}

testDB();
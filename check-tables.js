const { pool } = require("./src/config/db");

async function checkTables() {
  const tables = [
    'usuarios',
    'productos',
    'categorias',
    'clientes',
    'ventas',
    'detalle_ventas',
    'leads',
    'actividades'
  ];

  console.log("🔍 Verificando tablas en la base de datos...\n");

  for (const table of tables) {
    try {
      await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
      console.log(`✅ Tabla '${table}' existe y es accesible`);
    } catch (err) {
      console.log(`❌ Tabla '${table}' NO existe o hay error: ${err.message}`);
    }
  }

  pool.end();
}

checkTables();
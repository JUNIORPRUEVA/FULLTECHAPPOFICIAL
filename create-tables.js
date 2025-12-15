require('dotenv').config();
const { pool } = require('./src/config/db');

async function createTables() {
  try {
    console.log('Creando tablas faltantes...');

    // Tabla detalle_ventas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS detalle_ventas (
        id SERIAL PRIMARY KEY,
        venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
        producto_id INTEGER REFERENCES productos(id),
        cantidad INTEGER NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        fecha_creado TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabla detalle_ventas creada');

    // Tabla leads
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        email VARCHAR(200),
        telefono VARCHAR(50),
        empresa VARCHAR(200),
        fuente VARCHAR(100),
        status VARCHAR(50) DEFAULT 'nuevo',
        notas TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        synced BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('✅ Tabla leads creada');

    // Tabla actividades
    await pool.query(`
      CREATE TABLE IF NOT EXISTS actividades (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        usuario_id INTEGER REFERENCES usuarios(id),
        tipo VARCHAR(50) NOT NULL,
        descripcion TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabla actividades creada');

    // Tabla cotizaciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cotizaciones (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id),
        usuario_id INTEGER REFERENCES usuarios(id),
        fecha_emision TIMESTAMP DEFAULT NOW(),
        fecha_vencimiento TIMESTAMP,
        monto_total DECIMAL(10,2),
        estado VARCHAR(50) DEFAULT 'pendiente',
        notas TEXT,
        synced BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('✅ Tabla cotizaciones creada');

    // Tabla detalle_cotizaciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS detalle_cotizaciones (
        id SERIAL PRIMARY KEY,
        cotizacion_id INTEGER REFERENCES cotizaciones(id) ON DELETE CASCADE,
        producto_id INTEGER REFERENCES productos(id),
        cantidad INTEGER NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL
      )
    `);
    console.log('✅ Tabla detalle_cotizaciones creada');

    // Índices
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_detalle_ventas_venta_id ON detalle_ventas(venta_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_detalle_ventas_producto_id ON detalle_ventas(producto_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_actividades_lead_id ON actividades(lead_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente_id ON cotizaciones(cliente_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_detalle_cotizaciones_cotizacion_id ON detalle_cotizaciones(cotizacion_id)`);

    console.log('✅ Índices creados');
    console.log('🎉 Todas las tablas faltantes han sido creadas exitosamente!');

  } catch (error) {
    console.error('❌ Error creando tablas:', error);
  } finally {
    await pool.end();
  }
}

createTables();
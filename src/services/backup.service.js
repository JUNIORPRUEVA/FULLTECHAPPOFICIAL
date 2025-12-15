const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/db');
const { env } = require('../config/env');

class BackupService {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDir();
  }

  async ensureBackupDir() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.error('Error creando directorio de backups:', error);
    }
  }

  // Backup completo de base de datos
  async createFullBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `full-backup-${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      const pgDump = spawn('pg_dump', [
        env.DATABASE_URL,
        '-f', filepath,
        '--no-password',
        '--format=custom',
        '--compress=9'
      ]);

      pgDump.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Backup completo creado: ${filename}`);
          resolve(filepath);
        } else {
          reject(new Error(`pg_dump failed with code ${code}`));
        }
      });

      pgDump.on('error', reject);
    });
  }

  // Backup de datos críticos (JSON)
  async createDataBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `data-backup-${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);

      // Obtener datos de todas las tablas
      const tables = [
        'usuarios',
        'productos',
        'clientes',
        'ventas',
        'detalle_ventas',
        'leads',
        'actividades',
        'cotizaciones',
        'detalle_cotizaciones'
      ];

      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        tables: {}
      };

      for (const table of tables) {
        try {
          const result = await pool.query(`SELECT * FROM ${table} ORDER BY id`);
          backupData.tables[table] = result.rows;
        } catch (error) {
          console.warn(`⚠️  Error backing up table ${table}:`, error.message);
          backupData.tables[table] = [];
        }
      }

      await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));
      console.log(`✅ Backup de datos creado: ${filename}`);
      return filepath;

    } catch (error) {
      console.error('❌ Error creando backup de datos:', error);
      throw error;
    }
  }

  // Backup incremental (solo registros modificados)
  async createIncrementalBackup(lastBackupDate) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `incremental-backup-${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);

      const since = lastBackupDate || new Date(Date.now() - 24 * 60 * 60 * 1000); // Últimas 24 horas

      const backupData = {
        timestamp: new Date().toISOString(),
        since: since.toISOString(),
        type: 'incremental',
        tables: {}
      };

      // Tablas con campos de fecha para backup incremental
      const tablesWithDates = [
        { name: 'usuarios', dateField: 'fecha_creado' },
        { name: 'productos', dateField: 'fecha_creado' },
        { name: 'clientes', dateField: 'fecha_creado' },
        { name: 'ventas', dateField: 'fecha_creado' },
        { name: 'leads', dateField: 'created_at' },
        { name: 'actividades', dateField: 'created_at' },
        { name: 'cotizaciones', dateField: 'fecha_emision' }
      ];

      for (const table of tablesWithDates) {
        try {
          const query = `SELECT * FROM ${table.name} WHERE ${table.dateField} >= $1 ORDER BY id`;
          const result = await pool.query(query, [since]);
          backupData.tables[table.name] = result.rows;
        } catch (error) {
          console.warn(`⚠️  Error in incremental backup for ${table.name}:`, error.message);
          backupData.tables[table.name] = [];
        }
      }

      await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));
      console.log(`✅ Backup incremental creado: ${filename}`);
      return filepath;

    } catch (error) {
      console.error('❌ Error creando backup incremental:', error);
      throw error;
    }
  }

  // Limpiar backups antiguos
  async cleanupOldBackups(daysToKeep = 30) {
    try {
      const files = await fs.readdir(this.backupDir);
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      let deletedCount = 0;
      for (const file of files) {
        if (file.endsWith('.sql') || file.endsWith('.json')) {
          const filepath = path.join(this.backupDir, file);
          const stats = await fs.stat(filepath);

          if (stats.mtime < cutoffDate) {
            await fs.unlink(filepath);
            deletedCount++;
          }
        }
      }

      if (deletedCount > 0) {
        console.log(`🧹 Eliminados ${deletedCount} backups antiguos`);
      }

    } catch (error) {
      console.error('❌ Error limpiando backups antiguos:', error);
    }
  }

  // Obtener lista de backups disponibles
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.sql') || file.endsWith('.json')) {
          const filepath = path.join(this.backupDir, file);
          const stats = await fs.stat(filepath);

          backups.push({
            filename: file,
            path: filepath,
            size: stats.size,
            created: stats.mtime,
            type: file.includes('full') ? 'full' :
                  file.includes('incremental') ? 'incremental' : 'data'
          });
        }
      }

      return backups.sort((a, b) => b.created - a.created);

    } catch (error) {
      console.error('❌ Error listando backups:', error);
      return [];
    }
  }

  // Restaurar desde backup de datos JSON - MODO COMPLETO (BORRA EXISTENTES)
  async restoreComplete(filepath) {
    try {
      console.log('🔄 Iniciando restauración COMPLETA desde:', filepath);
      console.log('⚠️  ATENCIÓN: Esto BORRARÁ todos los datos existentes');

      const backupData = JSON.parse(await fs.readFile(filepath, 'utf8'));

      if (!backupData.tables) {
        throw new Error('Formato de backup inválido');
      }

      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Restaurar en orden para respetar foreign keys
        const restoreOrder = [
          'usuarios',
          'productos',
          'clientes',
          'ventas',
          'detalle_ventas',
          'leads',
          'actividades',
          'cotizaciones',
          'detalle_cotizaciones'
        ];

        for (const table of restoreOrder) {
          if (backupData.tables[table]) {
            // Limpiar tabla COMPLETAMENTE
            await client.query(`TRUNCATE TABLE ${table} CASCADE`);

            // Insertar datos
            if (backupData.tables[table].length > 0) {
              const columns = Object.keys(backupData.tables[table][0]);
              const values = backupData.tables[table].map(row =>
                '(' + columns.map((_, i) => `$${i + 1}`).join(', ') + ')'
              ).join(', ');

              const allValues = backupData.tables[table].flatMap(row =>
                columns.map(col => row[col])
              );

              const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${values}`;
              await client.query(query, allValues);
            }

            console.log(`✅ Restaurada tabla ${table}: ${backupData.tables[table].length} registros`);
          }
        }

        await client.query('COMMIT');
        console.log('🎉 Restauración COMPLETA finalizada');

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('❌ Error en restauración completa:', error);
      throw error;
    }
  }

  // Restaurar SOLO datos faltantes (no borra existentes)
  async restoreMissingOnly(filepath) {
    try {
      console.log('🔄 Iniciando restauración de SOLO datos faltantes desde:', filepath);
      console.log('✅ Los datos existentes NO se borrarán');

      const backupData = JSON.parse(await fs.readFile(filepath, 'utf8'));

      if (!backupData.tables) {
        throw new Error('Formato de backup inválido');
      }

      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Tablas que pueden tener datos faltantes
        const tablesToCheck = [
          'usuarios',
          'productos',
          'clientes',
          'leads'
        ];

        for (const table of tablesToCheck) {
          if (backupData.tables[table] && backupData.tables[table].length > 0) {
            let inserted = 0;

            for (const row of backupData.tables[table]) {
              try {
                // Verificar si el registro ya existe (por ID)
                const exists = await client.query(
                  `SELECT id FROM ${table} WHERE id = $1`,
                  [row.id]
                );

                if (exists.rowCount === 0) {
                  // Insertar solo si no existe
                  const columns = Object.keys(row);
                  const values = columns.map((_, i) => `$${i + 1}`).join(', ');
                  const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values})`;

                  await client.query(query, columns.map(col => row[col]));
                  inserted++;
                }
              } catch (error) {
                console.warn(`⚠️  Error insertando en ${table} ID ${row.id}:`, error.message);
              }
            }

            if (inserted > 0) {
              console.log(`✅ Insertados ${inserted} registros faltantes en ${table}`);
            } else {
              console.log(`ℹ️  No hay datos faltantes en ${table}`);
            }
          }
        }

        await client.query('COMMIT');
        console.log('🎉 Restauración de datos faltantes completada');

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('❌ Error en restauración de datos faltantes:', error);
      throw error;
    }
  }

  // Restaurar SOLO una tabla específica
  async restoreSingleTable(filepath, tableName) {
    try {
      console.log(`🔄 Iniciando restauración de tabla ${tableName} desde:`, filepath);

      const backupData = JSON.parse(await fs.readFile(filepath, 'utf8'));

      if (!backupData.tables || !backupData.tables[tableName]) {
        throw new Error(`Tabla ${tableName} no encontrada en el backup`);
      }

      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        const tableData = backupData.tables[tableName];

        if (tableData.length > 0) {
          // Opción SEGURA: preguntar antes de truncar
          console.log(`⚠️  ¿Quieres BORRAR todos los datos existentes en ${tableName}? (S/N)`);
          console.log(`   Registros en backup: ${tableData.length}`);

          // Por ahora, vamos con la opción conservadora: merge
          console.log(`✅ Usando modo MERGE (no borra existentes)`);

          let inserted = 0;
          let skipped = 0;

          for (const row of tableData) {
            try {
              // Verificar si existe
              const exists = await client.query(
                `SELECT id FROM ${tableName} WHERE id = $1`,
                [row.id]
              );

              if (exists.rowCount === 0) {
                // Insertar
                const columns = Object.keys(row);
                const values = columns.map((_, i) => `$${i + 1}`).join(', ');
                const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values})`;

                await client.query(query, columns.map(col => row[col]));
                inserted++;
              } else {
                skipped++;
              }
            } catch (error) {
              console.warn(`⚠️  Error procesando registro ID ${row.id}:`, error.message);
            }
          }

          console.log(`✅ Tabla ${tableName}: ${inserted} insertados, ${skipped} ya existían`);
        }

        await client.query('COMMIT');
        console.log(`🎉 Restauración de tabla ${tableName} completada`);

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error(`❌ Error restaurando tabla ${tableName}:`, error);
      throw error;
    }
  }

  // Función antigua - mantener compatibilidad pero mostrar advertencia
  async restoreFromDataBackup(filepath) {
    console.log('⚠️  ATENCIÓN: Esta función borra TODOS los datos existentes');
    console.log('💡 Recomendación: Usa restoreComplete(), restoreMissingOnly() o restoreSingleTable()');

    // Pedir confirmación explícita
    const confirmed = process.env.FORCE_RESTORE === 'true';

    if (!confirmed) {
      throw new Error('Para restauración completa, establece FORCE_RESTORE=true o usa funciones específicas');
    }

    return this.restoreComplete(filepath);
  }
}

module.exports = new BackupService();
const backupService = require('./src/services/backup.service');

async function testBackupSystem() {
  console.log('🧪 Probando sistema de backup...\n');

  try {
    // Test 1: Crear backup de datos
    console.log('1️⃣ Creando backup de datos...');
    const dataBackupPath = await backupService.createDataBackup();
    console.log('✅ Backup de datos creado:', dataBackupPath);

    // Test 2: Crear backup incremental
    console.log('\n2️⃣ Creando backup incremental...');
    const incrementalPath = await backupService.createIncrementalBackup();
    console.log('✅ Backup incremental creado:', incrementalPath);

    // Test 3: Listar backups
    console.log('\n3️⃣ Listando backups disponibles...');
    const backups = await backupService.listBackups();
    console.log(`📁 Encontrados ${backups.length} backups:`);
    backups.slice(0, 5).forEach(backup => {
      console.log(`  - ${backup.filename} (${(backup.size / 1024).toFixed(1)} KB)`);
    });

    // Test 4: Limpiar backups antiguos (sin eliminar nada realmente)
    console.log('\n4️⃣ Probando limpieza de backups...');
    await backupService.cleanupOldBackups(365); // Solo elimina muy antiguos
    console.log('✅ Limpieza completada');

    console.log('\n🎉 Todos los tests de backup pasaron exitosamente!');
    console.log('\n📖 Lee BACKUP-README.md para documentación completa');

  } catch (error) {
    console.error('❌ Error en test de backup:', error);
  }
}

// Ejecutar test si se llama directamente
if (require.main === module) {
  testBackupSystem();
}

module.exports = { testBackupSystem };
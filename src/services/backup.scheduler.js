const cron = require('node-cron');
const backupService = require('./backup.service');

class BackupScheduler {
  constructor() {
    this.jobs = [];
  }

  // Backup diario completo (todos los días a las 2:00 AM)
  startDailyFullBackup() {
    const job = cron.schedule('0 2 * * *', async () => {
      console.log('🔄 Iniciando backup diario completo...');
      try {
        await backupService.createFullBackup();
        console.log('✅ Backup diario completo completado');
      } catch (error) {
        console.error('❌ Error en backup diario completo:', error);
      }
    });

    this.jobs.push({ name: 'daily-full', job });
    console.log('📅 Backup diario completo programado para las 2:00 AM');
  }

  // Backup de datos diario (todos los días a las 3:00 AM)
  startDailyDataBackup() {
    const job = cron.schedule('0 3 * * *', async () => {
      console.log('🔄 Iniciando backup diario de datos...');
      try {
        await backupService.createDataBackup();
        console.log('✅ Backup diario de datos completado');
      } catch (error) {
        console.error('❌ Error en backup diario de datos:', error);
      }
    });

    this.jobs.push({ name: 'daily-data', job });
    console.log('📅 Backup diario de datos programado para las 3:00 AM');
  }

  // Backup incremental cada 6 horas
  startIncrementalBackup() {
    const job = cron.schedule('0 */6 * * *', async () => {
      console.log('🔄 Iniciando backup incremental...');
      try {
        await backupService.createIncrementalBackup();
        console.log('✅ Backup incremental completado');
      } catch (error) {
        console.error('❌ Error en backup incremental:', error);
      }
    });

    this.jobs.push({ name: 'incremental', job });
    console.log('📅 Backup incremental programado cada 6 horas');
  }

  // Limpieza semanal de backups antiguos (domingos a las 4:00 AM)
  startWeeklyCleanup() {
    const job = cron.schedule('0 4 * * 0', async () => {
      console.log('🧹 Iniciando limpieza semanal de backups...');
      try {
        await backupService.cleanupOldBackups(30); // Mantener 30 días
        console.log('✅ Limpieza semanal completada');
      } catch (error) {
        console.error('❌ Error en limpieza semanal:', error);
      }
    });

    this.jobs.push({ name: 'weekly-cleanup', job });
    console.log('📅 Limpieza semanal programada para domingos 4:00 AM');
  }

  // Iniciar todos los backups programados
  startAll() {
    console.log('🚀 Iniciando sistema de backup automático...');

    this.startDailyFullBackup();
    this.startDailyDataBackup();
    this.startIncrementalBackup();
    this.startWeeklyCleanup();

    console.log(`✅ ${this.jobs.length} tareas de backup programadas`);
  }

  // Detener todos los backups programados
  stopAll() {
    console.log('🛑 Deteniendo sistema de backup automático...');

    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`⏹️  Tarea '${name}' detenida`);
    });

    this.jobs = [];
  }

  // Obtener estado de las tareas
  getStatus() {
    return this.jobs.map(({ name, job }) => ({
      name,
      running: job.running,
      scheduled: job.scheduled
    }));
  }
}

module.exports = new BackupScheduler();
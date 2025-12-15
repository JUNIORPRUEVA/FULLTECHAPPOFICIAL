const asyncHandler = require("../../utils/asyncHandler");
const backupService = require("../../services/backup.service");

const createFullBackup = asyncHandler(async (req, res) => {
  const filepath = await backupService.createFullBackup();
  res.json({
    success: true,
    message: "Backup completo creado exitosamente",
    filepath: filepath
  });
});

const createDataBackup = asyncHandler(async (req, res) => {
  const filepath = await backupService.createDataBackup();
  res.json({
    success: true,
    message: "Backup de datos creado exitosamente",
    filepath: filepath
  });
});

const createIncrementalBackup = asyncHandler(async (req, res) => {
  const lastBackup = req.query.since ? new Date(req.query.since) : null;
  const filepath = await backupService.createIncrementalBackup(lastBackup);
  res.json({
    success: true,
    message: "Backup incremental creado exitosamente",
    filepath: filepath
  });
});

const listBackups = asyncHandler(async (req, res) => {
  const backups = await backupService.listBackups();
  res.json({
    success: true,
    data: backups
  });
});

const cleanupBackups = asyncHandler(async (req, res) => {
  const daysToKeep = parseInt(req.query.days) || 30;
  await backupService.cleanupOldBackups(daysToKeep);
  res.json({
    success: true,
    message: `Backups antiguos limpiados (manteniendo ${daysToKeep} días)`
  });
});

// Restauración COMPLETA (BORRA TODOS LOS DATOS EXISTENTES)
const restoreComplete = asyncHandler(async (req, res) => {
  const { filepath, confirm } = req.body;

  if (!filepath) {
    return res.status(400).json({
      success: false,
      message: "Se requiere el campo 'filepath'"
    });
  }

  if (confirm !== true) {
    return res.status(400).json({
      success: false,
      message: "Debes confirmar con 'confirm: true' - Esto BORRARÁ todos los datos existentes",
      warning: "Esta acción no se puede deshacer"
    });
  }

  await backupService.restoreComplete(filepath);
  res.json({
    success: true,
    message: "Restauración COMPLETA realizada exitosamente",
    warning: "Todos los datos anteriores fueron reemplazados"
  });
});

// Restauración de SOLO datos faltantes (NO BORRA EXISTENTES)
const restoreMissingOnly = asyncHandler(async (req, res) => {
  const { filepath } = req.body;

  if (!filepath) {
    return res.status(400).json({
      success: false,
      message: "Se requiere el campo 'filepath'"
    });
  }

  await backupService.restoreMissingOnly(filepath);
  res.json({
    success: true,
    message: "Restauración de datos faltantes completada",
    info: "Los datos existentes se conservaron"
  });
});

// Restauración de UNA SOLA tabla
const restoreSingleTable = asyncHandler(async (req, res) => {
  const { filepath, table } = req.body;

  if (!filepath || !table) {
    return res.status(400).json({
      success: false,
      message: "Se requieren los campos 'filepath' y 'table'"
    });
  }

  // Validar tabla permitida
  const allowedTables = [
    'usuarios', 'productos', 'clientes', 'ventas',
    'detalle_ventas', 'leads', 'actividades',
    'cotizaciones', 'detalle_cotizaciones'
  ];

  if (!allowedTables.includes(table)) {
    return res.status(400).json({
      success: false,
      message: `Tabla no permitida. Tablas válidas: ${allowedTables.join(', ')}`
    });
  }

  await backupService.restoreSingleTable(filepath, table);
  res.json({
    success: true,
    message: `Restauración de tabla '${table}' completada`,
    info: "Modo seguro: no se borraron datos existentes"
  });
});

// Endpoint legacy - mantener compatibilidad pero con advertencias
const restoreBackup = asyncHandler(async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Este endpoint está DEPRECADO",
    recommendation: "Usa uno de los siguientes endpoints específicos:",
    endpoints: {
      "POST /api/backup/restore/complete": "Restauración completa (BORRA TODOS los datos)",
      "POST /api/backup/restore/missing": "Solo datos faltantes (SEGURA)",
      "POST /api/backup/restore/table": "Restaurar tabla específica (SEGURA)"
    }
  });
});

module.exports = {
  createFullBackup,
  createDataBackup,
  createIncrementalBackup,
  listBackups,
  cleanupBackups,
  restoreComplete,
  restoreMissingOnly,
  restoreSingleTable,
  restoreBackup // Legacy
};
const express = require("express");
const {
  createFullBackup,
  createDataBackup,
  createIncrementalBackup,
  listBackups,
  cleanupBackups,
  restoreComplete,
  restoreMissingOnly,
  restoreSingleTable,
  restoreBackup
} = require("./backup.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Crear backups
router.post("/full", createFullBackup);
router.post("/data", createDataBackup);
router.post("/incremental", createIncrementalBackup);

// Gestionar backups
router.get("/", listBackups);
router.delete("/cleanup", cleanupBackups);

// Restauración SEGURA - Solo datos faltantes
router.post("/restore/missing", restoreMissingOnly);

// Restauración SEGURA - Tabla específica
router.post("/restore/table", restoreSingleTable);

// Restauración COMPLETA - BORRA TODOS LOS DATOS (usar con cuidado)
router.post("/restore/complete", restoreComplete);

// Endpoint legacy (deprecado)
router.post("/restore", restoreBackup);

module.exports = router;
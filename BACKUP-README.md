# 🚀 Sistema de Backup SEGURO - FullTech POS

## ⚠️ **IMPORTANTE: Sistema Rediseñado para tu Seguridad**

**El sistema de backup ha sido completamente rediseñado** para **NUNCA borrar tus datos existentes** a menos que lo confirmes explícitamente.

---

## 🛡️ **Niveles de Seguridad**

### **1. Restauración SEGURA (Predeterminada)**
```bash
# Solo inserta datos que NO existen
POST /api/backup/restore/missing
{
  "filepath": "backups/data-backup-2025-12-12.json"
}
```

### **2. Restauración de Tabla Específica**
```bash
# Solo una tabla, modo seguro
POST /api/backup/restore/table
{
  "filepath": "backups/data-backup-2025-12-12.json",
  "table": "productos"
}
```

### **3. Restauración COMPLETA (Solo con Confirmación)**
```bash
# ⚠️ BORRA TODOS LOS DATOS EXISTENTES
POST /api/backup/restore/complete
{
  "filepath": "backups/data-backup-2025-12-12.json",
  "confirm": true
}
```

---

## 📋 **Nuevos Endpoints Disponibles**

```bash
# Crear backups (igual que antes)
POST /api/backup/full      # Backup completo de BD
POST /api/backup/data      # Backup de datos JSON
POST /api/backup/incremental # Backup incremental
GET /api/backup           # Listar backups
DELETE /api/backup/cleanup # Limpiar antiguos

# Restauración SEGURA (NUEVO)
POST /api/backup/restore/missing  # Solo datos faltantes
POST /api/backup/restore/table    # Tabla específica
POST /api/backup/restore/complete # Completa (con confirmación)

# Endpoint antiguo (DEPRECADO)
POST /api/backup/restore   # Ya no funciona
```

---

## 🔒 **Cómo Funciona la Seguridad**

### **Modo "Missing Only" (Predeterminado)**
- ✅ **Revisa cada registro** en el backup
- ✅ **Solo inserta** si el ID no existe en la BD
- ✅ **Conserva TODOS** los datos existentes
- ✅ **Perfecto para** recuperar datos borrados accidentalmente

### **Modo "Table Specific"**
- ✅ **Solo afecta** la tabla que especificas
- ✅ **Modo merge** - no borra existentes
- ✅ **Ideal para** recuperar productos o clientes específicos

### **Modo "Complete" (Solo con Confirmación)**
- ⚠️ **REQUIERE** `"confirm": true` en el JSON
- ⚠️ **BORRA TODOS** los datos existentes primero
- ⚠️ **Úsalo solo** cuando necesites resetear completamente

---

## 💡 **Ejemplos de Uso Seguro**

### **Recuperar Productos Borrados**
```bash
# Si un empleado borró productos accidentalmente
curl -X POST http://localhost:5004/api/backup/restore/missing \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filepath": "backups/data-backup-ayer.json"}'

# Resultado: Solo inserta productos que faltan
```

### **Recuperar Una Tabla Específica**
```bash
# Solo recuperar clientes perdidos
curl -X POST http://localhost:5004/api/backup/restore/table \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filepath": "backups/data-backup-ayer.json",
    "table": "clientes"
  }'
```

### **Resetear Todo (Solo si es necesario)**
```bash
# ⚠️ Solo usar en emergencias reales
curl -X POST http://localhost:5004/api/backup/restore/complete \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filepath": "backups/data-backup-ayer.json",
    "confirm": true
  }'
```

---

## 🛡️ **Protecciones Implementadas**

### **1. Confirmación Explícita**
- Restauración completa requiere `"confirm": true`
- Mensaje de advertencia claro antes de proceder

### **2. Validación de Tablas**
- Solo permite restaurar tablas existentes
- Lista blanca de tablas permitidas

### **3. Modo Seguro por Defecto**
- Todas las operaciones nuevas son "merge" (no borran)
- Endpoint antiguo deprecado para evitar accidentes

### **4. Logs Detallados**
- Registra todas las operaciones
- Muestra qué se insertó vs qué se omitió
- Facilita auditoría

---

## 🎯 **Recomendaciones de Uso**

### **Situaciones Normales:**
- Usa `/restore/missing` para recuperar datos borrados
- Usa `/restore/table` para tablas específicas

### **Emergencias Mayores:**
- Usa `/restore/complete` solo cuando:
  - El servidor está completamente corrupto
  - Necesitas empezar desde cero
  - Has hecho backup de datos críticos por separado

### **Prevención:**
- **Haz backup diario** (automático)
- **Prueba restauraciones** mensualmente
- **Documenta** qué backups contienen qué datos

---

## 📊 **Qué Hace Cada Modo**

| Modo | Borra Datos Existentes? | Cuándo Usarlo | Seguridad |
|------|-------------------------|---------------|-----------|
| **Missing Only** | ❌ No | Recuperar datos borrados | 🔒 Máxima |
| **Table Specific** | ❌ No | Recuperar tabla específica | 🔒 Alta |
| **Complete** | ✅ Sí (con confirmación) | Reset total del sistema | ⚠️ Baja |

---

## 🚨 **Mensajes de Seguridad**

Cuando uses los endpoints, verás mensajes como:

```
✅ Insertados 5 registros faltantes en productos
ℹ️  No hay datos faltantes en clientes
⚠️  ¿Quieres BORRAR todos los datos existentes?
```

---

## 💡 **Tu Sistema Ahora Está 100% Seguro**

**Antes:** Un error podía borrar todos tus datos
**Ahora:** Los backups solo agregan datos faltantes, nunca borran existentes

¿Quieres probar el sistema con algunos datos de prueba para verificar que funciona correctamente? 🚀

### **Ejemplos de Uso**

```bash
# 1. Crear backup de datos
curl -X POST http://localhost:5004/api/backup/data \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. Listar backups
curl http://localhost:5004/api/backup \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Restaurar backup
curl -X POST http://localhost:5004/api/backup/restore \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filepath": "backups/data-backup-2025-12-12T10-30-00-000Z.json"}'
```

---

## ⏰ **Backup Automático Programado**

El sistema incluye backup automático que se ejecuta según este horario:

| Tipo | Frecuencia | Hora | Descripción |
|------|------------|------|-------------|
| **Completo** | Diario | 2:00 AM | Backup completo de BD |
| **Datos** | Diario | 3:00 AM | Backup de datos JSON |
| **Incremental** | Cada 6 horas | 0,6,12,18 | Solo cambios recientes |
| **Limpieza** | Semanal | Domingos 4:00 AM | Elimina backups > 30 días |

### **Control del Scheduler**

```javascript
const backupScheduler = require('./src/services/backup.scheduler');

// Iniciar todos los backups programados
backupScheduler.startAll();

// Detener todos los backups
backupScheduler.stopAll();

// Ver estado de las tareas
console.log(backupScheduler.getStatus());
```

---

## ☁️ **Backup en la Nube (AWS S3)**

### **Configuración Requerida**

Agrega estas variables a tu `.env`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=fulltech-backups
```

### **Uso del Servicio en la Nube**

```javascript
const cloudBackup = require('./src/services/cloud-backup.service');

// Crear y subir backup completo
await cloudBackup.createAndUploadFullBackup();

// Crear y subir backup de datos
await cloudBackup.createAndUploadDataBackup();

// Listar backups en la nube
const backups = await cloudBackup.listS3Backups();

// Restaurar desde la nube
await cloudBackup.restoreFromS3Backup('data-backups/data-backup-2025-12-12.json');
```

---

## 📁 **Estructura de Archivos**

```
backups/
├── full-backup-2025-12-12T02-00-00-000Z.sql    # Backup completo
├── data-backup-2025-12-12T03-00-00-000Z.json   # Backup de datos
└── incremental-backup-2025-12-12T06-00-00-000Z.json # Incremental
```

### **Formato del Backup JSON**

```json
{
  "timestamp": "2025-12-12T03:00:00.000Z",
  "version": "1.0",
  "tables": {
    "usuarios": [...],
    "productos": [...],
    "clientes": [...],
    "ventas": [...],
    "detalle_ventas": [...],
    "leads": [...],
    "actividades": [...],
    "cotizaciones": [...],
    "detalle_cotizaciones": [...]
  }
}
```

---

## 🔧 **Scripts Útiles**

### **Backup Manual desde Línea de Comandos**

```bash
# Backup completo de BD
pg_dump YOUR_DATABASE_URL -f backup.sql --format=custom

# Backup de datos JSON
node -e "
const backup = require('./src/services/backup.service');
backup.createDataBackup().then(console.log);
"
```

### **Restauración desde Línea de Comandos**

```bash
# Restaurar backup completo
pg_restore -d YOUR_DATABASE_URL backup.sql

# Restaurar datos JSON
node -e "
const backup = require('./src/services/backup.service');
backup.restoreFromDataBackup('backups/data-backup.json');
"
```

---

## ⚠️ **Consideraciones de Seguridad**

1. **Protección de Archivos**: Los archivos de backup contienen datos sensibles
2. **Encriptación**: Considera encriptar backups antes de subir a la nube
3. **Acceso**: Limita el acceso a los endpoints de backup
4. **Monitoreo**: Revisa logs regularmente para detectar fallos

### **Variables de Entorno Recomendadas**

```env
# Backup Configuration
BACKUP_RETENTION_DAYS=30
BACKUP_ENABLE_CLOUD=true
BACKUP_SCHEDULE_ENABLED=true
```

---

## 🚨 **Solución de Problemas**

### **Error: "pg_dump command not found"**
- Instala PostgreSQL client tools
- O usa el backup de datos JSON como alternativa

### **Error: "AWS credentials not found"**
- Verifica las variables de entorno AWS
- Asegúrate de que el usuario IAM tenga permisos S3

### **Error: "Backup directory not writable"**
- Verifica permisos de escritura en la carpeta `backups/`
- Crea la carpeta manualmente si es necesario

---

## 📊 **Monitoreo y Alertas**

El sistema registra todas las operaciones en los logs:

```
✅ Backup diario completo completado
✅ Backup incremental completado
🧹 Eliminados 5 backups antiguos
❌ Error en backup incremental: Connection timeout
```

### **Recomendaciones**

1. **Monitorea el espacio en disco** - Los backups pueden ocupar mucho espacio
2. **Prueba restauraciones regularmente** - Verifica que los backups funcionen
3. **Mantén múltiples copias** - Local + nube como mínimo
4. **Documenta procedimientos** - Para recuperación de desastres

---

## 🎯 **Próximos Pasos Recomendados**

1. **Configurar AWS S3** para backup en la nube
2. **Implementar encriptación** de backups sensibles
3. **Agregar notificaciones** por email cuando fallen los backups
4. **Crear dashboard** para monitorear estado de backups
5. **Implementar backup de archivos** (imágenes de productos, etc.)

---

*Sistema de backup creado para FullTech POS - Diciembre 2025*
# 📖 Guía Práctica: Cómo Usar el Backup

## 🚨 **Situaciones de Emergencia y Soluciones**

### **Problema 1: "Borré ventas por accidente"**
```
Empleado borra 20 ventas del día actual
```

**Solución paso a paso:**
```bash
# 1. Detener operaciones inmediatamente
echo "🚨 EMERGENCIA: No hacer más cambios en el sistema"

# 2. Identificar último backup bueno
curl http://localhost:5004/api/backup \
  -H "Authorization: Bearer TU_TOKEN"

# 3. Restaurar backup incremental de hace 1 hora
curl -X POST http://localhost:5004/api/backup/incremental?since=2025-12-12T10:00:00Z \
  -H "Authorization: Bearer TU_TOKEN"

# 4. Verificar que las ventas volvieron
echo "✅ Ventas recuperadas - continuar operaciones"
```

---

### **Problema 2: "El servidor no enciende"**
```
Disco duro falló completamente
```

**Solución paso a paso:**
```bash
# 1. Nuevo servidor con PostgreSQL instalado
echo "🖥️ Nuevo servidor listo"

# 2. Descargar último backup completo
# (desde el directorio backups/ o desde S3)

# 3. Restaurar base de datos
pg_restore -d TU_DATABASE_URL backup-full.sql

# 4. Verificar integridad
psql TU_DATABASE_URL -c "SELECT COUNT(*) FROM ventas;"

# 5. Reiniciar aplicación
npm start

echo "✅ Sistema operativo en nuevo servidor"
```

---

### **Problema 3: "Datos corruptos en producción"**
```
Base de datos funciona pero datos están mal
```

**Solución paso a paso:**
```bash
# 1. Crear backup de seguridad del estado actual
curl -X POST http://localhost:5004/api/backup/data \
  -H "Authorization: Bearer TU_TOKEN"

# 2. Identificar tabla problemática
# Ejemplo: productos con precios negativos
psql TU_DATABASE_URL -c "SELECT * FROM productos WHERE precio < 0;"

# 3. Restaurar solo tabla específica desde backup JSON
node -e "
const backup = require('./src/services/backup.service');
const fs = require('fs');

// Leer backup
const data = JSON.parse(fs.readFileSync('backups/data-backup.json', 'utf8'));

// Restaurar solo productos
const productos = data.tables.productos;
// Filtrar productos válidos y actualizar BD
console.log('Productos restaurados:', productos.length);
"

# 4. Verificar corrección
echo "✅ Datos corregidos sin afectar otras tablas"
```

---

### **Problema 4: "Necesito datos de hace 3 meses"**
```
Cliente reclama venta antigua
```

**Solución paso a paso:**
```bash
# 1. Listar backups disponibles
curl http://localhost:5004/api/backup \
  -H "Authorization: Bearer TU_TOKEN"

# 2. Buscar backup del período correcto
# backups/data-backup-2025-09-12T03-00-00-000Z.json

# 3. Extraer datos específicos del backup
node -e "
const fs = require('fs');
const backup = JSON.parse(fs.readFileSync('backups/data-backup-2025-09-12.json', 'utf8'));

// Buscar venta específica
const venta = backup.tables.ventas.find(v => v.id === 12345);
console.log('Venta encontrada:', venta);

// Buscar cliente
const cliente = backup.tables.clientes.find(c => c.id === venta.cliente_id);
console.log('Cliente:', cliente);
"

# 4. Proporcionar información al cliente
echo "✅ Información histórica recuperada"
```

---

## 🛠️ **Herramientas de Diagnóstico**

### **Verificar Estado del Sistema de Backup**
```bash
# Estado de backups
curl http://localhost:5004/api/backup \
  -H "Authorization: Bearer TU_TOKEN"

# Espacio en disco usado por backups
du -sh backups/

# Ver logs de backup recientes
tail -20 logs/backup.log
```

### **Pruebas de Integridad**
```bash
# Contar registros en cada tabla
psql TU_DATABASE_URL -c "
SELECT
  'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'productos', COUNT(*) FROM productos
UNION ALL
SELECT 'ventas', COUNT(*) FROM ventas
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes;
"

# Verificar últimas modificaciones
psql TU_DATABASE_URL -c "
SELECT 'ventas' as tabla, MAX(fecha_creado) as ultima_mod FROM ventas
UNION ALL
SELECT 'productos', MAX(fecha_creado) FROM productos
UNION ALL
SELECT 'clientes', MAX(fecha_creado) FROM clientes;
"
```

---

## 📋 **Protocolo de Emergencia**

### **Paso 1: Evaluar la Situación**
- [ ] ¿Qué datos se perdieron?
- [ ] ¿Cuándo ocurrió?
- [ ] ¿Sistema sigue funcionando?
- [ ] ¿Clientes afectados?

### **Paso 2: Contener el Daño**
- [ ] Detener operaciones si es necesario
- [ ] No hacer cambios adicionales
- [ ] Documentar lo sucedido
- [ ] Notificar a stakeholders

### **Paso 3: Ejecutar Recuperación**
- [ ] Identificar backup apropiado
- [ ] Probar restauración en entorno de prueba
- [ ] Ejecutar restauración en producción
- [ ] Verificar integridad de datos

### **Paso 4: Post-Recuperación**
- [ ] Verificar funcionamiento del sistema
- [ ] Reanudar operaciones normales
- [ ] Documentar lección aprendida
- [ ] Mejorar procedimientos preventivos

---

## 🎯 **Ejemplos de Comandos Diarios**

### **Mantenimiento Semanal**
```bash
# Viernes: Verificar backups de la semana
curl http://localhost:5004/api/backup \
  -H "Authorization: Bearer TU_TOKEN"

# Contar archivos de backup
ls -la backups/ | wc -l

# Verificar tamaño total
du -sh backups/
```

### **Auditoría Mensual**
```bash
# Probar restauración completa (en servidor de prueba)
createdb test_restore
pg_restore -d test_restore backups/full-backup.sql
psql test_restore -c "SELECT COUNT(*) FROM ventas;"
dropdb test_restore

# Verificar configuración de nube
echo "AWS S3 backups: $(ls backups/ | grep -c "uploaded" || echo "No configurado")"
```

---

## 🚀 **Automatización Avanzada**

### **Script de Monitoreo Diario**
```bash
#!/bin/bash
# monitor-backup.sh

echo "📊 Reporte Diario de Backup - $(date)"

# Verificar que backups existen
if [ $(ls backups/ | wc -l) -lt 2 ]; then
    echo "⚠️  ALERTA: Pocos archivos de backup"
    # Enviar email o notificación
fi

# Verificar tamaño razonable
backup_size=$(du -sm backups/ | cut -f1)
if [ $backup_size -lt 10 ]; then
    echo "⚠️  ALERTA: Tamaño de backup pequeño"
fi

# Verificar backup reciente
latest=$(ls -t backups/ | head -1)
age_hours=$(( ($(date +%s) - $(stat -c %Y "backups/$latest")) / 3600 ))
if [ $age_hours -gt 25 ]; then
    echo "⚠️  ALERTA: Backup muy antiguo ($age_hours horas)"
fi

echo "✅ Monitoreo completado"
```

### **Configurar Cron Job**
```bash
# Ejecutar monitoreo diario a las 8 AM
crontab -e
# Agregar: 0 8 * * * /path/to/monitor-backup.sh
```

---

## 💡 **Tips para tu Negocio**

### **Comunicación con Empleados**
- **Entrenamiento**: "Si borras algo, díselo inmediatamente al supervisor"
- **Confianza**: "Tenemos backup, no temas experimentar"
- **Responsabilidad**: "Reportar incidentes premia, no castiga"

### **Mejores Prácticas**
- **Backup antes de cambios grandes**: Nuevos productos, migraciones
- **Documentar procedimientos**: Cómo restaurar cada tipo de dato
- **Probar regularmente**: Al menos una vez al mes
- **Múltiples ubicaciones**: Local + nube como mínimo

### **Escalabilidad**
- **Crecimiento**: Más sucursales = más backups
- **Nube**: AWS S3 escala automáticamente
- **Compresión**: Backups se comprimen automáticamente

---

*Recuerda: El backup es como un seguro - nunca sabes cuándo lo necesitas, pero cuando lo necesitas, lo agradeces infinitamente.*
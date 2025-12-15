#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Instalando sistema de backup para FullTech POS...\n');

// Verificar que existe la estructura del proyecto
const requiredFiles = [
  'src/app.js',
  'src/server.js',
  'src/config/db.js',
  'package.json'
];

console.log('1️⃣ Verificando estructura del proyecto...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Archivo requerido no encontrado: ${file}`);
    process.exit(1);
  }
}
console.log('✅ Estructura del proyecto OK');

// Verificar/crear directorio de backups
const backupDir = 'backups';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
  console.log('📁 Directorio de backups creado');
} else {
  console.log('📁 Directorio de backups ya existe');
}

// Verificar dependencias
console.log('\n2️⃣ Verificando dependencias...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['node-cron', 'aws-sdk'];

for (const dep of requiredDeps) {
  if (!packageJson.dependencies[dep]) {
    console.log(`⚠️  Dependencia faltante: ${dep}`);
    console.log(`   Ejecuta: npm install ${dep}`);
  } else {
    console.log(`✅ ${dep} instalado`);
  }
}

// Verificar archivos del sistema de backup
console.log('\n3️⃣ Verificando archivos del sistema de backup...');
const backupFiles = [
  'src/services/backup.service.js',
  'src/services/backup.scheduler.js',
  'src/modules/backup/backup.controller.js',
  'src/modules/backup/backup.routes.js',
  'BACKUP-README.md',
  'test-backup.js'
];

for (const file of backupFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
  }
}

// Verificar integración en app.js
console.log('\n4️⃣ Verificando integración en app.js...');
const appJs = fs.readFileSync('src/app.js', 'utf8');
if (appJs.includes('backupRoutes')) {
  console.log('✅ Rutas de backup integradas en app.js');
} else {
  console.log('❌ Rutas de backup no encontradas en app.js');
}

// Verificar integración en server.js
console.log('\n5️⃣ Verificando integración en server.js...');
const serverJs = fs.readFileSync('src/server.js', 'utf8');
if (serverJs.includes('backupScheduler')) {
  console.log('✅ Scheduler de backup integrado en server.js');
} else {
  console.log('❌ Scheduler de backup no encontrado en server.js');
}

// Verificar variables de entorno para backup en nube
console.log('\n6️⃣ Verificando configuración de nube (opcional)...');
const envFile = '.env';
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const hasAws = envContent.includes('AWS_ACCESS_KEY_ID');
  const hasS3 = envContent.includes('AWS_S3_BUCKET');

  if (hasAws && hasS3) {
    console.log('✅ Configuración AWS S3 encontrada');
  } else {
    console.log('⚠️  Configuración AWS S3 no encontrada (opcional)');
    console.log('   Para backup en nube, agrega estas variables a .env:');
    console.log('   AWS_ACCESS_KEY_ID=your_key');
    console.log('   AWS_SECRET_ACCESS_KEY=your_secret');
    console.log('   AWS_REGION=us-east-1');
    console.log('   AWS_S3_BUCKET=your-bucket-name');
  }
} else {
  console.log('⚠️  Archivo .env no encontrado');
}

console.log('\n🎉 Instalación completada!');
console.log('\n📋 Próximos pasos:');
console.log('1. Instala dependencias faltantes: npm install node-cron aws-sdk');
console.log('2. Configura AWS S3 si deseas backup en la nube');
console.log('3. Ejecuta: node test-backup.js (para probar el sistema)');
console.log('4. Lee: BACKUP-README.md (documentación completa)');
console.log('5. Inicia el servidor: npm start (backups automáticos se activarán)');

console.log('\n🔗 Endpoints disponibles:');
console.log('POST /api/backup/full - Backup completo de BD');
console.log('POST /api/backup/data - Backup de datos JSON');
console.log('POST /api/backup/incremental - Backup incremental');
console.log('GET /api/backup - Listar backups');
console.log('DELETE /api/backup/cleanup - Limpiar antiguos');
console.log('POST /api/backup/restore - Restaurar backup');
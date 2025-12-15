const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');
const backupService = require('./backup.service');

class CloudBackupService {
  constructor() {
    // Configurar AWS S3 (requiere variables de entorno)
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    this.bucketName = process.env.AWS_S3_BUCKET || 'fulltech-backups';
  }

  // Subir backup a S3
  async uploadToS3(filepath, key) {
    try {
      const fileContent = await fs.readFile(filepath);
      const stats = await fs.stat(filepath);

      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: fileContent,
        ContentType: key.endsWith('.sql') ? 'application/sql' : 'application/json',
        Metadata: {
          'uploaded-at': new Date().toISOString(),
          'original-size': stats.size.toString()
        }
      };

      const result = await this.s3.upload(params).promise();
      console.log(`☁️  Backup subido a S3: ${result.Location}`);
      return result;

    } catch (error) {
      console.error('❌ Error subiendo a S3:', error);
      throw error;
    }
  }

  // Descargar backup desde S3
  async downloadFromS3(key, localPath) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      const result = await this.s3.getObject(params).promise();
      await fs.writeFile(localPath, result.Body);
      console.log(`📥 Backup descargado desde S3: ${localPath}`);
      return localPath;

    } catch (error) {
      console.error('❌ Error descargando desde S3:', error);
      throw error;
    }
  }

  // Listar backups en S3
  async listS3Backups(prefix = '') {
    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: prefix
      };

      const result = await this.s3.listObjectsV2(params).promise();
      return result.Contents.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        url: `https://${this.bucketName}.s3.amazonaws.com/${obj.Key}`
      }));

    } catch (error) {
      console.error('❌ Error listando backups en S3:', error);
      return [];
    }
  }

  // Backup completo automático a la nube
  async createAndUploadFullBackup() {
    try {
      console.log('🔄 Creando backup completo para la nube...');

      // Crear backup local
      const localPath = await backupService.createFullBackup();

      // Generar nombre para S3
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const s3Key = `full-backups/full-backup-${timestamp}.sql`;

      // Subir a S3
      await this.uploadToS3(localPath, s3Key);

      // Limpiar archivo local si se desea
      // await fs.unlink(localPath);

      return { localPath, s3Key };

    } catch (error) {
      console.error('❌ Error en backup completo a la nube:', error);
      throw error;
    }
  }

  // Backup de datos automático a la nube
  async createAndUploadDataBackup() {
    try {
      console.log('🔄 Creando backup de datos para la nube...');

      // Crear backup local
      const localPath = await backupService.createDataBackup();

      // Generar nombre para S3
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const s3Key = `data-backups/data-backup-${timestamp}.json`;

      // Subir a S3
      await this.uploadToS3(localPath, s3Key);

      return { localPath, s3Key };

    } catch (error) {
      console.error('❌ Error en backup de datos a la nube:', error);
      throw error;
    }
  }

  // Restaurar desde S3
  async restoreFromS3Backup(s3Key) {
    try {
      console.log('🔄 Restaurando desde backup en la nube...');

      // Descargar desde S3
      const tempPath = path.join(process.cwd(), 'temp-restore.json');
      await this.downloadFromS3(s3Key, tempPath);

      // Restaurar usando el servicio local
      await backupService.restoreFromDataBackup(tempPath);

      // Limpiar archivo temporal
      await fs.unlink(tempPath);

      console.log('✅ Restauración desde la nube completada');

    } catch (error) {
      console.error('❌ Error restaurando desde S3:', error);
      throw error;
    }
  }
}

module.exports = new CloudBackupService();
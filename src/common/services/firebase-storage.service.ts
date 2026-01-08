import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FirebaseConfig } from '../config/firebase.config';
import * as admin from 'firebase-admin';
import { ERROR_MESSAGES, ERROR_TITLES } from '../constants/error-messages.constants';

@Injectable()
export class FirebaseStorageService {
  private readonly logger = new Logger(FirebaseStorageService.name);
  private readonly storage: admin.storage.Storage;
  private readonly bucket: any;

  constructor() {
    const firebaseConfig = FirebaseConfig.getInstance();
    this.storage = firebaseConfig.getStorage();
    this.bucket = this.storage.bucket();
  }

  /**
   * Sube un archivo a Firebase Storage
   * @param file - Archivo a subir
   * @param folder - Carpeta donde guardar el archivo (ej: 'profile-photos')
   * @param fileName - Nombre del archivo (opcional, se genera automáticamente si no se proporciona)
   * @returns URL pública del archivo subido
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    fileName?: string
  ): Promise<string> {
    try {
      // Validar el archivo
      if (!file) {
        throw new BadRequestException(ERROR_MESSAGES.FILE_NOT_PROVIDED, ERROR_TITLES.VALIDATION_ERROR);
      }

      // Validar tipo de archivo para imágenes
      if (folder === 'profile-photos') {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(ERROR_MESSAGES.FILE_TYPE_NOT_ALLOWED, ERROR_TITLES.VALIDATION_ERROR);
        }

        // Validar tamaño del archivo (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new BadRequestException(ERROR_MESSAGES.FILE_TOO_LARGE, ERROR_TITLES.VALIDATION_ERROR);
        }
      }

      // Generar nombre único si no se proporciona
      const finalFileName = fileName || `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
      const filePath = `${folder}/${finalFileName}`;

      // Crear referencia al archivo en el bucket
      const fileRef = this.bucket.file(filePath);

      // Subir el archivo
      const uploadResult = await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
          },
        },
        public: true, // Hacer el archivo público
      });

      this.logger.log(`Archivo subido exitosamente: ${filePath}`);

      // Obtener URL pública
      const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;
      
      return publicUrl;
    } catch (error) {
      this.logger.error(`Error al subir archivo: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`${ERROR_MESSAGES.FILE_UPLOAD_ERROR}: ${error.message}`, ERROR_TITLES.VALIDATION_ERROR);
    }
  }

  /**
   * Elimina un archivo de Firebase Storage
   * @param fileUrl - URL del archivo a eliminar
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extraer el nombre del archivo de la URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      const filePath = `${folder}/${fileName}`;

      // Crear referencia al archivo
      const fileRef = this.bucket.file(filePath);

      // Verificar si el archivo existe
      const [exists] = await fileRef.exists();
      if (!exists) {
        this.logger.warn(`Archivo no encontrado: ${filePath}`);
        return;
      }

      // Eliminar el archivo
      await fileRef.delete();
      this.logger.log(`Archivo eliminado exitosamente: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error al eliminar archivo: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`${ERROR_MESSAGES.FILE_DELETE_ERROR}: ${error.message}`, ERROR_TITLES.VALIDATION_ERROR);
    }
  }

  /**
   * Obtiene metadatos de un archivo
   * @param fileUrl - URL del archivo
   */
  async getFileMetadata(fileUrl: string): Promise<any> {
    try {
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      const filePath = `${folder}/${fileName}`;

      const fileRef = this.bucket.file(filePath);
      const [metadata] = await fileRef.getMetadata();
      
      return metadata;
    } catch (error) {
      this.logger.error(`Error al obtener metadatos: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`${ERROR_MESSAGES.FILE_METADATA_ERROR}: ${error.message}`, ERROR_TITLES.VALIDATION_ERROR);
    }
  }

  /**
   * Genera una URL firmada para acceso temporal a un archivo privado
   * @param fileUrl - URL del archivo
   * @param expiresIn - Tiempo de expiración en segundos (por defecto 1 hora)
   */
  async getSignedUrl(fileUrl: string, expiresIn: number = 3600): Promise<string> {
    try {
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      const filePath = `${folder}/${fileName}`;

      const fileRef = this.bucket.file(filePath);
      const [signedUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error(`Error al generar URL firmada: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`${ERROR_MESSAGES.FILE_SIGNED_URL_ERROR}: ${error.message}`, ERROR_TITLES.VALIDATION_ERROR);
    }
  }
}



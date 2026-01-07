import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FirebaseConfig } from '../config/firebase.config';
import * as admin from 'firebase-admin';

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
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    fileName?: string
  ): Promise<string> {
    try {
      // Validar el archivo
      if (!file) {
        throw new BadRequestException(
          'No se proporcionó ningún archivo',
          'Error de validación'
        );
      }

      // Validar tipo de archivo para imágenes
      if (folder === 'profile-photos') {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            'Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG, GIF o WEBP',
            'Error de validación'
          );
        }

        // Validar tamaño del archivo (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new BadRequestException(
            'El archivo excede el tamaño máximo permitido de 5MB',
            'Error de validación'
          );
        }
      }

      // Generar nombre único si no se proporciona
      const finalFileName = fileName || `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
      const filePath = `${folder}/${finalFileName}`;

      // Crear referencia al archivo en el bucket
      const fileRef = this.bucket.file(filePath);

      // Subir el archivo
      await fileRef.save(file.buffer, {
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
      return `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;
    } catch (error: any) {
      this.logger.error(`Error al subir archivo: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        `Error al subir el archivo: ${error.message}`,
        'Error de validación'
      );
    }
  }

  /**
   * Elimina un archivo de Firebase Storage
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      const filePath = `${folder}/${fileName}`;

      const fileRef = this.bucket.file(filePath);
      const [exists] = await fileRef.exists();
      if (!exists) {
        this.logger.warn(`Archivo no encontrado: ${filePath}`);
        return;
      }

      await fileRef.delete();
      this.logger.log(`Archivo eliminado exitosamente: ${filePath}`);
    } catch (error: any) {
      this.logger.error(`Error al eliminar archivo: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        `Error al eliminar el archivo: ${error.message}`,
        'Error de validación'
      );
    }
  }

  /**
   * Obtiene metadatos de un archivo
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
    } catch (error: any) {
      this.logger.error(`Error al obtener metadatos: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        `Error al obtener metadatos del archivo: ${error.message}`,
        'Error de validación'
      );
    }
  }

  /**
   * Genera una URL firmada para acceso temporal a un archivo privado
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
    } catch (error: any) {
      this.logger.error(`Error al generar URL firmada: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        `Error al generar URL firmada: ${error.message}`,
        'Error de validación'
      );
    }
  }
}

import { Injectable, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { EmailTemplates } from '../utils/email-templates';
import { ERROR_MESSAGES, ERROR_TITLES } from '../constants/error-messages.constants';

@Injectable()
export class PasswordResetService implements OnModuleInit {
    private readonly logger = new Logger(PasswordResetService.name);
    private transporter: nodemailer.Transporter;

    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
        private readonly configService: ConfigService,
    ) { }

    async onModuleInit() {
        try {
            await this.initializeTransporter();
        } catch (error) {
            this.logger.warn(`No se pudo inicializar el servicio de email: ${error.message}`);
            this.logger.warn('El servicio de recuperación de contraseña no estará disponible hasta configurar GMAIL_USER y GMAIL_APP_PASSWORD correctamente');
        }
    }

    private async initializeTransporter() {
        const gmailUser = this.configService.get<string>('GMAIL_USER');
        const gmailPass = this.configService.get<string>('GMAIL_APP_PASSWORD');

        if (!gmailUser || !gmailPass) {
            throw new Error('GMAIL_USER o GMAIL_APP_PASSWORD no definidos');
        }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: gmailUser, pass: gmailPass },
        });

        try {
            await this.transporter.verify();
            this.logger.log('Servicio de email configurado correctamente');
        } catch (error) {
            this.logger.error(`Error al verificar credenciales de Gmail: ${error.message}`);
            throw error;
        }
    }

    /** Genera y envía un código de recuperación */
    async generateAndSendResetCode(correo: string): Promise<void> {
        const usuario = await this.usuarioRepository.findOne({
            where: { correo: correo.toLowerCase() },
        });
        if (!usuario) return;

        const codigo = this.generateRandomCode();
        const fechaExpiracion = new Date();
        fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 10);

        await this.usuarioRepository.update(
            { id: usuario.id },
            {
                codigoRecuperacion: codigo,
                fechaExpiracionCodigo: fechaExpiracion,
                codigoUsado: false,
            },
        );

        await this.sendPasswordResetEmail(correo, codigo, usuario.nombre);
    }

    /** Valida el código y restablece la contraseña */
    async resetPassword(
        correo: string,
        codigo: string,
        nuevaContraseña: string,
    ): Promise<void> {
        // Validación de formato
        if (
            !/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(nuevaContraseña)
        ) {
            throw new BadRequestException(
                ERROR_MESSAGES.PASSWORD_VALIDATION_FAILED,
                ERROR_TITLES.VALIDATION_ERROR,
            );
        }

        const usuario = await this.usuarioRepository.findOne({
            where: {
                correo: correo.toLowerCase(),
                codigoRecuperacion: codigo,
                codigoUsado: false,
            },
        });

        if (!usuario)
            throw new BadRequestException(ERROR_MESSAGES.PASSWORD_RESET_CODE_INVALID, ERROR_TITLES.VALIDATION_ERROR);
        if (new Date() > usuario.fechaExpiracionCodigo) {
            await this.usuarioRepository.update(
                { id: usuario.id },
                { codigoUsado: true },
            );
            throw new BadRequestException(ERROR_MESSAGES.PASSWORD_RESET_CODE_EXPIRED, ERROR_TITLES.VALIDATION_ERROR);
        }

        // Verificar si la nueva contraseña es igual a la actual
        const isSamePassword = await bcrypt.compare(
            nuevaContraseña,
            usuario.contraseña,
        );
        if (isSamePassword) {
            throw new BadRequestException(
                ERROR_MESSAGES.PASSWORD_SAME_AS_CURRENT,
                ERROR_TITLES.VALIDATION_ERROR,
            );
        }

        const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);
        await this.usuarioRepository.update(
            { id: usuario.id },
            {
                contraseña: hashedPassword,
                codigoUsado: true,
                fechaActualizacion: new Date(),
            },
        );
    }

    /** Envía el email con el código de recuperación */
    private async sendPasswordResetEmail(
        to: string,
        code: string,
        userName: string,
    ): Promise<void> {
        if (!this.transporter) {
            throw new BadRequestException(
                'El servicio de email no está configurado. Por favor, configure GMAIL_USER y GMAIL_APP_PASSWORD en las variables de entorno.',
            );
        }

        const mailOptions = {
            from: `"API Pacifico" <${this.configService.get<string>('GMAIL_USER')}>`,
            to,
            subject: 'Código de Recuperación de Contraseña - API Pacifico',
            html: EmailTemplates.generatePasswordResetEmail(code, userName),
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            this.logger.error(`Error al enviar email: ${error.message}`);
            throw new BadRequestException(
                'Error al enviar el código de recuperación. Verifique la configuración de email.',
            );
        }
    }

    /** Genera un código aleatorio de 4 dígitos */
    private generateRandomCode(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    /** Limpia códigos expirados */
    async cleanupExpiredCodes(): Promise<void> {
        await this.usuarioRepository
            .createQueryBuilder()
            .update(Usuario)
            .set({ codigoUsado: true })
            .where('fecha_expiracion_codigo < :now', { now: new Date() })
            .andWhere('codigo_usado = :used', { used: false })
            .execute();
    }
}



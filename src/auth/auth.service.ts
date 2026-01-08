import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { CreateUserResponseDto } from './dtos/create-user-response.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { plainToInstance } from 'class-transformer';
import { Usuario } from '../common/entities/usuario.entity';
import { PasswordResetService } from '../common/services/password-reset.service';
import { ERROR_MESSAGES, ERROR_TITLES } from '../common/constants/error-messages.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordResetService: PasswordResetService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.usersService.findByEmail(createUserDto.correo);
      if (existingUser) {
        throw new BadRequestException(ERROR_MESSAGES.USER_ALREADY_EXISTS, ERROR_TITLES.CONFLICT_ERROR);
      }

      // Crear el usuario en la base de datos
      const usuario = await this.usersService.create(createUserDto);

      // Actualizar fecha de último login
      await this.usersService.updateLastLogin(usuario.id);

      // Retornar respuesta sin contraseña
      return plainToInstance(CreateUserResponseDto, usuario, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      });
    } catch (error) {
      this.logger.error(`Error al crear usuario: ${error.message}`);
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<{ 
    access_token: string; 
    refresh_token: string;
    usuario: CreateUserResponseDto 
  }> {
    try {
      // Validar credenciales del usuario
      const usuario = await this.validateUser(loginUserDto.correo, loginUserDto.contraseña);
      if (!usuario) {
        throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS, ERROR_TITLES.AUTHENTICATION_ERROR);
      }

      // Actualizar fecha de último login
      await this.usersService.updateLastLogin(usuario.id);

      // Generar tokens JWT
      const payload = { 
        sub: usuario.id, 
        correo: usuario.correo,
        rol: usuario.rol?.nombre 
      };
      
      const access_token = this.jwtService.sign(payload);
      const refresh_token = this.generateRefreshToken(usuario.id);

      // Retornar tokens y datos del usuario
      const userResponse = plainToInstance(CreateUserResponseDto, usuario, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      });

      return {
        access_token,
        refresh_token,
        usuario: userResponse,
      };
    } catch (error) {
      this.logger.error(`Error en login: ${error.message}`);
      throw error;
    }
  }

  async validateUser(correo: string, contraseña: string): Promise<Usuario | null> {
    try {
      const usuario = await this.usersService.findByEmail(correo);
      if (!usuario) {
        return null;
      }

      const isPasswordValid = await this.usersService.validatePassword(usuario, contraseña);
      if (!isPasswordValid) {
        return null;
      }

      return usuario;
    } catch (error) {
      this.logger.error(`Error al validar usuario: ${error.message}`);
      return null;
    }
  }

  /**
   * Solicita un código de recuperación de contraseña
   * @param forgotPasswordDto - DTO con el correo del usuario
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    try {
      await this.passwordResetService.generateAndSendResetCode(forgotPasswordDto.correo);
      this.logger.log(`Solicitud de recuperación de contraseña para: ${forgotPasswordDto.correo}`);
    } catch (error) {
      this.logger.error(`Error en forgotPassword: ${error.message}`);
      throw error;
    }
  }

  /**
   * Restablece la contraseña usando el código de verificación
   * @param resetPasswordDto - DTO con correo, código y nueva contraseña
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    try {
      await this.passwordResetService.resetPassword(
        resetPasswordDto.correo,
        resetPasswordDto.codigo,
        resetPasswordDto.nuevaContraseña
      );
      this.logger.log(`Contraseña restablecida exitosamente para: ${resetPasswordDto.correo}`);
    } catch (error) {
      this.logger.error(`Error en resetPassword: ${error.message}`);
      throw error;
    }
  }

  /**
   * Genera un refresh token JWT
   * @param userId - ID del usuario
   * @returns Refresh token JWT
   */
  private generateRefreshToken(userId: string): string {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'sistema-horarios-refresh-secret-key';
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    
    const payload = {
      sub: userId,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    } as any);
  }

  /**
   * Renueva el access token usando un refresh token válido
   * @param refreshTokenDto - DTO con el refresh token
   * @returns Nuevo access token y refresh token
   */
  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'sistema-horarios-refresh-secret-key';
      
      // Verificar el refresh token
      let payload: any;
      try {
        payload = await this.jwtService.verifyAsync(refreshTokenDto.refresh_token, {
          secret: refreshSecret,
        });
      } catch (error) {
        throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN_INVALID, ERROR_TITLES.AUTHENTICATION_ERROR);
      }

      // Verificar que el token sea de tipo refresh
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN_TYPE_INVALID, ERROR_TITLES.AUTHENTICATION_ERROR);
      }

      // Buscar el usuario
      const usuario = await this.usersService.findById(payload.sub);
      if (!usuario || !usuario.activo) {
        throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND_OR_INACTIVE, ERROR_TITLES.AUTHENTICATION_ERROR);
      }

      // Generar nuevos tokens
      const newPayload = {
        sub: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol?.nombre,
      };

      const access_token = this.jwtService.sign(newPayload);
      const refresh_token = this.generateRefreshToken(usuario.id);

      this.logger.log(`Tokens renovados exitosamente para usuario: ${usuario.id}`);

      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      this.logger.error(`Error al refrescar tokens: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_RENEWAL_ERROR, ERROR_TITLES.AUTHENTICATION_ERROR);
    }
  }
}


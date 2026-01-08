import { 
  Body, 
  Controller, 
  Get, 
  HttpStatus, 
  Post, 
  Patch,
  HttpCode
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseWithData } from '../common/decorators/api-response-with-data.decorator';
import { CreateUserResponseDto } from './dtos/create-user-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { UserRole } from './enums/user-rol.enum';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Registrar un nuevo usuario',
    description: 'Crea una nueva cuenta de usuario en el sistema'
  })
  @ApiResponseWithData(
    CreateUserResponseDto,
    'Usuario registrado exitosamente',
    HttpStatus.CREATED,
  )
  async signUp(@Body() dto: CreateUserDto) {
    const userResponse = await this.authService.signUp(dto);
    return ApiResponseDto.Success(
      userResponse,
      'Registro de Usuario',
      'Usuario registrado exitosamente',
    );
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica al usuario y retorna un token JWT'
  })
  @ApiResponseWithData(
    Object,
    'Usuario autenticado exitosamente',
    HttpStatus.OK,
  )
  async login(@Body() loginRequest: LoginUserDto) {
    const result = await this.authService.login(loginRequest);
    return ApiResponseDto.Success(
      result,
      'Inicio de Sesión',
      'Usuario autenticado exitosamente',
    );
  }

  
  @Post('password-reset/request')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Generar y enviar código de recuperación',
    description: 'Envía un código de 4 dígitos al correo electrónico del usuario'
  })
  @ApiResponseWithData(
    Object,
    'Código de recuperación enviado exitosamente',
    HttpStatus.OK,
  )
  async generateResetCode(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return ApiResponseDto.Success(
      null,
      'Recuperación de Contraseña',
      'Si el correo existe en nuestro sistema, se ha enviado un código de recuperación',
    );
  }

  @Patch('password-reset/confirm')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Restablecer contraseña',
    description: 'Restablece la contraseña usando el código de verificación enviado por email'
  })
  @ApiResponseWithData(
    Object,
    'Contraseña restablecida exitosamente',
    HttpStatus.OK,
  )
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return ApiResponseDto.Success(
      null,
      'Restablecimiento de Contraseña',
      'Contraseña actualizada exitosamente',
    );
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Renovar tokens',
    description: 'Renueva el access token y refresh token usando un refresh token válido'
  })
  @ApiResponseWithData(
    Object,
    'Tokens renovados exitosamente',
    HttpStatus.OK,
  )
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshTokens(refreshTokenDto);
    return ApiResponseDto.Success(
      tokens,
      'Renovación de Tokens',
      'Tokens renovados exitosamente',
    );
  }

}


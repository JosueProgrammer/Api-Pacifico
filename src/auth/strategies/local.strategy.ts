import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ERROR_MESSAGES, ERROR_TITLES } from '../../common/constants/error-messages.constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'correo',
      passwordField: 'contraseña',
    });
  }

  async validate(correo: string, contraseña: string): Promise<any> {
    const usuario = await this.authService.validateUser(correo, contraseña);
    if (!usuario) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS, ERROR_TITLES.AUTHENTICATION_ERROR);
    }
    return usuario;
  }
}


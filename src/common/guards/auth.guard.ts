import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Usuario } from '../entities/usuario.entity';
import { ERROR_MESSAGES, ERROR_TITLES } from '../constants/error-messages.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_REQUIRED, ERROR_TITLES.AUTHENTICATION_ERROR);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'sistema-horarios-secret-key',
      });

      // Buscar el usuario en la base de datos
      const usuario = await this.usuarioRepository.findOne({
        where: { id: payload.sub, activo: true },
        relations: ['rol'],
      });
      if (!usuario) {
        throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_TITLES.AUTHENTICATION_ERROR);
      }

      // Agregar el usuario al request para uso posterior
      request.user = usuario;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_INVALID, ERROR_TITLES.AUTHENTICATION_ERROR);
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}



import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../common/entities/usuario.entity';
import { ERROR_MESSAGES, ERROR_TITLES } from '../../common/constants/error-messages.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'sistema-horarios-secret-key',
        });
    }

    async validate(payload: any) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id: payload.sub, activo: true },
            relations: ['rol']
        });
        if (!usuario) {
            throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND, ERROR_TITLES.AUTHENTICATION_ERROR);
        }
        return usuario;
    }
}


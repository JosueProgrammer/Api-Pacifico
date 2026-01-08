import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Usuario } from '../common/entities/usuario.entity';
import { Rol } from '../common/entities/rol.entity';
import { CreateUserDto } from '../auth/dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES, ERROR_TITLES } from '../common/constants/error-messages.constants';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) { }

  async findByEmail(correo: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { correo: correo.toLowerCase() },
      relations: ['rol']
    });
  }

  async findById(id: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { id },
      relations: ['rol']
    });
  }

  async create(createUserDto: CreateUserDto): Promise<Usuario> {
    const { contraseña, rol, activo, ...userData } = createUserDto;

    // Buscar el rol por nombre
    const rolEntity = await this.rolRepo.findOne({
      where: { nombre: rol }
    });

    if (!rolEntity) {
      throw new NotFoundException(`Rol '${rol}' no encontrado`);
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

    // Crear el usuario
    const usuario = this.usuarioRepo.create({
      ...userData,
      contraseña: hashedPassword,
      correo: userData.correo.toLowerCase(),
      rolId: rolEntity.id,
      activo: activo !== undefined ? activo : true,
    });

    return this.usuarioRepo.save(usuario);
  }

  async validatePassword(usuario: Usuario, contraseña: string): Promise<boolean> {
    return bcrypt.compare(contraseña, usuario.contraseña);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usuarioRepo.update(id, {
      fechaActualizacion: new Date(),
    });
  }
}


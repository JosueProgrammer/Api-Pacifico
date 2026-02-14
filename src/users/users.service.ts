import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../common/entities/usuario.entity';
import { Rol } from '../common/entities/rol.entity';
import { CreateUserDto } from '../auth/dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES, ERROR_TITLES } from '../common/constants/error-messages.constants';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { PaginationParamsDto } from '../common/dto/pagination-param.dto';
import { FilteringParam, SortingParam, getWhereConditions, getSortingOrder, getAndWhereConditions } from '../common/helpers/typeorm-helpers';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<Usuario> {
    const { contraseña, rol, activo, ...userData } = createUserDto;

    // Buscar el rol por nombre
    const rolEntity = await this.rolRepo.findOne({
      where: { nombre: rol }
    });

    if (!rolEntity) {
      throw new NotFoundException(`Rol '${rol}' no encontrado`);
    }

    // Verificar si el correo ya existe
    const existingUser = await this.findByEmail(userData.correo);
    if (existingUser) {
        throw new ConflictException('El correo electrónico ya está en uso');
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

  async findAll(
    pagination: PaginationParamsDto,
    filter?: FilteringParam<Usuario> | null,
    sorting?: SortingParam<Usuario> | null,
  ): Promise<PaginatedResponseDto<Usuario>> {
    const { page, limit } = pagination;
    const where = getWhereConditions(filter ?? null);
    const order = getSortingOrder(sorting ?? null);

    const [items, total] = await this.usuarioRepo.findAndCount({
      where,
      order,
      take: limit,
      skip: (page - 1) * limit,
      relations: ['rol'],
    });

    const totalPages = Math.ceil(total / limit);
    return PaginatedResponseDto.PaginatedSuccess(
      items,
      {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      'Listar Usuarios',
      'Lista de usuarios obtenida exitosamente',
    );
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
      relations: ['rol'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado`);
    }

    return usuario;
  }

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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    const { rol, ...userData } = updateUserDto;

    if (rol) {
      const rolEntity = await this.rolRepo.findOne({ where: { nombre: rol } });
      if (!rolEntity) {
        throw new NotFoundException(`Rol '${rol}' no encontrado`);
      }
      usuario.rol = rolEntity;
      usuario.rolId = rolEntity.id;
    }

    if (userData.correo && userData.correo !== usuario.correo) {
         const existingUser = await this.findByEmail(userData.correo);
         if (existingUser) {
             throw new ConflictException('El correo electrónico ya está en uso');
         }
         usuario.correo = userData.correo.toLowerCase();
    }

    Object.assign(usuario, userData);
    
    return this.usuarioRepo.save(usuario);
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuarioRepo.remove(usuario);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const usuario = await this.findOne(id);
    
    const isMatch = await bcrypt.compare(changePasswordDto.currentPassword, usuario.contraseña);
    if (!isMatch) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const saltRounds = 10;
    usuario.contraseña = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);
    
    await this.usuarioRepo.save(usuario);
  }

  async activate(id: string): Promise<Usuario> {
    const usuario = await this.findOne(id);
    usuario.activo = true;
    return this.usuarioRepo.save(usuario);
  }

  async deactivate(id: string): Promise<Usuario> {
    const usuario = await this.findOne(id);
    usuario.activo = false;
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

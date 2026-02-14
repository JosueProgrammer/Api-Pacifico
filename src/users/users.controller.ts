import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum'; // Check import path
import { ApiResponseWithData, ApiResponseWithPagination, PaginationParam, FilteringParamDecorator, SortingParamDecorator } from '../common/decorators';
import { Usuario } from '../common/entities/usuario.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { FilteringParam, SortingParam } from '../common/helpers/typeorm-helpers';
import { PaginationParamsDto } from '../common/dto/pagination-param.dto';
import { CreateUserDto } from '../auth/dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

@ApiTags('Usuarios')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponseWithData(Usuario, 'Usuario creado exitosamente', HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return ApiResponseDto.Success(user, 'Crear Usuario', 'Usuario creado exitosamente');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR) // Only admin should list all users usually
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponseWithPagination(Usuario, 'Lista de usuarios obtenida exitosamente')
  async findAll(
    @PaginationParam() pagination: PaginationParamsDto,
    @FilteringParamDecorator(['nombres', 'apellidos', 'correo', 'activo']) filter?: FilteringParam<Usuario>,
    @SortingParamDecorator(['nombres', 'fechaCreacion']) sorting?: SortingParam<Usuario>,
  ) {
    return this.usersService.findAll(pagination, filter, sorting);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponseWithData(Usuario, 'Usuario obtenido exitosamente')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return ApiResponseDto.Success(user, 'Obtener Usuario', 'Usuario obtenido exitosamente');
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponseWithData(Usuario, 'Usuario actualizado exitosamente')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return ApiResponseDto.Success(user, 'Actualizar Usuario', 'Usuario actualizado exitosamente');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return ApiResponseDto.Success(null, 'Eliminar Usuario', 'Usuario eliminado exitosamente');
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR) // Or self? implementationplan said admin for now/generic
  @ApiOperation({ summary: 'Cambiar contraseña de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async changePassword(@Param('id') id: string, @Body() changePasswordDto: ChangePasswordDto) {
    await this.usersService.changePassword(id, changePasswordDto);
    return ApiResponseDto.Success(null, 'Cambiar Contraseña', 'Contraseña actualizada exitosamente');
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Activar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponseWithData(Usuario, 'Usuario activado exitosamente')
  async activate(@Param('id') id: string) {
    const user = await this.usersService.activate(id);
    return ApiResponseDto.Success(user, 'Activar Usuario', 'Usuario activado exitosamente');
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Desactivar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponseWithData(Usuario, 'Usuario desactivado exitosamente')
  async deactivate(@Param('id') id: string) {
    const user = await this.usersService.deactivate(id);
    return ApiResponseDto.Success(user, 'Desactivar Usuario', 'Usuario desactivado exitosamente');
  }
}

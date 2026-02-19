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
import { ProveedoresService } from './proveedores.service';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { UpdateProveedoreDto } from './dto/update-proveedore.dto';
import { ApiOperation, ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponseWithData, ApiResponseWithPagination, PaginationParam, FilteringParamDecorator, SortingParamDecorator } from '../common/decorators';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';
import { FilteringParam, SortingParam } from '../common/helpers/typeorm-helpers';
import { Proveedor } from '../common/entities/proveedor.entity';

@ApiTags('Proveedores')
@Controller('proveedores')
@ApiBearerAuth()
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Crear un nuevo proveedor',
    description: 'Crea un nuevo proveedor en el sistema. Requiere permisos de Administrador o Supervisor.',
  })
  @ApiResponseWithData(
    Object,
    'Proveedor creado exitosamente',
    HttpStatus.CREATED,
  )
  async create(@Body() createProveedoreDto: CreateProveedoreDto) {
    const proveedor = await this.proveedoresService.create(createProveedoreDto);
    return ApiResponseDto.Success(
      proveedor,
      'Crear Proveedor',
      'Proveedor creado exitosamente',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los proveedores',
    description: 'Obtiene una lista paginada de proveedores con opciones de filtrado y ordenamiento.',
  })
  @ApiResponseWithPagination(
    Proveedor,
    'Lista de proveedores obtenida exitosamente',
    HttpStatus.OK,
  )
  findAll(
    @PaginationParam() pagination: any,
    @FilteringParamDecorator(['nombre', 'correo', 'telefono', 'activo']) filter?: FilteringParam<any> | null,
    @SortingParamDecorator(['nombre', 'correo', 'fechaCreacion']) sorting?: SortingParam<any> | null,
  ) {
    return this.proveedoresService.findAll(pagination, filter, sorting);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un proveedor por ID',
    description: 'Obtiene los detalles de un proveedor específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Proveedor,
    'Proveedor obtenido exitosamente',
    HttpStatus.OK,
  )
  async findOne(@Param('id') id: string) {
    const proveedor = await this.proveedoresService.findOne(id);
    return ApiResponseDto.Success(
      proveedor,
      'Obtener Proveedor',
      'Proveedor obtenido exitosamente',
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Actualizar un proveedor',
    description: 'Actualiza los detalles de un proveedor existente. Requiere permisos de Administrador o Supervisor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Proveedor,
    'Proveedor actualizado exitosamente',
    HttpStatus.OK,
  )
  async update(
    @Param('id') id: string,
    @Body() updateProveedoreDto: UpdateProveedoreDto,
  ) {
    const proveedor = await this.proveedoresService.update(id, updateProveedoreDto);
    return ApiResponseDto.Success(
      proveedor,
      'Actualizar Proveedor',
      'Proveedor actualizado exitosamente',
    );
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Activar un proveedor',
    description: 'Activa un proveedor que estaba desactivado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async activate(@Param('id') id: string) {
    const proveedor = await this.proveedoresService.activate(id);
    return ApiResponseDto.Success(
      proveedor,
      'Activar Proveedor',
      'Proveedor activado exitosamente',
    );
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Desactivar un proveedor',
    description: 'Desactiva un proveedor sin eliminarlo del sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async deactivate(@Param('id') id: string) {
    const proveedor = await this.proveedoresService.deactivate(id);
    return ApiResponseDto.Success(
      proveedor,
      'Desactivar Proveedor',
      'Proveedor desactivado exitosamente',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Eliminar un proveedor',
    description: 'Elimina un proveedor del sistema. No se puede eliminar si tiene compras asociadas. Requiere permisos de Administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async remove(@Param('id') id: string) {
    await this.proveedoresService.remove(id);
    return ApiResponseDto.Success(
      null,
      'Eliminar Proveedor',
      'Proveedor eliminado exitosamente',
    );
  }
}
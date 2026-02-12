import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { UpdateProveedoreDto } from './dto/update-proveedore.dto';
import { ApiOperation, ApiTags, ApiParam, } from '@nestjs/swagger';
import { ApiResponseWithData, ApiResponseWithPagination, PaginationParam, FilteringParamDecorator, SortingParamDecorator } from '../common/decorators';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';
import { FilteringParam, SortingParam } from '../common/helpers/typeorm-helpers';
import { Proveedor } from 'src/common/entities';
import { ERROR_MESSAGES } from 'src/common/constants/error-messages.constants';


@ApiTags('Proveedores')
@Controller('proveedores')
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
    @FilteringParamDecorator() filter: FilteringParam<any>,
    @SortingParamDecorator() sorting: SortingParam<any>,

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
    try {
      const proveedor = await this.proveedoresService.findOne(id);
      if (!proveedor) {
        throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
      }
      const updatedProveedor = await this.proveedoresService.update(id, updateProveedoreDto);
      return ApiResponseDto.Success(
        updatedProveedor,
        'Actualizar Proveedor',
        'Proveedor actualizado exitosamente',
      );
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Eliminar un proveedor',
    description: 'Elimina un proveedor del sistema. Requiere permisos de Administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Proveedor,
    'Proveedor eliminado exitosamente',
    HttpStatus.OK,
  )
  async remove(@Param('id') id: string) {
    try {
      const proveedor = await this.proveedoresService.remove(id);
      return ApiResponseDto.Success(
        proveedor,
        'Eliminar Proveedor',
        'Proveedor eliminado exitosamente',
      );
    } catch (error) {
      throw error;
    }
  }
}
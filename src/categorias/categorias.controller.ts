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
  Query,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto, UpdateCategoriaDto, QueryCategoriaDto } from './dtos';
import { ApiOperation, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApiResponseWithData, ApiResponseWithPagination, PaginationParam, FilteringParamDecorator, SortingParamDecorator } from '../common/decorators';
import { Categoria } from '../common/entities/categoria.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';
import { FilteringParam, SortingParam } from '../common/helpers/typeorm-helpers';

@ApiTags('Categorías')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Crear una nueva categoría',
    description: 'Crea una nueva categoría en el sistema. Requiere permisos de Administrador o Supervisor.',
  })
  @ApiResponseWithData(
    Categoria,
    'Categoría creada exitosamente',
    HttpStatus.CREATED,
  )
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    const categoria = await this.categoriasService.create(createCategoriaDto);
    return ApiResponseDto.Success(
      categoria,
      'Crear Categoría',
      'Categoría creada exitosamente',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todas las categorías',
    description: 'Obtiene una lista paginada de categorías con opciones de filtrado y ordenamiento.',
  })
  @ApiResponseWithPagination(
    Categoria,
    'Lista de categorías obtenida exitosamente',
    HttpStatus.OK,
  )
  async findAll(
    @PaginationParam() pagination: any,
    @FilteringParamDecorator(['nombre', 'activo']) filter?: FilteringParam<Categoria> | null,
    @SortingParamDecorator(['nombre', 'fechaCreacion']) sorting?: SortingParam<Categoria> | null,
  ) {
    return await this.categoriasService.findAll(pagination, filter, sorting);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener una categoría por ID',
    description: 'Obtiene los detalles de una categoría específica incluyendo sus productos asociados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Categoria,
    'Categoría obtenida exitosamente',
    HttpStatus.OK,
  )
  async findOne(@Param('id') id: string) {
    const categoria = await this.categoriasService.findOne(id);
    return ApiResponseDto.Success(
      categoria,
      'Obtener Categoría',
      'Categoría obtenida exitosamente',
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Actualizar una categoría',
    description: 'Actualiza los datos de una categoría existente. Requiere permisos de Administrador o Supervisor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Categoria,
    'Categoría actualizada exitosamente',
    HttpStatus.OK,
  )
  async update(
    @Param('id') id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    const categoria = await this.categoriasService.update(id, updateCategoriaDto);
    return ApiResponseDto.Success(
      categoria,
      'Actualizar Categoría',
      'Categoría actualizada exitosamente',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Eliminar una categoría',
    description: 'Elimina una categoría del sistema. Solo se puede eliminar si no tiene productos asociados. Requiere permisos de Administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Object,
    'Categoría eliminada exitosamente',
    HttpStatus.OK,
  )
  async remove(@Param('id') id: string) {
    await this.categoriasService.remove(id);
    return ApiResponseDto.Success(
      null,
      'Eliminar Categoría',
      'Categoría eliminada exitosamente',
    );
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Activar una categoría',
    description: 'Activa una categoría que estaba desactivada. Requiere permisos de Administrador o Supervisor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Categoria,
    'Categoría activada exitosamente',
    HttpStatus.OK,
  )
  async activate(@Param('id') id: string) {
    const categoria = await this.categoriasService.activate(id);
    return ApiResponseDto.Success(
      categoria,
      'Activar Categoría',
      'Categoría activada exitosamente',
    );
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Desactivar una categoría',
    description: 'Desactiva una categoría sin eliminarla. Requiere permisos de Administrador o Supervisor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Categoria,
    'Categoría desactivada exitosamente',
    HttpStatus.OK,
  )
  async deactivate(@Param('id') id: string) {
    const categoria = await this.categoriasService.deactivate(id);
    return ApiResponseDto.Success(
      categoria,
      'Desactivar Categoría',
      'Categoría desactivada exitosamente',
    );
  }
}


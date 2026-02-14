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
import { DescuentosService } from './descuentos.service';
import { CreateDescuentoDto, UpdateDescuentoDto } from './dtos';
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { ApiResponseWithData, ApiResponseWithPagination, PaginationParam, FilteringParamDecorator, SortingParamDecorator } from '../common/decorators';
import { Descuento } from '../common/entities/descuento.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';
import { FilteringParam, SortingParam } from '../common/helpers/typeorm-helpers';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Descuentos')
@Controller('descuentos')
@ApiBearerAuth()
export class DescuentosController {
  constructor(private readonly descuentosService: DescuentosService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Crear un nuevo descuento/cupón',
    description: 'Crea un nuevo descuento o cupón con código único.',
  })
  @ApiResponseWithData(
    Descuento,
    'Descuento creado exitosamente',
    HttpStatus.CREATED,
  )
  async create(@Body() createDescuentoDto: CreateDescuentoDto) {
    const descuento = await this.descuentosService.create(createDescuentoDto);
    return ApiResponseDto.Success(
      descuento,
      'Crear Descuento',
      'Descuento creado exitosamente',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los descuentos',
    description: 'Obtiene una lista paginada de descuentos.',
  })
  @ApiResponseWithPagination(
    Descuento,
    'Lista de descuentos obtenida exitosamente',
    HttpStatus.OK,
  )
  async findAll(
    @PaginationParam() pagination: any,
    @FilteringParamDecorator(['codigo', 'tipo', 'activo']) filter?: FilteringParam<Descuento> | null,
    @SortingParamDecorator(['codigo', 'valor', 'fechaInicio', 'fechaFin']) sorting?: SortingParam<Descuento> | null,
  ) {
    return await this.descuentosService.findAll(pagination, filter, sorting);
  }

  @Get('vigentes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener descuentos vigentes',
    description: 'Obtiene todos los descuentos activos y dentro de su período de vigencia.',
  })
  async getDescuentosVigentes() {
    const descuentos = await this.descuentosService.getDescuentosVigentes();
    return ApiResponseDto.Success(
      descuentos,
      'Descuentos Vigentes',
      'Descuentos vigentes obtenidos exitosamente',
    );
  }

  @Get('validar/:codigo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validar código de descuento',
    description: 'Valida si un código de descuento es válido y está vigente.',
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código del descuento',
    type: String,
    example: 'VERANO2024',
  })
  async validarCodigo(@Param('codigo') codigo: string) {
    const resultado = await this.descuentosService.validarCodigo(codigo);
    return ApiResponseDto.Success(
      resultado,
      'Validar Código',
      resultado.mensaje,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un descuento por ID',
    description: 'Obtiene los detalles de un descuento específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del descuento',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Descuento,
    'Descuento obtenido exitosamente',
    HttpStatus.OK,
  )
  async findOne(@Param('id') id: string) {
    const descuento = await this.descuentosService.findOne(id);
    return ApiResponseDto.Success(
      descuento,
      'Obtener Descuento',
      'Descuento obtenido exitosamente',
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Actualizar un descuento',
    description: 'Actualiza los datos de un descuento existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del descuento',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Descuento,
    'Descuento actualizado exitosamente',
    HttpStatus.OK,
  )
  async update(
    @Param('id') id: string,
    @Body() updateDescuentoDto: UpdateDescuentoDto,
  ) {
    const descuento = await this.descuentosService.update(id, updateDescuentoDto);
    return ApiResponseDto.Success(
      descuento,
      'Actualizar Descuento',
      'Descuento actualizado exitosamente',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Eliminar un descuento',
    description: 'Elimina un descuento del sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del descuento',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async remove(@Param('id') id: string) {
    await this.descuentosService.remove(id);
    return ApiResponseDto.Success(
      null,
      'Eliminar Descuento',
      'Descuento eliminado exitosamente',
    );
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Activar un descuento',
    description: 'Activa un descuento desactivado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del descuento',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async activate(@Param('id') id: string) {
    const descuento = await this.descuentosService.activate(id);
    return ApiResponseDto.Success(
      descuento,
      'Activar Descuento',
      'Descuento activado exitosamente',
    );
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Desactivar un descuento',
    description: 'Desactiva un descuento sin eliminarlo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del descuento',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async deactivate(@Param('id') id: string) {
    const descuento = await this.descuentosService.deactivate(id);
    return ApiResponseDto.Success(
      descuento,
      'Desactivar Descuento',
      'Descuento desactivado exitosamente',
    );
  }
}

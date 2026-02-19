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
import { MetodosPagoService } from './metodos-pago.service';
import { CreateMetodoPagoDto, UpdateMetodoPagoDto } from './dtos';
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { ApiResponseWithData, ApiResponseWithPagination, PaginationParam, FilteringParamDecorator, SortingParamDecorator } from '../common/decorators';
import { MetodoPago } from '../common/entities/metodo-pago.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';
import { FilteringParam, SortingParam } from '../common/helpers/typeorm-helpers';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Métodos de Pago')
@Controller('metodos-pago')
@ApiBearerAuth()
export class MetodosPagoController {
  constructor(private readonly metodosPagoService: MetodosPagoService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Crear un nuevo método de pago',
    description: 'Crea un nuevo método de pago en el sistema.',
  })
  @ApiResponseWithData(
    MetodoPago,
    'Método de pago creado exitosamente',
    HttpStatus.CREATED,
  )
  async create(@Body() createMetodoPagoDto: CreateMetodoPagoDto) {
    const metodoPago = await this.metodosPagoService.create(createMetodoPagoDto);
    return ApiResponseDto.Success(
      metodoPago,
      'Crear Método de Pago',
      'Método de pago creado exitosamente',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los métodos de pago',
    description: 'Obtiene una lista paginada de métodos de pago.',
  })
  @ApiResponseWithPagination(
    MetodoPago,
    'Lista de métodos de pago obtenida exitosamente',
    HttpStatus.OK,
  )
  async findAll(
    @PaginationParam() pagination: any,
    @FilteringParamDecorator(['nombre', 'activo']) filter?: FilteringParam<MetodoPago> | null,
    @SortingParamDecorator(['nombre', 'fechaCreacion']) sorting?: SortingParam<MetodoPago> | null,
  ) {
    return await this.metodosPagoService.findAll(pagination, filter, sorting);
  }

  @Get('activos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener métodos de pago activos',
    description: 'Obtiene todos los métodos de pago activos (para uso en formularios de venta).',
  })
  async findAllActive() {
    const metodosPago = await this.metodosPagoService.findAllActive();
    return ApiResponseDto.Success(
      metodosPago,
      'Métodos de Pago Activos',
      'Métodos de pago activos obtenidos exitosamente',
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un método de pago por ID',
    description: 'Obtiene los detalles de un método de pago específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del método de pago',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    MetodoPago,
    'Método de pago obtenido exitosamente',
    HttpStatus.OK,
  )
  async findOne(@Param('id') id: string) {
    const metodoPago = await this.metodosPagoService.findOne(id);
    return ApiResponseDto.Success(
      metodoPago,
      'Obtener Método de Pago',
      'Método de pago obtenido exitosamente',
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Actualizar un método de pago',
    description: 'Actualiza los datos de un método de pago existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del método de pago',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    MetodoPago,
    'Método de pago actualizado exitosamente',
    HttpStatus.OK,
  )
  async update(
    @Param('id') id: string,
    @Body() updateMetodoPagoDto: UpdateMetodoPagoDto,
  ) {
    const metodoPago = await this.metodosPagoService.update(id, updateMetodoPagoDto);
    return ApiResponseDto.Success(
      metodoPago,
      'Actualizar Método de Pago',
      'Método de pago actualizado exitosamente',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Eliminar un método de pago',
    description: 'Elimina un método de pago. No se puede eliminar si tiene ventas asociadas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del método de pago',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async remove(@Param('id') id: string) {
    await this.metodosPagoService.remove(id);
    return ApiResponseDto.Success(
      null,
      'Eliminar Método de Pago',
      'Método de pago eliminado exitosamente',
    );
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Activar un método de pago',
    description: 'Activa un método de pago desactivado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del método de pago',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async activate(@Param('id') id: string) {
    const metodoPago = await this.metodosPagoService.activate(id);
    return ApiResponseDto.Success(
      metodoPago,
      'Activar Método de Pago',
      'Método de pago activado exitosamente',
    );
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Desactivar un método de pago',
    description: 'Desactiva un método de pago sin eliminarlo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del método de pago',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async deactivate(@Param('id') id: string) {
    const metodoPago = await this.metodosPagoService.deactivate(id);
    return ApiResponseDto.Success(
      metodoPago,
      'Desactivar Método de Pago',
      'Método de pago desactivado exitosamente',
    );
  }
}

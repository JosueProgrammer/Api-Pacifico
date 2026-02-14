import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto, UpdateCompraDto } from './dtos';
import { ApiOperation, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApiResponseWithData, ApiResponseWithPagination, PaginationParam, FilteringParamDecorator, SortingParamDecorator } from '../common/decorators';
import { Compra } from '../common/entities/compra.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';
import { FilteringParam, SortingParam } from '../common/helpers/typeorm-helpers';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Compras')
@Controller('compras')
@ApiBearerAuth()
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Crear una nueva orden de compra',
    description: 'Crea una nueva orden de compra a un proveedor. El stock no se actualiza hasta recibir la compra.',
  })
  @ApiResponseWithData(
    Compra,
    'Compra creada exitosamente',
    HttpStatus.CREATED,
  )
  async create(@Body() createCompraDto: CreateCompraDto, @Req() req: any) {
    const usuarioId = req.user?.id || req.user?.sub;
    const compra = await this.comprasService.create(createCompraDto, usuarioId);
    return ApiResponseDto.Success(
      compra,
      'Crear Compra',
      'Compra creada exitosamente',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todas las compras',
    description: 'Obtiene una lista paginada de compras con opciones de filtrado y ordenamiento.',
  })
  @ApiResponseWithPagination(
    Compra,
    'Lista de compras obtenida exitosamente',
    HttpStatus.OK,
  )
  async findAll(
    @PaginationParam() pagination: any,
    @FilteringParamDecorator(['estado', 'proveedorId', 'usuarioId', 'numeroFactura']) filter?: FilteringParam<Compra> | null,
    @SortingParamDecorator(['fechaCompra', 'total', 'numeroFactura']) sorting?: SortingParam<Compra> | null,
  ) {
    return await this.comprasService.findAll(pagination, filter, sorting);
  }

  @Get('resumen')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Obtener resumen de compras',
    description: 'Obtiene un resumen con total de compras, cantidad y promedio. Opcionalmente filtrado por fechas.',
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    type: String,
    description: 'Fecha de inicio (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    type: String,
    description: 'Fecha de fin (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  async getResumen(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const inicio = fechaInicio ? new Date(fechaInicio) : undefined;
    const fin = fechaFin ? new Date(fechaFin) : undefined;
    const resumen = await this.comprasService.getResumenCompras(inicio, fin);
    return ApiResponseDto.Success(
      resumen,
      'Resumen de Compras',
      'Resumen obtenido exitosamente',
    );
  }

  @Get('proveedor/:proveedorId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener compras por proveedor',
    description: 'Obtiene todas las compras de un proveedor específico.',
  })
  @ApiParam({
    name: 'proveedorId',
    description: 'ID del proveedor',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async getComprasByProveedor(@Param('proveedorId') proveedorId: string) {
    const compras = await this.comprasService.getComprasByProveedor(proveedorId);
    return ApiResponseDto.Success(
      compras,
      'Compras por Proveedor',
      'Compras obtenidas exitosamente',
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener una compra por ID',
    description: 'Obtiene los detalles de una compra específica incluyendo productos y proveedor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la compra',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Compra,
    'Compra obtenida exitosamente',
    HttpStatus.OK,
  )
  async findOne(@Param('id') id: string) {
    const compra = await this.comprasService.findOne(id);
    return ApiResponseDto.Success(
      compra,
      'Obtener Compra',
      'Compra obtenida exitosamente',
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Actualizar estado de una compra',
    description: 'Actualiza el estado de una compra.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la compra',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Compra,
    'Compra actualizada exitosamente',
    HttpStatus.OK,
  )
  async update(
    @Param('id') id: string,
    @Body() updateCompraDto: UpdateCompraDto,
  ) {
    const compra = await this.comprasService.update(id, updateCompraDto);
    return ApiResponseDto.Success(
      compra,
      'Actualizar Compra',
      'Compra actualizada exitosamente',
    );
  }

  @Patch(':id/recibir')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Recibir una compra',
    description: 'Marca la compra como recibida y actualiza el stock de los productos. También actualiza el precio de compra de los productos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la compra',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Compra,
    'Compra recibida exitosamente',
    HttpStatus.OK,
  )
  async recibir(@Param('id') id: string) {
    const compra = await this.comprasService.recibir(id);
    return ApiResponseDto.Success(
      compra,
      'Recibir Compra',
      'Compra recibida exitosamente. Stock actualizado.',
    );
  }

  @Patch(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Cancelar una compra',
    description: 'Cancela una compra. Si ya fue recibida, revierte el stock de los productos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la compra',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Compra,
    'Compra cancelada exitosamente',
    HttpStatus.OK,
  )
  async cancelar(@Param('id') id: string) {
    const compra = await this.comprasService.cancelar(id);
    return ApiResponseDto.Success(
      compra,
      'Cancelar Compra',
      'Compra cancelada exitosamente',
    );
  }
}

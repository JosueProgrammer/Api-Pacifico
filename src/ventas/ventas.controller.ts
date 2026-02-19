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
import { VentasService } from './ventas.service';
import { CreateVentaDto, UpdateVentaDto } from './dtos';
import { ApiOperation, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApiResponseWithData, ApiResponseWithPagination, PaginationParam, FilteringParamDecorator, SortingParamDecorator } from '../common/decorators';
import { Venta } from '../common/entities/venta.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';
import { FilteringParam, SortingParam } from '../common/helpers/typeorm-helpers';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Ventas')
@Controller('ventas')
@ApiBearerAuth()
export class VentasController {
  constructor(private readonly ventasService: VentasService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR)
  @ApiOperation({
    summary: 'Crear una nueva venta',
    description: 'Crea una nueva venta con sus detalles. Actualiza automáticamente el stock de los productos.',
  })
  @ApiResponseWithData(
    Venta,
    'Venta creada exitosamente',
    HttpStatus.CREATED,
  )
  async create(@Body() createVentaDto: CreateVentaDto, @Req() req: any) {
    const usuarioId = req.user?.id || req.user?.sub;
    const venta = await this.ventasService.create(createVentaDto, usuarioId);
    return ApiResponseDto.Success(
      venta,
      'Crear Venta',
      'Venta creada exitosamente',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todas las ventas',
    description: 'Obtiene una lista paginada de ventas con opciones de filtrado y ordenamiento.',
  })
  @ApiResponseWithPagination(
    Venta,
    'Lista de ventas obtenida exitosamente',
    HttpStatus.OK,
  )
  async findAll(
    @PaginationParam() pagination: any,
    @FilteringParamDecorator(['estado', 'clienteId', 'usuarioId', 'numeroFactura']) filter?: FilteringParam<Venta> | null,
    @SortingParamDecorator(['fechaVenta', 'total', 'numeroFactura']) sorting?: SortingParam<Venta> | null,
  ) {
    return await this.ventasService.findAll(pagination, filter, sorting);
  }

  @Get('resumen')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Obtener resumen de ventas',
    description: 'Obtiene un resumen con total de ventas, cantidad y promedio. Opcionalmente filtrado por fechas.',
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
    const resumen = await this.ventasService.getResumenVentas(inicio, fin);
    return ApiResponseDto.Success(
      resumen,
      'Resumen de Ventas',
      'Resumen obtenido exitosamente',
    );
  }

  @Get('cliente/:clienteId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener ventas por cliente',
    description: 'Obtiene todas las ventas de un cliente específico.',
  })
  @ApiParam({
    name: 'clienteId',
    description: 'ID del cliente',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async getVentasByCliente(@Param('clienteId') clienteId: string) {
    const ventas = await this.ventasService.getVentasByCliente(clienteId);
    return ApiResponseDto.Success(
      ventas,
      'Ventas por Cliente',
      'Ventas obtenidas exitosamente',
    );
  }

  @Get('factura/:numeroFactura')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener venta por número de factura',
    description: 'Obtiene una venta específica por su número de factura.',
  })
  @ApiParam({
    name: 'numeroFactura',
    description: 'Número de factura',
    type: String,
    example: 'F2402140001',
  })
  async findByNumeroFactura(@Param('numeroFactura') numeroFactura: string) {
    const venta = await this.ventasService.findByNumeroFactura(numeroFactura);
    return ApiResponseDto.Success(
      venta,
      'Obtener Venta',
      'Venta obtenida exitosamente',
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener una venta por ID',
    description: 'Obtiene los detalles de una venta específica incluyendo productos y cliente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la venta',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Venta,
    'Venta obtenida exitosamente',
    HttpStatus.OK,
  )
  async findOne(@Param('id') id: string) {
    const venta = await this.ventasService.findOne(id);
    return ApiResponseDto.Success(
      venta,
      'Obtener Venta',
      'Venta obtenida exitosamente',
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Actualizar estado de una venta',
    description: 'Actualiza el estado de una venta. Si se cancela, se devuelve el stock.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la venta',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Venta,
    'Venta actualizada exitosamente',
    HttpStatus.OK,
  )
  async update(
    @Param('id') id: string,
    @Body() updateVentaDto: UpdateVentaDto,
  ) {
    const venta = await this.ventasService.update(id, updateVentaDto);
    return ApiResponseDto.Success(
      venta,
      'Actualizar Venta',
      'Venta actualizada exitosamente',
    );
  }

  @Patch(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Cancelar una venta',
    description: 'Cancela una venta y devuelve el stock de los productos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la venta',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Venta,
    'Venta cancelada exitosamente',
    HttpStatus.OK,
  )
  async cancelar(@Param('id') id: string) {
    const venta = await this.ventasService.cancelar(id);
    return ApiResponseDto.Success(
      venta,
      'Cancelar Venta',
      'Venta cancelada exitosamente',
    );
  }

  @Patch(':id/confirmar')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR)
  @ApiOperation({
    summary: 'Confirmar una venta en borrador',
    description: 'Confirma una venta en estado borrador, descontando stock y registrando movimientos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la venta',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Venta,
    'Venta confirmada exitosamente',
    HttpStatus.OK,
  )
  async confirmar(@Param('id') id: string) {
    const venta = await this.ventasService.confirmarVenta(id);
    return ApiResponseDto.Success(
      venta,
      'Confirmar Venta',
      'Venta confirmada exitosamente',
    );
  }
}

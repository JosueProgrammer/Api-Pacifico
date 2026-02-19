import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateMovimientoDto, AjusteStockDto } from './dtos';
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { ApiResponseWithData, ApiResponseWithPagination, PaginationParam, FilteringParamDecorator, SortingParamDecorator } from '../common/decorators';
import { Inventario } from '../common/entities/inventario.entity';
import { Producto } from '../common/entities/producto.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';
import { FilteringParam, SortingParam } from '../common/helpers/typeorm-helpers';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventario')
@Controller('inventario')
@ApiBearerAuth()
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) { }

  @Post('movimiento')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Registrar movimiento de inventario',
    description: 'Registra una entrada, salida o ajuste de inventario. El stock no puede quedar negativo.',
  })
  @ApiResponseWithData(
    Inventario,
    'Movimiento registrado exitosamente',
    HttpStatus.CREATED,
  )
  async registrarMovimiento(@Body() createMovimientoDto: CreateMovimientoDto, @Req() req: any) {
    const usuarioId = req.user?.id || req.user?.sub;
    const movimiento = await this.inventarioService.registrarMovimiento(createMovimientoDto, usuarioId);
    return ApiResponseDto.Success(
      movimiento,
      'Registrar Movimiento',
      'Movimiento de inventario registrado exitosamente',
    );
  }

  @Post('ajuste')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Ajustar stock de producto',
    description: 'Establece el stock de un producto a una cantidad específica (no puede ser negativo).',
  })
  @ApiResponseWithData(
    Inventario,
    'Stock ajustado exitosamente',
    HttpStatus.CREATED,
  )
  async ajustarStock(@Body() ajusteStockDto: AjusteStockDto, @Req() req: any) {
    const usuarioId = req.user?.id || req.user?.sub;
    const movimiento = await this.inventarioService.ajustarStock(ajusteStockDto, usuarioId);
    return ApiResponseDto.Success(
      movimiento,
      'Ajustar Stock',
      'Stock ajustado exitosamente',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener movimientos de inventario',
    description: 'Obtiene una lista paginada de todos los movimientos de inventario.',
  })
  @ApiResponseWithPagination(
    Inventario,
    'Movimientos obtenidos exitosamente',
    HttpStatus.OK,
  )
  async findAll(
    @PaginationParam() pagination: any,
    @FilteringParamDecorator(['productoId', 'tipoMovimiento', 'usuarioId']) filter?: FilteringParam<Inventario> | null,
    @SortingParamDecorator(['fechaMovimiento', 'cantidad']) sorting?: SortingParam<Inventario> | null,
  ) {
    return await this.inventarioService.findAll(pagination, filter, sorting);
  }

  @Get('resumen')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Obtener resumen de inventario',
    description: 'Obtiene estadísticas generales del inventario.',
  })
  async getResumen() {
    const resumen = await this.inventarioService.getResumenInventario();
    return ApiResponseDto.Success(
      resumen,
      'Resumen de Inventario',
      'Resumen obtenido exitosamente',
    );
  }

  @Get('stock-bajo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener productos con stock bajo',
    description: 'Obtiene todos los productos cuyo stock es menor o igual al stock mínimo.',
  })
  async getProductosStockBajo() {
    const productos = await this.inventarioService.getProductosStockBajo();
    return ApiResponseDto.Success(
      productos,
      'Productos con Stock Bajo',
      'Productos obtenidos exitosamente',
    );
  }

  @Get('producto/:productoId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener historial de un producto',
    description: 'Obtiene todos los movimientos de inventario de un producto específico.',
  })
  @ApiParam({
    name: 'productoId',
    description: 'ID del producto',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  async getHistorialProducto(@Param('productoId') productoId: string) {
    const historial = await this.inventarioService.getHistorialProducto(productoId);
    return ApiResponseDto.Success(
      historial,
      'Historial de Producto',
      'Historial obtenido exitosamente',
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un movimiento por ID',
    description: 'Obtiene los detalles de un movimiento de inventario específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del movimiento',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Inventario,
    'Movimiento obtenido exitosamente',
    HttpStatus.OK,
  )
  async findOne(@Param('id') id: string) {
    const movimiento = await this.inventarioService.findOne(id);
    return ApiResponseDto.Success(
      movimiento,
      'Obtener Movimiento',
      'Movimiento obtenido exitosamente',
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';
import { DevolucionesService } from './devoluciones.service';
import { CreateDevolucionDto, QueryDevolucionDto } from './dtos';
import { ApiOperation, ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponseWithData, ApiResponseWithPagination } from '../common/decorators';
import { Devolucion } from '../common/entities/devolucion.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';

@ApiTags('Devoluciones')
@Controller('devoluciones')
@ApiBearerAuth()
export class DevolucionesController {
  constructor(private readonly devolucionesService: DevolucionesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR)
  @ApiOperation({
    summary: 'Crear devolución',
    description: 'Procesa una devolución parcial o total de una venta. Actualiza automáticamente el inventario y registra el movimiento de caja.',
  })
  @ApiResponseWithData(
    Devolucion,
    'Devolución procesada exitosamente',
    HttpStatus.CREATED,
  )
  async create(@Body() createDevolucionDto: CreateDevolucionDto, @Req() req: any) {
    const usuarioId = req.user?.id || req.user?.sub;
    const devolucion = await this.devolucionesService.create(
      createDevolucionDto,
      usuarioId,
    );
    return ApiResponseDto.Success(
      devolucion,
      'Crear Devolución',
      'Devolución procesada exitosamente',
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR)
  @ApiOperation({
    summary: 'Listar devoluciones',
    description: 'Obtiene todas las devoluciones con filtros opcionales y paginación.',
  })
  @ApiResponseWithPagination(
    Devolucion,
    'Devoluciones obtenidas exitosamente',
    HttpStatus.OK,
  )
  async findAll(@Query() queryDto: QueryDevolucionDto) {
    return await this.devolucionesService.findAll(queryDto);
  }

  @Get('venta/:ventaId')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener devoluciones de una venta',
    description: 'Obtiene todas las devoluciones realizadas para una venta específica.',
  })
  @ApiParam({
    name: 'ventaId',
    description: 'ID de la venta',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Devolucion,
    'Devoluciones obtenidas exitosamente',
    HttpStatus.OK,
  )
  async findByVenta(@Param('ventaId') ventaId: string) {
    const devoluciones = await this.devolucionesService.findByVenta(ventaId);
    return ApiResponseDto.Success(
      devoluciones,
      'Devoluciones de Venta',
      'Devoluciones obtenidas exitosamente',
    );
  }

  @Get('venta/:ventaId/disponible')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener productos disponibles para devolver',
    description: 'Obtiene los productos de una venta que aún pueden ser devueltos (total o parcialmente).',
  })
  @ApiParam({
    name: 'ventaId',
    description: 'ID de la venta',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Array,
    'Productos disponibles obtenidos exitosamente',
    HttpStatus.OK,
  )
  async getProductosDisponibles(@Param('ventaId') ventaId: string) {
    const productos = await this.devolucionesService.getProductosDisponiblesParaDevolucion(ventaId);
    return ApiResponseDto.Success(
      productos,
      'Productos Disponibles para Devolución',
      'Productos disponibles obtenidos exitosamente',
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR)
  @ApiOperation({
    summary: 'Obtener devolución por ID',
    description: 'Obtiene los detalles completos de una devolución específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la devolución',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Devolucion,
    'Devolución obtenida exitosamente',
    HttpStatus.OK,
  )
  async findOne(@Param('id') id: string) {
    const devolucion = await this.devolucionesService.findOne(id);
    return ApiResponseDto.Success(
      devolucion,
      'Obtener Devolución',
      'Devolución obtenida exitosamente',
    );
  }
}

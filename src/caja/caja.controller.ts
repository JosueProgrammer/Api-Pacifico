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
import { CajaService } from './caja.service';
import { AbrirCajaDto, CerrarCajaDto, CrearMovimientoCajaDto } from './dtos';
import { ApiOperation, ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponseWithData, ApiResponseWithPagination, PaginationParam } from '../common/decorators';
import { Caja } from '../common/entities/caja.entity';
import { MovimientoCaja } from '../common/entities/movimiento-caja.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';

@ApiTags('Caja')
@Controller('caja')
@ApiBearerAuth()
export class CajaController {
  constructor(private readonly cajaService: CajaService) { }

  @Post('abrir')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR, UserRole.CAJERO)
  @ApiOperation({
    summary: 'Abrir caja',
    description: 'Abre una nueva caja con el monto inicial especificado. Solo puede haber una caja abierta por usuario.',
  })
  @ApiResponseWithData(
    Caja,
    'Caja abierta exitosamente',
    HttpStatus.CREATED,
  )
  async abrirCaja(@Body() abrirCajaDto: AbrirCajaDto, @Req() req: any) {
    const usuarioId = req.user?.id || req.user?.sub;
    const caja = await this.cajaService.abrirCaja(abrirCajaDto, usuarioId);
    return ApiResponseDto.Success(
      caja,
      'Abrir Caja',
      'Caja abierta exitosamente',
    );
  }

  @Post('cerrar')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR, UserRole.CAJERO)
  @ApiOperation({
    summary: 'Cerrar caja',
    description: 'Cierra la caja actual del usuario realizando el arqueo. Calcula automáticamente la diferencia entre monto esperado y real.',
  })
  @ApiResponseWithData(
    Caja,
    'Caja cerrada exitosamente',
    HttpStatus.OK,
  )
  async cerrarCaja(@Body() cerrarCajaDto: CerrarCajaDto, @Req() req: any) {
    const usuarioId = req.user?.id || req.user?.sub;
    const caja = await this.cajaService.cerrarCaja(cerrarCajaDto, usuarioId);
    return ApiResponseDto.Success(
      caja,
      'Cerrar Caja',
      'Caja cerrada exitosamente',
    );
  }

  @Get('abiertas')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Obtener todas las cajas abiertas',
    description: 'Obtiene una lista de todas las cajas que se encuentran abiertas actualmente en el sistema.',
  })
  @ApiResponseWithData(
    Caja,
    'Cajas abiertas obtenidas exitosamente',
    HttpStatus.OK,
  )
  async getCajasAbiertas() {
    const cajas = await this.cajaService.getCajasAbiertas();
    return ApiResponseDto.Success(
      cajas,
      'Cajas Abiertas',
      'Cajas abiertas obtenidas exitosamente',
    );
  }

  @Get('actual')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR, UserRole.CAJERO)
  @ApiOperation({
    summary: 'Obtener caja actual',
    description: 'Obtiene el estado de la caja abierta del usuario actual.',
  })
  @ApiResponseWithData(
    Caja,
    'Caja actual obtenida exitosamente',
    HttpStatus.OK,
  )
  async getCajaActual(@Req() req: any) {
    const usuarioId = req.user?.id || req.user?.sub;
    const caja = await this.cajaService.getCajaActual(usuarioId);
    return ApiResponseDto.Success(
      caja,
      'Caja Actual',
      caja ? 'Caja actual obtenida exitosamente' : 'No hay caja abierta',
    );
  }

  @Post('movimiento')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR, UserRole.CAJERO)
  @ApiOperation({
    summary: 'Registrar movimiento manual',
    description: 'Registra un retiro o depósito manual en la caja actual.',
  })
  @ApiResponseWithData(
    MovimientoCaja,
    'Movimiento registrado exitosamente',
    HttpStatus.CREATED,
  )
  async registrarMovimiento(
    @Body() crearMovimientoDto: CrearMovimientoCajaDto,
    @Req() req: any,
  ) {
    const usuarioId = req.user?.id || req.user?.sub;
    const movimiento = await this.cajaService.registrarMovimiento(
      crearMovimientoDto,
      usuarioId,
    );
    return ApiResponseDto.Success(
      movimiento,
      'Registrar Movimiento',
      'Movimiento registrado exitosamente',
    );
  }

  @Get('historial')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR, UserRole.CAJERO)
  @ApiOperation({
    summary: 'Obtener historial de cajas',
    description: 'Obtiene el historial de cajas cerradas con paginación.',
  })
  @ApiResponseWithPagination(
    Caja,
    'Historial obtenido exitosamente',
    HttpStatus.OK,
  )
  async getHistorial(
    @PaginationParam() pagination: any,
    @Req() req: any,
    @Query('usuarioId') usuarioId?: string,
  ) {
    const userRole = req.user?.rol?.nombre;
    const currentUserId = req.user?.id || req.user?.sub;

    // Si el usuario es Vendedor o Cajero, solo puede ver su propio historial
    let filterUsuarioId = usuarioId;
    if (userRole === UserRole.VENDEDOR || userRole === UserRole.CAJERO) {
      filterUsuarioId = currentUserId;
    }

    return await this.cajaService.getHistorial(pagination, filterUsuarioId);
  }

  @Get(':id/movimientos')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR, UserRole.CAJERO)
  @ApiOperation({
    summary: 'Obtener movimientos de una caja',
    description: 'Obtiene todos los movimientos de una caja específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la caja',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithPagination(
    MovimientoCaja,
    'Movimientos obtenidos exitosamente',
    HttpStatus.OK,
  )
  async getMovimientosByCaja(
    @Param('id') id: string,
    @PaginationParam() pagination: any,
  ) {
    return await this.cajaService.getMovimientosByCaja(id, pagination);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Obtener caja por ID',
    description: 'Obtiene los detalles de una caja específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la caja',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponseWithData(
    Caja,
    'Caja obtenida exitosamente',
    HttpStatus.OK,
  )
  async findOne(@Param('id') id: string) {
    const caja = await this.cajaService.findOne(id);
    return ApiResponseDto.Success(
      caja,
      'Obtener Caja',
      'Caja obtenida exitosamente',
    );
  }
}

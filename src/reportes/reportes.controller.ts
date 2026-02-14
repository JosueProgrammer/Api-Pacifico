import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { ReporteFilterDto } from './dtos/reporte-filter.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';

@ApiTags('Reportes')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Obtener métricas del dashboard',
    description: 'Retorna métricas generales como ventas del día, mes, y alertas de stock.',
  })
  async getDashboard() {
    return await this.reportesService.getDashboard();
  }

  @Get('ventas')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Reporte de ventas por período',
    description: 'Obtiene el total y cantidad de ventas agrupado por día, semana, mes o año.',
  })
  async getVentasPorPeriodo(@Query() filter: ReporteFilterDto) {
    return await this.reportesService.getVentasPorPeriodo(filter);
  }

  @Get('productos-mas-vendidos')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Productos más vendidos',
    description: 'Ranking de productos con mayores ventas por cantidad o monto total.',
  })
  async getProductosMasVendidos(@Query() filter: ReporteFilterDto) {
    return await this.reportesService.getProductosMasVendidos(filter);
  }

  @Get('ventas-por-categoria')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Ventas por categoría',
    description: 'Distribución de ventas agrupadas por categoría de producto.',
  })
  async getVentasPorCategoria(@Query() filter: ReporteFilterDto) {
    return await this.reportesService.getVentasPorCategoria(filter);
  }

  @Get('margen-ganancia')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Reporte de margen de ganancia',
    description: 'Calcula ingresos, costos estimados y margen bruto en el período seleccionado.',
  })
  async getMargenGanancia(@Query() filter: ReporteFilterDto) {
    return await this.reportesService.getMargenGanancia(filter);
  }

  @Get('comparativa')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Comparativa de períodos',
    description: 'Compara métricas de ventas entre el período actual y el anterior.',
  })
  async getComparativa(@Query() filter: ReporteFilterDto) {
    return await this.reportesService.getComparativa(filter);
  }
}

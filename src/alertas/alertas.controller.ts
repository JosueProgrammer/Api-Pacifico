import { Controller, Get, Patch, Delete, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertasService } from './alertas.service';
import { QueryAlertaDto } from './dtos/query-alerta.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';
import { ApiResponseWithData } from '../common/decorators/api-response-with-data.decorator';
import { Alerta } from '../common/entities/alerta.entity';

@ApiTags('Alertas')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Listar alertas',
    description: 'Obtiene todas las alertas con filtros opcionales.',
  })
  @ApiResponseWithData(
    Alerta,
    'Alertas obtenidas exitosamente',
    HttpStatus.OK,
  )
  async findAll(@Query() query: QueryAlertaDto) {
    return await this.alertasService.findAll(query);
  }

  @Get('no-leidas')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR)
  @ApiOperation({
    summary: 'Contador de alertas no leídas',
    description: 'Retorna el número de alertas pendientes de lectura.',
  })
  async getNoLeidasCount() {
    const count = await this.alertasService.getNoLeidasCount();
    return {
      success: true,
      data: { count },
      message: 'Contador obtenido exitosamente',
    };
  }

  @Patch(':id/marcar-leida')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR, UserRole.VENDEDOR)
  @ApiOperation({
    summary: 'Marcar alerta como leída',
    description: 'Marca una alerta específica como leída.',
  })
  @ApiResponseWithData(
    Alerta,
    'Alerta marcada como leída',
    HttpStatus.OK,
  )
  async marcarComoLeida(@Param('id') id: string) {
    const alerta = await this.alertasService.marcarComoLeida(id);
    return {
      success: true,
      data: alerta,
      message: 'Alerta marcada como leída',
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Eliminar alerta',
    description: 'Elimina una alerta específica.',
  })
  async remove(@Param('id') id: string) {
    await this.alertasService.remove(id);
    return {
      success: true,
      message: 'Alerta eliminada exitosamente',
    };
  }
}

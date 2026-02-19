import { Controller, Get, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { QueryAuditoriaDto } from './dtos/query-auditoria.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLog } from '../common/entities/audit-log.entity';
import { ApiPaginatedResponseDto } from '../common/dto/api-paginated-response.dto';

@ApiTags('Auditoría')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Consultar logs de auditoría' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de logs de auditoría',
    type: ApiPaginatedResponseDto,
  })
  async findAll(@Query() query: QueryAuditoriaDto) {
    const { page, limit, ...filters } = query;
    return this.auditoriaService.findAll(page, limit, filters);
  }
}

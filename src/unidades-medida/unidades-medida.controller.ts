import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UnidadesMedidaService } from './unidades-medida.service';
import { CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from './dto';
import { UnidadMedida } from '../common/entities/unidad-medida.entity';
import { ApiPaginatedResponseDto } from '../common/dto/api-paginated-response.dto';
import { PaginationParamsDto } from '../common/dto/pagination-param.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Unidades de Medida')
@ApiBearerAuth()
@Controller('unidades-medida')
export class UnidadesMedidaController {
  constructor(private readonly unidadesMedidaService: UnidadesMedidaService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear una nueva unidad de medida' })
  @ApiResponse({ status: 201, description: 'Unidad de medida creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o abreviatura duplicada' })
  async create(@Body() createUnidadMedidaDto: CreateUnidadMedidaDto): Promise<UnidadMedida> {
    return await this.unidadesMedidaService.create(createUnidadMedidaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las unidades de medida con paginación' })
  @ApiResponse({ status: 200, description: 'Lista de unidades de medida' })
  async findAll(
    @Query() pagination: PaginationParamsDto,
  ): Promise<ApiPaginatedResponseDto<UnidadMedida>> {
    return await this.unidadesMedidaService.findAll(pagination);
  }

  @Get('activas')
  @ApiOperation({ summary: 'Obtener todas las unidades de medida activas' })
  @ApiResponse({ status: 200, description: 'Lista de unidades de medida activas' })
  async getUnidadesActivas(): Promise<UnidadMedida[]> {
    return await this.unidadesMedidaService.getUnidadesActivas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una unidad de medida por ID' })
  @ApiResponse({ status: 200, description: 'Unidad de medida encontrada' })
  @ApiResponse({ status: 404, description: 'Unidad de medida no encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UnidadMedida> {
    return await this.unidadesMedidaService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar una unidad de medida' })
  @ApiResponse({ status: 200, description: 'Unidad de medida actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Unidad de medida no encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUnidadMedidaDto: UpdateUnidadMedidaDto,
  ): Promise<UnidadMedida> {
    return await this.unidadesMedidaService.update(id, updateUnidadMedidaDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una unidad de medida' })
  @ApiResponse({ status: 204, description: 'Unidad de medida eliminada exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar, tiene productos asociados' })
  @ApiResponse({ status: 404, description: 'Unidad de medida no encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.unidadesMedidaService.remove(id);
  }

  @Patch(':id/activar')
  @Roles('admin')
  @ApiOperation({ summary: 'Activar una unidad de medida' })
  @ApiResponse({ status: 200, description: 'Unidad de medida activada exitosamente' })
  async activate(@Param('id', ParseUUIDPipe) id: string): Promise<UnidadMedida> {
    return await this.unidadesMedidaService.activate(id);
  }

  @Patch(':id/desactivar')
  @Roles('admin')
  @ApiOperation({ summary: 'Desactivar una unidad de medida' })
  @ApiResponse({ status: 200, description: 'Unidad de medida desactivada exitosamente' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<UnidadMedida> {
    return await this.unidadesMedidaService.deactivate(id);
  }

  @Post('seed')
  @Roles('admin')
  @ApiOperation({ summary: 'Crear unidades de medida básicas por defecto' })
  @ApiResponse({ status: 201, description: 'Unidades básicas creadas exitosamente' })
  async seedUnidadesBasicas(): Promise<{ message: string }> {
    await this.unidadesMedidaService.seedUnidadesBasicas();
    return { message: 'Unidades de medida básicas creadas exitosamente' };
  }
}

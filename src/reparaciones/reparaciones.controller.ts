import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReparacionesService } from './reparaciones.service';
import { CreateReparacionDto } from './dto/create-reparacion.dto';
import { UpdateReparacionDto } from './dto/update-reparacion.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('reparaciones')
@Controller('reparaciones')
export class ReparacionesController {
  constructor(private readonly reparacionesService: ReparacionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reparación' })
  create(@Body() createReparacionDto: CreateReparacionDto) {
    return this.reparacionesService.create(createReparacionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las reparaciones' })
  findAll() {
    return this.reparacionesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener reparación por ID' })
  findOne(@Param('id') id: string) {
    return this.reparacionesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una reparación' })
  update(@Param('id') id: string, @Body() updateReparacionDto: UpdateReparacionDto) {
    return this.reparacionesService.update(id, updateReparacionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una reparación' })
  remove(@Param('id') id: string) {
    return this.reparacionesService.remove(id);
  }
}

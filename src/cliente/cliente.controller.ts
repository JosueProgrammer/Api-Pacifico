import { Controller, Post, Body, HttpCode, HttpStatus, Get, Param, Patch, Delete } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { ApiResponseWithData, FilteringParamDecorator, PaginationParam, Roles, SortingParamDecorator } from 'src/common/decorators';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { UserRole } from 'src/auth/enums/user-rol.enum';
import { ApiResponseDto } from 'src/common/dto';
import { FilteringParam, SortingParam } from 'src/common/helpers';
import { Cliente } from 'src/common/entities';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) { }

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR, UserRole.CAJERO)
  @ApiOperation({
    summary: 'Crear un nuevo cliente',
    description: 'Crea un nuevo cliente en el sistema.',
  })
  @ApiResponseWithData(
    ClienteResponseDto,
    'Cliente creado exitosamente',
    HttpStatus.CREATED,
  )
  async create(@Body() createClienteDto: CreateClienteDto) {
    const cliente = await this.clienteService.create(createClienteDto);
    return ApiResponseDto.Success(
      cliente,
      'Crear Cliente',
      'Cliente creado exitosamente',
    );
  }

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR, UserRole.CAJERO)
  @ApiOperation({
    summary: 'Obtener todos los clientes',
    description: 'Devuelve una lista paginada de todos los clientes.',
  })
  @ApiResponseWithData(
    ClienteResponseDto,
    'Clientes obtenidos exitosamente',
    HttpStatus.OK,
  )
  async findAll(
    @PaginationParam() pagination: any,
    @FilteringParamDecorator(['nombre', 'correo', 'telefono', 'activo']) filter?: FilteringParam<Cliente> | null,
    @SortingParamDecorator(['nombre', 'correo', 'fechaCreacion']) sorting?: SortingParam<Cliente> | null,
  ) {
    return await this.clienteService.findAll(pagination, filter, sorting);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un cliente por ID',
    description: 'Obtiene los detalles de un cliente específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    type: String,
    example: 'a3f1c2b4-8e9d-4f2a-bc1e-123456789abc',
  })
  @ApiResponseWithData(
    ClienteResponseDto,
    'Cliente obtenido exitosamente',
    HttpStatus.OK,
  )
  async findOne(@Param('id') id: string) {
    const cliente = await this.clienteService.findOne(id);

    return ApiResponseDto.Success(
      cliente,
      'Obtener Cliente',
      'Cliente obtenido exitosamente',
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Actualizar un cliente',
    description: 'Actualiza los datos de un cliente existente. Requiere permisos de Administrador o Supervisor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    type: String,
    example: 'a3f1c2b4-8e9d-4f2a-bc1e-123456789abc',
  })
  @ApiResponseWithData(
    ClienteResponseDto,
    'Cliente actualizado exitosamente',
    HttpStatus.OK,
  )
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    const cliente = await this.clienteService.update(id, updateClienteDto);

    return ApiResponseDto.Success(
      cliente,
      'Actualizar Cliente',
      'Cliente actualizado exitosamente',
    );
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Activar un cliente',
    description: 'Activa un cliente que estaba desactivado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    type: String,
    example: 'a3f1c2b4-8e9d-4f2a-bc1e-123456789abc',
  })
  async activate(@Param('id') id: string) {
    const cliente = await this.clienteService.activate(id);
    return ApiResponseDto.Success(
      cliente,
      'Activar Cliente',
      'Cliente activado exitosamente',
    );
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  @ApiOperation({
    summary: 'Desactivar un cliente',
    description: 'Desactiva un cliente sin eliminarlo del sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    type: String,
    example: 'a3f1c2b4-8e9d-4f2a-bc1e-123456789abc',
  })
  async deactivate(@Param('id') id: string) {
    const cliente = await this.clienteService.deactivate(id);
    return ApiResponseDto.Success(
      cliente,
      'Desactivar Cliente',
      'Cliente desactivado exitosamente',
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Eliminar un cliente',
    description: 'Elimina un cliente del sistema. Solo se puede eliminar si no tiene ventas asociadas. Requiere permisos de Administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    type: String,
    example: 'a3f1c2b4-8e9d-4f2a-bc1e-123456789abc',
  })
  @ApiResponseWithData(
    Object,
    'Cliente eliminado exitosamente',
    HttpStatus.OK,
  )
  async remove(@Param('id') id: string) {
    await this.clienteService.remove(id);

    return ApiResponseDto.Success(
      null,
      'Eliminar Cliente',
      'Cliente eliminado exitosamente',
    );
  }
}
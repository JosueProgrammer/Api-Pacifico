import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { ApiResponseWithData, FilteringParamDecorator, PaginationParam, Roles, SortingParamDecorator } from 'src/common/decorators';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { UserRole } from 'src/auth/enums/user-rol.enum';
import { userInfo } from 'os';
import { ApiResponseDto } from 'src/common/dto';
import { FilteringParam, SortingParam } from 'src/common/helpers';
import { Cliente } from 'src/common/entities';

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
    @FilteringParamDecorator(['nombre', 'correo', 'telefono']) filter?: FilteringParam<Cliente> | null,
    @SortingParamDecorator(['nombre', 'correo', 'fechaCreacion']) sorting?: SortingParam<Cliente> | null,
  ) {
    return await this.clienteService.findAll(pagination, filter, sorting);
  }

}
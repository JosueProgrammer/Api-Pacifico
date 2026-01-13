import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/common/entities';
import { Repository } from 'typeorm';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { plainToInstance } from 'class-transformer';
import { ApiPaginatedMetaDto, ApiPaginatedResponseDto, PaginationParamsDto } from 'src/common/dto';
import { FilteringParam, handleDBErrors, SortingParam } from 'src/common/helpers';
import { ERROR_MESSAGES } from 'src/common/constants/error-messages.constants';
import { getWhereConditions,getSortingOrder } from 'src/common/helpers';

@Injectable()
export class ClienteService {

  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>
  ) { }
  async create(createClienteDto: CreateClienteDto)
    : Promise<ClienteResponseDto> {

    try {
      const clienteExistente = await this.clienteRepository.findOne({
        where: { correo: createClienteDto.correo }
      });


      if (clienteExistente) {
        throw new BadRequestException("ya existe un correo igual en uso");
      }

      const nuevoCliente = this.clienteRepository.create({
        ...createClienteDto,
        fechaCreacion: new Date()
      })

      const savedCliente = await this.clienteRepository.save(nuevoCliente);

      return plainToInstance(ClienteResponseDto, savedCliente);
    } catch (error) {
      throw new BadRequestException('Error al crear el cliente');
    }

  }

  async findAll(
  pagination: PaginationParamsDto,
  filter?: FilteringParam<Cliente> | null,
  sorting?: SortingParam<Cliente> | null,
): Promise<ApiPaginatedResponseDto<ClienteResponseDto>> {
  try {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Construir condiciones de filtrado
    const whereConditions = getWhereConditions(filter ?? null);

    // Aplicar ordenamiento (default por nombre)
    const order = {
      nombre: 'ASC' as const,
      ...getSortingOrder(sorting ?? null),
    };

    // Total de registros
    const total = await this.clienteRepository.count({
      where: whereConditions,
    });

    // Registros paginados
    const clientes = await this.clienteRepository.find({
      where: whereConditions,
      order,
      skip,
      take: limit,
    });

    const data = plainToInstance(ClienteResponseDto, clientes);

    const meta: ApiPaginatedMetaDto = {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    };

    return ApiPaginatedResponseDto.Success(
      data,
      meta,
      'Clientes obtenidos exitosamente',
      'Lista de clientes',
    );
  } catch (error) {
    handleDBErrors(error, ERROR_MESSAGES.CLIENTES_NOT_FOUND);
    throw error;
  }
}

}

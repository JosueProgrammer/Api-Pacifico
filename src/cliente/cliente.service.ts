import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from '../common/entities/cliente.entity';
import { Venta } from '../common/entities/venta.entity';
import { Repository } from 'typeorm';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { plainToInstance } from 'class-transformer';
import { ApiPaginatedMetaDto, ApiPaginatedResponseDto, PaginationParamsDto } from '../common/dto';
import { FilteringParam, handleDBErrors, SortingParam } from '../common/helpers';
import { ERROR_MESSAGES, ERROR_TITLES } from '../common/constants/error-messages.constants';
import { getWhereConditions, getSortingOrder } from '../common/helpers';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {

  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
  ) { }

  async create(createClienteDto: CreateClienteDto): Promise<ClienteResponseDto> {
    try {
      // Verificar correo duplicado
      if (createClienteDto.correo) {
        const clienteExistente = await this.clienteRepository.findOne({
          where: { correo: createClienteDto.correo },
        });

        if (clienteExistente) {
          throw new BadRequestException(
            `Ya existe un cliente con el correo "${createClienteDto.correo}"`,
            ERROR_TITLES.CONFLICT_ERROR,
          );
        }
      }

      // Verificar teléfono duplicado
      if (createClienteDto.telefono) {
        const telefonoDuplicado = await this.clienteRepository.findOne({
          where: { telefono: createClienteDto.telefono },
        });

        if (telefonoDuplicado) {
          throw new BadRequestException(
            `Ya existe un cliente con el teléfono "${createClienteDto.telefono}"`,
            ERROR_TITLES.CONFLICT_ERROR,
          );
        }
      }

      const nuevoCliente = this.clienteRepository.create({
        ...createClienteDto,
        fechaCreacion: new Date(),
      });

      const savedCliente = await this.clienteRepository.save(nuevoCliente);
      return plainToInstance(ClienteResponseDto, savedCliente);
    } catch (error) {
      handleDBErrors(error, ERROR_MESSAGES.CLIENTE_NOT_CREATED ?? 'Error al crear el cliente');
      throw error;
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

      const whereConditions = getWhereConditions(filter ?? null);

      const order = {
        nombre: 'ASC' as const,
        ...getSortingOrder(sorting ?? null),
      };

      const total = await this.clienteRepository.count({
        where: whereConditions,
      });

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

  async findOne(id: string): Promise<ClienteResponseDto> {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { id },
      });

      if (!cliente) {
        throw new NotFoundException(
          `Cliente con ID "${id}" no encontrado`,
          ERROR_TITLES.NOT_FOUND_ERROR,
        );
      }

      return plainToInstance(ClienteResponseDto, cliente);
    } catch (error) {
      handleDBErrors(error, `Cliente con ID "${id}" no encontrado`);
      throw error;
    }
  }

  async update(
    id: string,
    updateClienteDto: UpdateClienteDto,
  ): Promise<ClienteResponseDto> {
    try {
      const cliente = await this.clienteRepository.findOne({ where: { id } });
      if (!cliente) {
        throw new NotFoundException(
          `Cliente con ID "${id}" no encontrado`,
          ERROR_TITLES.NOT_FOUND_ERROR,
        );
      }

      // Verificar correo duplicado si se está actualizando
      if (updateClienteDto.correo && updateClienteDto.correo !== cliente.correo) {
        const clienteExistente = await this.clienteRepository.findOne({
          where: { correo: updateClienteDto.correo },
        });

        if (clienteExistente) {
          throw new BadRequestException(
            `Ya existe un cliente con el correo "${updateClienteDto.correo}"`,
            ERROR_TITLES.CONFLICT_ERROR,
          );
        }
      }

      Object.assign(cliente, {
        ...updateClienteDto,
        fechaActualizacion: new Date(),
      });

      const clienteActualizado = await this.clienteRepository.save(cliente);
      return plainToInstance(ClienteResponseDto, clienteActualizado);
    } catch (error) {
      handleDBErrors(error, ERROR_MESSAGES.CLIENTE_NOT_UPDATED);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { id },
      });

      if (!cliente) {
        throw new NotFoundException(
          `Cliente con ID "${id}" no encontrado`,
          ERROR_TITLES.NOT_FOUND_ERROR,
        );
      }

      // Verificar si tiene ventas asociadas
      const ventasCount = await this.ventaRepository.count({
        where: { clienteId: id },
      });

      if (ventasCount > 0) {
        throw new BadRequestException(
          `No se puede eliminar el cliente porque tiene ${ventasCount} venta(s) asociada(s). Considere desactivarlo en su lugar.`,
          ERROR_TITLES.CONFLICT_ERROR,
        );
      }

      await this.clienteRepository.remove(cliente);
    } catch (error) {
      handleDBErrors(error, 'Error al eliminar el cliente');
      throw error;
    }
  }

  async activate(id: string): Promise<ClienteResponseDto> {
    try {
      const cliente = await this.clienteRepository.findOne({ where: { id } });
      if (!cliente) {
        throw new NotFoundException(
          `Cliente con ID "${id}" no encontrado`,
          ERROR_TITLES.NOT_FOUND_ERROR,
        );
      }
      cliente.activo = true;
      cliente.fechaActualizacion = new Date();
      const updated = await this.clienteRepository.save(cliente);
      return plainToInstance(ClienteResponseDto, updated);
    } catch (error) {
      handleDBErrors(error, 'Error al activar el cliente');
      throw error;
    }
  }

  async deactivate(id: string): Promise<ClienteResponseDto> {
    try {
      const cliente = await this.clienteRepository.findOne({ where: { id } });
      if (!cliente) {
        throw new NotFoundException(
          `Cliente con ID "${id}" no encontrado`,
          ERROR_TITLES.NOT_FOUND_ERROR,
        );
      }
      cliente.activo = false;
      cliente.fechaActualizacion = new Date();
      const updated = await this.clienteRepository.save(cliente);
      return plainToInstance(ClienteResponseDto, updated);
    } catch (error) {
      handleDBErrors(error, 'Error al desactivar el cliente');
      throw error;
    }
  }
}
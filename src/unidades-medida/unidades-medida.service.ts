import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadMedida, TipoUnidad } from '../common/entities/unidad-medida.entity';
import { CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from './dto';
import {
  getWhereConditions,
  getSortingOrder,
  handleDBErrors,
  FilteringParam,
  SortingParam,
} from '../common/helpers/typeorm-helpers';
import { ERROR_TITLES } from '../common/constants/error-messages.constants';
import { ApiPaginatedMetaDto } from '../common/dto/api-paginated-meta.dto';
import { ApiPaginatedResponseDto } from '../common/dto/api-paginated-response.dto';
import { PaginationParamsDto } from '../common/dto/pagination-param.dto';

@Injectable()
export class UnidadesMedidaService {
  constructor(
    @InjectRepository(UnidadMedida)
    private readonly unidadMedidaRepository: Repository<UnidadMedida>,
  ) {}

  async create(createUnidadMedidaDto: CreateUnidadMedidaDto): Promise<UnidadMedida> {
    try {
      // Verificar si ya existe una unidad con la misma abreviatura
      const existente = await this.unidadMedidaRepository.findOne({
        where: { abreviatura: createUnidadMedidaDto.abreviatura.toLowerCase() },
      });

      if (existente) {
        throw new BadRequestException(
          `Ya existe una unidad de medida con la abreviatura "${createUnidadMedidaDto.abreviatura}"`,
          ERROR_TITLES.CONFLICT_ERROR,
        );
      }

      const unidadMedida = this.unidadMedidaRepository.create({
        ...createUnidadMedidaDto,
        abreviatura: createUnidadMedidaDto.abreviatura.toLowerCase(),
        activo: createUnidadMedidaDto.activo ?? true,
      });

      return await this.unidadMedidaRepository.save(unidadMedida);
    } catch (error) {
      handleDBErrors(error, 'Error al crear la unidad de medida');
      throw error;
    }
  }

  async findAll(
    pagination: PaginationParamsDto,
    filter?: FilteringParam<UnidadMedida> | null,
    sorting?: SortingParam<UnidadMedida> | null,
  ): Promise<ApiPaginatedResponseDto<UnidadMedida>> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const whereConditions = getWhereConditions(filter ?? null);

      const order = {
        nombre: 'ASC' as const,
        ...getSortingOrder(sorting ?? null),
      };

      const total = await this.unidadMedidaRepository.count({
        where: whereConditions,
      });

      const unidades = await this.unidadMedidaRepository.find({
        where: whereConditions,
        order,
        skip,
        take: limit,
      });

      const meta: ApiPaginatedMetaDto = {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      };

      return ApiPaginatedResponseDto.Success(
        unidades,
        meta,
        'Unidades de medida obtenidas exitosamente',
        'Lista de unidades de medida',
      );
    } catch (error) {
      handleDBErrors(error, 'Error al obtener las unidades de medida');
      throw error;
    }
  }

  async findOne(id: string): Promise<UnidadMedida> {
    try {
      const unidadMedida = await this.unidadMedidaRepository.findOne({
        where: { id },
      });

      if (!unidadMedida) {
        throw new NotFoundException(
          `Unidad de medida con ID "${id}" no encontrada`,
          ERROR_TITLES.NOT_FOUND_ERROR,
        );
      }

      return unidadMedida;
    } catch (error) {
      handleDBErrors(error, `Unidad de medida con ID "${id}" no encontrada`);
      throw error;
    }
  }

  async findByAbreviatura(abreviatura: string): Promise<UnidadMedida | null> {
    return await this.unidadMedidaRepository.findOne({
      where: { abreviatura: abreviatura.toLowerCase(), activo: true },
    });
  }

  async update(id: string, updateUnidadMedidaDto: UpdateUnidadMedidaDto): Promise<UnidadMedida> {
    try {
      const unidadMedida = await this.findOne(id);

      // Verificar abreviatura duplicada si se está actualizando
      if (
        updateUnidadMedidaDto.abreviatura &&
        updateUnidadMedidaDto.abreviatura.toLowerCase() !== unidadMedida.abreviatura
      ) {
        const existente = await this.unidadMedidaRepository.findOne({
          where: { abreviatura: updateUnidadMedidaDto.abreviatura.toLowerCase() },
        });

        if (existente) {
          throw new BadRequestException(
            `Ya existe una unidad de medida con la abreviatura "${updateUnidadMedidaDto.abreviatura}"`,
            ERROR_TITLES.CONFLICT_ERROR,
          );
        }
      }

      Object.assign(unidadMedida, {
        ...updateUnidadMedidaDto,
        abreviatura: updateUnidadMedidaDto.abreviatura?.toLowerCase() || unidadMedida.abreviatura,
      });

      return await this.unidadMedidaRepository.save(unidadMedida);
    } catch (error) {
      handleDBErrors(error, 'Error al actualizar la unidad de medida');
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const unidadMedida = await this.findOne(id);

      // Verificar si hay productos usando esta unidad
      const productosCount = await this.unidadMedidaRepository
        .createQueryBuilder('unidad')
        .leftJoin('unidad.productos', 'producto')
        .where('unidad.id = :id', { id })
        .andWhere('producto.id IS NOT NULL')
        .getCount();

      if (productosCount > 0) {
        throw new BadRequestException(
          `No se puede eliminar la unidad de medida porque tiene ${productosCount} producto(s) asociado(s). Considere desactivarla en su lugar.`,
          ERROR_TITLES.CONFLICT_ERROR,
        );
      }

      await this.unidadMedidaRepository.remove(unidadMedida);
    } catch (error) {
      handleDBErrors(error, 'Error al eliminar la unidad de medida');
      throw error;
    }
  }

  async activate(id: string): Promise<UnidadMedida> {
    try {
      const unidadMedida = await this.findOne(id);
      unidadMedida.activo = true;
      return await this.unidadMedidaRepository.save(unidadMedida);
    } catch (error) {
      handleDBErrors(error, 'Error al activar la unidad de medida');
      throw error;
    }
  }

  async deactivate(id: string): Promise<UnidadMedida> {
    try {
      const unidadMedida = await this.findOne(id);
      unidadMedida.activo = false;
      return await this.unidadMedidaRepository.save(unidadMedida);
    } catch (error) {
      handleDBErrors(error, 'Error al desactivar la unidad de medida');
      throw error;
    }
  }

  async getUnidadesActivas(): Promise<UnidadMedida[]> {
    return await this.unidadMedidaRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  /**
   * Crea las unidades de medida por defecto si no existen
   */
  async seedUnidadesBasicas(): Promise<void> {
    const unidadesBasicas: Array<{ nombre: string; abreviatura: string; tipo: TipoUnidad }> = [
      { nombre: 'Unidad', abreviatura: 'und', tipo: TipoUnidad.UNIDAD },
      { nombre: 'Kilogramo', abreviatura: 'kg', tipo: TipoUnidad.PESO },
      { nombre: 'Gramo', abreviatura: 'g', tipo: TipoUnidad.PESO },
      { nombre: 'Libra', abreviatura: 'lb', tipo: TipoUnidad.PESO },
      { nombre: 'Litro', abreviatura: 'l', tipo: TipoUnidad.VOLUMEN },
      { nombre: 'Mililitro', abreviatura: 'ml', tipo: TipoUnidad.VOLUMEN },
      { nombre: 'Metro', abreviatura: 'm', tipo: TipoUnidad.LONGITUD },
      { nombre: 'Centímetro', abreviatura: 'cm', tipo: TipoUnidad.LONGITUD },
    ];

    for (const unidad of unidadesBasicas) {
      const existe = await this.unidadMedidaRepository.findOne({
        where: { abreviatura: unidad.abreviatura },
      });

      if (!existe) {
        await this.unidadMedidaRepository.save(
          this.unidadMedidaRepository.create(unidad),
        );
      }
    }
  }
}

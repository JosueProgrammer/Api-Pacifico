import { Injectable } from '@nestjs/common';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { UpdateProveedoreDto } from './dto/update-proveedore.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proveedor } from 'src/common/entities';
import { Repository } from 'typeorm';
import { ERROR_MESSAGES } from 'src/common/constants/error-messages.constants';
import { ProveedoresResponseDto } from './dto/proovedores-response.dto';
import { ApiPaginatedMetaDto, ApiPaginatedResponseDto, PaginationParamsDto } from 'src/common/dto';
import { FilteringParam, getSortingOrder, getWhereConditions, SortingParam } from 'src/common/helpers';
import { get } from 'http';
import { plainToInstance } from 'class-transformer';
import { object } from 'zod';


@Injectable()
export class ProveedoresService {

  constructor(
    @InjectRepository(Proveedor)
    private readonly ProveedorRepository: Repository<Proveedor>,
  ) { }

  async create(createProveedoreDto: CreateProveedoreDto) {
    try {
      const nuevoproveedor = this.ProveedorRepository.create({
        ...createProveedoreDto,
        fechaCreacion: new Date(),
        activo: true,
      });

      return await this.ProveedorRepository.save(nuevoproveedor);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(
    pagination: PaginationParamsDto,
    filter?: FilteringParam<Proveedor> | null,
    sorting?: SortingParam<Proveedor> | null,
  ): Promise<ApiPaginatedResponseDto<Proveedor>> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const whereConditions = getWhereConditions(filter ?? null);

      const order = {
        nombre: 'ASC' as const,
        ...getSortingOrder(sorting ?? null),
      };

      const [items, totalItems] =
        await this.ProveedorRepository.findAndCount({
          where: whereConditions,
          order,
          skip,
          take: limit,
        });

      const totalPages = Math.ceil(totalItems / limit);

      const meta: ApiPaginatedMetaDto = {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };

      return ApiPaginatedResponseDto.Success(
        items,
        meta,
        'Lista de proveedores obtenida exitosamente',
      );
    } catch (error) {
      throw new Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);


    }
  }

  async findOne(id: string): Promise<ProveedoresResponseDto> {
    try {
      const proveedor = await this.ProveedorRepository.findOne({ where: { id } });
      if (!proveedor) {
        throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
      }
      return plainToInstance(ProveedoresResponseDto, proveedor, {
        excludeExtraneousValues: true,
      });

    } catch (error) {
      throw new Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }

  }


  async update(id: string, updateProveedoreDto: UpdateProveedoreDto) {
    try{
      const proveedor = await this.findOne(id);
      if (!proveedor) {
        throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
      }

      const updateProveedor = this.ProveedorRepository.update(id,{
        ...updateProveedoreDto,
        fechaActualizacion: new Date(),
      });

      if (!updateProveedor) {
        throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
      }

      Object.assign(proveedor, updateProveedoreDto);
      return await this.ProveedorRepository.save(proveedor);

    }catch(error){
      throw new Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.ProveedorRepository.delete(id);

      if (result.affected === 0) {
        throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
      }
    } catch (error) {
      throw new Error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

}

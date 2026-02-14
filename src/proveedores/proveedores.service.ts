import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from '../common/entities/proveedor.entity';
import { Compra } from '../common/entities/compra.entity';
import { CreateProveedoreDto } from './dto/create-proveedore.dto';
import { UpdateProveedoreDto } from './dto/update-proveedore.dto';
import { ProveedoresResponseDto } from './dto/proovedores-response.dto';
import { ApiPaginatedMetaDto, ApiPaginatedResponseDto, PaginationParamsDto } from '../common/dto';
import {
    FilteringParam,
    getSortingOrder,
    getWhereConditions,
    SortingParam,
    handleDBErrors,
} from '../common/helpers';
import { plainToInstance } from 'class-transformer';
import { ERROR_MESSAGES, ERROR_TITLES } from '../common/constants/error-messages.constants';

@Injectable()
export class ProveedoresService {

    constructor(
        @InjectRepository(Proveedor)
        private readonly proveedorRepository: Repository<Proveedor>,
        @InjectRepository(Compra)
        private readonly compraRepository: Repository<Compra>,
    ) { }

    async create(createProveedoreDto: CreateProveedoreDto): Promise<ProveedoresResponseDto> {
        try {
            // Verificar si ya existe un proveedor con el mismo nombre
            if (createProveedoreDto.nombre) {
                const existente = await this.proveedorRepository.findOne({
                    where: { nombre: createProveedoreDto.nombre },
                });
                if (existente) {
                    throw new BadRequestException(
                        `Ya existe un proveedor con el nombre "${createProveedoreDto.nombre}"`,
                        ERROR_TITLES.CONFLICT_ERROR,
                    );
                }
            }

            // Verificar correo duplicado si se proporciona
            if (createProveedoreDto.correo) {
                const existenteCorreo = await this.proveedorRepository.findOne({
                    where: { correo: createProveedoreDto.correo },
                });
                if (existenteCorreo) {
                    throw new BadRequestException(
                        `Ya existe un proveedor con el correo "${createProveedoreDto.correo}"`,
                        ERROR_TITLES.CONFLICT_ERROR,
                    );
                }
            }

            const nuevoProveedor = this.proveedorRepository.create({
                ...createProveedoreDto,
                fechaCreacion: new Date(),
                activo: true,
            });

            const saved = await this.proveedorRepository.save(nuevoProveedor);
            return plainToInstance(ProveedoresResponseDto, saved, {
                excludeExtraneousValues: true,
            });
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
            throw error;
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
                await this.proveedorRepository.findAndCount({
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
            handleDBErrors(error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
            throw error;
        }
    }

    async findOne(id: string): Promise<ProveedoresResponseDto> {
        try {
            const proveedor = await this.proveedorRepository.findOne({ where: { id } });
            if (!proveedor) {
                throw new NotFoundException(
                    `Proveedor con ID "${id}" no encontrado`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }
            return plainToInstance(ProveedoresResponseDto, proveedor, {
                excludeExtraneousValues: true,
            });
        } catch (error) {
            handleDBErrors(error, `Proveedor con ID "${id}" no encontrado`);
            throw error;
        }
    }

    async update(id: string, updateProveedoreDto: UpdateProveedoreDto): Promise<ProveedoresResponseDto> {
        try {
            const proveedor = await this.proveedorRepository.findOne({ where: { id } });
            if (!proveedor) {
                throw new NotFoundException(
                    `Proveedor con ID "${id}" no encontrado`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            // Verificar nombre duplicado si se está actualizando
            if (updateProveedoreDto.nombre && updateProveedoreDto.nombre !== proveedor.nombre) {
                const existente = await this.proveedorRepository.findOne({
                    where: { nombre: updateProveedoreDto.nombre },
                });
                if (existente) {
                    throw new BadRequestException(
                        `Ya existe un proveedor con el nombre "${updateProveedoreDto.nombre}"`,
                        ERROR_TITLES.CONFLICT_ERROR,
                    );
                }
            }

            Object.assign(proveedor, {
                ...updateProveedoreDto,
                fechaActualizacion: new Date(),
            });

            const updated = await this.proveedorRepository.save(proveedor);
            return plainToInstance(ProveedoresResponseDto, updated, {
                excludeExtraneousValues: true,
            });
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const proveedor = await this.proveedorRepository.findOne({ where: { id } });
            if (!proveedor) {
                throw new NotFoundException(
                    `Proveedor con ID "${id}" no encontrado`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            // Verificar si tiene compras asociadas
            const comprasCount = await this.compraRepository.count({
                where: { proveedorId: id },
            });

            if (comprasCount > 0) {
                throw new BadRequestException(
                    `No se puede eliminar el proveedor porque tiene ${comprasCount} compra(s) asociada(s)`,
                    ERROR_TITLES.CONFLICT_ERROR,
                );
            }

            await this.proveedorRepository.remove(proveedor);
        } catch (error) {
            handleDBErrors(error, 'Error al eliminar el proveedor');
            throw error;
        }
    }

    async activate(id: string): Promise<ProveedoresResponseDto> {
        try {
            const proveedor = await this.proveedorRepository.findOne({ where: { id } });
            if (!proveedor) {
                throw new NotFoundException(
                    `Proveedor con ID "${id}" no encontrado`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }
            proveedor.activo = true;
            proveedor.fechaActualizacion = new Date();
            const updated = await this.proveedorRepository.save(proveedor);
            return plainToInstance(ProveedoresResponseDto, updated, {
                excludeExtraneousValues: true,
            });
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
            throw error;
        }
    }

    async deactivate(id: string): Promise<ProveedoresResponseDto> {
        try {
            const proveedor = await this.proveedorRepository.findOne({ where: { id } });
            if (!proveedor) {
                throw new NotFoundException(
                    `Proveedor con ID "${id}" no encontrado`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }
            proveedor.activo = false;
            proveedor.fechaActualizacion = new Date();
            const updated = await this.proveedorRepository.save(proveedor);
            return plainToInstance(ProveedoresResponseDto, updated, {
                excludeExtraneousValues: true,
            });
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
            throw error;
        }
    }
}

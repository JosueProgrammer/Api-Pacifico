import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoPago } from '../common/entities/metodo-pago.entity';
import { CreateMetodoPagoDto, UpdateMetodoPagoDto } from './dtos';
import {
    getWhereConditions,
    getSortingOrder,
    handleDBErrors,
    FilteringParam,
    SortingParam,
} from '../common/helpers/typeorm-helpers';
import { ERROR_MESSAGES, ERROR_TITLES } from '../common/constants/error-messages.constants';
import { ApiPaginatedMetaDto } from '../common/dto/api-paginated-meta.dto';
import { ApiPaginatedResponseDto } from '../common/dto/api-paginated-response.dto';
import { PaginationParamsDto } from '../common/dto/pagination-param.dto';

@Injectable()
export class MetodosPagoService {
    constructor(
        @InjectRepository(MetodoPago)
        private readonly metodoPagoRepository: Repository<MetodoPago>,
    ) { }

    async create(createMetodoPagoDto: CreateMetodoPagoDto): Promise<MetodoPago> {
        try {
            // Verificar si ya existe un método de pago con el mismo nombre
            const existente = await this.metodoPagoRepository.findOne({
                where: { nombre: createMetodoPagoDto.nombre },
            });

            if (existente) {
                throw new BadRequestException(
                    `Ya existe un método de pago con el nombre "${createMetodoPagoDto.nombre}"`,
                    ERROR_TITLES.CONFLICT_ERROR,
                );
            }

            const metodoPago = this.metodoPagoRepository.create({
                ...createMetodoPagoDto,
                activo: createMetodoPagoDto.activo ?? true,
            });

            return await this.metodoPagoRepository.save(metodoPago);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.METODO_PAGO_NOT_CREATED);
            throw error;
        }
    }

    async findAll(
        pagination: PaginationParamsDto,
        filter?: FilteringParam<MetodoPago> | null,
        sorting?: SortingParam<MetodoPago> | null,
    ): Promise<ApiPaginatedResponseDto<MetodoPago>> {
        try {
            const { page, limit } = pagination;
            const skip = (page - 1) * limit;

            const whereConditions = getWhereConditions(filter ?? null);

            const order = {
                nombre: 'ASC' as const,
                ...getSortingOrder(sorting ?? null),
            };

            const total = await this.metodoPagoRepository.count({
                where: whereConditions,
            });

            const metodosPago = await this.metodoPagoRepository.find({
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
                metodosPago,
                meta,
                'Métodos de pago obtenidos exitosamente',
                'Lista de métodos de pago',
            );
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.METODOS_PAGO_NOT_FOUND);
            throw error;
        }
    }

    async findAllActive(): Promise<MetodoPago[]> {
        try {
            return await this.metodoPagoRepository.find({
                where: { activo: true },
                order: { nombre: 'ASC' },
            });
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.METODOS_PAGO_NOT_FOUND);
            throw error;
        }
    }

    async findOne(id: string): Promise<MetodoPago> {
        try {
            const metodoPago = await this.metodoPagoRepository.findOne({
                where: { id },
            });

            if (!metodoPago) {
                throw new NotFoundException(
                    `Método de pago con ID "${id}" no encontrado`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            return metodoPago;
        } catch (error) {
            handleDBErrors(error, `Método de pago con ID "${id}" no encontrado`);
            throw error;
        }
    }

    async update(id: string, updateMetodoPagoDto: UpdateMetodoPagoDto): Promise<MetodoPago> {
        try {
            const metodoPago = await this.findOne(id);

            // Verificar nombre duplicado si se está actualizando
            if (updateMetodoPagoDto.nombre && updateMetodoPagoDto.nombre !== metodoPago.nombre) {
                const existente = await this.metodoPagoRepository.findOne({
                    where: { nombre: updateMetodoPagoDto.nombre },
                });

                if (existente) {
                    throw new BadRequestException(
                        `Ya existe un método de pago con el nombre "${updateMetodoPagoDto.nombre}"`,
                        ERROR_TITLES.CONFLICT_ERROR,
                    );
                }
            }

            Object.assign(metodoPago, updateMetodoPagoDto);
            return await this.metodoPagoRepository.save(metodoPago);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.METODO_PAGO_NOT_UPDATED);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const metodoPago = await this.findOne(id);

            // Verificar si tiene ventas asociadas
            const metodoPagoConVentas = await this.metodoPagoRepository.findOne({
                where: { id },
                relations: ['ventas'],
            });

            if (metodoPagoConVentas?.ventas && metodoPagoConVentas.ventas.length > 0) {
                throw new BadRequestException(
                    `No se puede eliminar el método de pago porque tiene ${metodoPagoConVentas.ventas.length} venta(s) asociada(s)`,
                    ERROR_TITLES.CONFLICT_ERROR,
                );
            }

            await this.metodoPagoRepository.remove(metodoPago);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.METODO_PAGO_NOT_DELETED);
            throw error;
        }
    }

    async activate(id: string): Promise<MetodoPago> {
        try {
            const metodoPago = await this.findOne(id);
            metodoPago.activo = true;
            return await this.metodoPagoRepository.save(metodoPago);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.METODO_PAGO_NOT_UPDATED);
            throw error;
        }
    }

    async deactivate(id: string): Promise<MetodoPago> {
        try {
            const metodoPago = await this.findOne(id);
            metodoPago.activo = false;
            return await this.metodoPagoRepository.save(metodoPago);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.METODO_PAGO_NOT_UPDATED);
            throw error;
        }
    }
}

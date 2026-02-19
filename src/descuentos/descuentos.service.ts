import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Descuento } from '../common/entities/descuento.entity';
import { CreateDescuentoDto, UpdateDescuentoDto, TipoDescuento } from './dtos';
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
export class DescuentosService {
    constructor(
        @InjectRepository(Descuento)
        private readonly descuentoRepository: Repository<Descuento>,
    ) { }

    async create(createDescuentoDto: CreateDescuentoDto): Promise<Descuento> {
        try {
            // Verificar si ya existe un descuento con el mismo código
            const existente = await this.descuentoRepository.findOne({
                where: { codigo: createDescuentoDto.codigo.toUpperCase() },
            });

            if (existente) {
                throw new BadRequestException(
                    `Ya existe un descuento con el código "${createDescuentoDto.codigo}"`,
                    ERROR_TITLES.CONFLICT_ERROR,
                );
            }

            // Validar fechas
            const fechaInicio = new Date(createDescuentoDto.fechaInicio);
            const fechaFin = new Date(createDescuentoDto.fechaFin);

            if (fechaFin <= fechaInicio) {
                throw new BadRequestException(
                    'La fecha de fin debe ser posterior a la fecha de inicio',
                    ERROR_TITLES.VALIDATION_ERROR,
                );
            }

            // Validar porcentaje si es tipo porcentaje
            if (createDescuentoDto.tipo === TipoDescuento.PORCENTAJE && createDescuentoDto.valor > 100) {
                throw new BadRequestException(
                    'El porcentaje de descuento no puede ser mayor a 100',
                    ERROR_TITLES.VALIDATION_ERROR,
                );
            }

            const descuento = this.descuentoRepository.create({
                ...createDescuentoDto,
                codigo: createDescuentoDto.codigo.toUpperCase(),
                fechaInicio,
                fechaFin,
                activo: createDescuentoDto.activo ?? true,
            });

            return await this.descuentoRepository.save(descuento);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.DESCUENTO_NOT_CREATED);
            throw error;
        }
    }

    async findAll(
        pagination: PaginationParamsDto,
        filter?: FilteringParam<Descuento> | null,
        sorting?: SortingParam<Descuento> | null,
    ): Promise<ApiPaginatedResponseDto<Descuento>> {
        try {
            const { page, limit } = pagination;
            const skip = (page - 1) * limit;

            const whereConditions = getWhereConditions(filter ?? null);

            const order = {
                fechaCreacion: 'DESC' as const,
                ...getSortingOrder(sorting ?? null),
            };

            const total = await this.descuentoRepository.count({
                where: whereConditions,
            });

            const descuentos = await this.descuentoRepository.find({
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
                descuentos,
                meta,
                'Descuentos obtenidos exitosamente',
                'Lista de descuentos',
            );
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.DESCUENTOS_NOT_FOUND);
            throw error;
        }
    }

    async findOne(id: string): Promise<Descuento> {
        try {
            const descuento = await this.descuentoRepository.findOne({
                where: { id },
            });

            if (!descuento) {
                throw new NotFoundException(
                    `Descuento con ID "${id}" no encontrado`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            return descuento;
        } catch (error) {
            handleDBErrors(error, `Descuento con ID "${id}" no encontrado`);
            throw error;
        }
    }

    /**
     * Valida un código de descuento y retorna el descuento si es válido
     */
    async validarCodigo(codigo: string): Promise<{
        valido: boolean;
        descuento?: Descuento;
        mensaje: string;
    }> {
        try {
            const descuento = await this.descuentoRepository.findOne({
                where: { codigo: codigo.toUpperCase() },
            });

            if (!descuento) {
                return {
                    valido: false,
                    mensaje: 'Código de descuento no encontrado',
                };
            }

            if (!descuento.activo) {
                return {
                    valido: false,
                    mensaje: 'El código de descuento está inactivo',
                };
            }

            const ahora = new Date();
            if (ahora < descuento.fechaInicio) {
                return {
                    valido: false,
                    mensaje: `El código será válido a partir del ${descuento.fechaInicio.toLocaleDateString()}`,
                };
            }

            if (ahora > descuento.fechaFin) {
                return {
                    valido: false,
                    mensaje: 'El código de descuento ha expirado',
                };
            }

            // Validar límite de usos
            if (descuento.limiteUso && descuento.vecesUsado >= descuento.limiteUso) {
                return {
                    valido: false,
                    mensaje: 'El código de descuento ha excedido su límite de usos',
                };
            }

            return {
                valido: true,
                descuento,
                mensaje: 'Código de descuento válido',
            };
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.DESCUENTOS_NOT_FOUND);
            throw error;
        }
    }

    /**
     * Calcula el monto de descuento a aplicar
     */
    calcularDescuento(descuento: Descuento, subtotal: number): number {
        if (descuento.tipo === TipoDescuento.PORCENTAJE) {
            return subtotal * (Number(descuento.valor) / 100);
        } else {
            // Monto fijo - no puede ser mayor al subtotal
            return Math.min(Number(descuento.valor), subtotal);
        }
    }

    async update(id: string, updateDescuentoDto: UpdateDescuentoDto): Promise<Descuento> {
        try {
            const descuento = await this.findOne(id);

            // Verificar código duplicado si se está actualizando
            if (updateDescuentoDto.codigo && updateDescuentoDto.codigo.toUpperCase() !== descuento.codigo) {
                const existente = await this.descuentoRepository.findOne({
                    where: { codigo: updateDescuentoDto.codigo.toUpperCase() },
                });

                if (existente) {
                    throw new BadRequestException(
                        `Ya existe un descuento con el código "${updateDescuentoDto.codigo}"`,
                        ERROR_TITLES.CONFLICT_ERROR,
                    );
                }
            }

            // Validar fechas si se están actualizando
            const fechaInicio = updateDescuentoDto.fechaInicio
                ? new Date(updateDescuentoDto.fechaInicio)
                : descuento.fechaInicio;
            const fechaFin = updateDescuentoDto.fechaFin
                ? new Date(updateDescuentoDto.fechaFin)
                : descuento.fechaFin;

            if (fechaFin <= fechaInicio) {
                throw new BadRequestException(
                    'La fecha de fin debe ser posterior a la fecha de inicio',
                    ERROR_TITLES.VALIDATION_ERROR,
                );
            }

            // Validar porcentaje
            const tipo = updateDescuentoDto.tipo || descuento.tipo;
            const valor = updateDescuentoDto.valor ?? descuento.valor;
            if (tipo === TipoDescuento.PORCENTAJE && valor > 100) {
                throw new BadRequestException(
                    'El porcentaje de descuento no puede ser mayor a 100',
                    ERROR_TITLES.VALIDATION_ERROR,
                );
            }

            Object.assign(descuento, {
                ...updateDescuentoDto,
                codigo: updateDescuentoDto.codigo?.toUpperCase() || descuento.codigo,
                fechaInicio,
                fechaFin,
            });

            return await this.descuentoRepository.save(descuento);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.DESCUENTO_NOT_UPDATED);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const descuento = await this.findOne(id);
            await this.descuentoRepository.remove(descuento);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.DESCUENTO_NOT_DELETED);
            throw error;
        }
    }

    async activate(id: string): Promise<Descuento> {
        try {
            const descuento = await this.findOne(id);
            descuento.activo = true;
            return await this.descuentoRepository.save(descuento);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.DESCUENTO_NOT_UPDATED);
            throw error;
        }
    }

    async deactivate(id: string): Promise<Descuento> {
        try {
            const descuento = await this.findOne(id);
            descuento.activo = false;
            return await this.descuentoRepository.save(descuento);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.DESCUENTO_NOT_UPDATED);
            throw error;
        }
    }

    /**
     * Obtiene descuentos activos y vigentes
     */
    async getDescuentosVigentes(): Promise<Descuento[]> {
        try {
            const ahora = new Date();
            return await this.descuentoRepository.find({
                where: {
                    activo: true,
                    fechaInicio: LessThanOrEqual(ahora),
                    fechaFin: MoreThanOrEqual(ahora),
                },
                order: { fechaFin: 'ASC' },
            });
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.DESCUENTOS_NOT_FOUND);
            throw error;
        }
    }

    async incrementarUso(id: string, queryRunner?: any): Promise<void> {
        try {
            if (queryRunner) {
                await queryRunner.manager.increment(Descuento, { id }, 'vecesUsado', 1);
            } else {
                await this.descuentoRepository.increment({ id }, 'vecesUsado', 1);
            }
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.DESCUENTO_NOT_UPDATED);
            throw error;
        }
    }

    async decrementarUso(id: string, queryRunner?: any): Promise<void> {
        try {
            const criteria = { id };
            if (queryRunner) {
                // Verificar si es mayor a 0 antes de decrementar
                const descuento = await queryRunner.manager.findOne(Descuento, { where: criteria });
                if (descuento && descuento.vecesUsado > 0) {
                    await queryRunner.manager.decrement(Descuento, criteria, 'vecesUsado', 1);
                }
            } else {
                const descuento = await this.findOne(id);
                if (descuento.vecesUsado > 0) {
                    await this.descuentoRepository.decrement(criteria, 'vecesUsado', 1);
                }
            }
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.DESCUENTO_NOT_UPDATED);
            throw error;
        }
    }
}

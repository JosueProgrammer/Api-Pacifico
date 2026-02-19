import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Compra } from '../common/entities/compra.entity';
import { DetalleCompra } from '../common/entities/detalle-compra.entity';
import { Producto } from '../common/entities/producto.entity';
import { Proveedor } from '../common/entities/proveedor.entity';
import { CreateCompraDto, UpdateCompraDto, EstadoCompra } from './dtos';
import { InventarioService } from '../inventario/inventario.service';
import { TipoMovimiento } from '../inventario/dtos';
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
export class ComprasService {
    constructor(
        @InjectRepository(Compra)
        private readonly compraRepository: Repository<Compra>,
        @InjectRepository(DetalleCompra)
        private readonly detalleCompraRepository: Repository<DetalleCompra>,
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
        @InjectRepository(Proveedor)
        private readonly proveedorRepository: Repository<Proveedor>,
        private readonly dataSource: DataSource,
        private readonly inventarioService: InventarioService,
    ) { }

    async create(createCompraDto: CreateCompraDto, usuarioId: string): Promise<Compra> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Verificar si el proveedor existe
            const proveedor = await this.proveedorRepository.findOne({
                where: { id: createCompraDto.proveedorId, activo: true },
            });

            if (!proveedor) {
                throw new NotFoundException(
                    `Proveedor con ID "${createCompraDto.proveedorId}" no encontrado o inactivo`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            // Validar productos y calcular totales
            let subtotal = 0;
            const detallesValidados: { producto: Producto; cantidad: number; precioUnitario: number; subtotalDetalle: number }[] = [];

            for (const detalle of createCompraDto.detalles) {
                const producto = await this.productoRepository.findOne({
                    where: { id: detalle.productoId },
                });

                if (!producto) {
                    throw new NotFoundException(
                        `Producto con ID "${detalle.productoId}" no encontrado`,
                        ERROR_TITLES.NOT_FOUND_ERROR,
                    );
                }

                const subtotalDetalle = detalle.precioUnitario * detalle.cantidad;

                detallesValidados.push({
                    producto,
                    cantidad: detalle.cantidad,
                    precioUnitario: detalle.precioUnitario,
                    subtotalDetalle,
                });

                subtotal += subtotalDetalle;
            }

            // Calcular totales
            const impuestoPorcentaje = createCompraDto.impuesto || 0;
            const montoImpuesto = subtotal * (impuestoPorcentaje / 100);
            const total = subtotal + montoImpuesto;

            // Crear la compra
            const compra = queryRunner.manager.create(Compra, {
                numeroFactura: createCompraDto.numeroFactura,
                proveedorId: createCompraDto.proveedorId,
                usuarioId,
                subtotal,
                impuesto: montoImpuesto,
                total,
                estado: 'pendiente',
                fechaCompra: new Date(),
            });

            const compraGuardada = await queryRunner.manager.save(Compra, compra);

            // Crear detalles de compra
            for (const detalle of detallesValidados) {
                const detalleCompra = queryRunner.manager.create(DetalleCompra, {
                    compraId: compraGuardada.id,
                    productoId: detalle.producto.id,
                    cantidad: detalle.cantidad,
                    precioUnitario: detalle.precioUnitario,
                    subtotal: detalle.subtotalDetalle,
                });

                await queryRunner.manager.save(DetalleCompra, detalleCompra);
            }

            await queryRunner.commitTransaction();

            return this.findOne(compraGuardada.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            handleDBErrors(error, ERROR_MESSAGES.COMPRA_NOT_CREATED);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(
        pagination: PaginationParamsDto,
        filter?: FilteringParam<Compra> | null,
        sorting?: SortingParam<Compra> | null,
    ): Promise<ApiPaginatedResponseDto<Compra>> {
        try {
            const { page, limit } = pagination;
            const skip = (page - 1) * limit;

            const whereConditions = getWhereConditions(filter ?? null);

            const order = {
                fechaCompra: 'DESC' as const,
                ...getSortingOrder(sorting ?? null),
            };

            const total = await this.compraRepository.count({
                where: whereConditions,
            });

            const compras = await this.compraRepository.find({
                where: whereConditions,
                order,
                skip,
                take: limit,
                relations: ['proveedor', 'usuario', 'detalleCompras', 'detalleCompras.producto'],
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
                compras,
                meta,
                'Compras obtenidas exitosamente',
                'Lista de compras',
            );
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.COMPRAS_NOT_FOUND);
            throw error;
        }
    }

    async findOne(id: string): Promise<Compra> {
        try {
            const compra = await this.compraRepository.findOne({
                where: { id },
                relations: ['proveedor', 'usuario', 'detalleCompras', 'detalleCompras.producto'],
            });

            if (!compra) {
                throw new NotFoundException(
                    `Compra con ID "${id}" no encontrada`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            return compra;
        } catch (error) {
            handleDBErrors(error, `Compra con ID "${id}" no encontrada`);
            throw error;
        }
    }

    async update(id: string, updateCompraDto: UpdateCompraDto): Promise<Compra> {
        try {
            const compra = await this.findOne(id);

            if (updateCompraDto.estado) {
                // Si se completa la compra, aumentar el stock
                if (updateCompraDto.estado === EstadoCompra.COMPLETADA && compra.estado !== 'completada') {
                    await this.actualizarStock(compra, 'incrementar');
                }

                // Si se cancela una compra completada, revertir el stock
                if (updateCompraDto.estado === EstadoCompra.CANCELADA && compra.estado === 'completada') {
                    await this.actualizarStock(compra, 'decrementar');
                }

                compra.estado = updateCompraDto.estado;
            }

            return await this.compraRepository.save(compra);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.COMPRA_NOT_UPDATED);
            throw error;
        }
    }

    async recibir(id: string): Promise<Compra> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const compra = await this.findOne(id);

            if (compra.estado === 'completada') {
                throw new BadRequestException(
                    'La compra ya fue recibida',
                    ERROR_TITLES.VALIDATION_ERROR,
                );
            }

            if (compra.estado === 'cancelada') {
                throw new BadRequestException(
                    'No se puede recibir una compra cancelada',
                    ERROR_TITLES.VALIDATION_ERROR,
                );
            }

            // Aumentar stock de productos
            for (const detalle of compra.detalleCompras) {
                const producto = await this.productoRepository.findOne({
                    where: { id: detalle.productoId },
                });

                if (producto) {
                    producto.stock += detalle.cantidad;
                    // Actualizar precio de compra si es diferente
                    if (Number(detalle.precioUnitario) !== Number(producto.precioCompra)) {
                        producto.precioCompra = detalle.precioUnitario;
                    }
                    producto.fechaActualizacion = new Date();
                    await queryRunner.manager.save(Producto, producto);

                    // Registrar movimiento de inventario (ENTRADA por recepción de compra)
                    await this.inventarioService.registrarMovimientoInterno(queryRunner, {
                        productoId: producto.id,
                        tipoMovimiento: TipoMovimiento.ENTRADA,
                        cantidad: detalle.cantidad,
                        motivo: `Recepción de compra ${compra.numeroFactura || compra.id}`,
                        referenciaId: compra.id,
                        usuarioId: compra.usuarioId,
                    });
                }
            }

            compra.estado = 'completada';
            const compraActualizada = await queryRunner.manager.save(Compra, compra);

            await queryRunner.commitTransaction();

            return this.findOne(compraActualizada.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            handleDBErrors(error, ERROR_MESSAGES.COMPRA_NOT_UPDATED);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async cancelar(id: string): Promise<Compra> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const compra = await this.findOne(id);

            if (compra.estado === 'cancelada') {
                throw new BadRequestException(
                    'La compra ya está cancelada',
                    ERROR_TITLES.VALIDATION_ERROR,
                );
            }

            // Si la compra estaba completada, devolver el stock
            if (compra.estado === 'completada') {
                for (const detalle of compra.detalleCompras) {
                    const producto = await this.productoRepository.findOne({
                        where: { id: detalle.productoId },
                    });

                    if (producto) {
                        if (producto.stock < detalle.cantidad) {
                            throw new BadRequestException(
                                `No se puede cancelar: el producto "${producto.nombre}" tiene stock insuficiente para revertir`,
                                ERROR_TITLES.VALIDATION_ERROR,
                            );
                        }
                        producto.stock -= detalle.cantidad;
                        producto.fechaActualizacion = new Date();
                        await queryRunner.manager.save(Producto, producto);

                        // Registrar movimiento de inventario (SALIDA por cancelación de compra)
                        await this.inventarioService.registrarMovimientoInterno(queryRunner, {
                            productoId: producto.id,
                            tipoMovimiento: TipoMovimiento.SALIDA,
                            cantidad: detalle.cantidad,
                            motivo: `Cancelación de compra ${compra.numeroFactura || compra.id}`,
                            referenciaId: compra.id,
                            usuarioId: compra.usuarioId,
                        });
                    }
                }
            }

            compra.estado = 'cancelada';
            const compraCancelada = await queryRunner.manager.save(Compra, compra);

            await queryRunner.commitTransaction();

            return this.findOne(compraCancelada.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            handleDBErrors(error, ERROR_MESSAGES.COMPRA_NOT_UPDATED);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getComprasByProveedor(proveedorId: string): Promise<Compra[]> {
        try {
            return await this.compraRepository.find({
                where: { proveedorId },
                relations: ['detalleCompras', 'detalleCompras.producto'],
                order: { fechaCompra: 'DESC' },
            });
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.COMPRAS_NOT_FOUND);
            throw error;
        }
    }

    async getResumenCompras(fechaInicio?: Date, fechaFin?: Date): Promise<{
        totalCompras: number;
        cantidadCompras: number;
        promedioCompra: number;
    }> {
        try {
            const queryBuilder = this.compraRepository
                .createQueryBuilder('compra')
                .where('compra.estado = :estado', { estado: 'completada' });

            if (fechaInicio) {
                queryBuilder.andWhere('compra.fechaCompra >= :fechaInicio', { fechaInicio });
            }

            if (fechaFin) {
                queryBuilder.andWhere('compra.fechaCompra <= :fechaFin', { fechaFin });
            }

            const result = await queryBuilder
                .select('SUM(compra.total)', 'totalCompras')
                .addSelect('COUNT(compra.id)', 'cantidadCompras')
                .addSelect('AVG(compra.total)', 'promedioCompra')
                .getRawOne();

            return {
                totalCompras: Number(result.totalCompras) || 0,
                cantidadCompras: Number(result.cantidadCompras) || 0,
                promedioCompra: Number(result.promedioCompra) || 0,
            };
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.COMPRAS_NOT_FOUND);
            throw error;
        }
    }

    private async actualizarStock(compra: Compra, tipo: 'incrementar' | 'decrementar'): Promise<void> {
        for (const detalle of compra.detalleCompras) {
            const producto = await this.productoRepository.findOne({
                where: { id: detalle.productoId },
            });

            if (producto) {
                if (tipo === 'incrementar') {
                    producto.stock += detalle.cantidad;
                } else {
                    producto.stock -= detalle.cantidad;
                }
                producto.fechaActualizacion = new Date();
                await this.productoRepository.save(producto);
            }
        }
    }
}

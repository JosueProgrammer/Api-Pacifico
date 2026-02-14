import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Venta } from '../common/entities/venta.entity';
import { DetalleVenta } from '../common/entities/detalle-venta.entity';
import { Producto } from '../common/entities/producto.entity';
import { Cliente } from '../common/entities/cliente.entity';
import { MetodoPago } from '../common/entities/metodo-pago.entity';
import { Descuento } from '../common/entities/descuento.entity';
import { CreateVentaDto, UpdateVentaDto, EstadoVenta } from './dtos';
import { DescuentosService } from '../descuentos/descuentos.service';
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
export class VentasService {
    constructor(
        @InjectRepository(Venta)
        private readonly ventaRepository: Repository<Venta>,
        @InjectRepository(DetalleVenta)
        private readonly detalleVentaRepository: Repository<DetalleVenta>,
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
        @InjectRepository(Cliente)
        private readonly clienteRepository: Repository<Cliente>,
        @InjectRepository(MetodoPago)
        private readonly metodoPagoRepository: Repository<MetodoPago>,
        private readonly dataSource: DataSource,
        private readonly descuentosService: DescuentosService,
        private readonly inventarioService: InventarioService,
    ) { }

    async create(createVentaDto: CreateVentaDto, usuarioId: string): Promise<Venta> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Verificar si el cliente existe (si se proporciona)
            if (createVentaDto.clienteId) {
                const cliente = await this.clienteRepository.findOne({
                    where: { id: createVentaDto.clienteId, activo: true },
                });

                if (!cliente) {
                    throw new NotFoundException(
                        `Cliente con ID "${createVentaDto.clienteId}" no encontrado o inactivo`,
                        ERROR_TITLES.NOT_FOUND_ERROR,
                    );
                }
            }

            // Verificar si el método de pago existe (si se proporciona)
            if (createVentaDto.metodoPagoId) {
                const metodoPago = await this.metodoPagoRepository.findOne({
                    where: { id: createVentaDto.metodoPagoId, activo: true },
                });

                if (!metodoPago) {
                    throw new NotFoundException(
                        `Método de pago con ID "${createVentaDto.metodoPagoId}" no encontrado o inactivo`,
                        ERROR_TITLES.NOT_FOUND_ERROR,
                    );
                }
            }

            // Validar productos y calcular totales
            let subtotal = 0;
            let idDescuentoAplicado: string | null = null;
            const detallesValidados: { producto: Producto; cantidad: number; descuento: number; precioUnitario: number; subtotalDetalle: number }[] = [];

            for (const detalle of createVentaDto.detalles) {
                const producto = await this.productoRepository.findOne({
                    where: { id: detalle.productoId, activo: true },
                });

                if (!producto) {
                    throw new NotFoundException(
                        `Producto con ID "${detalle.productoId}" no encontrado o inactivo`,
                        ERROR_TITLES.NOT_FOUND_ERROR,
                    );
                }

                // VALIDACIÓN CRÍTICA: El stock no puede quedar negativo
                if (producto.stock < detalle.cantidad) {
                    throw new BadRequestException(
                        `Stock insuficiente para el producto "${producto.nombre}". Stock disponible: ${producto.stock}, solicitado: ${detalle.cantidad}`,
                        ERROR_TITLES.VALIDATION_ERROR,
                    );
                }
                
                // Verificar que el stock resultante no sea negativo
                const stockResultante = producto.stock - detalle.cantidad;
                if (stockResultante < 0) {
                    throw new BadRequestException(
                        `No se puede realizar la venta. El stock de "${producto.nombre}" quedaría en ${stockResultante}`,
                        ERROR_TITLES.VALIDATION_ERROR,
                    );
                }

                const precioUnitario = Number(producto.precioVenta);
                const descuentoDetalle = detalle.descuento || 0;
                const subtotalDetalle = (precioUnitario * detalle.cantidad) - descuentoDetalle;

                detallesValidados.push({
                    producto,
                    cantidad: detalle.cantidad,
                    descuento: descuentoDetalle,
                    precioUnitario,
                    subtotalDetalle,
                });

                subtotal += subtotalDetalle;
            }

            // Calcular descuento (puede ser manual o por código)
            let descuentoGeneral = createVentaDto.descuento || 0;
            
            // Validar y aplicar código de descuento si se proporciona
            if (createVentaDto.codigoDescuento) {
                const resultadoDescuento = await this.descuentosService.validarCodigo(createVentaDto.codigoDescuento);
                
                if (!resultadoDescuento.valido) {
                    throw new BadRequestException(
                        resultadoDescuento.mensaje,
                        ERROR_TITLES.VALIDATION_ERROR,
                    );
                }
                
                // Calcular descuento por código
                const descuentoPorCodigo = this.descuentosService.calcularDescuento(resultadoDescuento.descuento!, subtotal);
                descuentoGeneral += descuentoPorCodigo;
                idDescuentoAplicado = resultadoDescuento.descuento!.id;
            }
            
            // Calcular totales
            const impuesto = createVentaDto.impuesto || 0;
            const subtotalConDescuento = Math.max(0, subtotal - descuentoGeneral); // No puede ser negativo
            const montoImpuesto = subtotalConDescuento * (impuesto / 100);
            const total = subtotalConDescuento + montoImpuesto;

            // Generar número de factura
            const numeroFactura = await this.generarNumeroFactura();

            // Crear la venta
            const venta = queryRunner.manager.create(Venta, {
                numeroFactura,
                clienteId: createVentaDto.clienteId,
                usuarioId,
                metodoPagoId: createVentaDto.metodoPagoId,
                subtotal,
                descuento: descuentoGeneral,
                impuesto: montoImpuesto,
                total,
                estado: 'completada',
                descuentoId: idDescuentoAplicado,
                fechaVenta: new Date(),
            });

            const ventaGuardada = await queryRunner.manager.save(Venta, venta);

            // Crear detalles y actualizar stock
            for (const detalle of detallesValidados) {
                // Crear detalle de venta
                const detalleVenta = queryRunner.manager.create(DetalleVenta, {
                    ventaId: ventaGuardada.id,
                    productoId: detalle.producto.id,
                    cantidad: detalle.cantidad,
                    precioUnitario: detalle.precioUnitario,
                    descuento: detalle.descuento,
                    subtotal: detalle.subtotalDetalle,
                });

                await queryRunner.manager.save(DetalleVenta, detalleVenta);

                // Actualizar stock del producto
                detalle.producto.stock -= detalle.cantidad;
                detalle.producto.fechaActualizacion = new Date();
                await queryRunner.manager.save(Producto, detalle.producto);

                // Registrar movimiento de inventario (SALIDA por venta)
                await this.inventarioService.registrarMovimientoInterno(queryRunner, {
                    productoId: detalle.producto.id,
                    tipoMovimiento: TipoMovimiento.SALIDA,
                    cantidad: detalle.cantidad,
                    motivo: `Venta ${ventaGuardada.numeroFactura}`,
                    referenciaId: ventaGuardada.id,
                    usuarioId,
                });
            }

            // Incrementar uso del descuento si aplica
            if (idDescuentoAplicado) {
                await this.descuentosService.incrementarUso(idDescuentoAplicado, queryRunner);
            }

            await queryRunner.commitTransaction();

            // Retornar la venta con sus relaciones
            return this.findOne(ventaGuardada.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            handleDBErrors(error, ERROR_MESSAGES.VENTA_NOT_CREATED);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(
        pagination: PaginationParamsDto,
        filter?: FilteringParam<Venta> | null,
        sorting?: SortingParam<Venta> | null,
    ): Promise<ApiPaginatedResponseDto<Venta>> {
        try {
            const { page, limit } = pagination;
            const skip = (page - 1) * limit;

            // Construir condiciones de filtrado
            const whereConditions = getWhereConditions(filter ?? null);

            // Aplicar ordenamiento
            const order = {
                fechaVenta: 'DESC' as const,
                ...getSortingOrder(sorting ?? null),
            };

            // Obtener total
            const total = await this.ventaRepository.count({
                where: whereConditions,
            });

            // Obtener registros paginados
            const ventas = await this.ventaRepository.find({
                where: whereConditions,
                order,
                skip,
                take: limit,
                relations: ['cliente', 'usuario', 'metodoPago', 'detalleVentas', 'detalleVentas.producto'],
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
                ventas,
                meta,
                'Ventas obtenidas exitosamente',
                'Lista de ventas',
            );
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.VENTAS_NOT_FOUND);
            throw error;
        }
    }

    async findOne(id: string): Promise<Venta> {
        try {
            const venta = await this.ventaRepository.findOne({
                where: { id },
                relations: ['cliente', 'usuario', 'metodoPago', 'detalleVentas', 'detalleVentas.producto'],
            });

            if (!venta) {
                throw new NotFoundException(
                    `Venta con ID "${id}" no encontrada`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            return venta;
        } catch (error) {
            handleDBErrors(error, `Venta con ID "${id}" no encontrada`);
            throw error;
        }
    }

    async findByNumeroFactura(numeroFactura: string): Promise<Venta> {
        try {
            const venta = await this.ventaRepository.findOne({
                where: { numeroFactura },
                relations: ['cliente', 'usuario', 'metodoPago', 'detalleVentas', 'detalleVentas.producto'],
            });

            if (!venta) {
                throw new NotFoundException(
                    `Venta con número de factura "${numeroFactura}" no encontrada`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            return venta;
        } catch (error) {
            handleDBErrors(error, `Venta con número de factura "${numeroFactura}" no encontrada`);
            throw error;
        }
    }

    async update(id: string, updateVentaDto: UpdateVentaDto): Promise<Venta> {
        try {
            const venta = await this.findOne(id);

            // Solo permitir cambios de estado
            if (updateVentaDto.estado) {
                // Si se cancela la venta, devolver el stock
                if (updateVentaDto.estado === EstadoVenta.CANCELADA && venta.estado !== 'cancelada') {
                    await this.revertirStock(venta);
                }

                venta.estado = updateVentaDto.estado;
            }

            return await this.ventaRepository.save(venta);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.VENTA_NOT_UPDATED);
            throw error;
        }
    }

    async cancelar(id: string): Promise<Venta> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const venta = await this.findOne(id);

            if (venta.estado === 'cancelada') {
                throw new BadRequestException(
                    'La venta ya está cancelada',
                    ERROR_TITLES.VALIDATION_ERROR,
                );
            }

            // Devolver stock de productos
            for (const detalle of venta.detalleVentas) {
                const producto = await this.productoRepository.findOne({
                    where: { id: detalle.productoId },
                });

                if (producto) {
                    producto.stock += detalle.cantidad;
                    producto.fechaActualizacion = new Date();
                    await queryRunner.manager.save(Producto, producto);

                    // Registrar movimiento de inventario (ENTRADA por cancelación de venta)
                    await this.inventarioService.registrarMovimientoInterno(queryRunner, {
                        productoId: producto.id,
                        tipoMovimiento: TipoMovimiento.ENTRADA,
                        cantidad: detalle.cantidad,
                        motivo: `Cancelación de venta ${venta.numeroFactura}`,
                        referenciaId: venta.id,
                        usuarioId: venta.usuarioId,
                    });
                }
            }



            // Decrementar uso del descuento si aplica
            if (venta.descuentoId) {
                await this.descuentosService.decrementarUso(venta.descuentoId, queryRunner);
            }

            venta.estado = 'cancelada';
            const ventaCancelada = await queryRunner.manager.save(Venta, venta);

            await queryRunner.commitTransaction();

            return this.findOne(ventaCancelada.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            handleDBErrors(error, ERROR_MESSAGES.VENTA_NOT_UPDATED);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getVentasByCliente(clienteId: string): Promise<Venta[]> {
        try {
            return await this.ventaRepository.find({
                where: { clienteId },
                relations: ['detalleVentas', 'detalleVentas.producto', 'metodoPago'],
                order: { fechaVenta: 'DESC' },
            });
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.VENTAS_NOT_FOUND);
            throw error;
        }
    }

    async getResumenVentas(fechaInicio?: Date, fechaFin?: Date): Promise<{
        totalVentas: number;
        cantidadVentas: number;
        promedioVenta: number;
    }> {
        try {
            const queryBuilder = this.ventaRepository
                .createQueryBuilder('venta')
                .where('venta.estado = :estado', { estado: 'completada' });

            if (fechaInicio) {
                queryBuilder.andWhere('venta.fechaVenta >= :fechaInicio', { fechaInicio });
            }

            if (fechaFin) {
                queryBuilder.andWhere('venta.fechaVenta <= :fechaFin', { fechaFin });
            }

            const result = await queryBuilder
                .select('SUM(venta.total)', 'totalVentas')
                .addSelect('COUNT(venta.id)', 'cantidadVentas')
                .addSelect('AVG(venta.total)', 'promedioVenta')
                .getRawOne();

            return {
                totalVentas: Number(result.totalVentas) || 0,
                cantidadVentas: Number(result.cantidadVentas) || 0,
                promedioVenta: Number(result.promedioVenta) || 0,
            };
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.VENTAS_NOT_FOUND);
            throw error;
        }
    }

    private async generarNumeroFactura(): Promise<string> {
        const fecha = new Date();
        const año = fecha.getFullYear().toString().slice(-2);
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');

        // Obtener el último número de factura del día
        const ultimaVenta = await this.ventaRepository
            .createQueryBuilder('venta')
            .where('venta.numeroFactura LIKE :prefijo', { prefijo: `F${año}${mes}${dia}%` })
            .orderBy('venta.numeroFactura', 'DESC')
            .getOne();

        let secuencia = 1;
        if (ultimaVenta) {
            const ultimaSecuencia = parseInt(ultimaVenta.numeroFactura.slice(-4), 10);
            secuencia = ultimaSecuencia + 1;
        }

        return `F${año}${mes}${dia}${secuencia.toString().padStart(4, '0')}`;
    }

    private async revertirStock(venta: Venta): Promise<void> {
        for (const detalle of venta.detalleVentas) {
            const producto = await this.productoRepository.findOne({
                where: { id: detalle.productoId },
            });

            if (producto) {
                producto.stock += detalle.cantidad;
                producto.fechaActualizacion = new Date();
                await this.productoRepository.save(producto);
            }
        }
    }
}

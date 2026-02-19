import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Inventario } from '../common/entities/inventario.entity';
import { Producto } from '../common/entities/producto.entity';
import { CreateMovimientoDto, AjusteStockDto, TipoMovimiento } from './dtos';
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
export class InventarioService {
    constructor(
        @InjectRepository(Inventario)
        private readonly inventarioRepository: Repository<Inventario>,
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
        private readonly dataSource: DataSource,
    ) { }

    /**
     * Registra un movimiento de inventario y actualiza el stock del producto
     * Valida que el stock nunca sea negativo
     */
    async registrarMovimiento(createMovimientoDto: CreateMovimientoDto, usuarioId: string): Promise<Inventario> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Obtener el producto
            const producto = await this.productoRepository.findOne({
                where: { id: createMovimientoDto.productoId },
            });

            if (!producto) {
                throw new NotFoundException(
                    `Producto con ID "${createMovimientoDto.productoId}" no encontrado`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            // Calcular nuevo stock según el tipo de movimiento
            let nuevoStock = producto.stock;
            const cantidad = createMovimientoDto.cantidad;

            switch (createMovimientoDto.tipoMovimiento) {
                case TipoMovimiento.ENTRADA:
                    nuevoStock = producto.stock + cantidad;
                    break;
                case TipoMovimiento.SALIDA:
                    nuevoStock = producto.stock - cantidad;
                    break;
                case TipoMovimiento.AJUSTE:
                    // En ajuste, la cantidad puede ser positiva (agregar) o se usa para establecer
                    // Aquí asumimos que es una diferencia
                    nuevoStock = producto.stock + cantidad;
                    break;
            }

            // VALIDACIÓN CRÍTICA: El stock no puede ser negativo
            if (nuevoStock < 0) {
                throw new BadRequestException(
                    `No se puede realizar el movimiento. El stock resultante sería ${nuevoStock}. Stock actual: ${producto.stock}`,
                    ERROR_TITLES.VALIDATION_ERROR,
                );
            }

            // Crear el registro de movimiento
            const movimiento = queryRunner.manager.create(Inventario, {
                productoId: createMovimientoDto.productoId,
                tipoMovimiento: createMovimientoDto.tipoMovimiento,
                cantidad: cantidad,
                motivo: createMovimientoDto.motivo,
                referenciaId: createMovimientoDto.referenciaId,
                usuarioId,
                fechaMovimiento: new Date(),
            });

            await queryRunner.manager.save(Inventario, movimiento);

            // Actualizar el stock del producto
            producto.stock = nuevoStock;
            producto.fechaActualizacion = new Date();
            await queryRunner.manager.save(Producto, producto);

            await queryRunner.commitTransaction();

            // Retornar el movimiento con sus relaciones
            return this.findOne(movimiento.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            handleDBErrors(error, ERROR_MESSAGES.INVENTARIO_NOT_CREATED);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Registra un movimiento de inventario usando una transacción externa (de ventas/compras).
     * NO modifica el stock del producto — solo crea el registro de trazabilidad.
     * El stock ya fue actualizado por el servicio que llama a este método.
     */
    async registrarMovimientoInterno(
        queryRunner: QueryRunner,
        data: {
            productoId: string;
            tipoMovimiento: TipoMovimiento;
            cantidad: number;
            motivo: string;
            referenciaId: string;
            usuarioId: string;
        },
    ): Promise<void> {
        const movimiento = queryRunner.manager.create(Inventario, {
            productoId: data.productoId,
            tipoMovimiento: data.tipoMovimiento,
            cantidad: data.cantidad,
            motivo: data.motivo,
            referenciaId: data.referenciaId,
            usuarioId: data.usuarioId,
            fechaMovimiento: new Date(),
        });
        await queryRunner.manager.save(Inventario, movimiento);
    }

    /**
     * Ajusta el stock de un producto a una cantidad específica
     * Registra el movimiento correspondiente
     */
    async ajustarStock(ajusteStockDto: AjusteStockDto, usuarioId: string): Promise<Inventario> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Obtener el producto
            const producto = await this.productoRepository.findOne({
                where: { id: ajusteStockDto.productoId },
            });

            if (!producto) {
                throw new NotFoundException(
                    `Producto con ID "${ajusteStockDto.productoId}" no encontrado`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            // VALIDACIÓN: El nuevo stock no puede ser negativo
            if (ajusteStockDto.nuevoStock < 0) {
                throw new BadRequestException(
                    'El stock no puede ser negativo',
                    ERROR_TITLES.VALIDATION_ERROR,
                );
            }

            // Calcular la diferencia
            const diferencia = ajusteStockDto.nuevoStock - producto.stock;
            const tipoMovimiento = diferencia >= 0 ? TipoMovimiento.ENTRADA : TipoMovimiento.SALIDA;

            // Crear el registro de movimiento
            const movimiento = queryRunner.manager.create(Inventario, {
                productoId: ajusteStockDto.productoId,
                tipoMovimiento: 'ajuste',
                cantidad: Math.abs(diferencia),
                motivo: `${ajusteStockDto.motivo} (Stock anterior: ${producto.stock}, Nuevo stock: ${ajusteStockDto.nuevoStock})`,
                usuarioId,
                fechaMovimiento: new Date(),
            });

            await queryRunner.manager.save(Inventario, movimiento);

            // Actualizar el stock del producto
            producto.stock = ajusteStockDto.nuevoStock;
            producto.fechaActualizacion = new Date();
            await queryRunner.manager.save(Producto, producto);

            await queryRunner.commitTransaction();

            return this.findOne(movimiento.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            handleDBErrors(error, ERROR_MESSAGES.INVENTARIO_NOT_CREATED);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Obtiene todos los movimientos de inventario con paginación
     */
    async findAll(
        pagination: PaginationParamsDto,
        filter?: FilteringParam<Inventario> | null,
        sorting?: SortingParam<Inventario> | null,
    ): Promise<ApiPaginatedResponseDto<Inventario>> {
        try {
            const { page, limit } = pagination;
            const skip = (page - 1) * limit;

            const whereConditions = getWhereConditions(filter ?? null);

            const order = {
                fechaMovimiento: 'DESC' as const,
                ...getSortingOrder(sorting ?? null),
            };

            const total = await this.inventarioRepository.count({
                where: whereConditions,
            });

            const movimientos = await this.inventarioRepository.find({
                where: whereConditions,
                order,
                skip,
                take: limit,
                relations: ['producto', 'usuario'],
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
                movimientos,
                meta,
                'Movimientos de inventario obtenidos exitosamente',
                'Lista de movimientos',
            );
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.INVENTARIO_NOT_FOUND);
            throw error;
        }
    }

    /**
     * Obtiene un movimiento por ID
     */
    async findOne(id: string): Promise<Inventario> {
        try {
            const movimiento = await this.inventarioRepository.findOne({
                where: { id },
                relations: ['producto', 'usuario'],
            });

            if (!movimiento) {
                throw new NotFoundException(
                    `Movimiento con ID "${id}" no encontrado`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            return movimiento;
        } catch (error) {
            handleDBErrors(error, `Movimiento con ID "${id}" no encontrado`);
            throw error;
        }
    }

    /**
     * Obtiene el historial de movimientos de un producto
     */
    async getHistorialProducto(productoId: string): Promise<Inventario[]> {
        try {
            // Verificar que el producto existe
            const producto = await this.productoRepository.findOne({
                where: { id: productoId },
            });

            if (!producto) {
                throw new NotFoundException(
                    `Producto con ID "${productoId}" no encontrado`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            return await this.inventarioRepository.find({
                where: { productoId },
                relations: ['usuario'],
                order: { fechaMovimiento: 'DESC' },
            });
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.INVENTARIO_NOT_FOUND);
            throw error;
        }
    }

    /**
     * Obtiene productos con stock bajo (menor o igual al stock mínimo)
     */
    async getProductosStockBajo(): Promise<Producto[]> {
        try {
            return await this.productoRepository
                .createQueryBuilder('producto')
                .where('producto.stock <= producto.stockMinimo')
                .andWhere('producto.activo = :activo', { activo: true })
                .orderBy('producto.stock', 'ASC')
                .getMany();
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.INVENTARIO_NOT_FOUND);
            throw error;
        }
    }

    /**
     * Obtiene un resumen del inventario
     */
    async getResumenInventario(): Promise<{
        totalProductos: number;
        productosActivos: number;
        productosStockBajo: number;
        productosAgotados: number;
        valorTotalInventario: number;
    }> {
        try {
            const totalProductos = await this.productoRepository.count();
            const productosActivos = await this.productoRepository.count({
                where: { activo: true },
            });

            const productosStockBajo = await this.productoRepository
                .createQueryBuilder('producto')
                .where('producto.stock <= producto.stockMinimo')
                .andWhere('producto.stock > 0')
                .andWhere('producto.activo = :activo', { activo: true })
                .getCount();

            const productosAgotados = await this.productoRepository.count({
                where: { stock: 0, activo: true },
            });

            const valorTotal = await this.productoRepository
                .createQueryBuilder('producto')
                .select('SUM(producto.stock * producto.precioCompra)', 'valor')
                .where('producto.activo = :activo', { activo: true })
                .getRawOne();

            return {
                totalProductos,
                productosActivos,
                productosStockBajo,
                productosAgotados,
                valorTotalInventario: Number(valorTotal?.valor) || 0,
            };
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.INVENTARIO_NOT_FOUND);
            throw error;
        }
    }
}

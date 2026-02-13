import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../common/entities/producto.entity';
import { Categoria } from '../common/entities/categoria.entity';
import { Proveedor } from '../common/entities/proveedor.entity';
import { CreateProductoDto, UpdateProductoDto } from './dtos';
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
export class ProductosService {
    constructor(
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>,
        @InjectRepository(Proveedor)
        private readonly proveedorRepository: Repository<Proveedor>,
    ) { }

    async create(createProductoDto: CreateProductoDto): Promise<Producto> {
        try {
            // Verificar si ya existe un producto con el mismo código de barras
            if (createProductoDto.codigoBarras) {
                const productoExistente = await this.productoRepository.findOne({
                    where: { codigoBarras: createProductoDto.codigoBarras },
                });

                if (productoExistente) {
                    throw new BadRequestException(
                        `Ya existe un producto con el código de barras "${createProductoDto.codigoBarras}"`,
                        ERROR_TITLES.CONFLICT_ERROR,
                    );
                }
            }

            // Verificar si la categoría existe (si se proporciona)
            if (createProductoDto.categoriaId) {
                const categoria = await this.categoriaRepository.findOne({
                    where: { id: createProductoDto.categoriaId },
                });

                if (!categoria) {
                    throw new NotFoundException(
                        `Categoría con ID "${createProductoDto.categoriaId}" no encontrada`,
                        ERROR_TITLES.NOT_FOUND_ERROR,
                    );
                }
            }

            // Verificar si el proveedor existe (si se proporciona)
            if (createProductoDto.proveedorId) {
                const proveedor = await this.proveedorRepository.findOne({
                    where: { id: createProductoDto.proveedorId },
                });

                if (!proveedor) {
                    throw new NotFoundException(
                        `Proveedor con ID "${createProductoDto.proveedorId}" no encontrado`,
                        ERROR_TITLES.NOT_FOUND_ERROR,
                    );
                }
            }

            const producto = this.productoRepository.create({
                ...createProductoDto,
                stock: createProductoDto.stock ?? 0,
                stockMinimo: createProductoDto.stockMinimo ?? 0,
                activo: createProductoDto.activo ?? true,
            });

            return await this.productoRepository.save(producto);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.PRODUCTO_NOT_CREATED);
            throw error;
        }
    }

    async findAll(
        pagination: PaginationParamsDto,
        filter?: FilteringParam<Producto> | null,
        sorting?: SortingParam<Producto> | null,
    ): Promise<ApiPaginatedResponseDto<Producto>> {
        try {
            const { page, limit } = pagination;
            const skip = (page - 1) * limit;

            // Construir condiciones de filtrado
            const whereConditions = getWhereConditions(filter ?? null);

            // Aplicar ordenamiento
            const order = {
                nombre: 'ASC' as const,
                ...getSortingOrder(sorting ?? null),
            };

            // Obtener total
            const total = await this.productoRepository.count({
                where: whereConditions,
            });

            // Obtener registros paginados
            const productos = await this.productoRepository.find({
                where: whereConditions,
                order,
                skip,
                take: limit,
                relations: ['categoria', 'proveedor'],
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
                productos,
                meta,
                'Productos obtenidos exitosamente',
                'Lista de productos',
            );
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.PRODUCTOS_NOT_FOUND);
            throw error;
        }
    }

    async findOne(id: string): Promise<Producto> {
        try {
            const producto = await this.productoRepository.findOne({
                where: { id },
                relations: ['categoria', 'proveedor'],
            });

            if (!producto) {
                throw new NotFoundException(
                    `Producto con ID "${id}" no encontrado`,
                    ERROR_TITLES.NOT_FOUND_ERROR,
                );
            }

            return producto;
        } catch (error) {
            handleDBErrors(error, `Producto con ID "${id}" no encontrado`);
            throw error;
        }
    }

    async update(id: string, updateProductoDto: UpdateProductoDto): Promise<Producto> {
        try {
            const producto = await this.findOne(id);

            // Verificar si se está actualizando el código de barras y si ya existe
            if (updateProductoDto.codigoBarras && updateProductoDto.codigoBarras !== producto.codigoBarras) {
                const productoExistente = await this.productoRepository.findOne({
                    where: { codigoBarras: updateProductoDto.codigoBarras },
                });

                if (productoExistente) {
                    throw new BadRequestException(
                        `Ya existe un producto con el código de barras "${updateProductoDto.codigoBarras}"`,
                        ERROR_TITLES.CONFLICT_ERROR,
                    );
                }
            }

            // Verificar si la categoría existe (si se proporciona)
            if (updateProductoDto.categoriaId) {
                const categoria = await this.categoriaRepository.findOne({
                    where: { id: updateProductoDto.categoriaId },
                });

                if (!categoria) {
                    throw new NotFoundException(
                        `Categoría con ID "${updateProductoDto.categoriaId}" no encontrada`,
                        ERROR_TITLES.NOT_FOUND_ERROR,
                    );
                }
            }

            // Verificar si el proveedor existe (si se proporciona)
            if (updateProductoDto.proveedorId) {
                const proveedor = await this.proveedorRepository.findOne({
                    where: { id: updateProductoDto.proveedorId },
                });

                if (!proveedor) {
                    throw new NotFoundException(
                        `Proveedor con ID "${updateProductoDto.proveedorId}" no encontrado`,
                        ERROR_TITLES.NOT_FOUND_ERROR,
                    );
                }
            }

            // Actualizar el producto
            Object.assign(producto, updateProductoDto);
            producto.fechaActualizacion = new Date();
            return await this.productoRepository.save(producto);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.PRODUCTO_NOT_UPDATED);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const producto = await this.findOne(id);

            // Verificar si el producto tiene ventas asociadas
            const productoConVentas = await this.productoRepository.findOne({
                where: { id },
                relations: ['detalleVentas'],
            });

            if (productoConVentas?.detalleVentas && productoConVentas.detalleVentas.length > 0) {
                throw new BadRequestException(
                    `No se puede eliminar el producto porque tiene ${productoConVentas.detalleVentas.length} venta(s) asociada(s)`,
                    ERROR_TITLES.CONFLICT_ERROR,
                );
            }

            await this.productoRepository.remove(producto);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.PRODUCTO_NOT_DELETED);
            throw error;
        }
    }

    async activate(id: string): Promise<Producto> {
        try {
            const producto = await this.findOne(id);
            producto.activo = true;
            producto.fechaActualizacion = new Date();
            return await this.productoRepository.save(producto);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.PRODUCTO_NOT_UPDATED);
            throw error;
        }
    }

    async deactivate(id: string): Promise<Producto> {
        try {
            const producto = await this.findOne(id);
            producto.activo = false;
            producto.fechaActualizacion = new Date();
            return await this.productoRepository.save(producto);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.PRODUCTO_NOT_UPDATED);
            throw error;
        }
    }

    async updateStock(id: string, cantidad: number, tipo: 'incrementar' | 'decrementar'): Promise<Producto> {
        try {
            const producto = await this.findOne(id);

            if (tipo === 'incrementar') {
                producto.stock += cantidad;
            } else {
                if (producto.stock < cantidad) {
                    throw new BadRequestException(
                        `No hay suficiente stock. Stock disponible: ${producto.stock}`,
                        ERROR_TITLES.VALIDATION_ERROR,
                    );
                }
                producto.stock -= cantidad;
            }

            producto.fechaActualizacion = new Date();
            return await this.productoRepository.save(producto);
        } catch (error) {
            handleDBErrors(error, ERROR_MESSAGES.PRODUCTO_NOT_UPDATED);
            throw error;
        }
    }
}


import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../common/entities/producto.entity';
import { Categoria } from '../common/entities/categoria.entity';
import { Proveedor } from '../common/entities/proveedor.entity';
import { CreateProductoDto, UpdateProductoDto } from './dtos';
import { PaginationParamsDto } from '../common/dto/pagination-param.dto';
import { FilteringParam, SortingParam, getWhereConditions, getSortingOrder } from '../common/helpers/typeorm-helpers';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class ProductosService {
  private readonly logger = new Logger(ProductosService.name);

  constructor(
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepo: Repository<Proveedor>,
  ) { }

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const { categoriaId, proveedorId, codigoBarras, ...productoData } = createProductoDto;

    if (categoriaId) {
      const categoria = await this.categoriaRepo.findOne({ where: { id: categoriaId } });
      if (!categoria) {
        throw new NotFoundException(`Categoría con ID '${categoriaId}' no encontrada`);
      }
    }

    if (proveedorId) {
      const proveedor = await this.proveedorRepo.findOne({ where: { id: proveedorId } });
      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID '${proveedorId}' no encontrado`);
      }
    }

    if (codigoBarras) {
      const existingProduct = await this.productoRepo.findOne({ where: { codigoBarras } });
      if (existingProduct) {
        throw new ConflictException(`Ya existe un producto con el código de barras '${codigoBarras}'`);
      }
    }

    const producto = this.productoRepo.create({
      ...productoData,
      codigoBarras,
      categoriaId,
      proveedorId,
    });

    return this.productoRepo.save(producto);
  }

  async findAll(
    pagination: { page: number; limit: number },
    filter?: FilteringParam<Producto> | null,
    sorting?: SortingParam<Producto> | null,
  ): Promise<PaginatedResponseDto<Producto>> {
    const { page, limit } = pagination;
    const where = getWhereConditions(filter ?? null);
    const order = getSortingOrder(sorting ?? null);

    const [items, total] = await this.productoRepo.findAndCount({
      where,
      order,
      take: limit,
      skip: (page - 1) * limit,
      relations: ['categoria', 'proveedor'],
    });

    const totalPages = Math.ceil(total / limit);
    return PaginatedResponseDto.PaginatedSuccess(
      items,
      {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      'Listar Productos',
      'Lista de productos obtenida exitosamente',
    );
  }

  async findOne(id: string): Promise<Producto> {
    const producto = await this.productoRepo.findOne({
      where: { id },
      relations: ['categoria', 'proveedor'],
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID '${id}' no encontrado`);
    }

    return producto;
  }

  async update(id: string, updateProductoDto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.findOne(id);
    const { categoriaId, proveedorId, codigoBarras, ...productoData } = updateProductoDto;

    if (categoriaId) {
      const categoria = await this.categoriaRepo.findOne({ where: { id: categoriaId } });
      if (!categoria) {
        throw new NotFoundException(`Categoría con ID '${categoriaId}' no encontrada`);
      }
      producto.categoriaId = categoriaId;
    }

    if (proveedorId) {
      const proveedor = await this.proveedorRepo.findOne({ where: { id: proveedorId } });
      if (!proveedor) {
        throw new NotFoundException(`Proveedor con ID '${proveedorId}' no encontrado`);
      }
      producto.proveedorId = proveedorId;
    }

    if (codigoBarras && codigoBarras !== producto.codigoBarras) {
      const existingProduct = await this.productoRepo.findOne({ where: { codigoBarras } });
      if (existingProduct) {
        throw new ConflictException(`Ya existe un producto con el código de barras '${codigoBarras}'`);
      }
      producto.codigoBarras = codigoBarras;
    }

    Object.assign(producto, productoData);

    return this.productoRepo.save(producto);
  }

  async remove(id: string): Promise<void> {
    const producto = await this.findOne(id);
    // TODO: Verify dependencies (e.g. sales) before deleting?
    await this.productoRepo.remove(producto);
  }

  async activate(id: string): Promise<Producto> {
    const producto = await this.findOne(id);
    producto.activo = true;
    return this.productoRepo.save(producto);
  }

  async deactivate(id: string): Promise<Producto> {
    const producto = await this.findOne(id);
    producto.activo = false;
    return this.productoRepo.save(producto);
  }

  async updateStock(id: string, cantidad: number, tipo: 'incrementar' | 'decrementar'): Promise<Producto> {
      const producto = await this.findOne(id);
      
      if (tipo === 'incrementar') {
          producto.stock += cantidad;
      } else {
          if (producto.stock < cantidad) {
              throw new BadRequestException('Stock insuficiente para realizar la operación');
          }
          producto.stock -= cantidad;
      }

      return this.productoRepo.save(producto);
  }
}

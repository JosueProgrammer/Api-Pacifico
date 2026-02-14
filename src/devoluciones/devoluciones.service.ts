import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Devolucion } from '../common/entities/devolucion.entity';
import { DetalleDevolucion } from '../common/entities/detalle-devolucion.entity';
import { Venta } from '../common/entities/venta.entity';
import { DetalleVenta } from '../common/entities/detalle-venta.entity';
import { Producto } from '../common/entities/producto.entity';
import { CreateDevolucionDto, QueryDevolucionDto } from './dtos';
import { InventarioService } from '../inventario/inventario.service';
import { CajaService } from '../caja/caja.service';
import { TipoMovimiento } from '../inventario/dtos';
import { TipoMovimientoCaja } from '../common/entities/movimiento-caja.entity';
import { handleDBErrors } from '../common/helpers/typeorm-helpers';
import { ERROR_MESSAGES, ERROR_TITLES } from '../common/constants/error-messages.constants';
import { ApiPaginatedMetaDto } from '../common/dto/api-paginated-meta.dto';
import { ApiPaginatedResponseDto } from '../common/dto/api-paginated-response.dto';

@Injectable()
export class DevolucionesService {
  constructor(
    @InjectRepository(Devolucion)
    private readonly devolucionRepository: Repository<Devolucion>,
    @InjectRepository(DetalleDevolucion)
    private readonly detalleDevolucionRepository: Repository<DetalleDevolucion>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository: Repository<DetalleVenta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly dataSource: DataSource,
    private readonly inventarioService: InventarioService,
    private readonly cajaService: CajaService,
  ) {}

  /**
   * Crea una nueva devolución (parcial o total)
   */
  async create(
    createDevolucionDto: CreateDevolucionDto,
    usuarioId: string,
  ): Promise<Devolucion> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar que la venta existe
      const venta = await this.ventaRepository.findOne({
        where: { id: createDevolucionDto.ventaId },
        relations: ['detalleVentas', 'detalleVentas.producto'],
      });

      if (!venta) {
        throw new NotFoundException(
          `Venta con ID "${createDevolucionDto.ventaId}" no encontrada`,
          ERROR_TITLES.NOT_FOUND_ERROR,
        );
      }

      if (venta.estado === 'cancelada') {
        throw new BadRequestException(
          'No se puede devolver una venta cancelada',
          ERROR_TITLES.VALIDATION_ERROR,
        );
      }

      // 2. Validar cantidades disponibles para devolución
      const detallesValidados: {
        detalleVenta: DetalleVenta;
        cantidadDevolver: number;
        subtotal: number;
      }[] = [];

      let montoTotalDevolucion = 0;

      for (const detalleDto of createDevolucionDto.detalles) {
        const detalleVenta = await this.detalleVentaRepository.findOne({
          where: { id: detalleDto.detalleVentaId },
          relations: ['producto'],
        });

        if (!detalleVenta) {
          throw new NotFoundException(
            `Detalle de venta con ID "${detalleDto.detalleVentaId}" no encontrado`,
            ERROR_TITLES.NOT_FOUND_ERROR,
          );
        }

        // Verificar que el detalle pertenece a la venta
        if (detalleVenta.ventaId !== createDevolucionDto.ventaId) {
          throw new BadRequestException(
            'El detalle de venta no pertenece a la venta especificada',
            ERROR_TITLES.VALIDATION_ERROR,
          );
        }

        // Calcular cantidad ya devuelta
        const cantidadYaDevuelta = await this.getCantidadDevuelta(
          detalleVenta.id,
        );

        const cantidadDisponible =
          Number(detalleVenta.cantidad) - cantidadYaDevuelta;

        // Validar cantidad a devolver
        if (detalleDto.cantidad <= 0) {
          throw new BadRequestException(
            'La cantidad a devolver debe ser mayor a 0',
            ERROR_TITLES.VALIDATION_ERROR,
          );
        }

        if (detalleDto.cantidad > cantidadDisponible) {
          throw new BadRequestException(
            `No se puede devolver ${detalleDto.cantidad} unidades del producto "${detalleVenta.producto.nombre}". ` +
              `Cantidad disponible para devolución: ${cantidadDisponible}`,
            ERROR_TITLES.VALIDATION_ERROR,
          );
        }

        // Calcular subtotal de devolución (proporcional al precio original)
        const precioUnitario = Number(detalleVenta.precioUnitario);
        const subtotalDevolucion = precioUnitario * detalleDto.cantidad;

        detallesValidados.push({
          detalleVenta,
          cantidadDevolver: detalleDto.cantidad,
          subtotal: subtotalDevolucion,
        });

        montoTotalDevolucion += subtotalDevolucion;
      }

      // 3. Determinar tipo de devolución
      const cantidadTotalVendida = venta.detalleVentas.reduce(
        (sum, d) => sum + Number(d.cantidad),
        0,
      );
      const cantidadTotalDevuelta = detallesValidados.reduce(
        (sum, d) => sum + d.cantidadDevolver,
        0,
      );
      const cantidadYaDevueltaAntes = await this.getCantidadTotalDevuelta(
        venta.id,
      );

      const esDevolucionTotal =
        cantidadTotalDevuelta + cantidadYaDevueltaAntes >=
        cantidadTotalVendida;

      // 4. Generar número de devolución
      const numeroDevolucion = await this.generarNumeroDevolucion();

      // 5. Crear registro de devolución
      const devolucion = queryRunner.manager.create(Devolucion, {
        numeroDevolucion,
        ventaId: createDevolucionDto.ventaId,
        usuarioId,
        fecha: new Date(),
        motivo: createDevolucionDto.motivo,
        tipo: esDevolucionTotal ? 'total' : 'parcial',
        montoDevuelto: montoTotalDevolucion,
        estado: 'procesada',
      });

      const devolucionGuardada = await queryRunner.manager.save(
        Devolucion,
        devolucion,
      );

      // 6. Crear detalles de devolución y actualizar inventario
      for (const detalle of detallesValidados) {
        // Crear detalle de devolución
        const detalleDevolucion = queryRunner.manager.create(DetalleDevolucion, {
          devolucionId: devolucionGuardada.id,
          detalleVentaId: detalle.detalleVenta.id,
          productoId: detalle.detalleVenta.productoId,
          cantidad: detalle.cantidadDevolver,
          precioUnitario: Number(detalle.detalleVenta.precioUnitario),
          subtotal: detalle.subtotal,
        });

        await queryRunner.manager.save(DetalleDevolucion, detalleDevolucion);

        // Actualizar stock del producto (devolver al inventario)
        const producto = await this.productoRepository.findOne({
          where: { id: detalle.detalleVenta.productoId },
        });

        if (producto) {
          producto.stock = Number(producto.stock) + detalle.cantidadDevolver;
          producto.fechaActualizacion = new Date();
          await queryRunner.manager.save(Producto, producto);

          // Registrar movimiento de inventario (ENTRADA por devolución)
          await this.inventarioService.registrarMovimientoInterno(queryRunner, {
            productoId: producto.id,
            tipoMovimiento: TipoMovimiento.ENTRADA,
            cantidad: detalle.cantidadDevolver,
            motivo: `Devolución ${devolucionGuardada.numeroDevolucion}`,
            referenciaId: devolucionGuardada.id,
            usuarioId,
          });
        }
      }

      // 7. Registrar movimiento de caja (egreso)
      const cajaAbierta = await this.cajaService.getCajaAbiertaByUsuario(
        usuarioId,
      );

      if (cajaAbierta) {
        await this.cajaService.registrarMovimientoInterno(queryRunner, {
          cajaId: cajaAbierta.id,
          usuarioId,
          tipo: TipoMovimientoCaja.DEVOLUCION,
          monto: montoTotalDevolucion,
          concepto: `Devolución ${numeroDevolucion} - ${createDevolucionDto.motivo}`,
          referenciaId: devolucionGuardada.id,
        });
      }

      await queryRunner.commitTransaction();

      // Retornar la devolución con sus relaciones
      return this.findOne(devolucionGuardada.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBErrors(error, 'Error al crear la devolución');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene todas las devoluciones con filtros y paginación
   */
  async findAll(
    queryDto: QueryDevolucionDto,
  ): Promise<ApiPaginatedResponseDto<Devolucion>> {
    try {
      const { page = 1, limit = 10, ventaId, estado, fechaInicio, fechaFin } = queryDto;
      const skip = (page - 1) * limit;

      const queryBuilder = this.devolucionRepository
        .createQueryBuilder('devolucion')
        .leftJoinAndSelect('devolucion.venta', 'venta')
        .leftJoinAndSelect('devolucion.usuario', 'usuario')
        .leftJoinAndSelect('devolucion.detalles', 'detalles')
        .leftJoinAndSelect('detalles.producto', 'producto');

      // Aplicar filtros
      if (ventaId) {
        queryBuilder.andWhere('devolucion.ventaId = :ventaId', { ventaId });
      }

      if (estado) {
        queryBuilder.andWhere('devolucion.estado = :estado', { estado });
      }

      if (fechaInicio) {
        queryBuilder.andWhere('devolucion.fecha >= :fechaInicio', {
          fechaInicio,
        });
      }

      if (fechaFin) {
        queryBuilder.andWhere('devolucion.fecha <= :fechaFin', { fechaFin });
      }

      // Ordenar por fecha descendente
      queryBuilder.orderBy('devolucion.fecha', 'DESC');

      // Obtener total
      const total = await queryBuilder.getCount();

      // Aplicar paginación
      const devoluciones = await queryBuilder.skip(skip).take(limit).getMany();

      const meta: ApiPaginatedMetaDto = {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      };

      return ApiPaginatedResponseDto.Success(
        devoluciones,
        meta,
        'Devoluciones obtenidas exitosamente',
        'Lista de devoluciones',
      );
    } catch (error) {
      handleDBErrors(error, 'Error al obtener las devoluciones');
      throw error;
    }
  }

  /**
   * Obtiene una devolución por ID
   */
  async findOne(id: string): Promise<Devolucion> {
    try {
      const devolucion = await this.devolucionRepository.findOne({
        where: { id },
        relations: [
          'venta',
          'venta.cliente',
          'usuario',
          'detalles',
          'detalles.producto',
          'detalles.detalleVenta',
        ],
      });

      if (!devolucion) {
        throw new NotFoundException(
          `Devolución con ID "${id}" no encontrada`,
          ERROR_TITLES.NOT_FOUND_ERROR,
        );
      }

      return devolucion;
    } catch (error) {
      handleDBErrors(error, `Devolución con ID "${id}" no encontrada`);
      throw error;
    }
  }

  /**
   * Obtiene todas las devoluciones de una venta específica
   */
  async findByVenta(ventaId: string): Promise<Devolucion[]> {
    try {
      return await this.devolucionRepository.find({
        where: { ventaId },
        relations: ['detalles', 'detalles.producto', 'usuario'],
        order: { fecha: 'DESC' },
      });
    } catch (error) {
      handleDBErrors(error, 'Error al obtener las devoluciones de la venta');
      throw error;
    }
  }

  /**
   * Obtiene los productos disponibles para devolver de una venta
   */
  async getProductosDisponiblesParaDevolucion(ventaId: string): Promise<
    Array<{
      detalleVentaId: string;
      productoId: string;
      nombreProducto: string;
      cantidadVendida: number;
      cantidadDevuelta: number;
      cantidadDisponible: number;
      precioUnitario: number;
    }>
  > {
    try {
      const venta = await this.ventaRepository.findOne({
        where: { id: ventaId },
        relations: ['detalleVentas', 'detalleVentas.producto'],
      });

      if (!venta) {
        throw new NotFoundException(
          `Venta con ID "${ventaId}" no encontrada`,
          ERROR_TITLES.NOT_FOUND_ERROR,
        );
      }

      const productosDisponibles: Array<{
        detalleVentaId: string;
        productoId: string;
        nombreProducto: string;
        cantidadVendida: number;
        cantidadDevuelta: number;
        cantidadDisponible: number;
        precioUnitario: number;
      }> = [];

      for (const detalleVenta of venta.detalleVentas) {
        const cantidadDevuelta = await this.getCantidadDevuelta(detalleVenta.id);
        const cantidadDisponible =
          Number(detalleVenta.cantidad) - cantidadDevuelta;

        if (cantidadDisponible > 0) {
          productosDisponibles.push({
            detalleVentaId: detalleVenta.id,
            productoId: detalleVenta.productoId,
            nombreProducto: detalleVenta.producto.nombre,
            cantidadVendida: Number(detalleVenta.cantidad),
            cantidadDevuelta,
            cantidadDisponible,
            precioUnitario: Number(detalleVenta.precioUnitario),
          });
        }
      }

      return productosDisponibles;
    } catch (error) {
      handleDBErrors(
        error,
        'Error al obtener productos disponibles para devolución',
      );
      throw error;
    }
  }

  /**
   * Calcula la cantidad ya devuelta de un detalle de venta específico
   */
  private async getCantidadDevuelta(detalleVentaId: string): Promise<number> {
    const result = await this.detalleDevolucionRepository
      .createQueryBuilder('dd')
      .select('SUM(dd.cantidad)', 'total')
      .innerJoin('dd.devolucion', 'devolucion')
      .where('dd.detalleVentaId = :detalleVentaId', { detalleVentaId })
      .andWhere('devolucion.estado = :estado', { estado: 'procesada' })
      .getRawOne();

    return Number(result?.total) || 0;
  }

  /**
   * Calcula la cantidad total devuelta de una venta
   */
  private async getCantidadTotalDevuelta(ventaId: string): Promise<number> {
    const result = await this.detalleDevolucionRepository
      .createQueryBuilder('dd')
      .select('SUM(dd.cantidad)', 'total')
      .innerJoin('dd.devolucion', 'devolucion')
      .where('devolucion.ventaId = :ventaId', { ventaId })
      .andWhere('devolucion.estado = :estado', { estado: 'procesada' })
      .getRawOne();

    return Number(result?.total) || 0;
  }

  /**
   * Genera un número único de devolución (formato: D240214-0001)
   */
  private async generarNumeroDevolucion(): Promise<string> {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');

    // Obtener la última devolución del día
    const ultimaDevolucion = await this.devolucionRepository
      .createQueryBuilder('devolucion')
      .where('devolucion.numeroDevolucion LIKE :prefijo', {
        prefijo: `D${año}${mes}${dia}%`,
      })
      .orderBy('devolucion.numeroDevolucion', 'DESC')
      .getOne();

    let secuencia = 1;
    if (ultimaDevolucion) {
      const ultimaSecuencia = parseInt(
        ultimaDevolucion.numeroDevolucion.slice(-4),
        10,
      );
      secuencia = ultimaSecuencia + 1;
    }

    return `D${año}${mes}${dia}${secuencia.toString().padStart(4, '0')}`;
  }
}

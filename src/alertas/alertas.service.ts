import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from '../common/entities/alerta.entity';
import { Producto } from '../common/entities/producto.entity';
import { QueryAlertaDto } from './dtos/query-alerta.dto';
import { handleDBErrors } from '../common/helpers/typeorm-helpers';
import { ApiPaginatedMetaDto } from '../common/dto/api-paginated-meta.dto';
import { ApiPaginatedResponseDto } from '../common/dto/api-paginated-response.dto';

@Injectable()
export class AlertasService {
  constructor(
    @InjectRepository(Alerta)
    private readonly alertaRepository: Repository<Alerta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  /**
   * Genera una alerta de stock bajo para un producto
   */
  async generarAlertaStockBajo(productoId: string): Promise<Alerta | null> {
    try {
      const producto = await this.productoRepository.findOne({
        where: { id: productoId },
      });

      if (!producto) return null;

      // Solo generar si el stock está por debajo del mínimo
      if (Number(producto.stock) > Number(producto.stockMinimo)) {
        return null;
      }

      // Verificar si ya existe una alerta no leída para este producto
      const alertaExistente = await this.alertaRepository.findOne({
        where: {
          entidadId: productoId,
          entidadTipo: 'producto',
          tipo: 'stock_bajo',
          leida: false,
        },
      });

      if (alertaExistente) {
        return alertaExistente; // No crear duplicados
      }

      // Crear nueva alerta
      const alerta = this.alertaRepository.create({
        tipo: 'stock_bajo',
        titulo: `Stock bajo: ${producto.nombre}`,
        mensaje: `El producto "${producto.nombre}" tiene un stock de ${producto.stock} unidades, por debajo del mínimo de ${producto.stockMinimo}.`,
        entidadId: productoId,
        entidadTipo: 'producto',
        leida: false,
      });

      return await this.alertaRepository.save(alerta);
    } catch (error) {
      handleDBErrors(error, 'Error al generar alerta de stock bajo');
      return null;
    }
  }

  /**
   * Genera una alerta de stock agotado para un producto
   */
  async generarAlertaStockAgotado(productoId: string): Promise<Alerta | null> {
    try {
      const producto = await this.productoRepository.findOne({
        where: { id: productoId },
      });

      if (!producto) return null;

      // Solo generar si el stock es 0
      if (Number(producto.stock) > 0) {
        return null;
      }

      // Verificar si ya existe una alerta no leída
      const alertaExistente = await this.alertaRepository.findOne({
        where: {
          entidadId: productoId,
          entidadTipo: 'producto',
          tipo: 'stock_agotado',
          leida: false,
        },
      });

      if (alertaExistente) {
        return alertaExistente;
      }

      const alerta = this.alertaRepository.create({
        tipo: 'stock_agotado',
        titulo: `Stock agotado: ${producto.nombre}`,
        mensaje: `El producto "${producto.nombre}" está completamente agotado.`,
        entidadId: productoId,
        entidadTipo: 'producto',
        leida: false,
      });

      return await this.alertaRepository.save(alerta);
    } catch (error) {
      handleDBErrors(error, 'Error al generar alerta de stock agotado');
      return null;
    }
  }

  /**
   * Obtiene todas las alertas con filtros y paginación
   */
  async findAll(
    queryDto: QueryAlertaDto,
  ): Promise<ApiPaginatedResponseDto<Alerta>> {
    try {
      const { page = 1, limit = 10, tipo, leida } = queryDto;
      const skip = (page - 1) * limit;

      const queryBuilder = this.alertaRepository
        .createQueryBuilder('alerta')
        .orderBy('alerta.fechaCreacion', 'DESC');

      if (tipo) {
        queryBuilder.andWhere('alerta.tipo = :tipo', { tipo });
      }

      if (leida !== undefined) {
        queryBuilder.andWhere('alerta.leida = :leida', { leida });
      }

      const total = await queryBuilder.getCount();
      const alertas = await queryBuilder.skip(skip).take(limit).getMany();

      const meta: ApiPaginatedMetaDto = {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      };

      return ApiPaginatedResponseDto.Success(
        alertas,
        meta,
        'Alertas obtenidas exitosamente',
        'Lista de alertas',
      );
    } catch (error) {
      handleDBErrors(error, 'Error al obtener alertas');
      throw error;
    }
  }

  /**
   * Obtiene el conteo de alertas no leídas
   */
  async getNoLeidasCount(): Promise<number> {
    try {
      return await this.alertaRepository.count({
        where: { leida: false },
      });
    } catch (error) {
      handleDBErrors(error, 'Error al contar alertas no leídas');
      throw error;
    }
  }

  /**
   * Marca una alerta como leída
   */
  async marcarComoLeida(id: string): Promise<Alerta> {
    try {
      const alerta = await this.alertaRepository.findOne({
        where: { id },
      });

      if (!alerta) {
        throw new Error(`Alerta con ID "${id}" no encontrada`);
      }

      alerta.leida = true;
      return await this.alertaRepository.save(alerta);
    } catch (error) {
      handleDBErrors(error, 'Error al marcar alerta como leída');
      throw error;
    }
  }

  /**
   * Elimina una alerta
   */
  async remove(id: string): Promise<void> {
    try {
      const result = await this.alertaRepository.delete(id);
      if (result.affected === 0) {
        throw new Error(`Alerta con ID "${id}" no encontrada`);
      }
    } catch (error) {
      handleDBErrors(error, 'Error al eliminar alerta');
      throw error;
    }
  }

  /**
   * Elimina alertas antiguas leídas (limpieza)
   */
  async limpiarAlertasLeidas(diasAntiguedad: number = 30): Promise<number> {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

      const result = await this.alertaRepository
        .createQueryBuilder()
        .delete()
        .where('leida = :leida', { leida: true })
        .andWhere('fechaCreacion < :fecha', { fecha: fechaLimite })
        .execute();

      return result.affected || 0;
    } catch (error) {
      handleDBErrors(error, 'Error al limpiar alertas');
      throw error;
    }
  }
}

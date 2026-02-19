import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Caja, EstadoCaja } from '../common/entities/caja.entity';
import { MovimientoCaja, TipoMovimientoCaja } from '../common/entities/movimiento-caja.entity';
import { AbrirCajaDto, CerrarCajaDto, CrearMovimientoCajaDto } from './dtos';
import { handleDBErrors } from '../common/helpers/typeorm-helpers';
import { ERROR_MESSAGES, ERROR_TITLES } from '../common/constants/error-messages.constants';
import { ApiPaginatedMetaDto } from '../common/dto/api-paginated-meta.dto';
import { ApiPaginatedResponseDto } from '../common/dto/api-paginated-response.dto';
import { PaginationParamsDto } from '../common/dto/pagination-param.dto';

@Injectable()
export class CajaService {
  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
    @InjectRepository(MovimientoCaja)
    private readonly movimientoCajaRepository: Repository<MovimientoCaja>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Abre una nueva caja para el usuario
   */
  async abrirCaja(abrirCajaDto: AbrirCajaDto, usuarioId: string): Promise<Caja> {
    try {
      // Verificar si el usuario ya tiene una caja abierta
      const cajaAbierta = await this.cajaRepository.findOne({
        where: { usuarioId, estado: EstadoCaja.ABIERTA },
      });

      if (cajaAbierta) {
        throw new BadRequestException(
          ERROR_MESSAGES.CAJA_ALREADY_OPEN,
          ERROR_TITLES.VALIDATION_ERROR,
        );
      }

      // Crear nueva caja
      const caja = this.cajaRepository.create({
        usuarioId,
        montoInicial: abrirCajaDto.montoInicial,
        estado: EstadoCaja.ABIERTA,
        fechaApertura: new Date(),
      });

      const cajaGuardada = await this.cajaRepository.save(caja);

      return this.findOne(cajaGuardada.id);
    } catch (error) {
      handleDBErrors(error, ERROR_MESSAGES.CAJA_NOT_OPENED);
      throw error;
    }
  }

  /**
   * Cierra la caja actual del usuario con arqueo
   */
  async cerrarCaja(cerrarCajaDto: CerrarCajaDto, usuarioId: string): Promise<Caja> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Obtener la caja abierta del usuario
      const caja = await this.cajaRepository.findOne({
        where: { usuarioId, estado: EstadoCaja.ABIERTA },
        relations: ['movimientos'],
      });

      if (!caja) {
        throw new BadRequestException(
          ERROR_MESSAGES.CAJA_NOT_OPEN,
          ERROR_TITLES.VALIDATION_ERROR,
        );
      }

      // Calcular monto esperado
      const montoEsperado = await this.calcularMontoEsperado(caja.id);

      // Calcular diferencia
      const diferencia = cerrarCajaDto.montoFinal - montoEsperado;

      // Actualizar caja
      caja.fechaCierre = new Date();
      caja.montoFinal = cerrarCajaDto.montoFinal;
      caja.montoEsperado = montoEsperado;
      caja.diferencia = diferencia;
      caja.estado = EstadoCaja.CERRADA;
      caja.observaciones = cerrarCajaDto.observaciones;

      await queryRunner.manager.save(Caja, caja);
      await queryRunner.commitTransaction();

      return this.findOne(caja.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBErrors(error, ERROR_MESSAGES.CAJA_NOT_CLOSED);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene la caja abierta del usuario actual
   */
  async getCajaActual(usuarioId: string): Promise<Caja | null> {
    try {
      const caja = await this.cajaRepository.findOne({
        where: { usuarioId, estado: EstadoCaja.ABIERTA },
        relations: ['usuario', 'movimientos'],
      });

      return caja;
    } catch (error) {
      handleDBErrors(error, ERROR_MESSAGES.CAJA_NOT_FOUND);
      throw error;
    }
  }

  /**
   * Registra un movimiento manual (retiro/depósito)
   */
  async registrarMovimiento(
    crearMovimientoDto: CrearMovimientoCajaDto,
    usuarioId: string,
  ): Promise<MovimientoCaja> {
    try {
      // Obtener la caja abierta del usuario
      const caja = await this.cajaRepository.findOne({
        where: { usuarioId, estado: EstadoCaja.ABIERTA },
      });

      if (!caja) {
        throw new BadRequestException(
          ERROR_MESSAGES.CAJA_NOT_OPEN,
          ERROR_TITLES.VALIDATION_ERROR,
        );
      }

      // Crear el movimiento
      const movimiento = this.movimientoCajaRepository.create({
        cajaId: caja.id,
        usuarioId,
        tipo: crearMovimientoDto.tipo,
        monto: crearMovimientoDto.monto,
        concepto: crearMovimientoDto.concepto,
        referenciaId: crearMovimientoDto.referenciaId,
        fecha: new Date(),
      });

      const movimientoGuardado = await this.movimientoCajaRepository.save(movimiento);

      return this.findMovimientoById(movimientoGuardado.id);
    } catch (error) {
      handleDBErrors(error, ERROR_MESSAGES.MOVIMIENTO_CAJA_NOT_CREATED);
      throw error;
    }
  }

  /**
   * Registra un movimiento de caja interno (para ventas/devoluciones)
   * Usado por otros servicios como VentasService
   */
  async registrarMovimientoInterno(
    queryRunner: QueryRunner,
    datos: {
      cajaId: string;
      usuarioId: string;
      tipo: TipoMovimientoCaja;
      monto: number;
      concepto: string;
      referenciaId?: string;
    },
  ): Promise<MovimientoCaja> {
    const movimiento = queryRunner.manager.create(MovimientoCaja, {
      cajaId: datos.cajaId,
      usuarioId: datos.usuarioId,
      tipo: datos.tipo,
      monto: datos.monto,
      concepto: datos.concepto,
      referenciaId: datos.referenciaId,
      fecha: new Date(),
    });

    return queryRunner.manager.save(MovimientoCaja, movimiento);
  }

  /**
   * Obtiene el historial de cajas cerradas con paginación
   */
  async getHistorial(
    pagination: PaginationParamsDto,
    usuarioId?: string,
  ): Promise<ApiPaginatedResponseDto<Caja>> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const whereConditions: any = { estado: EstadoCaja.CERRADA };
      if (usuarioId) {
        whereConditions.usuarioId = usuarioId;
      }

      const total = await this.cajaRepository.count({ where: whereConditions });

      const cajas = await this.cajaRepository.find({
        where: whereConditions,
        order: { fechaCierre: 'DESC' },
        skip,
        take: limit,
        relations: ['usuario'],
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
        cajas,
        meta,
        'Historial de cajas obtenido exitosamente',
        'Historial de Cajas',
      );
    } catch (error) {
      handleDBErrors(error, ERROR_MESSAGES.CAJA_NOT_FOUND);
      throw error;
    }
  }

  /**
   * Obtiene los movimientos de una caja específica
   */
  async getMovimientosByCaja(
    cajaId: string,
    pagination: PaginationParamsDto,
  ): Promise<ApiPaginatedResponseDto<MovimientoCaja>> {
    try {
      // Verificar que la caja existe
      const caja = await this.cajaRepository.findOne({ where: { id: cajaId } });
      if (!caja) {
        throw new NotFoundException(
          `Caja con ID "${cajaId}" no encontrada`,
          ERROR_TITLES.NOT_FOUND_ERROR,
        );
      }

      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const total = await this.movimientoCajaRepository.count({
        where: { cajaId },
      });

      const movimientos = await this.movimientoCajaRepository.find({
        where: { cajaId },
        order: { fecha: 'DESC' },
        skip,
        take: limit,
        relations: ['usuario'],
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
        'Movimientos obtenidos exitosamente',
        'Movimientos de Caja',
      );
    } catch (error) {
      handleDBErrors(error, ERROR_MESSAGES.MOVIMIENTOS_CAJA_NOT_FOUND);
      throw error;
    }
  }

  /**
   * Obtiene una caja por ID
   */
  async findOne(id: string): Promise<Caja> {
    const caja = await this.cajaRepository.findOne({
      where: { id },
      relations: ['usuario', 'movimientos'],
    });

    if (!caja) {
      throw new NotFoundException(
        `Caja con ID "${id}" no encontrada`,
        ERROR_TITLES.NOT_FOUND_ERROR,
      );
    }

    return caja;
  }

  /**
   * Verifica si el usuario tiene una caja abierta
   */
  async tieneCajaAbierta(usuarioId: string): Promise<boolean> {
    const caja = await this.cajaRepository.findOne({
      where: { usuarioId, estado: EstadoCaja.ABIERTA },
    });
    return !!caja;
  }

  /**
   * Obtiene la caja abierta del usuario (para uso interno)
   */
  async getCajaAbiertaByUsuario(usuarioId: string): Promise<Caja | null> {
    return this.cajaRepository.findOne({
      where: { usuarioId, estado: EstadoCaja.ABIERTA },
    });
  }

  private async findMovimientoById(id: string): Promise<MovimientoCaja> {
    const movimiento = await this.movimientoCajaRepository.findOne({
      where: { id },
      relations: ['usuario', 'caja'],
    });

    if (!movimiento) {
      throw new NotFoundException(
        `Movimiento con ID "${id}" no encontrado`,
        ERROR_TITLES.NOT_FOUND_ERROR,
      );
    }

    return movimiento;
  }

  /**
   * Calcula el monto esperado en la caja basado en movimientos
   */
  private async calcularMontoEsperado(cajaId: string): Promise<number> {
    const caja = await this.cajaRepository.findOne({
      where: { id: cajaId },
    });

    if (!caja) {
      return 0;
    }

    // Obtener todos los movimientos de la caja
    const movimientos = await this.movimientoCajaRepository.find({
      where: { cajaId },
    });

    let montoEsperado = Number(caja.montoInicial);

    for (const mov of movimientos) {
      const monto = Number(mov.monto);
      
      // Ventas y depósitos suman, devoluciones y retiros restan
      if (mov.tipo === TipoMovimientoCaja.VENTA || mov.tipo === TipoMovimientoCaja.DEPOSITO) {
        montoEsperado += monto;
      } else if (mov.tipo === TipoMovimientoCaja.DEVOLUCION || mov.tipo === TipoMovimientoCaja.RETIRO) {
        montoEsperado -= monto;
      }
    }

    return Math.round(montoEsperado * 100) / 100;
  }
}

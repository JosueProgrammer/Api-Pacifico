import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Venta } from '../common/entities/venta.entity';
import { DetalleVenta } from '../common/entities/detalle-venta.entity';
import { Producto } from '../common/entities/producto.entity';
import { Compra } from '../common/entities/compra.entity';
import { Cliente } from '../common/entities/cliente.entity';
import { Caja, EstadoCaja } from '../common/entities/caja.entity';
import { ReporteFilterDto } from './dtos/reporte-filter.dto';
import { handleDBErrors } from '../common/helpers/typeorm-helpers';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository: Repository<DetalleVenta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,
    private readonly dataSource: DataSource,
  ) { }

  async getDashboard() {
    try {
      const hoyStart = new Date();
      hoyStart.setHours(0, 0, 0, 0);
      const hoyEnd = new Date();
      hoyEnd.setHours(23, 59, 59, 999);

      // 1. Ventas de hoy
      const ventasHoyResult = await this.ventaRepository
        .createQueryBuilder('venta')
        .select('SUM(venta.total)', 'total')
        .addSelect('COUNT(venta.id)', 'cantidad')
        .where('venta.fechaVenta BETWEEN :start AND :end', {
          start: hoyStart,
          end: hoyEnd,
        })
        .andWhere('venta.estado = :estado', { estado: 'completada' })
        .getRawOne();

      // 2. Ventas del mes
      const mesStart = new Date();
      mesStart.setDate(1);
      mesStart.setHours(0, 0, 0, 0);

      const ventasMesResult = await this.ventaRepository
        .createQueryBuilder('venta')
        .select('SUM(venta.total)', 'total')
        .where('venta.fechaVenta >= :start', { start: mesStart })
        .andWhere('venta.estado = :estado', { estado: 'completada' })
        .getRawOne();

      // 3. Clientes totales
      const totalClientes = await this.clienteRepository.count({ where: { activo: true } });

      // 4. Cajas abiertas actualmente
      const cajasAbiertas = await this.cajaRepository.count({ where: { estado: EstadoCaja.ABIERTA } });

      // 5. Rendimiento de Ventas (Últimos 7 días)
      const sieteDiasAtras = new Date();
      sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 6);
      sieteDiasAtras.setHours(0, 0, 0, 0);

      const rendimientoVentas = await this.ventaRepository
        .createQueryBuilder('venta')
        .select("TO_CHAR(venta.fechaVenta, 'YYYY-MM-DD')", 'fecha')
        .addSelect('SUM(venta.total)', 'total')
        .where('venta.fechaVenta >= :start', { start: sieteDiasAtras })
        .andWhere('venta.estado = :estado', { estado: 'completada' })
        .groupBy('fecha')
        .orderBy('fecha', 'ASC')
        .getRawMany();

      // Formatear rendimiento para asegurar que aparezcan los 7 días
      const chartData: any[] = [];
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
      for (let i = 0; i < 7; i++) {
        const d = new Date(sieteDiasAtras);
        d.setDate(d.getDate() + i);
        const isoFecha = d.toISOString().split('T')[0];
        const dayMatch = rendimientoVentas.find(rv => rv.fecha === isoFecha);

        chartData.push({
          dia: dayNames[d.getDay()],
          fecha: isoFecha,
          total: Number(dayMatch?.total) || 0
        });
      }

      // 6. Alertas Críticas (Stock bajo o agotado)
      const alertasStock = await this.productoRepository
        .createQueryBuilder('producto')
        .where('producto.stock <= producto.stockMinimo')
        .andWhere('producto.activo = :activo', { activo: true })
        .orderBy('producto.stock', 'ASC')
        .limit(5)
        .getMany();

      // 7. Productos más vendidos (Top 5 hoy o histórico corto)
      const topProductos = await this.detalleVentaRepository
        .createQueryBuilder('dv')
        .select('producto.nombre', 'nombre')
        .addSelect('SUM(dv.cantidad)', 'cantidad')
        .innerJoin('dv.producto', 'producto')
        .innerJoin('dv.venta', 'venta')
        .where('venta.fechaVenta BETWEEN :start AND :end', { start: hoyStart, end: hoyEnd })
        .andWhere('venta.estado = :estado', { estado: 'completada' })
        .groupBy('producto.nombre')
        .orderBy('SUM(dv.cantidad)', 'DESC')
        .limit(3)
        .getRawMany();

      return {
        ventasHoy: Number(ventasHoyResult?.total) || 0,
        cantidadVentasHoy: Number(ventasHoyResult?.cantidad) || 0,
        ventasMes: Number(ventasMesResult?.total) || 0,
        totalClientes,
        cajasAbiertas,
        rendimientoVentas: chartData,
        alertas: alertasStock.map(p => ({
          id: p.id,
          nombre: p.nombre,
          stock: Number(p.stock),
          stockMinimo: Number(p.stockMinimo),
          tipo: p.stock <= 0 ? 'critica' : 'advertencia'
        })),
        topProductos: topProductos.map(tp => ({
          nombre: tp.nombre,
          cantidad: Number(tp.cantidad)
        }))
      };
    } catch (error) {
      handleDBErrors(error, 'Error al generar dashboard');
      throw error;
    }
  }

  async getVentasPorPeriodo(filter: ReporteFilterDto) {
    try {
      const { fechaInicio, fechaFin, agrupar = 'dia' } = filter;
      const start = fechaInicio ? new Date(fechaInicio) : new Date(new Date().getFullYear(), 0, 1);
      const end = fechaFin ? new Date(fechaFin) : new Date();
      end.setHours(23, 59, 59, 999);

      let truncFormat = 'YYYY-MM-DD';
      if (agrupar === 'mes') truncFormat = 'YYYY-MM';
      if (agrupar === 'anio') truncFormat = 'YYYY';
      if (agrupar === 'semana') truncFormat = 'IYYY-IW'; // ISO Week

      // Nota: La sintaxis de TO_CHAR depende de PostgreSQL. Ajustar si es otro motor.
      const query = this.ventaRepository
        .createQueryBuilder('venta')
        .select(`TO_CHAR(venta.fechaVenta, '${truncFormat}')`, 'periodo')
        .addSelect('SUM(venta.total)', 'totalVentas')
        .addSelect('COUNT(venta.id)', 'cantidadVentas')
        .where('venta.fechaVenta BETWEEN :start AND :end', { start, end })
        .andWhere('venta.estado = :estado', { estado: 'completada' })
        .groupBy('periodo')
        .orderBy('periodo', 'ASC');

      const result = await query.getRawMany();

      return result.map(item => ({
        periodo: item.periodo,
        totalVentas: Number(item.totalVentas),
        cantidadVentas: Number(item.cantidadVentas),
      }));
    } catch (error) {
      handleDBErrors(error, 'Error al obtener ventas por periodo');
      throw error;
    }
  }

  async getProductosMasVendidos(filter: ReporteFilterDto) {
    try {
      const { fechaInicio, fechaFin, limit = 10 } = filter;
      const start = fechaInicio ? new Date(fechaInicio) : new Date(new Date().getFullYear(), 0, 1);
      const end = fechaFin ? new Date(fechaFin) : new Date();
      end.setHours(23, 59, 59, 999);

      const result = await this.detalleVentaRepository
        .createQueryBuilder('dv')
        .select('dv.productoId', 'productoId')
        .addSelect('producto.nombre', 'nombre')
        .addSelect('SUM(dv.cantidad)', 'cantidadVendida')
        .addSelect('SUM(dv.subtotal)', 'totalVentas')
        .innerJoin('dv.producto', 'producto')
        .innerJoin('dv.venta', 'venta')
        .where('venta.fechaVenta BETWEEN :start AND :end', { start, end })
        .andWhere('venta.estado = :estado', { estado: 'completada' })
        .groupBy('dv.productoId')
        .addGroupBy('producto.nombre')
        .orderBy('SUM(dv.cantidad)', 'DESC')
        .limit(limit)
        .getRawMany();

      // Calcular porcentaje del total
      const totalVentasPeriodo = result.reduce((sum, item) => sum + Number(item.totalVentas), 0);

      return result.map(item => ({
        productoId: item.productoId,
        nombre: item.nombre,
        cantidadVendida: Number(item.cantidadVendida),
        totalVentas: Number(item.totalVentas),
        porcentajeVentas: totalVentasPeriodo > 0
          ? Number(((Number(item.totalVentas) / totalVentasPeriodo) * 100).toFixed(2))
          : 0,
      }));
    } catch (error) {
      handleDBErrors(error, 'Error al obtener productos más vendidos');
      throw error;
    }
  }

  async getVentasPorCategoria(filter: ReporteFilterDto) {
    try {
      const { fechaInicio, fechaFin } = filter;
      const start = fechaInicio ? new Date(fechaInicio) : new Date(new Date().getFullYear(), 0, 1);
      const end = fechaFin ? new Date(fechaFin) : new Date();
      end.setHours(23, 59, 59, 999);

      const result = await this.detalleVentaRepository
        .createQueryBuilder('dv')
        .select('categoria.nombre', 'categoria')
        .addSelect('SUM(dv.subtotal)', 'totalVentas')
        .addSelect('COUNT(DISTINCT dv.ventaId)', 'cantidadVentas') // Aproximado
        .innerJoin('dv.producto', 'producto')
        .innerJoin('producto.categoria', 'categoria')
        .innerJoin('dv.venta', 'venta')
        .where('venta.fechaVenta BETWEEN :start AND :end', { start, end })
        .andWhere('venta.estado = :estado', { estado: 'completada' })
        .groupBy('categoria.nombre')
        .orderBy('SUM(dv.subtotal)', 'DESC')
        .getRawMany();

      const totalGeneral = result.reduce((sum, item) => sum + Number(item.totalVentas), 0);

      return result.map(item => ({
        categoria: item.categoria,
        totalVentas: Number(item.totalVentas),
        porcentaje: totalGeneral > 0
          ? Number(((Number(item.totalVentas) / totalGeneral) * 100).toFixed(2))
          : 0,
      }));
    } catch (error) {
      handleDBErrors(error, 'Error al obtener ventas por categoría');
      throw error;
    }
  }

  async getMargenGanancia(filter: ReporteFilterDto) {
    try {
      const { fechaInicio, fechaFin } = filter;
      const start = fechaInicio ? new Date(fechaInicio) : new Date(new Date().getFullYear(), 0, 1);
      const end = fechaFin ? new Date(fechaFin) : new Date();
      end.setHours(23, 59, 59, 999);

      // 1. Calcular ingresos totales (Ventas)
      const ingresosResult = await this.ventaRepository
        .createQueryBuilder('venta')
        .select('SUM(venta.subtotal)', 'ingresos') // Usamos subtotal sin impuestos para margen real
        .where('venta.fechaVenta BETWEEN :start AND :end', { start, end })
        .andWhere('venta.estado = :estado', { estado: 'completada' })
        .getRawOne();

      const ingresosTotales = Number(ingresosResult?.ingresos) || 0;

      // 2. Calcular costos de los productos vendidos
      // Esto es complejo sin un histórico de costos exacto por lote.
      // Usaremos el costo promedio actual del producto como aproximación.
      const costosResult = await this.detalleVentaRepository
        .createQueryBuilder('dv')
        .select('SUM(dv.cantidad * producto.precioCompra)', 'costos')
        .innerJoin('dv.producto', 'producto')
        .innerJoin('dv.venta', 'venta')
        .where('venta.fechaVenta BETWEEN :start AND :end', { start, end })
        .andWhere('venta.estado = :estado', { estado: 'completada' })
        .getRawOne();

      const costoProductos = Number(costosResult?.costos) || 0;

      const margenBruto = ingresosTotales - costoProductos;
      const porcentajeMargen = ingresosTotales > 0
        ? (margenBruto / ingresosTotales) * 100
        : 0;

      return {
        ingresosTotales,
        costoProductos,
        margenBruto,
        porcentajeMargen: Number(porcentajeMargen.toFixed(2)),
      };
    } catch (error) {
      handleDBErrors(error, 'Error al calcular margen de ganancia');
      throw error;
    }
  }

  async getComparativa(filter: ReporteFilterDto) {
    try {
      // Por defecto comparar mes actual vs mes anterior si no se especifica
      const periodo = filter.agrupar || 'mes';
      const hoy = new Date();

      let currentStart: Date, currentEnd: Date;
      let prevStart: Date, prevEnd: Date;

      if (periodo === 'mes') {
        // Mes actual
        currentStart = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        currentEnd = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);

        // Mes anterior
        prevStart = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        prevEnd = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59, 999);
      } else {
        // Semana actual vs anterior (simplificado)
        // ... (implementación adicional si se requiere)
        // Por ahora default a mes
        currentStart = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        currentEnd = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
        prevStart = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        prevEnd = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59, 999);
      }

      const getMetricas = async (start: Date, end: Date) => {
        const ventas = await this.ventaRepository
          .createQueryBuilder('venta')
          .select('SUM(venta.total)', 'total')
          .addSelect('COUNT(venta.id)', 'cantidad')
          .where('venta.fechaVenta BETWEEN :start AND :end', { start, end })
          .andWhere('venta.estado = :estado', { estado: 'completada' })
          .getRawOne();

        return {
          total: Number(ventas?.total) || 0,
          cantidad: Number(ventas?.cantidad) || 0,
        };
      };

      const actual = await getMetricas(currentStart, currentEnd);
      const anterior = await getMetricas(prevStart, prevEnd);

      const variacionDinero = anterior.total > 0
        ? ((actual.total - anterior.total) / anterior.total) * 100
        : 100;

      const variacionCantidad = anterior.cantidad > 0
        ? ((actual.cantidad - anterior.cantidad) / anterior.cantidad) * 100
        : 100;

      return {
        periodoActual: {
          inicio: currentStart.toISOString(),
          fin: currentEnd.toISOString(),
          ...actual
        },
        periodoAnterior: {
          inicio: prevStart.toISOString(),
          fin: prevEnd.toISOString(),
          ...anterior
        },
        variacion: {
          dinero: Number(variacionDinero.toFixed(2)),
          cantidad: Number(variacionCantidad.toFixed(2))
        }
      };

    } catch (error) {
      handleDBErrors(error, 'Error al generar comparativa');
      throw error;
    }
  }
}

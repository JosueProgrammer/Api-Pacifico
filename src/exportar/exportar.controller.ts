import { Controller, Get, Query, Res, Param, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Venta } from '../common/entities/venta.entity';
import { Compra } from '../common/entities/compra.entity';
import { Producto } from '../common/entities/producto.entity';
import { PdfService } from './services/pdf.service';
import { ExcelService } from './services/excel.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-rol.enum';

@Controller('exportar')
export class ExportarController {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly pdfService: PdfService,
    private readonly excelService: ExcelService,
  ) {}

  @Get('ventas/excel')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  async exportarVentasExcel(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Res() res: Response,
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException('Fechas requeridas');
    }

    const ventas = await this.ventaRepository.find({
      where: {
        fechaVenta: Between(new Date(fechaInicio), new Date(new Date(fechaFin).setHours(23, 59, 59))),
      },
      relations: ['cliente', 'usuario'],
      order: { fechaVenta: 'DESC' },
    });

    const buffer = await this.excelService.generarReporteVentas(ventas, fechaInicio, fechaFin);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=ventas-${fechaInicio}-al-${fechaFin}.xlsx`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get('ventas/pdf')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  async exportarVentasPdf(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Res() res: Response,
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException('Fechas requeridas');
    }

    const ventas = await this.ventaRepository.find({
      where: {
        fechaVenta: Between(new Date(fechaInicio), new Date(new Date(fechaFin).setHours(23, 59, 59))),
      },
      relations: ['cliente', 'usuario'],
      order: { fechaVenta: 'DESC' },
    });

    const buffer = await this.pdfService.generarReporteVentas(ventas, fechaInicio, fechaFin);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ventas-${fechaInicio}-al-${fechaFin}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get('compras/excel')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  async exportarComprasExcel(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Res() res: Response,
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException('Fechas requeridas');
    }

    const compras = await this.compraRepository.find({
      where: {
        fechaCompra: Between(new Date(fechaInicio), new Date(new Date(fechaFin).setHours(23, 59, 59))),
      },
      relations: ['proveedor', 'usuario'],
      order: { fechaCompra: 'DESC' },
    });

    const buffer = await this.excelService.generarReporteCompras(compras, fechaInicio, fechaFin);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=compras-${fechaInicio}-al-${fechaFin}.xlsx`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get('compras/pdf')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  async exportarComprasPdf(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Res() res: Response,
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException('Fechas requeridas');
    }

    const compras = await this.compraRepository.find({
      where: {
        fechaCompra: Between(new Date(fechaInicio), new Date(new Date(fechaFin).setHours(23, 59, 59))),
      },
      relations: ['proveedor', 'usuario'],
      order: { fechaCompra: 'DESC' },
    });

    const buffer = await this.pdfService.generarReporteCompras(compras, fechaInicio, fechaFin);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=compras-${fechaInicio}-al-${fechaFin}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get('inventario/excel')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  async exportarInventarioExcel(@Res() res: Response) {
    const productos = await this.productoRepository.find({
      relations: ['categoria', 'unidadMedida'],
      order: { nombre: 'ASC' },
    });

    const buffer = await this.excelService.generarInventario(productos);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=inventario-${new Date().toISOString().split('T')[0]}.xlsx`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get('inventario/pdf')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  async exportarInventarioPdf(@Res() res: Response) {
    const productos = await this.productoRepository.find({
      relations: ['categoria', 'unidadMedida'],
      order: { nombre: 'ASC' },
    });

    const buffer = await this.pdfService.generarInventario(productos);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=inventario-${new Date().toISOString().split('T')[0]}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get('productos-stock-bajo/excel')
  @Roles(UserRole.ADMINISTRADOR, UserRole.SUPERVISOR)
  async exportarStockBajoExcel(@Res() res: Response) {
    // Buscar productos donde stock <= stockMinimo
    // TypeORM QueryBuilder es mejor para comparar columnas
    const productos = await this.productoRepository.createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .leftJoinAndSelect('producto.unidadMedida', 'unidadMedida')
      .where('producto.stock <= producto.stockMinimo')
      .getMany();

    const buffer = await this.excelService.generarReporteStockBajo(productos);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=stock-bajo-${new Date().toISOString().split('T')[0]}.xlsx`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  @Get('ventas/:id/factura/pdf')
  async exportarFacturaPdf(@Param('id') id: string, @Res() res: Response) {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['cliente', 'detalleVentas', 'detalleVentas.producto'],
    });

    if (!venta) {
      throw new BadRequestException('Venta no encontrada');
    }

    const buffer = await this.pdfService.generarFactura(venta);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=factura-${venta.numeroFactura}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}

import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Venta } from '../../common/entities/venta.entity';
import { Compra } from '../../common/entities/compra.entity';
import { Producto } from '../../common/entities/producto.entity';

@Injectable()
export class ExcelService {
  
  constructor() {}

  async generarReporteVentas(ventas: Venta[], fechaInicio: string, fechaFin: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ventas');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Factura', key: 'factura', width: 20 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Descuento', key: 'descuento', width: 15 },
      { header: 'Impuesto', key: 'impuesto', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    ventas.forEach((venta) => {
      worksheet.addRow({
        fecha: venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleDateString() : '-',
        factura: venta.numeroFactura,
        cliente: venta.cliente ? venta.cliente.nombre : 'Cliente General',
        estado: venta.estado,
        subtotal: Number(venta.subtotal),
        descuento: Number(venta.descuento),
        impuesto: Number(venta.impuesto),
        total: Number(venta.total),
      });
    });

    // Style header
    worksheet.getRow(1).font = { bold: true };
    
    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async generarReporteCompras(compras: Compra[], fechaInicio: string, fechaFin: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Compras');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Factura', key: 'factura', width: 20 },
      { header: 'Proveedor', key: 'proveedor', width: 30 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Impuesto', key: 'impuesto', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    compras.forEach((compra) => {
      worksheet.addRow({
        fecha: compra.fechaCompra ? new Date(compra.fechaCompra).toLocaleDateString() : '-',
        factura: compra.numeroFactura || '-',
        proveedor: compra.proveedor ? compra.proveedor.nombre : 'N/A',
        estado: compra.estado,
        subtotal: Number(compra.subtotal),
        impuesto: Number(compra.impuesto),
        total: Number(compra.total),
      });
    });

    worksheet.getRow(1).font = { bold: true };

    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async generarInventario(productos: Producto[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario');

    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Producto', key: 'nombre', width: 40 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Unidad', key: 'unidad', width: 15 },
      { header: 'Precio Venta', key: 'precioVenta', width: 15 },
      { header: 'Precio Compra', key: 'precioCompra', width: 15 },
      { header: 'Stock Actual', key: 'stock', width: 15 },
      { header: 'Stock Mínimo', key: 'stockMin', width: 15 },
      { header: 'Valor Inventario', key: 'valor', width: 20 },
    ];

    productos.forEach((prod) => {
      worksheet.addRow({
        codigo: prod.codigoBarras || '-',
        nombre: prod.nombre,
        categoria: prod.categoria ? prod.categoria.nombre : 'Sin Categoría',
        unidad: prod.unidadMedida ? prod.unidadMedida.nombre : '-',
        precioVenta: Number(prod.precioVenta),
        precioCompra: Number(prod.precioCompra || 0),
        stock: Number(prod.stock),
        stockMin: Number(prod.stockMinimo),
        valor: Number(prod.precioVenta) * Number(prod.stock),
      });
    });

    worksheet.getRow(1).font = { bold: true };

    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async generarReporteStockBajo(productos: Producto[]): Promise<Buffer> {
     const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Stock Bajo');

    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Producto', key: 'nombre', width: 40 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Stock Actual', key: 'stock', width: 15 },
      { header: 'Stock Mínimo', key: 'stockMin', width: 15 },
      { header: 'Déficit', key: 'deficit', width: 15 },
    ];

    productos.forEach((prod) => {
      worksheet.addRow({
        codigo: prod.codigoBarras || '-',
        nombre: prod.nombre,
        categoria: prod.categoria ? prod.categoria.nombre : 'Sin Categoría',
        stock: Number(prod.stock),
        stockMin: Number(prod.stockMinimo),
        deficit: Number(prod.stockMinimo) - Number(prod.stock),
      });
    });

    worksheet.getRow(1).font = { bold: true };

    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }
}

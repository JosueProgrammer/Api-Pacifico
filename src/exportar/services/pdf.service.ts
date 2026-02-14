import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Venta } from '../../common/entities/venta.entity';
import { Compra } from '../../common/entities/compra.entity';
import { Producto } from '../../common/entities/producto.entity';
import { Response } from 'express';

@Injectable()
export class PdfService {
  
  constructor() {}

  async generarReporteVentas(ventas: Venta[], fechaInicio: string, fechaFin: string): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));

    // Header
    doc.fontSize(20).text('Reporte de Ventas', { align: 'center' });
    doc.fontSize(12).text(`Desde: ${fechaInicio} - Hasta: ${fechaFin}`, { align: 'center' });
    doc.moveDown();

    // Table Header
    const tableTop = 150;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 280;
    const priceX = 350;
    const totalX = 450;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Fecha', itemCodeX, tableTop);
    doc.text('Factura', descriptionX, tableTop);
    doc.text('Cliente', quantityX, tableTop);
    doc.text('Estado', priceX, tableTop);
    doc.text('Total', totalX, tableTop);

    doc.moveTo(itemCodeX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;
    let totalVentas = 0;

    doc.font('Helvetica');
    ventas.forEach((venta) => {
        if (y > 700) {
            doc.addPage();
            y = 50;
        }

        doc.text(venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleDateString() : '-', itemCodeX, y);
        doc.text(venta.numeroFactura, descriptionX, y);
        doc.text(venta.cliente ? venta.cliente.nombre : 'Cliente General', quantityX, y, { width: 60, ellipsis: true });
        doc.text(venta.estado, priceX, y);
        doc.text(`$${Number(venta.total).toFixed(2)}`, totalX, y);

        totalVentas += Number(venta.total);
        y += 20;
    });

    doc.moveDown();
    doc.font('Helvetica-Bold').text(`Total Ventas: $${totalVentas.toFixed(2)}`, totalX - 50, y + 20);

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }

  async generarReporteCompras(compras: Compra[], fechaInicio: string, fechaFin: string): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));

    // Header
    doc.fontSize(20).text('Reporte de Compras', { align: 'center' });
    doc.fontSize(12).text(`Desde: ${fechaInicio} - Hasta: ${fechaFin}`, { align: 'center' });
    doc.moveDown();

    // Table Header
    const tableTop = 150;
    const dateX = 50;
    const invoiceX = 150;
    const supplierX = 250;
    const statusX = 380;
    const totalX = 480;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Fecha', dateX, tableTop);
    doc.text('Factura', invoiceX, tableTop);
    doc.text('Proveedor', supplierX, tableTop);
    doc.text('Estado', statusX, tableTop);
    doc.text('Total', totalX, tableTop);

    doc.moveTo(dateX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;
    let totalCompras = 0;

    doc.font('Helvetica');
    compras.forEach((compra) => {
        if (y > 700) {
            doc.addPage();
            y = 50;
        }

        doc.text(compra.fechaCompra ? new Date(compra.fechaCompra).toLocaleDateString() : '-', dateX, y);
        doc.text(compra.numeroFactura || '-', invoiceX, y);
        doc.text(compra.proveedor ? compra.proveedor.nombre : 'N/A', supplierX, y, { width: 120, ellipsis: true });
        doc.text(compra.estado, statusX, y);
        doc.text(`$${Number(compra.total).toFixed(2)}`, totalX, y);

        totalCompras += Number(compra.total);
        y += 20;
    });

    doc.moveDown();
    doc.font('Helvetica-Bold').text(`Total Compras: $${totalCompras.toFixed(2)}`, totalX - 50, y + 20);

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  }

  async generarInventario(productos: Producto[]): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));

    doc.fontSize(20).text('Reporte de Inventario Actual', { align: 'center' });
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    const tableTop = 100;
    const codeX = 30;
    const nameX = 100;
    const categoryX = 300;
    const priceX = 450;
    const stockX = 550;
    const valueX = 650;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Código', codeX, tableTop);
    doc.text('Producto', nameX, tableTop);
    doc.text('Categoría', categoryX, tableTop);
    doc.text('Precio', priceX, tableTop);
    doc.text('Stock', stockX, tableTop);
    doc.text('Valor Total', valueX, tableTop);

    doc.moveTo(codeX, tableTop + 15).lineTo(750, tableTop + 15).stroke();

    let y = tableTop + 25;
    let valorTotalInventario = 0;

    doc.font('Helvetica');
    productos.forEach((prod) => {
        if (y > 500) {
            doc.addPage();
            y = 50;
        }

        const valor = Number(prod.precioVenta) * Number(prod.stock);
        valorTotalInventario += valor;

        doc.text(prod.codigoBarras || '-', codeX, y, { width: 60, ellipsis: true });
        doc.text(prod.nombre, nameX, y, { width: 190, ellipsis: true });
        doc.text(prod.categoria ? prod.categoria.nombre : 'Sin Categoría', categoryX, y, { width: 140, ellipsis: true });
        doc.text(`$${Number(prod.precioVenta).toFixed(2)}`, priceX, y);
        doc.text(Number(prod.stock).toFixed(2), stockX, y);
        doc.text(`$${valor.toFixed(2)}`, valueX, y);

        y += 20;
    });

    doc.moveDown();
    doc.font('Helvetica-Bold').text(`Valor Total Inventario: $${valorTotalInventario.toFixed(2)}`, valueX - 50, y + 20);

    doc.end();

    return new Promise((resolve) => {
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });
    });
  }

  async generarFactura(venta: Venta): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));

    // Factura Header
    doc.fontSize(20).text('Factura de Venta', { align: 'right' });
    doc.fontSize(10).text(`Fecha: ${new Date(venta.fechaVenta).toLocaleString()}`, { align: 'right' });
    doc.text(`Factura #: ${venta.numeroFactura}`, { align: 'right' });

    doc.moveDown();
    doc.fontSize(12).text('Datos del Cliente:', { underline: true });
    doc.fontSize(10).text(`Nombre: ${venta.cliente ? venta.cliente.nombre : 'Cliente General'}`);
    if (venta.cliente && venta.cliente.telefono) doc.text(`Teléfono: ${venta.cliente.telefono}`);
    if (venta.cliente && venta.cliente.correo) doc.text(`Email: ${venta.cliente.correo}`);

    doc.moveDown();

    // Items Table
    const tableTop = 200;
    const itemX = 50;
    const qtyX = 300;
    const priceX = 380;
    const totalX = 480;

    doc.font('Helvetica-Bold');
    doc.text('Producto', itemX, tableTop);
    doc.text('Cant.', qtyX, tableTop);
    doc.text('Precio', priceX, tableTop);
    doc.text('Total', totalX, tableTop);

    doc.moveTo(itemX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;
    doc.font('Helvetica');

    venta.detalleVentas.forEach((detalle) => {
        doc.text(detalle.producto ? detalle.producto.nombre : 'Producto Eliminado', itemX, y, { width: 240, ellipsis: true });
        doc.text(Number(detalle.cantidad).toString(), qtyX, y);
        doc.text(`$${Number(detalle.precioUnitario).toFixed(2)}`, priceX, y);
        doc.text(`$${Number(detalle.subtotal).toFixed(2)}`, totalX, y);
        y += 20;
    });

    doc.moveTo(itemX, y + 10).lineTo(550, y + 10).stroke();
    y += 20;

    doc.font('Helvetica-Bold');
    doc.text(`Subtotal: $${Number(venta.subtotal).toFixed(2)}`, 350, y, { align: 'right' });
    y += 15;
    if (Number(venta.descuento) > 0) {
        doc.text(`Descuento: -$${Number(venta.descuento).toFixed(2)}`, 350, y, { align: 'right' });
        y += 15;
    }
    if (Number(venta.impuesto) > 0) {
        doc.text(`Impuesto: $${Number(venta.impuesto).toFixed(2)}`, 350, y, { align: 'right' });
        y += 15;
    }
    doc.fontSize(14).text(`Total: $${Number(venta.total).toFixed(2)}`, 350, y, { align: 'right' });

    doc.end();

    return new Promise((resolve) => {
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });
    });
  }
}

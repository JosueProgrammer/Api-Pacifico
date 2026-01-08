import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Usuario,
  Rol,
  Categoria,
  Producto,
  Cliente,
  Venta,
  DetalleVenta,
  Proveedor,
  Compra,
  DetalleCompra,
  Inventario,
  Almacen,
  MetodoPago,
  Descuento,
  Configuracion,
  LogActividad,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Rol,
      Categoria,
      Producto,
      Cliente,
      Venta,
      DetalleVenta,
      Proveedor,
      Compra,
      DetalleCompra,
      Inventario,
      Almacen,
      MetodoPago,
      Descuento,
      Configuracion,
      LogActividad,
    ]),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class CommonModule {}

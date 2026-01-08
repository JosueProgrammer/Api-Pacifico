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
  MetodoPago,
  Descuento,
  Configuracion,
} from './entities';
import { PasswordResetService } from './services/password-reset.service';

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
      MetodoPago,
      Descuento,
      Configuracion,
    ]),
  ],
  providers: [PasswordResetService],
  exports: [TypeOrmModule, PasswordResetService],
})
export class CommonModule {}

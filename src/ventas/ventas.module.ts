import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { Venta } from '../common/entities/venta.entity';
import { DetalleVenta } from '../common/entities/detalle-venta.entity';
import { Producto } from '../common/entities/producto.entity';
import { Cliente } from '../common/entities/cliente.entity';
import { MetodoPago } from '../common/entities/metodo-pago.entity';
import { DescuentosModule } from '../descuentos/descuentos.module';
import { InventarioModule } from '../inventario/inventario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, DetalleVenta, Producto, Cliente, MetodoPago]),
    DescuentosModule,
    InventarioModule,
  ],
  controllers: [VentasController],
  providers: [VentasService],
  exports: [VentasService],
})
export class VentasModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevolucionesService } from './devoluciones.service';
import { DevolucionesController } from './devoluciones.controller';
import { Devolucion } from '../common/entities/devolucion.entity';
import { DetalleDevolucion } from '../common/entities/detalle-devolucion.entity';
import { Venta } from '../common/entities/venta.entity';
import { DetalleVenta } from '../common/entities/detalle-venta.entity';
import { Producto } from '../common/entities/producto.entity';
import { InventarioModule } from '../inventario/inventario.module';
import { CajaModule } from '../caja/caja.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Devolucion,
      DetalleDevolucion,
      Venta,
      DetalleVenta,
      Producto,
    ]),
    InventarioModule,
    CajaModule,
  ],
  controllers: [DevolucionesController],
  providers: [DevolucionesService],
  exports: [DevolucionesService],
})
export class DevolucionesModule {}

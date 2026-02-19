import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { Compra } from '../common/entities/compra.entity';
import { DetalleCompra } from '../common/entities/detalle-compra.entity';
import { Producto } from '../common/entities/producto.entity';
import { Proveedor } from '../common/entities/proveedor.entity';
import { InventarioModule } from '../inventario/inventario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Compra, DetalleCompra, Producto, Proveedor]),
    InventarioModule,
  ],
  controllers: [ComprasController],
  providers: [ComprasService],
  exports: [ComprasService],
})
export class ComprasModule { }

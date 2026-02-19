import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Venta } from '../common/entities/venta.entity';
import { DetalleVenta } from '../common/entities/detalle-venta.entity';
import { Producto } from '../common/entities/producto.entity';
import { Compra } from '../common/entities/compra.entity';
import { AuthModule } from '../auth/auth.module';
import { Usuario } from '../common/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta,
      DetalleVenta,
      Producto,
      Compra,
      Usuario,
    ]),
    AuthModule,
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}

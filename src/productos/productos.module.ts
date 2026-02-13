import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from '../common/entities/producto.entity';
import { Categoria } from '../common/entities/categoria.entity';
import { Proveedor } from '../common/entities/proveedor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria, Proveedor])],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService],
})
export class ProductosModule { }


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';
import { Alerta } from '../common/entities/alerta.entity';
import { Producto } from '../common/entities/producto.entity';
import { AuthModule } from '../auth/auth.module';
import { Usuario } from '../common/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Alerta,
      Producto,
      Usuario,
    ]),
    AuthModule,
  ],
  controllers: [AlertasController],
  providers: [AlertasService],
  exports: [AlertasService],
})
export class AlertasModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReparacionesService } from './reparaciones.service';
import { ReparacionesController } from './reparaciones.controller';
import { Reparacion } from '../common/entities/reparacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reparacion])],
  controllers: [ReparacionesController],
  providers: [ReparacionesService],
})
export class ReparacionesModule {}

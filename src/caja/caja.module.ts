import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CajaService } from './caja.service';
import { CajaController } from './caja.controller';
import { Caja } from '../common/entities/caja.entity';
import { MovimientoCaja } from '../common/entities/movimiento-caja.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Caja, MovimientoCaja]),
  ],
  controllers: [CajaController],
  providers: [CajaService],
  exports: [CajaService],
})
export class CajaModule {}

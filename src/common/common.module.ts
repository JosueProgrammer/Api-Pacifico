import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
//import { Usuario } from './entities/usuario.entity';
//import { Rol } from './entities/rol.entity';

@Module({
  imports: [
   // TypeOrmModule.forFeature([Usuario, Rol]),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class CommonModule {}

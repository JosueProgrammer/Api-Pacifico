import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Usuario } from '../common/entities/usuario.entity';
import { Rol } from '../common/entities/rol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

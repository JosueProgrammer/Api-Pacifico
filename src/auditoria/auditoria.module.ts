import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { AuditLog } from '../common/entities/audit-log.entity';
import { AuditSubscriber } from '../common/subscribers/audit.subscriber';
import { AuthModule } from '../auth/auth.module';
import { Usuario } from '../common/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, Usuario]),
    AuthModule,
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService, AuditSubscriber],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}

import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

type DatabaseType = 'postgres' | 'mysql' | 'mariadb';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: (configService.get<string>('TYPE') || 'postgres') as DatabaseType,
  url: configService.get<string>('POSTGRES_URL'),
  ssl: { rejectUnauthorized: false },
  // Schema para el sistema de horarios
  schema: 'sistema_horarios',
  logging: configService.get<string>('NODE_ENV') !== 'production',
  entities: [__dirname + '/../../**/*.entity.{js,ts}'],
  autoLoadEntities: true,
  synchronize: configService.get<boolean>('SYNCHRONIZE') || false,
});


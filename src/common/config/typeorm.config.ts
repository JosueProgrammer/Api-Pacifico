import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

type DatabaseType = 'postgres' | 'mysql' | 'mariadb';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: (configService.get<string>('TYPE') || 'postgres') as DatabaseType,
  url: configService.get<string>('POSTGRES_URL'),
  ssl: { rejectUnauthorized: false },
  // Schema para API Pacifico
  schema: 'api_pacifico',
  logging: configService.get<string>('NODE_ENV') !== 'production',
  entities: [__dirname + '/../../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/../../migrations/**/*.ts'],
  autoLoadEntities: true,
  synchronize: configService.get<boolean>('SYNCHRONIZE') || false,
});


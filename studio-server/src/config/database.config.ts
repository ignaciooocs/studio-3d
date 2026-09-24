import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
  const isProd = nodeEnv === 'production';

  // En desarrollo queremos que el esquema se sincronice automáticamente
  // para que se creen las tablas (como meshy_tasks) al arrancar.
  const synchronize =
    isProd === true ? false : true; // siempre true en dev/test, false en prod

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize,
    logging: configService.get<boolean>('DB_LOGGING'),
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsRun: false,
    autoLoadEntities: true,
  };
};

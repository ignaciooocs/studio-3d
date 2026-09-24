import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MeshyModule } from './meshy/meshy.module';
import { validationSchema } from './config/validation.schema';
import { getDatabaseConfig } from './config/database.config';
import meshyConfig from './config/meshy.config';

@Module({
  imports: [
    // ConfigModule con validación Joi
    ConfigModule.forRoot({
      isGlobal: true,
      load: [meshyConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    // TypeORM con configuración dinámica
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    // Módulo Meshy
    MeshyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

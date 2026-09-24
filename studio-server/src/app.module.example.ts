import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validationSchema } from './config/validation.schema';
import { getDatabaseConfig } from './config/database.config';
import meshyConfig from './config/meshy.config';
// import { MeshyModule } from './meshy/meshy.module'; // Descomentar cuando se cree

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
    // MeshyModule, // Descomentar cuando se cree
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

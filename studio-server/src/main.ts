import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  // Deshabilitar bodyParser automático para configurarlo manualmente con límite mayor
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // Configurar límite de tamaño del body (para imágenes en base64)
  // Por defecto es 100KB, aumentamos a 10MB para permitir imágenes más grandes
  const express = require('express');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Configurar CORS
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (ej: Postman, mobile apps)
      if (!origin) {
        return callback(null, true);
      }
      // En desarrollo, permitir todos los orígenes locales
      if (process.env.NODE_ENV === 'development') {
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
      }
      // Verificar si el origen está en la lista permitida
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('No permitido por CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar filtro global de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Studio 3D API')
    .setDescription(
      'API para la gestión de modelos 3D usando Meshy.ai. Permite convertir imágenes a modelos 3D y gestionar las tareas de generación.',
    )
    .setVersion('1.0')
    .addTag('meshy', 'Endpoints para integración con Meshy.ai')
    .addTag('health', 'Endpoints de salud del servidor')
    .addBearerAuth()
    .build();

  // Casts a any para evitar conflicto de tipos entre versiones de Nest en @nestjs/swagger y la app
  const document = SwaggerModule.createDocument(app as any, config);
  SwaggerModule.setup('api', app as any, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📚 Swagger disponible en http://localhost:${port}/api`);
}
bootstrap();

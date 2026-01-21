import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

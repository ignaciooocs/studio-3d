# Plan de Integración - API Meshy.ai

## 📋 Resumen Ejecutivo

Este documento describe el plan de integración de la API de Meshy.ai para la funcionalidad de **imagen a modelo 3D** en el backend `studio-server`. El objetivo es crear un módulo NestJS que actúe como capa de abstracción sobre la API de Meshy, proporcionando endpoints propios y lógica de negocio personalizada.

---

## 🎯 Objetivos

1. **Crear módulo Meshy** en NestJS con endpoints propios
2. **Abstraer la comunicación** con la API de Meshy.ai
3. **Implementar lógica de negocio** personalizada (validaciones, transformaciones, etc.)
4. **Gestionar el ciclo de vida** de las tareas de generación (creación, seguimiento, descarga)
5. **Preparar la base** para futuras integraciones de otras APIs de Meshy

---

## 🏗️ Arquitectura del Módulo

### Estructura de Directorios

```
studio-server/src/
├── meshy/
│   ├── meshy.module.ts          # Módulo principal
│   ├── meshy.controller.ts      # Endpoints REST
│   ├── meshy.service.ts         # Lógica de negocio
│   ├── meshy-client.service.ts  # Cliente HTTP para Meshy API
│   ├── repositories/
│   │   └── meshy-task.repository.ts # Repository pattern
│   ├── dto/
│   │   ├── create-image-to-3d.dto.ts
│   │   ├── task-status.dto.ts
│   │   └── meshy-response.dto.ts
│   ├── entities/
│   │   └── meshy-task.entity.ts # Entidad TypeORM
│   ├── interfaces/
│   │   ├── meshy-api.interface.ts
│   │   └── meshy-config.interface.ts
│   ├── enums/
│   │   ├── task-status.enum.ts
│   │   └── model-format.enum.ts
│   └── meshy.controller.spec.ts
├── config/
│   ├── database.config.ts        # Configuración de TypeORM
│   ├── meshy.config.ts          # Configuración del módulo Meshy
│   └── validation.schema.ts     # Esquema Joi para validación
└── database/
    └── migrations/              # Migraciones de TypeORM (futuro)
```

---

## 📦 Dependencias Necesarias

### Producción
- `@nestjs/axios` - Cliente HTTP para llamadas a Meshy API
- `@nestjs/config` - Gestión de variables de entorno
- `@nestjs/typeorm` - Integración de TypeORM con NestJS
- `typeorm` - ORM para base de datos
- `pg` - Driver de PostgreSQL
- `class-validator` - Validación de DTOs
- `class-transformer` - Transformación de objetos
- `joi` - Validación de esquemas de configuración
- `dotenv` - Carga de variables de entorno

### Desarrollo
- `@types/pg` - Tipos de TypeScript para PostgreSQL

### Instalación
```bash
pnpm add @nestjs/axios @nestjs/config @nestjs/typeorm typeorm pg class-validator class-transformer joi dotenv
pnpm add -D @types/pg @types/node
```

---

## 🔌 Endpoints Propios

### 1. POST `/meshy/image-to-3d`
**Descripción:** Inicia una tarea de conversión de imagen a modelo 3D

**Request Body:**
```typescript
{
  imageUrl?: string;           // URL pública de la imagen
  imageBase64?: string;        // Imagen en base64
  modelType?: 'standard' | 'premium';
  targetPolycount?: number;    // 1000-50000
  shouldTexture?: boolean;      // Aplicar texturas
  shouldRemesh?: boolean;      // Remallado
  symmetry?: 'none' | 'x' | 'y' | 'z';
  moderation?: boolean;         // Moderación de contenido
}
```

**Response:**
```typescript
{
  taskId: string;              // ID interno de la tarea
  meshyTaskId: string;         // ID de la tarea en Meshy
  status: 'PENDING';
  createdAt: string;
}
```

### 2. GET `/meshy/task/:taskId`
**Descripción:** Consulta el estado de una tarea

**Response:**
```typescript
{
  taskId: string;
  meshyTaskId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  progress?: number;           // 0-100
  modelUrls?: {
    glb?: string;
    fbx?: string;
    obj?: string;
    usdz?: string;
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3. GET `/meshy/task/:taskId/download`
**Descripción:** Descarga el modelo generado

**Query Parameters:**
- `format`: 'glb' | 'fbx' | 'obj' | 'usdz' (default: 'glb')

**Response:**
- Redirección a URL de Meshy o proxy del archivo

### 4. DELETE `/meshy/task/:taskId`
**Descripción:** Cancela o elimina una tarea (si es posible)

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 🔧 Componentes Principales

### 1. MeshyClientService
**Responsabilidad:** Comunicación directa con la API de Meshy.ai

**Métodos:**
- `createImageTo3DTask(dto: CreateImageTo3DDto): Promise<MeshyTaskResponse>`
- `getTaskStatus(meshyTaskId: string): Promise<MeshyTaskStatus>`
- `downloadModel(url: string): Promise<Buffer>` (opcional, para proxy)

**Configuración:**
- Base URL: `https://api.meshy.ai`
- Autenticación: Header `Authorization: Bearer {API_KEY}`
- Timeout: 30 segundos

### 2. MeshyTaskRepository
**Responsabilidad:** Acceso a datos usando patrón Repository

**Métodos:**
- `create(task: Partial<MeshyTask>): Promise<MeshyTask>`
- `findById(id: string): Promise<MeshyTask | null>`
- `findByMeshyTaskId(meshyTaskId: string): Promise<MeshyTask | null>`
- `update(id: string, updates: Partial<MeshyTask>): Promise<MeshyTask>`
- `delete(id: string): Promise<void>`
- `findAll(): Promise<MeshyTask[]>`

**Implementación:**
- Extiende `Repository<MeshyTask>` de TypeORM
- Métodos personalizados para consultas específicas
- Abstracción de la capa de persistencia

### 3. MeshyService
**Responsabilidad:** Lógica de negocio y orquestación

**Métodos:**
- `createImageTo3DTask(dto: CreateImageTo3DDto): Promise<TaskResponse>`
- `getTaskStatus(taskId: string): Promise<TaskStatusResponse>`
- `downloadModel(taskId: string, format: ModelFormat): Promise<Buffer | string>`
- `cancelTask(taskId: string): Promise<void>`

**Lógica adicional:**
- Validación de entrada (imagen, parámetros)
- Persistencia en BD usando MeshyTaskRepository
- Transformación de respuestas de Meshy a formato propio
- Manejo de errores y reintentos
- Sincronización de estado con Meshy API

### 4. MeshyController
**Responsabilidad:** Endpoints REST y validación de requests

**Validaciones:**
- DTOs con `class-validator`
- Verificación de formato de imagen
- Límites de parámetros (polycount, etc.)
- Autenticación/autorización (futuro)

---

## 🐳 Docker y Base de Datos

### Docker Compose para PostgreSQL

Se incluye un archivo `docker-compose.yml` para levantar PostgreSQL fácilmente:

```bash
# Levantar PostgreSQL
docker-compose up -d

# Verificar que está corriendo
docker-compose ps

# Ver logs
docker-compose logs -f postgres

# Detener
docker-compose down
```

**Configuración del contenedor:**
- Imagen: `postgres:16-alpine`
- Puerto: `5432` (configurable)
- Usuario: `studio_user` (configurable)
- Base de datos: `studio_db` (configurable)
- Volumen persistente para datos

### Variables de Entorno

Copia `env.example` a `.env` y completa los valores:

```bash
cp env.example .env
```

Ver archivo `env.example` para todas las variables disponibles.

Ver archivo `.env.example` para referencia completa. Variables principales:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=studio_user
DB_PASSWORD=studio_password
DB_DATABASE=studio_db
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Meshy API Configuration
MESHY_API_KEY=your_api_key_here
MESHY_API_BASE_URL=https://api.meshy.ai
MESHY_API_TIMEOUT=30000

# Application Configuration
MESHY_DEFAULT_MODEL_TYPE=standard
MESHY_DEFAULT_POLYCOUNT=10000
MESHY_MAX_POLYCOUNT=50000
MESHY_MIN_POLYCOUNT=1000

# Task Configuration
MESHY_POLLING_INTERVAL=5000
MESHY_MAX_RETRIES=3

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Validación con Joi

```typescript
// config/validation.schema.ts
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Database
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  
  // Meshy
  MESHY_API_KEY: Joi.string().required(),
  MESHY_API_BASE_URL: Joi.string().uri().default('https://api.meshy.ai'),
  MESHY_API_TIMEOUT: Joi.number().default(30000),
  MESHY_DEFAULT_MODEL_TYPE: Joi.string().valid('standard', 'premium').default('standard'),
  MESHY_DEFAULT_POLYCOUNT: Joi.number().min(1000).max(50000).default(10000),
  MESHY_MAX_POLYCOUNT: Joi.number().default(50000),
  MESHY_MIN_POLYCOUNT: Joi.number().default(1000),
  MESHY_POLLING_INTERVAL: Joi.number().default(5000),
  MESHY_MAX_RETRIES: Joi.number().default(3),
  
  // Server
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
});
```

### ConfigModule Setup

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    // ... otros módulos (MeshyModule, etc.)
  ],
})
export class AppModule {}
```

**Nota:** El archivo `src/app.module.example.ts` contiene un ejemplo completo de configuración.

### TypeORM Configuration

```typescript
// config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
  logging: configService.get<boolean>('DB_LOGGING'),
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
});
```

### Meshy Configuration

```typescript
// config/meshy.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('meshy', () => ({
  apiKey: process.env.MESHY_API_KEY,
  baseUrl: process.env.MESHY_API_BASE_URL || 'https://api.meshy.ai',
  timeout: parseInt(process.env.MESHY_API_TIMEOUT || '30000'),
  defaultModelType: process.env.MESHY_DEFAULT_MODEL_TYPE || 'standard',
  defaultPolycount: parseInt(process.env.MESHY_DEFAULT_POLYCOUNT || '10000'),
  maxPolycount: parseInt(process.env.MESHY_MAX_POLYCOUNT || '50000'),
  minPolycount: parseInt(process.env.MESHY_MIN_POLYCOUNT || '1000'),
  pollingInterval: parseInt(process.env.MESHY_POLLING_INTERVAL || '5000'),
  maxRetries: parseInt(process.env.MESHY_MAX_RETRIES || '3'),
}));
```

---

## 🔄 Flujo de Trabajo

### Flujo: Crear Tarea de Imagen a 3D

```
1. Cliente → POST /meshy/image-to-3d
   ↓
2. MeshyController valida DTO
   ↓
3. MeshyService procesa request
   - Valida imagen (URL o base64)
   - Aplica valores por defecto
   ↓
4. MeshyClientService → POST Meshy API
   - /openapi/v1/image-to-3d
   ↓
5. MeshyService crea entidad MeshyTask
   - Usa MeshyTaskRepository.create()
   - Persiste en PostgreSQL
   ↓
6. Retorna respuesta con taskId interno (UUID)
```

### Flujo: Consultar Estado

```
1. Cliente → GET /meshy/task/:taskId
   ↓
2. MeshyService busca tarea en BD
   - Usa MeshyTaskRepository.findById()
   ↓
3. Si existe, obtiene meshyTaskId
   ↓
4. MeshyClientService → GET Meshy API
   - /openapi/v1/image-to-3d/:meshyTaskId
   ↓
5. MeshyService actualiza entidad en BD
   - Usa MeshyTaskRepository.update()
   ↓
6. Retorna estado actualizado desde BD
```

---

## 🗄️ Persistencia con TypeORM

### Entidad MeshyTask

```typescript
// meshy/entities/meshy-task.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TaskStatus } from '../enums/task-status.enum';

@Entity('meshy_tasks')
@Index(['meshyTaskId'], { unique: true })
export class MeshyTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  meshyTaskId: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ type: 'int', nullable: true })
  progress: number;

  @Column('jsonb', { nullable: true })
  modelUrls: Record<string, string>;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  modelType: string;

  @Column({ type: 'int', nullable: true })
  targetPolycount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Repository Pattern

```typescript
// meshy/repositories/meshy-task.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeshyTask } from '../entities/meshy-task.entity';
import { TaskStatus } from '../enums/task-status.enum';

@Injectable()
export class MeshyTaskRepository {
  constructor(
    @InjectRepository(MeshyTask)
    private readonly repository: Repository<MeshyTask>,
  ) {}

  async create(task: Partial<MeshyTask>): Promise<MeshyTask> {
    const newTask = this.repository.create(task);
    return await this.repository.save(newTask);
  }

  async findById(id: string): Promise<MeshyTask | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByMeshyTaskId(meshyTaskId: string): Promise<MeshyTask | null> {
    return await this.repository.findOne({ where: { meshyTaskId } });
  }

  async update(id: string, updates: Partial<MeshyTask>): Promise<MeshyTask> {
    await this.repository.update(id, updates);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Task with id ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(): Promise<MeshyTask[]> {
    return await this.repository.find();
  }

  async findByStatus(status: TaskStatus): Promise<MeshyTask[]> {
    return await this.repository.find({ where: { status } });
  }
}
```

### Configuración del Módulo con TypeORM

```typescript
// meshy/meshy.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeshyTask } from './entities/meshy-task.entity';
import { MeshyTaskRepository } from './repositories/meshy-task.repository';
import { MeshyController } from './meshy.controller';
import { MeshyService } from './meshy.service';
import { MeshyClientService } from './meshy-client.service';

@Module({
  imports: [TypeOrmModule.forFeature([MeshyTask])],
  controllers: [MeshyController],
  providers: [MeshyService, MeshyClientService, MeshyTaskRepository],
  exports: [MeshyService, MeshyTaskRepository],
})
export class MeshyModule {}
```

---

## 🛡️ Manejo de Errores

### Errores de Meshy API
- `400 Bad Request` → Validación de parámetros
- `401 Unauthorized` → API key inválida
- `429 Too Many Requests` → Rate limiting
- `500 Internal Server Error` → Error del servidor de Meshy

### Estrategia de Reintentos
- Reintentos automáticos para errores 5xx
- Backoff exponencial
- Límite máximo de reintentos configurable

### Respuestas de Error Estándar

```typescript
{
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}
```

---

## 🧪 Testing

### Tests Unitarios
- `MeshyService`: Lógica de negocio
- `MeshyClientService`: Mock de llamadas HTTP
- `MeshyController`: Validación de endpoints

### Tests de Integración
- Flujo completo de creación de tarea
- Consulta de estado
- Manejo de errores

### Mocks
- Mock de respuestas de Meshy API
- Mock de HttpService (Axios)

---

## 📊 Monitoreo y Logging

### Métricas a Registrar
- Número de tareas creadas
- Tiempo promedio de procesamiento
- Tasa de éxito/fallo
- Uso de créditos de Meshy
- Tiempos de respuesta de API

### Logs
- Requests a Meshy API (sin datos sensibles)
- Errores y excepciones
- Cambios de estado de tareas

---

## 🚀 Fases de Implementación

### Fase 1: Configuración Base (Día 1-2)
- [ ] Instalar dependencias (TypeORM, pg, joi, dotenv)
- [ ] Configurar Docker Compose para PostgreSQL
- [ ] Crear archivo .env.example
- [ ] Configurar validación con Joi
- [ ] Configurar ConfigModule con validación
- [ ] Configurar TypeORM en AppModule
- [ ] Crear estructura de directorios
- [ ] Probar conexión a base de datos

### Fase 2: Cliente Meshy (Día 3-4)
- [ ] Implementar MeshyClientService
- [ ] Configurar HttpModule con Axios
- [ ] Implementar métodos básicos (createTask, getStatus)
- [ ] Tests unitarios del cliente

### Fase 3: Persistencia y Servicio de Negocio (Día 5-7)
- [ ] Crear entidad MeshyTask
- [ ] Implementar MeshyTaskRepository con patrón Repository
- [ ] Configurar TypeORM en MeshyModule
- [ ] Implementar MeshyService
- [ ] Integrar Repository en MeshyService
- [ ] Lógica de validación
- [ ] Transformación de respuestas
- [ ] Tests unitarios (Service y Repository)

### Fase 4: Controlador y DTOs (Día 8-9)
- [ ] Crear DTOs con validaciones
- [ ] Implementar MeshyController
- [ ] Configurar rutas
- [ ] Validaciones de entrada
- [ ] Tests de endpoints

### Fase 5: Integración y Testing (Día 10-12)
- [ ] Tests de integración
- [ ] Manejo de errores completo
- [ ] Documentación de API (Swagger)
- [ ] Ajustes y optimizaciones

### Fase 6: Funcionalidades Avanzadas (Día 13-15)
- [ ] Endpoint de descarga
- [ ] Soporte para múltiples formatos
- [ ] Reintentos automáticos
- [ ] Logging y monitoreo

---

## 🔐 Seguridad

### Consideraciones
1. **API Key**: Almacenar en variables de entorno, nunca en código
2. **Validación de Input**: Sanitizar URLs y validar imágenes
3. **Rate Limiting**: Implementar límites por usuario/IP
4. **Autenticación**: Agregar autenticación de usuarios (futuro)
5. **Moderación**: Activar moderación de contenido en Meshy

---

## 📝 Notas Adicionales

### Límites de Meshy
- Verificar límites del plan (Studio/Pro/Enterprise)
- Gestionar créditos disponibles
- Implementar cola de tareas si es necesario

### Escalabilidad
- Considerar uso de cola de trabajos (Bull/BullMQ) para tareas asíncronas
- Implementar caché para consultas de estado frecuentes
- Considerar persistencia en BD para producción

### Futuras Extensiones
- Multi-image-to-3D
- Text-to-3D
- Remeshing avanzado
- Optimización de modelos

---

## 📚 Referencias

- [Documentación Meshy API](https://docs.meshy.ai/api/image-to-3d)
- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS HttpModule](https://docs.nestjs.com/techniques/http-module)
- [TypeORM Documentation](https://typeorm.io/)
- [NestJS TypeORM](https://docs.nestjs.com/techniques/database)
- [Joi Validation](https://joi.dev/api/)
- [Docker Compose](https://docs.docker.com/compose/)

## 📄 Archivos de Configuración Creados

- `docker-compose.yml` - Configuración de PostgreSQL
- `env.example` - Plantilla de variables de entorno
- `src/config/validation.schema.ts` - Esquema Joi para validación
- `src/config/database.config.ts` - Configuración de TypeORM
- `src/config/meshy.config.ts` - Configuración de Meshy
- `src/app.module.example.ts` - Ejemplo de AppModule configurado
- `README_SETUP.md` - Guía de configuración inicial

---

## ✅ Checklist de Implementación

### Configuración
- [ ] Variables de entorno configuradas (.env.example)
- [ ] Validación con Joi implementada
- [ ] ConfigModule configurado
- [ ] TypeORM configurado y conectado
- [ ] Docker Compose funcionando
- [ ] Estructura de directorios creada

### Cliente
- [ ] MeshyClientService implementado
- [ ] Autenticación configurada
- [ ] Manejo de errores HTTP

### Persistencia
- [ ] Entidad MeshyTask creada
- [ ] MeshyTaskRepository implementado
- [ ] TypeORM integrado en módulo

### Servicio
- [ ] MeshyService implementado
- [ ] Integración con Repository
- [ ] Validaciones de negocio

### Controlador
- [ ] Endpoints implementados
- [ ] DTOs con validaciones
- [ ] Documentación Swagger

### Testing
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Cobertura > 80%

### Producción
- [ ] Logging configurado
- [ ] Manejo de errores robusto
- [ ] Monitoreo implementado

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../enums/task-status.enum';
import { ModelFormat } from '../enums/model-format.enum';

export class TaskStatusResponseDto {
  @ApiProperty({
    description: 'ID único de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  taskId: string;

  @ApiProperty({
    description: 'ID de la tarea en Meshy.ai',
    example: 'meshy_task_abc123',
    type: String,
  })
  meshyTaskId: string;

  @ApiProperty({
    description: 'Estado actual de la tarea',
    enum: TaskStatus,
    example: TaskStatus.SUCCEEDED,
  })
  status: TaskStatus;

  @ApiPropertyOptional({
    description: 'Progreso de la tarea (0-100)',
    example: 100,
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  progress?: number;

  @ApiPropertyOptional({
    description: 'URLs de los modelos generados en diferentes formatos',
    example: {
      glb: 'https://meshy.ai/models/example.glb',
      fbx: 'https://meshy.ai/models/example.fbx',
      obj: 'https://meshy.ai/models/example.obj',
      usdz: 'https://meshy.ai/models/example.usdz',
    },
    type: Object,
  })
  modelUrls?: Record<ModelFormat, string>;

  @ApiPropertyOptional({
    description: 'Mensaje de error si la tarea falló',
    example: null,
    type: String,
  })
  error?: string;

  @ApiPropertyOptional({
    description: 'Nombre personalizado de la tarea/modelo',
    example: 'Mi Modelo 3D',
    type: String,
  })
  name?: string;

  @ApiProperty({
    description: 'Fecha de creación de la tarea',
    example: '2024-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización de la tarea',
    example: '2024-01-01T00:05:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt: string;
}

export class CreateTaskResponseDto {
  @ApiProperty({
    description: 'ID único de la tarea creada (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  taskId: string;

  @ApiProperty({
    description: 'ID de la tarea en Meshy.ai',
    example: 'meshy_task_abc123',
    type: String,
  })
  meshyTaskId: string;

  @ApiProperty({
    description: 'Estado inicial de la tarea',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiPropertyOptional({
    description: 'Nombre personalizado de la tarea/modelo',
    example: 'Mi Modelo 3D',
    type: String,
  })
  name?: string;

  @ApiProperty({
    description: 'Fecha de creación de la tarea',
    example: '2024-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt: string;
}

export class DownloadModelResponseDto {
  @ApiProperty({
    description: 'URL de descarga del modelo',
    example: 'https://meshy.ai/models/example.glb',
    type: String,
  })
  downloadUrl: string;
}

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { MeshyService } from './meshy.service';
import { CreateImageTo3DDto } from './dto/create-image-to-3d.dto';
import {
  CreateTaskResponseDto,
  TaskStatusResponseDto,
  DownloadModelResponseDto,
} from './dto/task-status.dto';
import { ModelFormat } from './enums/model-format.enum';

@ApiTags('meshy')
@Controller('meshy')
export class MeshyController {
  constructor(private readonly meshyService: MeshyService) {}

  @Post('image-to-3d')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear tarea de conversión de imagen a modelo 3D',
    description:
      'Inicia una nueva tarea para convertir una imagen en un modelo 3D usando Meshy.ai. Debes proporcionar una URL de imagen o una imagen en base64.',
  })
  @ApiCreatedResponse({
    description: 'Tarea creada exitosamente',
    type: CreateTaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Error de validación en los parámetros de entrada',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['Se debe proporcionar imageUrl o imageBase64'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async createImageTo3DTask(
    @Body() dto: CreateImageTo3DDto,
  ): Promise<CreateTaskResponseDto> {
    return await this.meshyService.createImageTo3DTask(dto);
  }

  @Get('task/:taskId')
  @ApiOperation({
    summary: 'Consultar estado de una tarea',
    description:
      'Obtiene el estado actual de una tarea de generación de modelo 3D. Incluye el progreso, URLs de los modelos generados y cualquier error.',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID único de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la tarea obtenido exitosamente',
    type: TaskStatusResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Tarea no encontrada',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'Task with id 123e4567-e89b-12d3-a456-426614174000 not found',
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async getTaskStatus(
    @Param('taskId') taskId: string,
  ): Promise<TaskStatusResponseDto> {
    return await this.meshyService.getTaskStatus(taskId);
  }

  @Get('task/:taskId/download')
  @ApiOperation({
    summary: 'Obtener URL de descarga del modelo',
    description:
      'Obtiene la URL de descarga del modelo generado en el formato especificado. La tarea debe estar completada (status: SUCCEEDED).',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID único de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiQuery({
    name: 'format',
    description: 'Formato del modelo a descargar',
    enum: ModelFormat,
    required: false,
    example: ModelFormat.GLB,
  })
  @ApiResponse({
    status: 200,
    description: 'URL de descarga obtenida exitosamente',
    type: DownloadModelResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Tarea no encontrada o formato no disponible',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'Model format glb not available for this task',
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Tarea no completada o formato inválido',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Task is not completed. Current status: IN_PROGRESS',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async downloadModel(
    @Param('taskId') taskId: string,
    @Query('format') format?: string,
  ): Promise<DownloadModelResponseDto> {
    const modelFormat =
      (format as ModelFormat) || ModelFormat.GLB;

    // Validar formato
    if (!Object.values(ModelFormat).includes(modelFormat)) {
      throw new BadRequestException(
        `Invalid format. Allowed formats: ${Object.values(ModelFormat).join(', ')}`,
      );
    }

    const downloadUrl = await this.meshyService.downloadModel(
      taskId,
      modelFormat,
    );

    return { downloadUrl };
  }

  @Delete('task/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancelar una tarea',
    description:
      'Cancela una tarea de generación de modelo 3D. Marca la tarea como FAILED y detiene el procesamiento.',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID único de la tarea (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Tarea cancelada exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'Tarea no encontrada',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'Task with id 123e4567-e89b-12d3-a456-426614174000 not found',
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async cancelTask(@Param('taskId') taskId: string): Promise<void> {
    await this.meshyService.cancelTask(taskId);
  }
}

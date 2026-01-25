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
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
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
      'Obtiene el estado actual de una tarea de generación de modelo 3D desde la base de datos local (actualizada desde Meshy). Incluye el progreso, URLs de los modelos generados y cualquier error.',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID único de la tarea (UUID local)',
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

  @Get('meshy-task/:taskIdOrMeshyId')
  @ApiOperation({
    summary: 'Consultar estado directamente desde Meshy',
    description:
      'Obtiene el estado actual de una tarea directamente desde Meshy API, sin pasar por la base de datos local. Acepta tanto el taskId local (UUID) como el meshyTaskId (ID de Meshy). Si se proporciona un taskId local, se busca el meshyTaskId correspondiente en la BD.',
  })
  @ApiParam({
    name: 'taskIdOrMeshyId',
    description: 'ID de la tarea local (UUID) o ID de Meshy. Si es un UUID local, se buscará el meshyTaskId correspondiente.',
    example: '4c86f125-433b-48b4-8b46-1c06e7142f75 o 019bf165-20f1-7ab9-b13c-7bb82785f7f4',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la tarea obtenido directamente desde Meshy',
    type: TaskStatusResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Tarea no encontrada en la BD local o en Meshy',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'Task not found',
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Error al consultar Meshy API',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Error al consultar Meshy API',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async getTaskStatusFromMeshy(
    @Param('taskIdOrMeshyId') taskIdOrMeshyId: string,
  ): Promise<TaskStatusResponseDto> {
    return await this.meshyService.getTaskStatusFromMeshy(taskIdOrMeshyId);
  }

  @Get('task/:taskId/proxy')
  @ApiOperation({
    summary: 'Descargar modelo a través del servidor (proxy)',
    description:
      'Descarga el modelo desde Meshy a través del servidor para evitar problemas de CORS. Devuelve el archivo directamente.',
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
    description: 'Archivo del modelo descargado exitosamente',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Tarea no encontrada o formato no disponible',
  })
  @ApiBadRequestResponse({
    description: 'Tarea no completada o formato inválido',
  })
  async proxyModel(
    @Param('taskId') taskId: string,
    @Res() res: Response,
    @Query('format') format?: string,
  ): Promise<void> {
    const modelFormat =
      (format as ModelFormat) || ModelFormat.GLB;

    // Validar formato
    if (!Object.values(ModelFormat).includes(modelFormat)) {
      throw new BadRequestException(
        `Invalid format. Allowed formats: ${Object.values(ModelFormat).join(', ')}`,
      );
    }

    const { buffer, contentType, filename } =
      await this.meshyService.downloadModelAsBuffer(taskId, modelFormat);

    // Configurar headers para la descarga
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Enviar el buffer
    res.send(buffer);
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

  @Get('tasks')
  @ApiOperation({
    summary: 'Listar todas las tareas',
    description:
      'Obtiene una lista de todas las tareas de generación de modelos 3D creadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas obtenida exitosamente',
    type: [TaskStatusResponseDto],
  })
  async getAllTasks(): Promise<TaskStatusResponseDto[]> {
    return await this.meshyService.getAllTasks();
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

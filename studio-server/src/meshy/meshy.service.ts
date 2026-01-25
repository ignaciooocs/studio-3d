import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MeshyClientService } from './meshy-client.service';
import { MeshyTaskRepository } from './repositories/meshy-task.repository';
import { CreateImageTo3DDto } from './dto/create-image-to-3d.dto';
import {
  CreateTaskResponseDto,
  TaskStatusResponseDto,
} from './dto/task-status.dto';
import { MeshyTask } from './entities/meshy-task.entity';
import { TaskStatus } from './enums/task-status.enum';
import { ModelFormat } from './enums/model-format.enum';
import { MeshyConfig } from './interfaces/meshy-config.interface';
import { MeshyImageTo3DRequest } from './interfaces/meshy-api.interface';

@Injectable()
export class MeshyService {
  private readonly config: MeshyConfig;
  private readonly logger = new Logger(MeshyService.name);

  constructor(
    private readonly meshyClient: MeshyClientService,
    private readonly taskRepository: MeshyTaskRepository,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.config = this.configService.get<MeshyConfig>('meshy')!;
    
    // Validar configuración al inicializar
    if (!this.config.apiKey || this.config.apiKey === 'your_meshy_api_key_here') {
      this.logger.warn('⚠️ MESHY_API_KEY no está configurada o está usando el valor por defecto');
    }
    this.logger.log(`Meshy config loaded - Base URL: ${this.config.baseUrl}, Timeout: ${this.config.timeout}ms`);
  }

  async createImageTo3DTask(
    dto: CreateImageTo3DDto,
  ): Promise<CreateTaskResponseDto> {
    try {
      this.logger.log(`Creating image-to-3d task with DTO: ${JSON.stringify({ ...dto, imageBase64: dto.imageBase64 ? `${dto.imageBase64.substring(0, 50)}...` : null })}`);
      
      // Validar que se proporcione imagen
      if (!dto.imageUrl && !dto.imageBase64) {
        throw new BadRequestException(
          'Se debe proporcionar imageUrl o imageBase64',
        );
      }

      // Extraer base64 puro si viene como data URI
      let imageBase64 = dto.imageBase64;
      if (imageBase64 && imageBase64.startsWith('data:')) {
        // Extraer solo la parte base64 del data URI
        const base64Match = imageBase64.match(/^data:image\/[a-z]+;base64,(.+)$/);
        if (base64Match && base64Match[1]) {
          imageBase64 = base64Match[1];
          this.logger.log('Extracted base64 from data URI');
        } else {
          this.logger.warn('Invalid data URI format, using as-is');
        }
      }

      // Construir request para Meshy API
      // IMPORTANTE: Meshy API requiere que se envíe image_url O image_base64, pero NO ambos
      // Si enviamos image_base64, NO debemos incluir image_url (ni siquiera como undefined)
      const request: MeshyImageTo3DRequest = {
        model_type: dto.modelType || this.config.defaultModelType,
        should_texture: dto.shouldTexture ?? false,
        should_remesh: dto.shouldRemesh ?? false,
        symmetry: dto.symmetry || 'none',
        moderation: dto.moderation ?? false,
      };

      // Agregar imagen
      // IMPORTANTE: Según el error de Meshy "ImageURL is a required field", parece que
      // Meshy siempre requiere image_url, incluso cuando usamos base64.
      // Solución: Enviar el base64 como data URI en el campo image_url
      
      if (dto.imageUrl) {
        request.image_url = dto.imageUrl;
      } else if (imageBase64 && dto.imageBase64) {
        // Intentar enviar el base64 como data URI en image_url
        // Algunas APIs aceptan data URIs directamente en el campo URL
        const originalBase64 = dto.imageBase64;
        const dataUri = originalBase64.startsWith('data:') 
          ? originalBase64 
          : `data:image/jpeg;base64,${imageBase64}`;
        
        this.logger.log(`Using data URI format for image_url (length: ${dataUri.length})`);
        request.image_url = dataUri;
        
        // NO incluir image_base64 cuando usamos image_url con data URI
      }

      // Agregar target_polycount solo si está definido
      if (dto.targetPolycount !== undefined) {
        request.target_polycount = dto.targetPolycount;
      } else if (this.config.defaultPolycount) {
        request.target_polycount = this.config.defaultPolycount;
      }

      this.logger.log(`Request to Meshy API: ${JSON.stringify({ ...request, image_base64: request.image_base64 ? `${request.image_base64.substring(0, 50)}...` : null })}`);

      // Validar polycount
      if (request.target_polycount) {
        if (
          request.target_polycount < this.config.minPolycount ||
          request.target_polycount > this.config.maxPolycount
        ) {
          throw new BadRequestException(
            `targetPolycount debe estar entre ${this.config.minPolycount} y ${this.config.maxPolycount}`,
          );
        }
      }

      // Crear tarea en Meshy
      this.logger.log('Calling Meshy API to create task...');
      const meshyResponse = await this.meshyClient.createImageTo3DTask(request);
      this.logger.log(`Meshy API response: ${JSON.stringify(meshyResponse)}`);

      if (!meshyResponse || !meshyResponse.result) {
        this.logger.error(`Invalid response from Meshy API: ${JSON.stringify(meshyResponse)}`);
        throw new InternalServerErrorException(
          'Invalid response from Meshy API: missing result',
        );
      }

      // Guardar en base de datos
      this.logger.log(`Saving task to database with meshyTaskId: ${meshyResponse.result}`);
      const task = await this.taskRepository.create({
        meshyTaskId: meshyResponse.result,
        status: TaskStatus.PENDING,
        imageUrl: dto.imageUrl || null,
        modelType: request.model_type,
        targetPolycount: request.target_polycount,
        name: dto.name || null,
      });
      this.logger.log(`Task saved successfully with id: ${task.id}`);

      return {
        taskId: task.id,
        meshyTaskId: task.meshyTaskId,
        status: task.status,
        name: task.name || undefined,
        createdAt: task.createdAt.toISOString(),
      };
    } catch (error: any) {
      this.logger.error(`Error in createImageTo3DTask: ${error.message || error}`);
      if (error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }
      
      // Si ya es una excepción HTTP de NestJS, relanzarla
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException ||
        error instanceof NotFoundException ||
        (error.getStatus && typeof error.getStatus === 'function')
      ) {
        throw error;
      }
      
      // Si es un error de Meshy API (HttpException de MeshyClientService), relanzarlo
      if (error.response) {
        this.logger.error(`Meshy API error response: ${JSON.stringify(error.response.data)}`);
        this.logger.error(`Status: ${error.response.status}`);
        // El error ya debería ser un HttpException de MeshyClientService
        throw error;
      }
      
      // Si es un error de base de datos u otro error desconocido
      this.logger.error(`Unknown error type: ${error.constructor?.name || 'Unknown'}`);
      this.logger.error(`Error details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
      
      throw new InternalServerErrorException(
        `Error al crear tarea: ${error.message || 'Error desconocido'}`,
      );
    }
  }

  async getTaskStatus(taskId: string): Promise<TaskStatusResponseDto> {
    this.logger.log(`Getting task status for taskId: ${taskId}`);
    // Buscar tarea en BD
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      this.logger.error(`Task with id ${taskId} not found`);
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

      // Obtener estado actualizado de Meshy
      try {
        this.logger.log(`Getting task status from Meshy for taskId: ${taskId}`);
        const meshyStatus = await this.meshyClient.getTaskStatus(
          task.meshyTaskId,
        );
        this.logger.log(`Meshy status: ${JSON.stringify(meshyStatus)}`);
        // Actualizar tarea en BD
        // La respuesta de Meshy tiene los datos directamente, no dentro de "result"
        const updates: Partial<MeshyTask> = {
          status: meshyStatus.status,
          progress: meshyStatus.progress || null,
          modelUrls: meshyStatus.model_urls || null,
          error: meshyStatus.task_error || null,
        };
        this.logger.log(`Updating task in database: ${JSON.stringify(updates)}`);
        const updatedTask = await this.taskRepository.update(task.id, updates);
        this.logger.log(`Updated task in database: ${JSON.stringify(updatedTask)}`);
        return this.mapTaskToResponseDto(updatedTask);
      } catch (error) {
        this.logger.error(`Error getting task status: ${error}`);
        // Si hay error al consultar Meshy, retornar estado de BD
        return this.mapTaskToResponseDto(task);
      }
  }

  async downloadModel(
    taskId: string,
    format: ModelFormat = ModelFormat.GLB,
  ): Promise<string> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    if (task.status !== TaskStatus.SUCCEEDED) {
      throw new BadRequestException(
        `Task is not completed. Current status: ${task.status}`,
      );
    }

    if (!task.modelUrls || !task.modelUrls[format]) {
      throw new NotFoundException(
        `Model format ${format} not available for this task`,
      );
    }

    return task.modelUrls[format];
  }

  /**
   * Descargar modelo como buffer para hacer proxy y evitar problemas de CORS
   */
  async downloadModelAsBuffer(
    taskId: string,
    format: ModelFormat = ModelFormat.GLB,
  ): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    const downloadUrl = await this.downloadModel(taskId, format);
    
    this.logger.log(`Downloading model from Meshy: ${downloadUrl}`);
    
    try {
      // Descargar el archivo desde Meshy usando HttpService
      const response = await firstValueFrom(
        this.httpService.get(downloadUrl, {
          responseType: 'arraybuffer',
        }),
      );

      // Convertir ArrayBuffer a Buffer
      const buffer = Buffer.from(response.data);

      // Determinar content type basado en el formato
      const contentTypes: Record<ModelFormat, string> = {
        [ModelFormat.GLB]: 'model/gltf-binary',
        [ModelFormat.FBX]: 'application/octet-stream',
        [ModelFormat.OBJ]: 'model/obj',
        [ModelFormat.USDZ]: 'model/usd',
      };

      const contentType = contentTypes[format] || 'application/octet-stream';
      const filename = `model-${taskId.slice(0, 8)}.${format}`;

      return { buffer, contentType, filename };
    } catch (error: any) {
      this.logger.error(`Error downloading model buffer: ${error.message}`);
      if (error.response) {
        throw new InternalServerErrorException(
          `Error al descargar modelo desde Meshy: ${error.response.statusText}`,
        );
      }
      throw new InternalServerErrorException(
        `Error al descargar modelo: ${error.message}`,
      );
    }
  }

  async cancelTask(taskId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    // Actualizar estado a FAILED
    await this.taskRepository.update(task.id, {
      status: TaskStatus.FAILED,
      error: 'Task cancelled by user',
    });
  }

  /**
   * Consultar directamente a Meshy API sin pasar por la BD local
   * Útil para obtener datos en tiempo real o debugging
   * Solo consulta a Meshy, no realiza consultas a la base de datos
   */
  async getTaskStatusFromMeshy(
    meshyTaskId: string,
  ): Promise<TaskStatusResponseDto> {
    this.logger.log(
      `Getting task status directly from Meshy for meshyTaskId: ${meshyTaskId}`,
    );

    try {
      const meshyStatus = await this.meshyClient.getTaskStatus(meshyTaskId);
      this.logger.log(`Meshy status: ${JSON.stringify(meshyStatus)}`);

      // Mapear la respuesta de Meshy al formato de respuesta
      return {
        taskId: '', // No hay taskId local ya que no consultamos la BD
        meshyTaskId: meshyStatus.id,
        status: meshyStatus.status,
        progress: meshyStatus.progress || undefined,
        modelUrls: meshyStatus.model_urls
          ? (meshyStatus.model_urls as Record<ModelFormat, string>)
          : undefined,
        error: meshyStatus.task_error || undefined,
        createdAt: meshyStatus.created_at
          ? new Date(meshyStatus.created_at).toISOString()
          : new Date().toISOString(),
        updatedAt: meshyStatus.finished_at
          ? new Date(meshyStatus.finished_at).toISOString()
          : meshyStatus.started_at
          ? new Date(meshyStatus.started_at).toISOString()
          : new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error getting task status from Meshy: ${error}`);
      throw error;
    }
  }

  async getAllTasks(): Promise<TaskStatusResponseDto[]> {
    this.logger.log('Getting all tasks');
    const tasks = await this.taskRepository.findAll();
    
    // Actualizar tareas que están en progreso desde Meshy
    const tasksToUpdate = tasks.filter(
      (task) =>
        task.status === TaskStatus.PENDING ||
        task.status === TaskStatus.IN_PROGRESS,
    );

    this.logger.log(`Updating ${tasksToUpdate.length} tasks from Meshy`);

    // Actualizar tareas en paralelo (con límite para no sobrecargar)
    const updatePromises = tasksToUpdate.map(async (task) => {
      try {
        const meshyStatus = await this.meshyClient.getTaskStatus(
          task.meshyTaskId,
        );
        const updates: Partial<MeshyTask> = {
          status: meshyStatus.status,
          progress: meshyStatus.progress || null,
          modelUrls: meshyStatus.model_urls || null,
          error: meshyStatus.task_error || null,
        };
        await this.taskRepository.update(task.id, updates);
        this.logger.log(`Updated task ${task.id} from Meshy`);
      } catch (error) {
        this.logger.error(
          `Error updating task ${task.id} from Meshy: ${error}`,
        );
        // Continuar con otras tareas aunque una falle
      }
    });

    // Esperar a que se actualicen todas las tareas en progreso
    await Promise.allSettled(updatePromises);

    // Obtener todas las tareas actualizadas
    const updatedTasks = await this.taskRepository.findAll();
    return updatedTasks.map((task) => this.mapTaskToResponseDto(task));
  }

  private mapTaskToResponseDto(task: MeshyTask): TaskStatusResponseDto {
    return {
      taskId: task.id,
      meshyTaskId: task.meshyTaskId,
      status: task.status,
      progress: task.progress || undefined,
      modelUrls: task.modelUrls
        ? (task.modelUrls as Record<ModelFormat, string>)
        : undefined,
      error: task.error || undefined,
      name: task.name || undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}

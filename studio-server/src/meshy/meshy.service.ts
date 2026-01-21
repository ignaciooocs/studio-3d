import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

@Injectable()
export class MeshyService {
  private readonly config: MeshyConfig;
  private readonly logger = new Logger(MeshyService.name);

  constructor(
    private readonly meshyClient: MeshyClientService,
    private readonly taskRepository: MeshyTaskRepository,
    private readonly configService: ConfigService,
  ) {
    this.config = this.configService.get<MeshyConfig>('meshy')!;
  }

  async createImageTo3DTask(
    dto: CreateImageTo3DDto,
  ): Promise<CreateTaskResponseDto> {
    // Validar que se proporcione imagen
    if (!dto.imageUrl && !dto.imageBase64) {
      throw new BadRequestException(
        'Se debe proporcionar imageUrl o imageBase64',
      );
    }

    // Aplicar valores por defecto
    const request = {
      image_url: dto.imageUrl,
      image_base64: dto.imageBase64,
      model_type: dto.modelType || this.config.defaultModelType,
      target_polycount:
        dto.targetPolycount || this.config.defaultPolycount,
      should_texture: dto.shouldTexture ?? false,
      should_remesh: dto.shouldRemesh ?? false,
      symmetry: dto.symmetry || 'none',
      moderation: dto.moderation ?? false,
    };

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
    const meshyResponse = await this.meshyClient.createImageTo3DTask(request);

    // Guardar en base de datos
    const task = await this.taskRepository.create({
      meshyTaskId: meshyResponse.result,
      status: TaskStatus.PENDING,
      imageUrl: dto.imageUrl || null,
      modelType: request.model_type,
      targetPolycount: request.target_polycount,
    });

    return {
      taskId: task.id,
      meshyTaskId: task.meshyTaskId,
      status: task.status,
      createdAt: task.createdAt.toISOString(),
    };
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
      const updates: Partial<MeshyTask> = {
        status: meshyStatus.result.status,
        progress: meshyStatus.result.progress || null,
        modelUrls: meshyStatus.result.model_urls || null,
        error: meshyStatus.result.error || null,
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
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}

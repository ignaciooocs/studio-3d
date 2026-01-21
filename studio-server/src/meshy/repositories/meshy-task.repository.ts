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

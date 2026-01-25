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
  progress: number | null;

  @Column('jsonb', { nullable: true })
  modelUrls: Record<string, string> | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  modelType: string | null;

  @Column({ type: 'int', nullable: true })
  targetPolycount: number | null;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

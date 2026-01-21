import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeshyController } from './meshy.controller';
import { MeshyService } from './meshy.service';
import { MeshyClientService } from './meshy-client.service';
import { MeshyTaskRepository } from './repositories/meshy-task.repository';
import { MeshyTask } from './entities/meshy-task.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([MeshyTask]),
  ],
  controllers: [MeshyController],
  providers: [MeshyService, MeshyClientService, MeshyTaskRepository],
  exports: [MeshyService, MeshyTaskRepository],
})
export class MeshyModule {}

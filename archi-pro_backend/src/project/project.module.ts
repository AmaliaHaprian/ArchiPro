import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectRepository } from './projectRepo';
import { ProjectMapper } from './projectMapper';
import { ProjectWebSocketGateway } from './websocketGateway';
import { UserModule } from '../user/user.module';
@Module({
  imports: [UserModule],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository, ProjectMapper, ProjectWebSocketGateway],
  exports: [ProjectRepository],
})
export class ProjectModule {}

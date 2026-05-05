import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectRepository } from './projectRepo';
import { ProjectMapper } from './projectMapper';
import { ProjectWebSocketGateway } from './websocketGateway';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './Project';
@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Project])],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository, ProjectMapper, ProjectWebSocketGateway, TypeOrmModule],
  exports: [ProjectRepository],
})
export class ProjectModule {}

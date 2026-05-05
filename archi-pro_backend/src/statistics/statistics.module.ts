import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { ProjectModule } from '../project/project.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/project/Project';
@Module({
  imports: [ProjectModule, TypeOrmModule.forFeature([Project])],
  providers: [StatisticsService],
  controllers: [StatisticsController]
})
export class StatisticsModule {}

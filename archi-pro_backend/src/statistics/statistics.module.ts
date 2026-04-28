import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { ProjectModule } from '../project/project.module';
@Module({
  imports: [ProjectModule],
  providers: [StatisticsService],
  controllers: [StatisticsController]
})
export class StatisticsModule {}

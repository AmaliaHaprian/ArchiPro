import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './project/project.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [ProjectModule, StatisticsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

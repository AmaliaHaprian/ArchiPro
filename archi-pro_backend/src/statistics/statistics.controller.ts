import { Controller, Get, Param } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Logger } from '@nestjs/common';
@Controller('statistics')
export class StatisticsController {
    private readonly logger = new Logger(StatisticsController.name);
    
    constructor(private readonly statisticsService: StatisticsService) {}

    @Get('projects-by-category')
    getProjectsByCategory() {
        return this.statisticsService.getProjectsByCategory();
    }

    @Get('stage-bottleneck')
    getStageBottleneck() {
        return this.statisticsService.getStageBottleneck();
    }

    @Get('status-distribution')
    getStatusDistribution() {
        return this.statisticsService.getStatusDistribution();
    }

    @Get('top-completed-projects')
    getTopCompletedProjects() {
        return this.statisticsService.getTopCompletedProjects();
    }

    @Get('overall-statistics')
    getOverallStatistics() {
        this.logger.log('GET/overall-statistics called');
        return this.statisticsService.getOverallStatistics();
    }

    @Get('projects-by-category/:userId')
    getProjectsByCategoryForUser(@Param('userId') userId: string) {
        return this.statisticsService.getProjectsByCategoryForUser(userId);
    }

    @Get('stage-bottleneck/:userId')
    getStageBottleneckForUser(@Param('userId') userId: string) {
        return this.statisticsService.getStageBottleneckForUser(userId);
    }

    @Get('status-distribution/:userId')
    getStatusDistributionForUser(@Param('userId') userId: string) {
        return this.statisticsService.getStatusDistributionForUser(userId);
    }

    @Get('top-completed-projects/:userId')
    getTopCompletedProjectsForUser(@Param('userId') userId: string) {
        return this.statisticsService.getTopCompletedProjectsForUser(userId);
    }

    @Get('overall-statistics/:userId')
    getOverallStatisticsForUser(@Param('userId') userId: string) {
        return this.statisticsService.getOverallStatisticsForUser(userId);
    }
}

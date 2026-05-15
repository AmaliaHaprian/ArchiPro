import { Controller, Get, Param, Headers } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Logger } from '@nestjs/common';
import { AccessControlService } from '../user/access-control.service';
import { PermissionCode } from '../user/access-control';
@Controller('statistics')
export class StatisticsController {
    private readonly logger = new Logger(StatisticsController.name);
    
    constructor(
        private readonly statisticsService: StatisticsService,
        private readonly accessControlService: AccessControlService,
    ) {}

    @Get('projects-by-category')
    async getProjectsByCategory(@Headers('x-user-id') requesterUserId: string) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        return this.statisticsService.getProjectsByCategory();
    }

    @Get('stage-bottleneck')
    async getStageBottleneck(@Headers('x-user-id') requesterUserId: string) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        return this.statisticsService.getStageBottleneck();
    }

    @Get('status-distribution')
    async getStatusDistribution(@Headers('x-user-id') requesterUserId: string) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        return this.statisticsService.getStatusDistribution();
    }

    @Get('top-completed-projects')
    async getTopCompletedProjects(@Headers('x-user-id') requesterUserId: string) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        return this.statisticsService.getTopCompletedProjects();
    }

    @Get('overall-statistics')
    async getOverallStatistics(@Headers('x-user-id') requesterUserId: string) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        this.logger.log('GET/overall-statistics called');
        return this.statisticsService.getOverallStatistics();
    }

    @Get('projects-by-category/:userId')
    async getProjectsByCategoryForUser(@Headers('x-user-id') requesterUserId: string, @Param('userId') userId: string) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        return this.statisticsService.getProjectsByCategoryForUser(userId);
    }

    @Get('stage-bottleneck/:userId')
    async getStageBottleneckForUser(@Headers('x-user-id') requesterUserId: string, @Param('userId') userId: string) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        return this.statisticsService.getStageBottleneckForUser(userId);
    }

    @Get('status-distribution/:userId')
    async getStatusDistributionForUser(@Headers('x-user-id') requesterUserId: string, @Param('userId') userId: string) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        return this.statisticsService.getStatusDistributionForUser(userId);
    }

    @Get('top-completed-projects/:userId')
    async getTopCompletedProjectsForUser(@Headers('x-user-id') requesterUserId: string, @Param('userId') userId: string) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        return this.statisticsService.getTopCompletedProjectsForUser(userId);
    }

    @Get('overall-statistics/:userId')
    async getOverallStatisticsForUser(@Headers('x-user-id') requesterUserId: string, @Param('userId') userId: string) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        return this.statisticsService.getOverallStatisticsForUser(userId);
    }
}

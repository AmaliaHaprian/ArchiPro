import { Controller, Get, Param, Headers, Req } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Logger } from '@nestjs/common';
import { AccessControlService } from '../user/access-control.service';
import { PermissionCode } from '../user/access-control';
import { UseGuards } from '@nestjs/common';
import { Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PermissionGuard } from 'src/auth/permission.guard';
import { RequirePermissions } from 'src/auth/require-permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('statistics')
export class StatisticsController {
    private readonly logger = new Logger(StatisticsController.name);
    
    constructor(
        private readonly statisticsService: StatisticsService,
        private readonly accessControlService: AccessControlService,
    ) {}

    @Get('projects-by-category')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getProjectsByCategory(@Request() request) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        return this.statisticsService.getProjectsByCategory();
    }

    @Get('stage-bottleneck')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getStageBottleneck(@Request() request) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        return this.statisticsService.getStageBottleneck();
    }

    @Get('status-distribution')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getStatusDistribution(@Request() request) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        return this.statisticsService.getStatusDistribution();
    }

    @Get('top-completed-projects')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getTopCompletedProjects(@Request() request) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        return this.statisticsService.getTopCompletedProjects();
    }

    @Get('overall-statistics')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getOverallStatistics(@Request() request) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        this.logger.log('GET/overall-statistics called');
        return this.statisticsService.getOverallStatistics();
    }

    @Get('projects-by-category/:userId')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getProjectsByCategoryForUser(@Request() request, @Param('userId') userId: string) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        return this.statisticsService.getProjectsByCategoryForUser(userId);
    }

    @Get('stage-bottleneck/:userId')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getStageBottleneckForUser(@Request() request, @Param('userId') userId: string) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        return this.statisticsService.getStageBottleneckForUser(userId);
    }

    @Get('status-distribution/:userId')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getStatusDistributionForUser(@Request() request, @Param('userId') userId: string) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        return this.statisticsService.getStatusDistributionForUser(userId);
    }

    @Get('top-completed-projects/:userId')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getTopCompletedProjectsForUser(@Request() request, @Param('userId') userId: string) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        return this.statisticsService.getTopCompletedProjectsForUser(userId);
    }

    @Get('overall-statistics/:userId')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getOverallStatisticsForUser(@Request() request, @Param('userId') userId: string) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        return this.statisticsService.getOverallStatisticsForUser(userId);
    }
}

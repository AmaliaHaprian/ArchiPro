import { Controller, Delete, Get, Post, Put, Body, Param, Logger, NotFoundException, HttpCode, Query, DefaultValuePipe, UseInterceptors, Headers, ForbiddenException, UseGuards, Req } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectMapper } from './projectMapper';
import { CreateProjectDto } from './dtos/createProjectDto';
import { UpdateProjectDto } from './dtos/updateProjectDto';
import { ProjectFilter } from './Project';
import type { Action } from './Project';
import { LogInterceptor } from '../logging/logInterceptor';
import { AccessControlService } from '../user/access-control.service';
import { PermissionCode } from '../user/access-control';
import { Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { de } from '@faker-js/faker';
import { PermissionGuard } from 'src/auth/permission.guard';
import { RequirePermissions } from 'src/auth/require-permission.decorator';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('projects')
@UseInterceptors(LogInterceptor)
export class ProjectController {
    private readonly logger = new Logger(ProjectController.name);

    constructor(
        private readonly projectService: ProjectService,
        private readonly projectMapper: ProjectMapper,
        private readonly accessControlService: AccessControlService,
    ) {}

    @Get()
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getAllProjects(@Request() request, @Query('page') page: number=1 ) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        this.logger.log('GET /projects called');
        const projects = await this.projectService.getPaginated(page);
        console.log(projects);
        return projects.map((project) => this.projectMapper.toDto(project));
    }

    @Get('filter')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async filterProjects(@Request() request, @Query('page') page: number=1,
                    @Query('title', new DefaultValuePipe('')) title: string,
                    @Query('category', new DefaultValuePipe('')) category?: string, 
                    @Query('status', new DefaultValuePipe('')) status?: string) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        this.logger.log(`GET /projects/filter?category=${category}&status=${status} called`);
        const filter: ProjectFilter = {
            category: category as any,
            status: status as any,
        };
        const projects = await this.projectService.getPaginatedFiltered(page, title, filter);
        return projects.map((project) => this.projectMapper.toDto(project));
    }

    @Get(':id')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getProjectById(@Request() request, @Param('id') id: string) {
        const requesterUserId = request.user?.userId;
        this.logger.log(`GET /projects/${id} called`);
        const project = await this.projectService.findProjectById(id);
        if (!project) {
            throw new NotFoundException(`Project with id ${id} not found`);
        }
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireProjectOwnerOrAdmin(requesterUserId, project);
        return this.projectMapper.toDto(project);
    }

    @Post()
    @HttpCode(201)
    @RequirePermissions(PermissionCode.PROJECT_CREATE)
    async createProject(@Request() request, @Body() createProjectDto: CreateProjectDto) {
        const requesterUserId = request.user?.userId;
        const requester = await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_CREATE);
        if (requester.role?.name !== 'ADMIN' && createProjectDto.userId !== requester.id) {
            throw new ForbiddenException('Cannot create a project for another user');
        }
        this.logger.log(`POST /projects payload: ${JSON.stringify(createProjectDto)}`);
        const project = await this.projectMapper.toEntityFromCreateDto(createProjectDto);
        this.logger.log(`Mapped project entity: ${JSON.stringify(project)}`);
        const savedProject = await this.projectService.saveProject(project);
        return this.projectMapper.toDto(savedProject);
    }

    @Delete(':id')
    @HttpCode(204)
    @RequirePermissions(PermissionCode.PROJECT_DELETE)
    async deleteProject(@Request() request, @Param('id') id: string) {
        const requesterUserId = request.user?.userId;
        this.logger.log(`DELETE /projects/${id} called`);
        
        const existingProject = await this.projectService.findProjectById(id);
        if (!existingProject) {
            throw new NotFoundException(`Project with id ${id} not found`);
        }

        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_DELETE);
        await this.accessControlService.requireProjectOwnerOrAdmin(requesterUserId, existingProject);

        await this.projectService.deleteProject(id);
        return { message: 'Project deleted successfully' };
    }

    @Put(':id')
    @RequirePermissions(PermissionCode.PROJECT_UPDATE)
    @HttpCode(200)
    async updateProject(@Request() request, @Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        const requesterUserId = request.user?.userId;
        this.logger.log(`PUT /projects/${id} payload: ${JSON.stringify(updateProjectDto)}`);
        
        const existingProject = await this.projectService.findProjectById(id);
        if (!existingProject) {
            throw new NotFoundException(`Project with id ${id} not found`);
        }

        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_UPDATE);
        await this.accessControlService.requireProjectOwnerOrAdmin(requesterUserId, existingProject);
        existingProject.category = updateProjectDto.category;
        existingProject.description = updateProjectDto.description;
        existingProject.endDate = updateProjectDto.endDate;
        existingProject.updatedAt = new Date();
        const savedProject = await this.projectService.updateProject(id, existingProject);
        return this.projectMapper.toDto(savedProject);
    }

    @Post('/sync')
    @HttpCode(200)
    @RequirePermissions(PermissionCode.PROJECT_CREATE)
    async syncOfflineData(@Request() request, @Body() actionQueue: Action[]) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_CREATE);
        this.logger.log(`POST /projects/sync payload: ${JSON.stringify(actionQueue)}`);
        await this.projectService.syncOfflineData(actionQueue);
        return { message: 'Offline data synchronized successfully' };
    }

    @Post('start-fake-data')
    @RequirePermissions(PermissionCode.MANAGE_PROJECTS)
    async startFakeDataGeneration(@Request() request, @Query('userId') userId: string) {
        const requesterUserId = request.user?.userId;
        const requester = await this.accessControlService.requirePermission(requesterUserId, PermissionCode.MANAGE_PROJECTS);
        if (requester.role?.name !== 'ADMIN' && requester.id !== userId) {
            throw new ForbiddenException('Cannot start fake data generation for another user');
        }
        this.projectService.startFakeProjectGeneration(userId);
        return { message: 'Fake data generation started successfully' };
    }

    @Post('stop-fake-data')
    @RequirePermissions(PermissionCode.MANAGE_PROJECTS)
    async stopFakeDataGeneration(@Request() request) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.MANAGE_PROJECTS);
        this.projectService.stopFakeProjectGeneration();
        return { message: 'Fake data generation stopped successfully' };
    }

    @Get('user/:userId')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getPaginatedByUserId(@Request() request, @Param('userId') userId: string, @Query('page') page: number=1) {
        const requesterUserId = request.user?.userId;
        this.logger.log(`GET /projects/user/${userId}?page=${page} called`);
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        const projects = await this.projectService.getPaginatedByUserId(userId, page);
        return projects.map((project) => this.projectMapper.toDto(project));
    }

    @Get('user/:userId/filter')
    @RequirePermissions(PermissionCode.PROJECT_VIEW)
    async getPaginatedFilteredByUserId(@Request() request, @Param('userId') userId: string, @Query('page') page: number=1, @Query('title') title: string='', @Query('category') category?: string, @Query('status') status?: string) {
        debugger;
        const requesterUserId = request.user?.userId;
        console.log(requesterUserId, userId);
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        const filter: ProjectFilter = {
            category: category as any,
            status: status as any,
        };
        const filteredProjects = await this.projectService.getPaginatedFilteredByUserId(userId, page, title, filter);
        return filteredProjects.map((project) => this.projectMapper.toDto(project));
    }
}

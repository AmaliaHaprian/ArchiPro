import { Controller, Delete, Get, Post, Put, Body, Param, Logger, NotFoundException, HttpCode, Query, DefaultValuePipe, UseInterceptors, Headers, ForbiddenException } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectMapper } from './projectMapper';
import { CreateProjectDto } from './dtos/createProjectDto';
import { UpdateProjectDto } from './dtos/updateProjectDto';
import { ProjectFilter } from './Project';
import type { Action } from './Project';
import { LogInterceptor } from '../logging/logInterceptor';
import { AccessControlService } from '../user/access-control.service';
import { PermissionCode } from '../user/access-control';

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
    async getAllProjects(@Headers('x-user-id') requesterUserId: string, @Query('page') page: number=1 ) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        this.logger.log('GET /projects called');
        const projects = await this.projectService.getPaginated(page);
        console.log(projects);
        return projects.map((project) => this.projectMapper.toDto(project));
    }

    @Get('filter')
    async filterProjects(@Headers('x-user-id') requesterUserId: string, @Query('page') page: number=1,
                    @Query('title', new DefaultValuePipe('')) title: string,
                    @Query('category', new DefaultValuePipe('')) category?: string, 
                    @Query('status', new DefaultValuePipe('')) status?: string) {
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
    async getProjectById(@Headers('x-user-id') requesterUserId: string, @Param('id') id: string) {
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
    async createProject(@Headers('x-user-id') requesterUserId: string, @Body() createProjectDto: CreateProjectDto) {
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
    async deleteProject(@Headers('x-user-id') requesterUserId: string, @Param('id') id: string) {
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
    @HttpCode(200)
    async updateProject(@Headers('x-user-id') requesterUserId: string, @Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
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
    async syncOfflineData(@Headers('x-user-id') requesterUserId: string, @Body() actionQueue: Action[]) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_CREATE);
        this.logger.log(`POST /projects/sync payload: ${JSON.stringify(actionQueue)}`);
        await this.projectService.syncOfflineData(actionQueue);
        return { message: 'Offline data synchronized successfully' };
    }

    @Post('start-fake-data')
    async startFakeDataGeneration(@Headers('x-user-id') requesterUserId: string, @Query('userId') userId: string) {
        const requester = await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_CREATE);
        if (requester.role?.name !== 'ADMIN' && requester.id !== userId) {
            throw new ForbiddenException('Cannot start fake data generation for another user');
        }
        this.projectService.startFakeProjectGeneration(userId);
        return { message: 'Fake data generation started successfully' };
    }

    @Post('stop-fake-data')
    async stopFakeDataGeneration(@Headers('x-user-id') requesterUserId: string) {
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_CREATE);
        this.projectService.stopFakeProjectGeneration();
        return { message: 'Fake data generation stopped successfully' };
    }

    @Get('user/:userId')
    async getPaginatedByUserId(@Headers('x-user-id') requesterUserId: string, @Param('userId') userId: string, @Query('page') page: number=1) {
        this.logger.log(`GET /projects/user/${userId}?page=${page} called`);
        await this.accessControlService.requirePermission(requesterUserId, PermissionCode.PROJECT_VIEW);
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, userId);
        const projects = await this.projectService.getPaginatedByUserId(userId, page);
        return projects.map((project) => this.projectMapper.toDto(project));
    }

    @Get('user/:userId/filter')
    async getPaginatedFilteredByUserId(@Headers('x-user-id') requesterUserId: string, @Param('userId') userId: string, @Query('page') page: number=1, @Query('title') title: string='', @Query('category') category?: string, @Query('status') status?: string) {
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

import { Controller, Delete, Get, Post, Put, Body, Param, Logger, NotFoundException, HttpCode, Query, DefaultValuePipe } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectMapper } from './projectMapper';
import { CreateProjectDto } from './dtos/createProjectDto';
import { UpdateProjectDto } from './dtos/updateProjectDto';
import { ProjectFilter } from './Project';
import type { Action } from './Project';

@Controller('projects')
export class ProjectController {
    private readonly logger = new Logger(ProjectController.name);

    constructor(private readonly projectService: ProjectService, private readonly projectMapper: ProjectMapper) {}

    @Get()
    async getAllProjects(@Query('page') page: number=1 ) {
        this.logger.log('GET /projects called');
        const projects = await this.projectService.getPaginated(page);
        console.log(projects);
        return projects.map((project) => this.projectMapper.toDto(project));
    }

    @Get('filter')
    async filterProjects( @Query('page') page: number=1,
                    @Query('title', new DefaultValuePipe('')) title: string,
                    @Query('category', new DefaultValuePipe('')) category?: string, 
                    @Query('status', new DefaultValuePipe('')) status?: string) {
        this.logger.log(`GET /projects/filter?category=${category}&status=${status} called`);
        const filter: ProjectFilter = {
            category: category as any,
            status: status as any,
        };
        const projects = await this.projectService.getPaginatedFiltered(page, title, filter);
        return projects.map((project) => this.projectMapper.toDto(project));
    }

    @Get(':id')
    async getProjectById(@Param('id') id: string) {
        this.logger.log(`GET /projects/${id} called`);
        const project = await this.projectService.findProjectById(id);
        if (!project) {
            throw new NotFoundException(`Project with id ${id} not found`);
        }
        return this.projectMapper.toDto(project);
    }

    @Post()
    @HttpCode(201)
    async createProject(@Body() createProjectDto: CreateProjectDto) {
        this.logger.log(`POST /projects payload: ${JSON.stringify(createProjectDto)}`);
        const project = await this.projectMapper.toEntityFromCreateDto(createProjectDto);
        this.logger.log(`Mapped project entity: ${JSON.stringify(project)}`);
        const savedProject = await this.projectService.saveProject(project);
        return this.projectMapper.toDto(savedProject);
    }

    @Delete(':id')
    @HttpCode(204)
    async deleteProject(@Param('id') id: string) {
        this.logger.log(`DELETE /projects/${id} called`);
        
        const existingProject = await this.projectService.findProjectById(id);
        if (!existingProject) {
            throw new NotFoundException(`Project with id ${id} not found`);
        }

        await this.projectService.deleteProject(id);
        return { message: 'Project deleted successfully' };
    }

    @Put(':id')
    @HttpCode(200)
    async updateProject(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        this.logger.log(`PUT /projects/${id} payload: ${JSON.stringify(updateProjectDto)}`);
        
        const existingProject = await this.projectService.findProjectById(id);
        if (!existingProject) {
            throw new NotFoundException(`Project with id ${id} not found`);
        }
        existingProject.category = updateProjectDto.category;
        existingProject.description = updateProjectDto.description;
        existingProject.endDate = updateProjectDto.endDate;
        existingProject.updatedAt = new Date();
        const savedProject = await this.projectService.updateProject(id, existingProject);
        return this.projectMapper.toDto(savedProject);
    }

    @Post('/sync')
    @HttpCode(200)
    syncOfflineData(@Body() actionQueue: Action[]) {
        this.logger.log(`POST /projects/sync payload: ${JSON.stringify(actionQueue)}`);
        this.projectService.syncOfflineData(actionQueue);
        return { message: 'Offline data synchronized successfully' };
    }

    @Post('start-fake-data')
    startFakeDataGeneration(@Query('userId') userId: string) {
        this.projectService.startFakeProjectGeneration(userId);
        return { message: 'Fake data generation started successfully' };
    }

    @Post('stop-fake-data')
    stopFakeDataGeneration() {
        this.projectService.stopFakeProjectGeneration();
        return { message: 'Fake data generation stopped successfully' };
    }

    @Get('user/:userId')
    async getPaginatedByUserId(@Param('userId') userId: string, @Query('page') page: number=1) {
        this.logger.log(`GET /projects/user/${userId}?page=${page} called`);
        const projects = await this.projectService.getPaginatedByUserId(userId, page);
        return projects.map((project) => this.projectMapper.toDto(project));
    }

    @Get('user/:userId/filter')
    async getPaginatedFilteredByUserId(@Param('userId') userId: string, @Query('page') page: number=1, @Query('title') title: string='', @Query('category') category?: string, @Query('status') status?: string) {
        const filter: ProjectFilter = {
            category: category as any,
            status: status as any,
        };
        const filteredProjects = await this.projectService.getPaginatedFilteredByUserId(userId, page, title, filter);
        return filteredProjects.map((project) => this.projectMapper.toDto(project));
    }
}

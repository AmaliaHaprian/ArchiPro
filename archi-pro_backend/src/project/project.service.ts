import { Injectable } from '@nestjs/common';
import { ProjectRepository } from './projectRepo';
import { Project } from './Project';
import { ProjectFilter } from './Project';
import type { Action } from './Project';
import { ProjectWebSocketGateway } from './websocketGateway';
import { generateBatchOfFakeProjects } from './generateFakeData';
import { User } from '../user/user';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class ProjectService {
    private fakeProjectInterval: NodeJS.Timeout | null = null;
    

    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        private readonly projectWebSocketGateway: ProjectWebSocketGateway,
        private readonly loggingService: LoggingService,
    ) {}

    //
    async getAllProjects() {
        return await this.projectRepository.find({ relations: { user: true } });
    }
    //
    async saveProject(project: Project) {
        return await this.projectRepository.save(project);
    }
    //
    async deleteProject(id: string) {
        return await this.projectRepository.delete(id);
    }
    //
    async updateProject(id: string, updatedProject: Project) {
        return await this.projectRepository.save(updatedProject);
    }

    async findProjectById(id: string) {
        return await this.projectRepository.findOne({ where: { id }, relations: { user: true } });
    }

    async getPaginated(page: number) {
        const pageSize = 5;
        const skip = (page - 1) * pageSize;
        return await this.projectRepository.find({ skip, take: pageSize, relations: { user: true } });
    }
    //
    async getProjectsByUserId(userId: string) {
        return await this.projectRepository.find({ where: { user: { id: userId } }, relations: { user: true } });
    }
    //
    async getPaginatedByUserId(userId: string, page: number) {
        const pageSize = 5;
        const skip = (page - 1) * pageSize;
        return await this.projectRepository.find({ where: { user: { id: userId } }, skip, take: pageSize, relations: { user: true } });
    }
    //
    async searchByTitle(title: string) {
        return await this.projectRepository.find({ where: { title: ILike(`%${title}%`) }, relations: { user: true } });
    }
    //
    async searchByTitleAndUserId(userId: string, title: string) {
        return await this.projectRepository.find({ where: { user: { id: userId }, title: ILike(`%${title}%`) }, relations: { user: true } });
    }
    //
    async filterandSearchProjects(title: string, filter: ProjectFilter) {
        return await this.projectRepository.find({ where: {
            title: ILike(`%${title}%`),
            ...(filter.category ? { category: filter.category } : {}),
            ...(filter.status ? { status: filter.status } : {})
        }, relations: { user: true } });
    }
    //
    async getPaginatedFiltered(page: number, title: string, filter: ProjectFilter) {
        const pageSize = 5;
        const skip = (page - 1) * pageSize;
        return await this.projectRepository.find({ where: {
            title: ILike(`%${title}%`),
            ...(filter.category ? { category: filter.category } : {}),
            ...(filter.status ? { status: filter.status } : {})
        }, skip, take: pageSize, relations: { user: true } });
    }
    //
    async filterandSearchProjectsByUserId(userId: string, title: string, filter: ProjectFilter) {
        return await this.projectRepository.find({ where: {
            user: { id: userId },
            title: ILike(`%${title}%`),
            ...(filter.category ? { category: filter.category } : {}),
            ...(filter.status ? { status: filter.status } : {})
        }, relations: { user: true } });
    }
    //
    async getPaginatedFilteredByUserId(userId: string, page: number, title: string, filter: ProjectFilter) {
        const pageSize = 5;
        const skip = (page - 1) * pageSize;
        return await this.projectRepository.find({ where: {
            user: { id: userId },
            title: ILike(`%${title}%`),
            ...(filter.category ? { category: filter.category } : {}),
            ...(filter.status ? { status: filter.status } : {})
        }, skip, take: pageSize, relations: { user: true } });
    }
    
    async syncOfflineData(actionQueue: Action[]) {
        for (const action of actionQueue) {
            switch (action.type) {
                case 'add':
                    await this.saveProject(action.data.project);
                    break;
                case 'update':
                    await this.updateProject(action.data.id, action.data.project);
                    break;
                case 'delete':
                    await this.deleteProject(action.data.id);
                    break;
            }
        }
    }

    
    startFakeProjectGeneration(userId: string) {
        if (this.fakeProjectInterval) return;

        this.fakeProjectInterval = setInterval(() => {
            try {
                const user = new User("", "", "", userId);
                const batch = generateBatchOfFakeProjects(user);
                Promise.all(batch.map(project => this.projectRepository.save(project)));
                this.projectWebSocketGateway.broadcastProjectsAdded(batch);
                void this.loggingService.recordAction({
                    userId,
                    group: 'ADMIN',
                    action: 'FAKE_DATA_BATCH_CREATED',
                    payload: { batchSize: batch.length },
                });
            } catch (error) {
                console.error('Fake project generation failed:', error);
            }
        }, 5000);
    }

    stopFakeProjectGeneration() {
        if (this.fakeProjectInterval) {
            clearInterval(this.fakeProjectInterval);
            this.fakeProjectInterval = null;
        }
    }
}

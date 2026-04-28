import { Injectable } from '@nestjs/common';
import { ProjectRepository } from './projectRepo';
import { Project } from './Project';
import { ProjectFilter } from './Project';
import type { Action } from './Project';
import { ProjectWebSocketGateway } from './websocketGateway';
import { generateBatchOfFakeProjects } from './generateFakeData';

@Injectable()
export class ProjectService {
    private fakeProjectInterval: NodeJS.Timeout | null = null;

    constructor(private readonly projectRepository: ProjectRepository,
        private readonly projectWebSocketGateway: ProjectWebSocketGateway
    ) {}

    getAllProjects() {
        return this.projectRepository.getAll();
    }

    saveProject(project: Project) {
        return this.projectRepository.save(project);
    }

    deleteProject(id: string) {
        this.projectRepository.delete(id);
    }

    updateProject(id: string, updatedProject: Project) {
        this.projectRepository.update(id, updatedProject);
    }

    findProjectById(id: string) {
        return this.projectRepository.findById(id);
    }

    getPaginated(page: number) {
        return this.projectRepository.getPaginated(page);
    }

    getProjectsByUserId(userId: string) {
        return this.projectRepository.getProjectsByUserId(userId);
    }

    getPaginatedByUserId(userId: string, page: number) {
        return this.projectRepository.getPaginatedByUserId(userId, page);
    }

    searchByTitle(title: string) {
        const allProjects = this.projectRepository.getAll();
        return allProjects.filter(project => project.title.toLowerCase().includes(title.toLowerCase()));
    }

    searchByTitleAndUserId(userId: string, title: string) {
        const userProjects = this.projectRepository.getProjectsByUserId(userId);
        return userProjects.filter(project => project.title.toLowerCase().includes(title.toLowerCase()));
    }

    filterandSearchProjects(title: string, filter: ProjectFilter) {
        
        const projects = this.searchByTitle(title);
        if( filter.category?.toString() == ''  && filter.status?.toString() == '') {
            return projects;
        }

        return projects.filter(project => {
            if (filter.category && project.category !== filter.category) {
                return false;
            }
            if (filter.status && project.status !== filter.status) {
                return false;
            }
            return true;
        });
    }

    getPaginatedFiltered(page: number, title: string, filter: ProjectFilter) {
        const filteredProjects = this.filterandSearchProjects(title, filter);

        const pageSize = 5;
        const startIndex = (page - 1) * pageSize;
        return filteredProjects.slice(startIndex, startIndex + pageSize);
    }

    filterandSearchProjectsByUserId(userId: string, title: string, filter: ProjectFilter) {
        const projects = this.searchByTitleAndUserId(userId, title);
        console.log('Length of projects for user', userId, ':', projects.length);
        if( filter.category?.toString() == ''  && filter.status?.toString() == '') {
            return projects;
        }

        return projects.filter(project => {
            if (filter.category && project.category !== filter.category) {
                return false;
            }
            if (filter.status && project.status !== filter.status) {
                return false;
            }
            return true;
        });
    }

    getPaginatedFilteredByUserId(userId: string, page: number, title: string, filter: ProjectFilter) {
        const filteredProjects = this.filterandSearchProjectsByUserId(userId, title, filter);
        const pageSize = 5;
        const startIndex = (page - 1) * pageSize;
        return filteredProjects.slice(startIndex, startIndex + pageSize);
    }
    
    syncOfflineData(actionQueue: Action[]) {
        for (const action of actionQueue) {
            switch (action.type) {
                case 'add':
                    this.saveProject(action.data.project);
                    break;
                case 'update':
                    this.updateProject(action.data.id, action.data.project);
                    break;
                case 'delete':
                    this.deleteProject(action.data.id);
                    break;
            }

        }
    }

    startFakeProjectGeneration(userId: string) {
        if (this.fakeProjectInterval) return;

        this.fakeProjectInterval = setInterval(() => {
            try {
                const batch = generateBatchOfFakeProjects(userId);
                batch.forEach(project => this.projectRepository.save(project));
                this.projectWebSocketGateway.broadcastProjectsAdded(batch);
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

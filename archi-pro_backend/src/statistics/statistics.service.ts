import { Injectable } from '@nestjs/common';
import { ProjectRepository } from 'src/project/projectRepo';

@Injectable()
export class StatisticsService {
    constructor(private readonly projectRepository: ProjectRepository) {}

    getProjectsByCategory() {
        const projects = this.projectRepository.getAll();
        const categories = projects.reduce((acc, project) => {
            const category = project.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {}  as Record<string, number>);
        return categories;
    }

    getStageBottleneck() {
        const projects = this.projectRepository.getAll();
        const stages = projects.reduce((acc, project) => {
            const stage = project.currentStage;
            acc[stage] = (acc[stage] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return stages;
    }

    getStatusDistribution() {
        const projects = this.projectRepository.getAll();
        const statusDistribution = projects.reduce((acc, project) => {
            const status = project.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return statusDistribution;
    }

    getTopCompletedProjects() {
        const projects = this.projectRepository.getAll();
        const completedProjects = projects.filter(project => project.status === 'DONE');
        const topProjects = completedProjects.sort((a, b) => b.workingHours - a.workingHours).slice(0, 5);

        return topProjects.slice(0, 3);
    }

    getOverallStatistics() {
        const projects = this.projectRepository.getAll();
        console.log(projects.length);
        const totalProjects = projects.length;
        const completedProjects = projects.filter(project => project.status === 'DONE').length;
        const averageWorkingHours = totalProjects > 0 ? projects.reduce((acc, project) => acc + project.workingHours, 0) / totalProjects : 0;
        const averageProgress = totalProjects > 0 ? projects.reduce((acc, project) =>  acc + project.progress, 0) / totalProjects : 0;
        return {
            totalProjects,
            completedProjects,
            averageWorkingHours,
            averageProgress
        };
    }

    getProjectsByCategoryForUser(userId: string) {
        const projects = this.projectRepository.getProjectsByUserId(userId);
        const categories = projects.reduce((acc, project) => {
            const category = project.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {}  as Record<string, number>);
        return categories;
    }

    getStageBottleneckForUser(userId: string) {
        const projects = this.projectRepository.getProjectsByUserId(userId);
        const stages = projects.reduce((acc, project) => {
            const stage = project.currentStage;
            acc[stage] = (acc[stage] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return stages;
    }

    getStatusDistributionForUser(userId: string) {
        const projects = this.projectRepository.getProjectsByUserId(userId);
        const statusDistribution = projects.reduce((acc, project) => {
            const status = project.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return statusDistribution;
    }

    getTopCompletedProjectsForUser(userId: string) {
        const projects = this.projectRepository.getProjectsByUserId(userId);
        const completedProjects = projects.filter(project => project.status === 'DONE');
        const topProjects = completedProjects.sort((a, b) => b.workingHours - a.workingHours).slice(0, 5);
        return topProjects.slice(0, 3);
    }

    getOverallStatisticsForUser(userId: string) {
        const projects = this.projectRepository.getProjectsByUserId(userId);
        const totalProjects = projects.length;
        const deadlines = projects.filter(project => project.status === 'DONE').length;
        const averageWorkingHours = totalProjects > 0 ? projects.reduce((acc, project) => acc + project.workingHours, 0) / totalProjects : 0;
        const averageProgress = totalProjects > 0 ? projects.reduce((acc, project) =>  acc + project.progress, 0) / totalProjects : 0;
        return {
            totalProjects,
            deadlines,
            averageWorkingHours,
            averageProgress
        };
    }
}

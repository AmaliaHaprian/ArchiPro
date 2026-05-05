import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/project/Project';
import { ProjectRepository } from 'src/project/projectRepo';
import { Repository } from 'typeorm';
    
@Injectable()
export class StatisticsService {
    constructor(
        @InjectRepository(Project)
        private projectRepository: Repository<Project>
    ) {}

    async getProjectsByCategory() {
        const projects = await this.projectRepository.find();
        const categories = projects.reduce((acc, project) => {
            const category = project.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {}  as Record<string, number>);
        return categories;
    }

    async getStageBottleneck() {
        const projects = await this.projectRepository.find();
        const stages = projects.reduce((acc, project) => {
            const stage = project.currentStage;
            acc[stage] = (acc[stage] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return stages;
    }

    async getStatusDistribution() {
        const projects = await this.projectRepository.find();
        const statusDistribution = projects.reduce((acc, project) => {
            const status = project.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return statusDistribution;
    }

    async getTopCompletedProjects() {
        const projects = await this.projectRepository.find();
        const completedProjects = projects.filter(project => project.status === 'DONE');
        const topProjects = completedProjects.sort((a, b) => b.workingHours - a.workingHours).slice(0, 5);

        return topProjects.slice(0, 3);
    }

    async getOverallStatistics() {
        const projects = await this.projectRepository.find();
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

    async getProjectsByCategoryForUser(userId: string) {
        const projects = await this.projectRepository.find({ where: { user: { id: userId } } });
        const categories = projects.reduce((acc, project) => {
            const category = project.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {}  as Record<string, number>);
        return categories;
    }

    async getStageBottleneckForUser(userId: string) {
        const projects = await this.projectRepository.find({ where: { user: { id: userId } } });
        const stages = projects.reduce((acc, project) => {
            const stage = project.currentStage;
            acc[stage] = (acc[stage] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return stages;
    }

    async getStatusDistributionForUser(userId: string) {

        
        const projects = await this.projectRepository.find({ where: { user: { id: userId } } });
        const statusDistribution = projects.reduce((acc, project) => {
            const status = project.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return statusDistribution;
    }

    async getTopCompletedProjectsForUser(userId: string) {
        const projects = await this.projectRepository.find({ where: { user: { id: userId } } });
        const completedProjects = projects.filter(project => project.status === 'DONE');
        const topProjects = completedProjects.sort((a, b) => b.workingHours - a.workingHours).slice(0, 5);
        return topProjects.slice(0, 3);
    }

    async getOverallStatisticsForUser(userId: string) {
        const result = await this.projectRepository.query(`
            SELECT * FROM get_overall_statistics_for_user($1)
        `, [userId]);

        if (result && result.length > 0) {
            const row = result[0];
            console.log('Raw statistics result from database for user:', userId, row);
            return {
                totalProjects: Number(row.totalprojects),
                deadlines: Number(row.deadlines),
                averageWorkingHours: Number(row.averageworkinghours),
                averageProgress: Number(row.averageprogress)
            };
        }
        return {
            totalProjects: 0,
            deadlines: 0,
            averageWorkingHours: 0,
            averageProgress: 0
        };

    }
}

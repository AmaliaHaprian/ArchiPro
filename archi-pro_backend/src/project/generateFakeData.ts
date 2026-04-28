import { faker } from '@faker-js/faker';
import { Project, ProjectCategory, ProjectStatus, ProjectStage } from './Project';

function createFakeProject(id: string): Project {
    const userId=id;
    const title = faker.company.name();
    const description = faker.lorem.sentence();
    const category = faker.helpers.arrayElement(Object.values(ProjectCategory));
    const startDate = faker.date.past();
    const endDate = faker.date.future();
    
    const project = new Project(userId, title, category, description, startDate, endDate);

    project.workingHours = faker.number.int({ min: 0, max: 50 });
    project.status = faker.helpers.arrayElement(Object.values(ProjectStatus));
    project.currentStage = faker.helpers.arrayElement(Object.values(ProjectStage));
    project.progress = faker.number.int({ min: 0, max: 100 });

    return project;
}

export function generateBatchOfFakeProjects(id: string): Project[] {
    const projects: Project[] = [];
    for (let i = 0; i < 10; i++) {
        projects.push(createFakeProject(id));
    }
    return projects;
}
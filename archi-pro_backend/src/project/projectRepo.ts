import { Project } from "./Project";
import { Injectable } from "@nestjs/common";
import { ProjectCategory, ProjectStatus, ProjectStage } from "./Project";
import { UserRepository } from "../user/userRepository";
@Injectable()
export class ProjectRepository {
    private projects: Project[] = [];

    private normalizeDate(value: any, fallback: Date): Date {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return value;
        }

        if (typeof value === 'string' || typeof value === 'number') {
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed;
            }
        }

        return fallback;
    }

    private normalizeStatus(status: any): ProjectStatus {
        const statusMap: Record<string, ProjectStatus> = {
            NOT_STARTED: ProjectStatus.NOT_STARTED,
            "Not started": ProjectStatus.NOT_STARTED,
            PLANNING: ProjectStatus.PLANNING,
            Planning: ProjectStatus.PLANNING,
            IN_PROGRESS: ProjectStatus.IN_PROGRESS,
            "In progress": ProjectStatus.IN_PROGRESS,
            DONE: ProjectStatus.DONE,
            Done: ProjectStatus.DONE,
            Completed: ProjectStatus.DONE,
        };

        return statusMap[status] ?? ProjectStatus.PLANNING;
    }

    private normalizeCategory(category: any): ProjectCategory {
        const categoryMap: Record<string, ProjectCategory> = {
            RESIDENTIAL: ProjectCategory.RESIDENTIAL,
            Residential: ProjectCategory.RESIDENTIAL,
            LANDSCAPE: ProjectCategory.LANDSCAPE,
            Landscape: ProjectCategory.LANDSCAPE,
            URBAN: ProjectCategory.URBAN,
            Urban: ProjectCategory.URBAN,
            MIXED_USE: ProjectCategory.MIXED_USE,
            "Mixed use": ProjectCategory.MIXED_USE,
            "Mixed Use": ProjectCategory.MIXED_USE,
            CULTURAL: ProjectCategory.CULTURAL,
            Cultural: ProjectCategory.CULTURAL,
            INFRASTRUCTURE: ProjectCategory.INFRASTRUCTURE,
            Infrastructure: ProjectCategory.INFRASTRUCTURE,
            EDUCATIONAL: ProjectCategory.EDUCATIONAL,
            Educational: ProjectCategory.EDUCATIONAL,
            ENTERTAINMENT: ProjectCategory.ENTERTAINMENT,
            Entertainment: ProjectCategory.ENTERTAINMENT,
            HISTORIC: ProjectCategory.HISTORIC,
            Historic: ProjectCategory.HISTORIC,
        };

        return categoryMap[category] ?? ProjectCategory.RESIDENTIAL;
    }

    private normalizeProject(project: any) {
        if (project?.status) {
            project.status = this.normalizeStatus(project.status);
        }
        if (project?.category) {
            project.category = this.normalizeCategory(project.category);
        }
        if (project?.startDate !== undefined && project?.startDate !== null) {
            project.startDate = this.normalizeDate(project.startDate, new Date());
        }
        if (project?.endDate !== undefined && project?.endDate !== null) {
            project.endDate = this.normalizeDate(project.endDate, new Date());
        }
        if (project?.createdAt !== undefined && project?.createdAt !== null) {
            project.createdAt = this.normalizeDate(project.createdAt, new Date());
        }
        if (project?.updatedAt !== undefined && project?.updatedAt !== null) {
            project.updatedAt = this.normalizeDate(project.updatedAt, new Date());
        }
    }

    private normalizeAllProjects() {
        this.projects.forEach(project => this.normalizeProject(project));
    }


    getAll() : Project[] {
        this.normalizeAllProjects();
        return this.projects;
    }

    save(project: Project) {
        this.normalizeProject(project);
        this.projects.unshift(project);
        console.log(this.projects.length);
        return project;
    }

    findById(id: string) {
        this.normalizeAllProjects();
        return this.projects.find(project => project.id === id);
    }

    delete(id: string) {
        this.projects = this.projects.filter(project => project.id !== id);
    }

    update(id: string, updatedProject: Project) {
        this.normalizeProject(updatedProject);
        const index = this.projects.findIndex(project => project.id === id);
        if (index !== -1) {
            if( updatedProject.category !== this.projects[index].category) 
                this.projects[index].category = updatedProject.category;
            if (updatedProject.description !== this.projects[index].description)
                this.projects[index].description = updatedProject.description;
            if (updatedProject.endDate !== this.projects[index].endDate)
                this.projects[index].endDate = updatedProject.endDate;
            this.projects[index].updatedAt = new Date();
        }
    }

    getPaginated(page: number) {
        this.normalizeAllProjects();
        const pageSize = 5;
        const startIndex = (page - 1) * pageSize;
        return this.projects.slice(startIndex, startIndex + pageSize);
    }
    
    getProjectsByUserId(userId: string): Project[] {
        this.normalizeAllProjects();
        return this.projects.filter(project => project.userId == userId);
    }

    getPaginatedByUserId(userId: string, page: number): Project[] {
        const userProjects = this.getProjectsByUserId(userId);
        const pageSize = 5;
        const startIndex = (page - 1) * pageSize;
        return userProjects.slice(startIndex, startIndex + pageSize);
    }

    constructor(private readonly userRepository: UserRepository) {
        const defaultUserId = this.userRepository.getAllUsers()[0].userId;
        const project1 = new Project(defaultUserId, "Housing Complex", ProjectCategory.RESIDENTIAL, "Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.", new Date("2024-01-01"), new Date("2025-12-31"));
        project1.status = ProjectStatus.IN_PROGRESS;
        project1.progress = 45;
        project1.currentStage = ProjectStage.DESIGN;
        project1.workingHours = 40;
        const project2 = new Project(defaultUserId, "Office Building", ProjectCategory.URBAN, "Designing a modern office building with sustainable features and flexible workspaces for a tech company.", new Date("2024-02-01"), new Date("2025-11-30"));
        project2.status = ProjectStatus.PLANNING;
        project2.progress = 20;
        project2.currentStage = ProjectStage.RESEARCH;
        project2.workingHours = 15;
        const project3 = new Project(defaultUserId, "Community Center", ProjectCategory.MIXED_USE, "Creating a community center that includes a library, sports facilities, and event spaces to serve the local neighborhood.", new Date("2024-03-01"), new Date("2025-10-31"));
        project3.status = ProjectStatus.PLANNING;
        project3.progress = 10;
        project3.currentStage = ProjectStage.RESEARCH;
        project3.workingHours = 10;
        const project4 = new Project(defaultUserId, "City Park", ProjectCategory.LANDSCAPE, "Designing a new city park with walking trails, playgrounds, and green spaces to enhance urban livability.", new Date("2024-04-01"), new Date("2025-09-30"));
        project4.status = ProjectStatus.PLANNING;
        project4.progress = 5;
        project4.currentStage = ProjectStage.RESEARCH;
        project4.workingHours = 5;
        const project5 = new Project(defaultUserId, "Museum of Modern Art", ProjectCategory.CULTURAL, "Creating a new museum of modern art that features innovative architecture and interactive exhibits.", new Date("2024-05-01"), new Date("2025-08-31"));
        project5.status = ProjectStatus.PLANNING;
        project5.progress = 15;
        project5.currentStage = ProjectStage.RESEARCH;
        project5.workingHours = 20;
        const project6 = new Project(defaultUserId, "Bridge Construction", ProjectCategory.INFRASTRUCTURE, "Constructing a new bridge to improve transportation connectivity between two major urban areas.", new Date("2024-06-01"), new Date("2025-07-31"));
        project6.status= ProjectStatus.IN_PROGRESS;
        project6.progress = 30;
        project6.currentStage = ProjectStage.SITE_ANALYSIS;
        project6.workingHours = 25;
        const project7 = new Project(defaultUserId, "University Campus", ProjectCategory.EDUCATIONAL, "Designing a new university campus that includes academic buildings, dormitories, and recreational facilities.", new Date("2024-07-01"), new Date("2025-06-30"));
        project7.status = ProjectStatus.IN_PROGRESS;
        project7.progress = 25;
        project7.currentStage = ProjectStage.DESIGN;
        project7.workingHours = 30;
        const project8 = new Project(defaultUserId, "Sports Stadium", ProjectCategory.URBAN, "Creating a new sports stadium that can host various sporting events and concerts, with a focus on sustainability.", new Date("2024-08-01"), new Date("2025-05-31"));
        project8.status = ProjectStatus.PLANNING;
        project8.progress = 10;
        project8.currentStage = ProjectStage.RESEARCH;
        project8.workingHours = 10;
        const project9 = new Project(defaultUserId, "Mixed-Use Development", ProjectCategory.MIXED_USE, "Designing a mixed-use development that combines residential, commercial, and recreational spaces in a vibrant urban setting.", new Date("2024-09-01"), new Date("2025-04-30"));
        project9.status = ProjectStatus.IN_PROGRESS;
        project9.progress = 35;
        project9.currentStage = ProjectStage.PROJECT_BRIEF;
        project9.workingHours = 35;
        const project10 = new Project(defaultUserId, "Historic Building Renovation", ProjectCategory.HISTORIC, "Renovating a historic building to preserve its architectural heritage while adapting it for modern use.", new Date("2024-10-01"), new Date("2025-03-31"));
        project10.status = ProjectStatus.IN_PROGRESS;
        project10.progress = 80;
        project10.currentStage = ProjectStage.VISUALIZATION;
        project10.workingHours = 90;
        const project11 = new Project(defaultUserId, "Urban Farm", ProjectCategory.URBAN, "Creating an urban farm that promotes sustainable agriculture and provides fresh produce to the local community.", new Date("2024-11-01"), new Date("2025-02-28"));
        project11.status = ProjectStatus.IN_PROGRESS;
        project11.progress = 50;
        project11.currentStage = ProjectStage.DESIGN;
        project11.workingHours = 50;
        const project12 = new Project(defaultUserId, "Cultural Center", ProjectCategory.CULTURAL, "Designing a cultural center that celebrates local art, music, and traditions while fostering community engagement.", new Date("2024-12-01"), new Date("2025-01-31"));
        project12.status = ProjectStatus.IN_PROGRESS;
        project12.progress = 40;
        project12.currentStage = ProjectStage.PROJECT_BRIEF;
        project12.workingHours = 40;
        const project13= new Project(defaultUserId, "Green Roof Initiative", ProjectCategory.LANDSCAPE, "Implementing a green roof initiative to promote biodiversity and reduce urban heat island effects in the city.", new Date("2025-01-01"), new Date("2025-12-31"));
        project13.status = ProjectStatus.IN_PROGRESS;
        project13.progress = 30;
        project13.currentStage = ProjectStage.PROJECT_BRIEF;
        project13.workingHours = 30;
        const project14 = new Project(defaultUserId, "Affordable Housing", ProjectCategory.RESIDENTIAL, "Designing affordable housing solutions to address the growing demand for housing in urban areas.", new Date("2025-02-01"), new Date("2025-11-30"));
        project14.status = ProjectStatus.IN_PROGRESS;
        project14.progress = 20;
        project14.currentStage = ProjectStage.SITE_ANALYSIS;
        project14.workingHours = 20;
        const project15 = new Project(defaultUserId, "Public Library", ProjectCategory.CULTURAL, "Creating a new public library that serves as a community hub for learning, creativity, and social interaction.", new Date("2025-03-01"), new Date("2025-10-31"));
        project15.status = ProjectStatus.IN_PROGRESS;
        project15.progress = 10;
        project15.currentStage = ProjectStage.PROJECT_BRIEF;
        project15.workingHours = 10;
        const project16 = new Project(defaultUserId, "Renewable Energy Plant", ProjectCategory.INFRASTRUCTURE, "Constructing a renewable energy plant that harnesses solar and wind power to provide clean energy to the city.", new Date("2025-04-01"), new Date("2025-09-30"));
        project16.status = ProjectStatus.IN_PROGRESS;
        project16.progress = 5;
        project16.currentStage = ProjectStage.PROJECT_BRIEF;
        project16.workingHours = 5;
        const project17 = new Project(defaultUserId, "Public Transportation Hub", ProjectCategory.INFRASTRUCTURE, "Designing a new public transportation hub that integrates various modes of transportation and promotes sustainable mobility.", new Date("2025-05-01"), new Date("2025-08-31"));
        project17.status = ProjectStatus.IN_PROGRESS;
        project17.progress = 15;
        project17.currentStage = ProjectStage.SITE_ANALYSIS;
        project17.workingHours = 15;
        const project18 = new Project(defaultUserId, "Art Gallery", ProjectCategory.CULTURAL, "Creating a new art gallery that showcases contemporary art and provides a platform for emerging artists.", new Date("2025-06-01"), new Date("2025-07-31"));
        project18.status = ProjectStatus.DONE;
        project18.progress = 100;
        project18.currentStage = ProjectStage.VISUALIZATION;
        project18.workingHours = 95;
        const project19 = new Project(defaultUserId, "Urban Renewal Project", ProjectCategory.URBAN, "Implementing an urban renewal project that revitalizes a neglected neighborhood and promotes economic development.", new Date("2025-06-30"), new Date("2025-07-01"));
        project19.status = ProjectStatus.IN_PROGRESS;
        project19.progress = 30;
        project19.currentStage = ProjectStage.PROJECT_BRIEF;
        project19.workingHours = 30;
        const project20 = new Project(defaultUserId, "Sustainable Housing Development", ProjectCategory.RESIDENTIAL, "Designing a sustainable housing development that incorporates energy-efficient features and promotes eco-friendly living.", new Date("2025-05-31"), new Date("2025-08-01"));
        project20.status = ProjectStatus.IN_PROGRESS;
        project20.progress = 25;
        project20.currentStage = ProjectStage.SITE_ANALYSIS;
        project20.workingHours = 25;
        this.save(project1);
        this.save(project2);
        this.save(project3);
        this.save(project4);
        this.save(project5);
        this.save(project6);
        this.save(project7);
        this.save(project8);
        this.save(project9);
        this.save(project10);
        this.save(project11);
        this.save(project12);
        this.save(project13);
        this.save(project14);
        this.save(project15);
        this.save(project16);
        this.save(project17);
        this.save(project18);
        this.save(project19);
        this.save(project20);
    }
}

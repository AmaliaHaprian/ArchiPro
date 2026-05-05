import { Injectable } from "@nestjs/common";
import { Project } from "./Project";
import { CreateProjectDto } from "./dtos/createProjectDto";
import { ProjectDto } from "./dtos/projectDto";
import { UpdateProjectDto } from "./dtos/updateProjectDto";
import { User } from "src/user/user";
import { ProjectService } from "./project.service";
import { UserService } from "src/user/user.service";

@Injectable()
export class ProjectMapper {
    private readonly userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    public toDto(project: Project): ProjectDto {
        return new ProjectDto(
            project.id,
            project.user?.id ?? (project as Project & { userId?: string }).userId ?? '',
            project.title,
            project.status,
            project.category,
            project.progress,
            project.description,
            project.startDate,
            project.endDate,
            project.createdAt,
            project.updatedAt,
            project.currentStage,
            project.workingHours,
            project.stageData

        );
    }

    public async toEntityFromCreateDto(createProjectDto: CreateProjectDto): Promise<Project> {
        const user = await this.userService.getUserById(createProjectDto.userId);
        console.log('User fetched for project creation:', user);
        if (!user) {
            throw new Error('User not found');
        }
        const project = new Project(user, createProjectDto.title, createProjectDto.category, createProjectDto.description, createProjectDto.startDate, createProjectDto.endDate);
        return project;
    }

    public fromDtoToEntity(projectDto: ProjectDto): Project {
            const user = new User('', '', '');
            user.id = projectDto.userId;
        const project = new Project(user, projectDto.title, projectDto.category, projectDto.description, projectDto.startDate, projectDto.endDate);
        project.id = projectDto.id;
        project.status = projectDto.status;
        project.createdAt = projectDto.createdAt;
        project.progress = projectDto.progress;
        project.updatedAt = projectDto.updatedAt;
        project.currentStage = projectDto.currentStage;
        project.workingHours = projectDto.workingHours;
        project.stageData = projectDto.stageData;
        return project;
    }

    public toEntityFromUpdateDto(updateProjectDto: UpdateProjectDto, user: User): Project {
        const project = new Project(user, "", updateProjectDto.category, updateProjectDto.description, new Date(), updateProjectDto.endDate);
        return project;
    }

}
import { Injectable } from "@nestjs/common";
import { Project } from "./Project";
import { CreateProjectDto } from "./dtos/createProjectDto";
import { ProjectDto } from "./dtos/projectDto";
import { UpdateProjectDto } from "./dtos/updateProjectDto";

@Injectable()
export class ProjectMapper {
    public toDto(project: Project): ProjectDto {
        return new ProjectDto(
            project.id,
            project.userId,
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

    public toEntityFromCreateDto(createProjectDto: CreateProjectDto): Project {
        const project = new Project(createProjectDto.userId, createProjectDto.title, createProjectDto.category, createProjectDto.description, createProjectDto.startDate, createProjectDto.endDate);
        return project;
    }

    public fromDtoToEntity(projectDto: ProjectDto): Project {
        const project = new Project(projectDto.userId, projectDto.title, projectDto.category, projectDto.description, projectDto.startDate, projectDto.endDate);
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

    public toEntityFromUpdateDto(updateProjectDto: UpdateProjectDto): Project {
        const project = new Project('', '', updateProjectDto.category, updateProjectDto.description, new Date(), updateProjectDto.endDate);
        return project;
    }

}
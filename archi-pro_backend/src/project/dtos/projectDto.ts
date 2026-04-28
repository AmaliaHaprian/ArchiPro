import { ProjectCategory, ProjectStage, ProjectStatus, ProjectBriefStage, SiteAnalysisStage, DesignStage, ResearchStage, StageData } from "../Project";
import { IsString } from "class-validator";
export class ProjectDto {
    id: string;
    userId: string;
    title: string;
    status: ProjectStatus;
    category: ProjectCategory;
    progress: number;
    description: string;
    startDate: Date;
    endDate: Date;
    createdAt!: Date;
    updatedAt!: Date;
    currentStage!: ProjectStage;
    workingHours!: number;
    stageData: StageData;
    
    constructor(id: string, userId: string, title: string, status: ProjectStatus, category: ProjectCategory, progress: number, description: string, startDate: Date, endDate: Date, createdAt: Date, updatedAt: Date, currentStage: ProjectStage, workingHours: number, stageData: StageData) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.status = status;
        this.category = category;
        this.progress = progress;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.currentStage = currentStage;
        this.workingHours = workingHours;
        this.stageData = stageData;
    }
}
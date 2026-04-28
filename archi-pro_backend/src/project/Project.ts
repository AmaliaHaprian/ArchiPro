import { randomUUID } from 'crypto';

export enum ProjectStatus {
    NOT_STARTED = "NOT_STARTED",
    PLANNING = 'PLANNING',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export enum ProjectCategory {
    RESIDENTIAL = 'RESIDENTIAL',
    LANDSCAPE = 'LANDSCAPE',
    URBAN = 'URBAN',
    MIXED_USE = 'MIXED_USE',
    CULTURAL = 'CULTURAL',
    INFRASTRUCTURE = 'INFRASTRUCTURE',
    EDUCATIONAL = 'EDUCATIONAL',
    ENTERTAINMENT = 'ENTERTAINMENT',
    HISTORIC = 'HISTORIC',
}

export enum ProjectStage {
    PROJECT_BRIEF = 'PROJECT_BRIEF',
    SITE_ANALYSIS = 'SITE_ANALYSIS',
    RESEARCH = 'RESEARCH',
    DESIGN= 'DESIGN',
    VISUALIZATION = 'VISUALIZATION',
}

export class SiteAnalysisStage {
    projectId: string;
    siteName: string;
    address: string;
    area: string;
    type: string;
    notes: string;
    images: string[];

    constructor(projectId: string, siteName: string, address: string, area: string, type: string) {
        this.projectId = projectId;
        this.siteName = siteName;
        this.address = address;
        this.area = area;
        this.type = type;
        this.notes = '';
        this.images =  [];
    }
}

export class ResearchStage {
    projectId: string;
    images: string[];

    constructor(projectId: string) {
        this.projectId = projectId;
        this.images = [];
    }
}
export class File {
    name: string;
    type: string;
    size: number;
    uploadedAt: Date;
    url: string;

    constructor(name: string, type: string, size: number, url: string) {
        this.name = name;
        this.type = type;
        this.size = size;
        this.uploadedAt = new Date();
        this.url = url;
    }
}

export class FilesGroup {
    Sketches: File[];
    Plans: File[];
    Renders: File[];

    constructor() {
        this.Sketches = [];
        this.Plans = [];
        this.Renders = [];
    }
}
export class DesignStage {
    projectId: string;
    files: FilesGroup;
    toDoList: string[];
    notes: string;

    constructor(projectId: string) {
        this.projectId = projectId;
        this.files = new FilesGroup();
        this.toDoList = [];
        this.notes = '';
    }
}

export class ProjectBriefStage {
    projectId: string;
    toDoList: string[];
    notes: string;

    constructor(projectId: string) {
        this.projectId = projectId;
        this.toDoList = [];
        this.notes = '';
    }
}

export interface ProjectFilter {
    category?: ProjectCategory;
    status?: ProjectStatus;
}

export class StageData {
    projectBrief: ProjectBriefStage;
    siteAnalysis: SiteAnalysisStage;
    research: ResearchStage;
    design: DesignStage;

    constructor(projectId: string) {
        this.projectBrief = new ProjectBriefStage(projectId);
        this.siteAnalysis = new SiteAnalysisStage(projectId, '', '', '', '');
        this.research = new ResearchStage(projectId);
        this.design = new DesignStage(projectId);
    }
}
export class Project {
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
    constructor(userId: string, title: string,  category: ProjectCategory, description: string, startDate: Date, endDate: Date) {
        this.id = randomUUID();
        this.userId = userId;
        this.title = title;
        this.status = ProjectStatus.PLANNING;
        this.category = category;
        this.description = description;
        this.progress = 0;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.currentStage = ProjectStage.PROJECT_BRIEF;
        this.workingHours = 0;

        this.stageData = new StageData(this.id);
    }
}

export interface Action {
    type: 'add' | 'update' | 'delete';
    data: any;
}
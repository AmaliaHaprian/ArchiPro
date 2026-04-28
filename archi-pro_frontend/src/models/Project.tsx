export const ProjectStatus = {
    NOT_STARTED: "Not started",
    PLANNING: "Planning",
    IN_PROGRESS: "In progress",
    DONE: "Done",
    COMPLETED: "Completed",
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const ProjectCategory = {
    RESIDENTIAL: 'RESIDENTIAL',
    LANDSCAPE: 'LANDSCAPE',
    URBAN: 'URBAN',
    MIXED_USE: 'MIXED_USE',
    CULTURAL: 'CULTURAL',
    INFRASTRUCTURE: 'INFRASTRUCTURE',
} as const;

export type ProjectCategory = (typeof ProjectCategory)[keyof typeof ProjectCategory];

export const ProjectStage = {
    PROJECT_BRIEF: 'PROJECT_BRIEF',
    SITE_ANALYSIS: 'SITE_ANALYSIS',
    RESEARCH: 'RESEARCH',
    DESIGN: 'DESIGN',
    VISUALIZATION: 'VISUALIZATION',
} as const;

export type ProjectStage = (typeof ProjectStage)[keyof typeof ProjectStage];

export interface File {
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    url: string;
}

export interface ResearchStage {
    projectId: string;
    images?: string[];
}
export interface SiteAnalysisStage {
    projectId: string;
    siteName?: string;
    address?: string;
    siteArea?: string;
    type?: string;
    notes?: string;
    images?: string[];
}
export interface DesignStage {
    projectId: string;
    files?: {
        Sketches?: File[];
        Plans?: File[];
        Renders?: File[];
    };
    toDoList?: string[];
    notes?: string;
}

export interface ProjectBriefStage {
    projectId: string;
    toDoList?: string[];
    notes?: string;
}

export interface Project {
    id: string;
    userId: string;
    title: string;
    status: ProjectStatus;
    category: ProjectCategory;
    progress: number;
    description: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    currentStage?: ProjectStage;
    workingHours?: number;
    stageData?: {
        projectBrief?: ProjectBriefStage;
        siteAnalysis?: SiteAnalysisStage;
        research?: ResearchStage;
        design?: DesignStage;
    };
}

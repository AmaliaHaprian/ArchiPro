export interface DesignFile {
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
}

export interface ResearchStageData {
    images?: string[];
}
export interface SiteAnalysisStageData {
    siteName?: string;
    address?: string;
    siteArea?: string;
    type?: string;
    notes?: string;
    images?: string[];
}
export interface ProjectStageData {
    files?: {
        Sketches?: DesignFile[];
        Plans?: DesignFile[];
        Renders?: DesignFile[];
    };
    todo?: string[];
    notes?: string;
}

export interface Project {
    id: string;
    projectName: string;
    projectStatus: string;
    projectCategory: string;
    projectProgres: number;
    projectDescription: string;
    projectStartDate: string;
    projectDueDate: string;
    projectCreatedAt: string;
    projectUpdatedAt: string;
    projectCurrentStage?: string;
    projectWorkingHours?: number;
    stageData?: {
        'Project brief'?: ProjectStageData;
        'Site analysis'?: SiteAnalysisStageData;
        'Research'?: ResearchStageData;
        'Design'?: ProjectStageData;
        'Visualize'?: ProjectStageData;
    };
}

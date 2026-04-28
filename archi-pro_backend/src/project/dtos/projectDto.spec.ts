import { ProjectDto } from './projectDto';
import { ProjectCategory, ProjectStage, ProjectStatus, ProjectBriefStage, SiteAnalysisStage, DesignStage, ResearchStage } from '../Project';

describe('ProjectDto', () => {
  it('should create a ProjectDto instance with all properties set', () => {
    const stageData = {
      projectBrief: {  } as ProjectBriefStage,
      siteAnalysis: {  } as SiteAnalysisStage,
      research: {  } as ResearchStage,
      design: { files: {} } as DesignStage,
    };
    const now = new Date();
    const dto = new ProjectDto(
      '1',
      'Test Project',
      ProjectStatus.IN_PROGRESS,
      ProjectCategory.RESIDENTIAL,
      50,
      'A test project',
      now,
      now,
      now,
      now,
      ProjectStage.DESIGN,
      120,
      stageData
    );
    expect(dto.id).toBe('1');
    expect(dto.title).toBe('Test Project');
    expect(dto.status).toBe(ProjectStatus.IN_PROGRESS);
    expect(dto.category).toBe(ProjectCategory.RESIDENTIAL);
    expect(dto.progress).toBe(50);
    expect(dto.description).toBe('A test project');
    expect(dto.startDate).toBe(now);
    expect(dto.endDate).toBe(now);
    expect(dto.createdAt).toBe(now);
    expect(dto.updatedAt).toBe(now);
    expect(dto.currentStage).toBe(ProjectStage.DESIGN);
    expect(dto.workingHours).toBe(120);
    expect(dto.stageData).toEqual(stageData);
  });
});

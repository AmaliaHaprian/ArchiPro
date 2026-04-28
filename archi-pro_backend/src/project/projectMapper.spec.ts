import { ProjectMapper } from './projectMapper';
import { Project } from './Project';
import { ProjectDto } from './dtos/projectDto';
import { CreateProjectDto } from './dtos/createProjectDto';
import { UpdateProjectDto } from './dtos/updateProjectDto';
import { ProjectCategory, ProjectStage, ProjectStatus, ProjectBriefStage, SiteAnalysisStage, DesignStage, ResearchStage } from './Project';
import { File } from './Project';

describe('ProjectMapper', () => {
  let mapper: ProjectMapper;
  beforeEach(() => {
    mapper = new ProjectMapper();
  });

  it('should create a File instance with correct properties', () => {
      const before = new Date();
      const file = new File('test.txt', 'text/plain', 1234, 'http://example.com/test.txt');
      const after = new Date();
  
      expect(file.name).toBe('test.txt');
      expect(file.type).toBe('text/plain');
      expect(file.size).toBe(1234);
      expect(file.url).toBe('http://example.com/test.txt');
      expect(file.uploadedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(file.uploadedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

  it('should map Project to ProjectDto', () => {
    const stageData = {
      projectBrief: {  } as ProjectBriefStage,
      siteAnalysis: {  } as SiteAnalysisStage,
      research: {  } as ResearchStage,
      design: {  } as DesignStage,
    };
    const now = new Date();
    const project = new Project('Test', ProjectCategory.RESIDENTIAL, 'desc', now, now);
    project.id = '1';
    project.status = ProjectStatus.DONE;
    project.progress = 42;
    project.createdAt = now;
    project.updatedAt = now;
    project.currentStage = ProjectStage.DESIGN;
    project.workingHours = 100;
    project.stageData = stageData;

    const dto = mapper.toDto(project);
    expect(dto).toBeInstanceOf(ProjectDto);
    expect(dto.id).toBe('1');
    expect(dto.title).toBe('Test');
    expect(dto.status).toBe(ProjectStatus.DONE);
    expect(dto.category).toBe(ProjectCategory.RESIDENTIAL);
    expect(dto.progress).toBe(42);
    expect(dto.description).toBe('desc');
    expect(dto.startDate).toBe(now);
    expect(dto.endDate).toBe(now);
    expect(dto.createdAt).toBe(now);
    expect(dto.updatedAt).toBe(now);
    expect(dto.currentStage).toBe(ProjectStage.DESIGN);
    expect(dto.workingHours).toBe(100);
    expect(dto.stageData).toEqual(stageData);
  });

  it('should map CreateProjectDto to Project', () => {
    const now = new Date();
    const createDto: CreateProjectDto = {
      title: 'New',
      category: ProjectCategory.CULTURAL,
      description: 'desc',
      startDate: now,
      endDate: now,
    };
    const project = mapper.toEntityFromCreateDto(createDto);
    expect(project).toBeInstanceOf(Project);
    expect(project.title).toBe('New');
    expect(project.category).toBe(ProjectCategory.CULTURAL);
    expect(project.description).toBe('desc');
    expect(project.startDate).toBe(now);
    expect(project.endDate).toBe(now);
  });

  it('should map ProjectDto to Project', () => {
    const stageData = {
      projectBrief: {  } as ProjectBriefStage,
      siteAnalysis: {  } as SiteAnalysisStage,
      research: {  } as ResearchStage,
      design: {  } as DesignStage,
    };
    const now = new Date();
    const dto = new ProjectDto(
      '2',
      'DtoTitle',
      ProjectStatus.DONE,
      ProjectCategory.INFRASTRUCTURE,
      100,
      'desc',
      now,
      now,
      now,
      now,
      ProjectStage.RESEARCH,
      200,
      stageData
    );
    const project = mapper.fromDtoToEntity(dto);
    expect(project).toBeInstanceOf(Project);
    expect(project.id).toBe('2');
    expect(project.title).toBe('DtoTitle');
    expect(project.status).toBe(ProjectStatus.DONE);
    expect(project.category).toBe(ProjectCategory.INFRASTRUCTURE);
    expect(project.progress).toBe(100);
    expect(project.description).toBe('desc');
    expect(project.startDate).toBe(now);
    expect(project.endDate).toBe(now);
    expect(project.createdAt).toBe(now);
    expect(project.updatedAt).toBe(now);
    expect(project.currentStage).toBe(ProjectStage.RESEARCH);
    expect(project.workingHours).toBe(200);
    expect(project.stageData).toEqual(stageData);
  });

  it('should map UpdateProjectDto to Project', () => {
    const now = new Date();
    const updateDto: UpdateProjectDto = {
      category: ProjectCategory.CULTURAL,
      description: 'desc',
      endDate: now,
    };
    const project = mapper.toEntityFromUpdateDto(updateDto);
    expect(project).toBeInstanceOf(Project);
    expect(project.category).toBe(ProjectCategory.CULTURAL);
    expect(project.description).toBe('desc');
    expect(project.endDate).toBe(now);
  });
});

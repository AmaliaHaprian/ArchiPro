import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectMapper } from './projectMapper';
import { Project, ProjectCategory } from './Project';
import { CreateProjectDto } from './dtos/createProjectDto';
import { UpdateProjectDto } from './dtos/updateProjectDto';
import { AccessControlService } from '../user/access-control.service';
import { LoggingService } from '../logging/logging.service';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;
  const requesterUserId = 'test-user-id';
  const mockUser = { id: requesterUserId } as any;

  beforeEach(async () => {
    const mockProject1 = new Project(mockUser, "Housing Complex", ProjectCategory.RESIDENTIAL, "Building a new housing complex", new Date("2024-01-01"), new Date("2025-12-31"));
    const mockProject2 = new Project(mockUser, "Office Building", ProjectCategory.URBAN, "Designing a modern office building", new Date("2024-02-01"), new Date("2025-11-30"));
    const mockProject3 = new Project(mockUser, "Community Center", ProjectCategory.MIXED_USE, "Creating a community center", new Date("2024-03-01"), new Date("2025-10-31"));

    const mockPaginatedResults = [
      { title: "Housing Complex", category: ProjectCategory.RESIDENTIAL, description: "Building a new housing complex", progress: 0, status: "PLANNING" },
      { title: "Office Building", category: ProjectCategory.URBAN, description: "Designing a modern office building", progress: 0, status: "PLANNING" },
      { title: "Community Center", category: ProjectCategory.MIXED_USE, description: "Creating a community center", progress: 0, status: "PLANNING" },
    ];

    const mockModule: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: AccessControlService,
          useValue: {
            requirePermission: jest.fn().mockResolvedValue({ id: requesterUserId, role: { name: 'ADMIN' } }),
            requireSelfOrAdmin: jest.fn().mockResolvedValue({ id: requesterUserId, role: { name: 'ADMIN' } }),
            requireProjectOwnerOrAdmin: jest.fn().mockResolvedValue({ id: requesterUserId, role: { name: 'ADMIN' } }),
            requireAdmin: jest.fn().mockResolvedValue({ id: requesterUserId, role: { name: 'ADMIN' } }),
          },
        },
        {
          provide: LoggingService,
          useValue: {
            recordAction: jest.fn(),
            getLogs: jest.fn(),
            getObservations: jest.fn(),
            resolveObservation: jest.fn(),
          },
        },
        {
          provide: ProjectService,
          useValue: {
            syncOfflineData: jest.fn(),
            startFakeProjectGeneration: jest.fn(),
            stopFakeProjectGeneration: jest.fn(),
            getPaginated: jest.fn().mockReturnValue(mockPaginatedResults),
            getPaginatedFiltered: jest.fn().mockReturnValue([mockProject1]),
            findProjectById: jest.fn((id: string) => {
              if (id === "47b64d85-80c2-4cbb-844d-b19673535afa") {
                return {
                  "id": "47b64d85-80c2-4cbb-844d-b19673535afa",
                  "title": "Housing Complex",
                  "status": "PLANNING",
                  "category": "RESIDENTIAL",
                  "progress": 0,
                  "description": "Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.",
                  "startDate": "2024-01-01T00:00:00.000Z",
                  "endDate": "2025-12-31T00:00:00.000Z",
                  "createdAt": "2026-04-15T20:00:49.395Z",
                  "updatedAt": "2026-04-15T20:00:49.395Z",
                  "currentStage": "PROJECT_BRIEF",
                  "workingHours": 0,
                  "stageData": {
                    "projectBrief": {
                      "projectId": "47b64d85-80c2-4cbb-844d-b19673535afa",
                      "toDoList": [],
                      "notes": ""
                    },
                    "siteAnalysis": {
                      "projectId": "47b64d85-80c2-4cbb-844d-b19673535afa",
                      "siteName": "",
                      "address": "",
                      "area": "",
                      "type": "",
                      "notes": "",
                      "images": []
                    },
                    "research": {
                      "projectId": "47b64d85-80c2-4cbb-844d-b19673535afa",
                      "images": []
                    },
                    "design": {
                      "projectId": "47b64d85-80c2-4cbb-844d-b19673535afa",
                      "files": {
                        "Sketches": [],
                        "Plans": [],
                        "Renders": []
                      },
                      "toDoList": [],
                      "notes": ""
                    }
                  }
                };
              }
              return undefined;
            }),
            saveProject: jest.fn(),
            deleteProject: jest.fn((id: string) => {
              if (id === "47b64d85-80c2-4cbb-844d-b19673535afa") {
                return { message: 'Project deleted successfully' };
              }
              throw new Error(`Project with id ${id} not found`);
            }),
            updateProject: jest.fn((id: string, project: Project) => {
              if (id === "47b64d85-80c2-4cbb-844d-b19673535afa")
                return {
                  "id": "47b64d85-80c2-4cbb-844d-b19673535afa",
                  "title": "Housing Complex",
                  "status": "PLANNING",
                  "category": "URBAN",
                  "progress": 0,
                  "description": "Updated description",
                  "startDate": "2024-01-01T00:00:00.000Z",
                  "endDate": "2025-12-31T00:00:00.000Z",
                  "createdAt": "2026-04-15T20:00:49.395Z",
                  "updatedAt": "2026-04-15T20:00:49.395Z",
                  "currentStage": "PROJECT_BRIEF",
                  "workingHours": 0,
                  "stageData": {
                    "projectBrief": {
                      "projectId": "47b64d85-80c2-4cbb-844d-b19673535afa",
                      "toDoList": [],
                      "notes": ""
                    },
                    "siteAnalysis": {
                      "projectId": "47b64d85-80c2-4cbb-844d-b19673535afa",
                      "siteName": "",
                      "address": "",
                      "area": "",
                      "type": "",
                      "notes": "",
                      "images": []
                    },
                    "research": {
                      "projectId": "47b64d85-80c2-4cbb-844d-b19673535afa",
                      "images": []
                    },
                    "design": {
                      "projectId": "47b64d85-80c2-4cbb-844d-b19673535afa",
                      "files": {
                        "Sketches": [],
                        "Plans": [],
                        "Renders": []
                      },
                      "toDoList": [],
                      "notes": ""
                    }
                  }
                }
              throw new Error(`Project with id ${id} not found`);
            }),
            searchByTitle: jest.fn().mockReturnValue([]),
          },
        },
        {
          provide: ProjectMapper,
          useValue: {
            toDto: jest.fn((project: Project) => ({
              id: project.id,
              title: project.title,
              category: project.category,
              description: project.description,
              progress: project.progress,
              status: project.status,
              startDate: project.startDate,
              endDate: project.endDate,
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
              currentStage: project.currentStage,
              workingHours: project.workingHours,
              stageData: project.stageData,
            })),
            toEntityFromCreateDto: jest.fn((dto: CreateProjectDto) => {
              const project = new Project(mockUser, dto.title, dto.category, dto.description, dto.startDate, dto.endDate);
              return project;
            }),
            toEntityFromUpdateDto: jest.fn((dto) => new Project(mockUser, '', dto.category, dto.description, new Date(), dto.endDate)),
          },
        },
      ],
    }).compile();

    controller = mockModule.get<ProjectController>(ProjectController);
    service = mockModule.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return paginated projects', async () => {
    const result=await controller.getAllProjects(requesterUserId, 1);
    expect(result).toHaveLength(3);
  });

  it('should add a new project', async () => {
    const newProject = new CreateProjectDto(requesterUserId, "Outside Gym", ProjectCategory.MIXED_USE, "A new outdoor gym for the community.", new Date("2024-01-01"), new Date("2025-12-31"));
    jest.spyOn(service, 'saveProject').mockImplementation(async (project: Project) => project);
    const result = await controller.createProject(requesterUserId, newProject);
    
    expect(result.title).toBe("Outside Gym");
    expect(result.category).toBe(ProjectCategory.MIXED_USE);
    expect(result.description).toBe("A new outdoor gym for the community.");
    expect(result.progress).toBe(0);
    expect(result.status).toBe("PLANNING");
  });

  it('should get filtered projects', async () => {
    const result = await controller.filterProjects(requesterUserId, 1,'', ProjectCategory.RESIDENTIAL, 'PLANNING');
    expect(result[0].title).toBe("Housing Complex");
    expect(result[0].category).toBe(ProjectCategory.RESIDENTIAL);
    expect(result[0].description).toBe("Building a new housing complex");
    expect(result[0].progress).toBe(0);
    expect(result[0].status).toBe("PLANNING");
  })

  it('should get project by id', async () => {
    const result = await controller.getProjectById(requesterUserId, "47b64d85-80c2-4cbb-844d-b19673535afa");
    expect(result.title).toBe("Housing Complex");
    expect(result.category).toBe(ProjectCategory.RESIDENTIAL);
    expect(result.description).toBe("Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.");
    expect(result.progress).toBe(0);
    expect(result.status).toBe("PLANNING");
  });

  it('should throw NotFoundException for non-existing project', () => {
    return expect(controller.getProjectById(requesterUserId, "non-existing-id")).rejects.toThrow('Project with id non-existing-id not found');
  });

  it('should delete a project', async () => {
    const result = await controller.deleteProject(requesterUserId, "47b64d85-80c2-4cbb-844d-b19673535afa");
    expect(result.message).toBe('Project deleted successfully');

    await expect(controller.deleteProject(requesterUserId, "non-existing-id")).rejects.toThrow('Project with id non-existing-id not found');
  });

  it('should update a project', async () => {
    const updateDto = new UpdateProjectDto( ProjectCategory.URBAN, "Updated description", new Date("2025-12-31") );
    await controller.updateProject(requesterUserId, "47b64d85-80c2-4cbb-844d-b19673535afa", updateDto);
    expect(service.updateProject).toHaveBeenCalledWith("47b64d85-80c2-4cbb-844d-b19673535afa", expect.objectContaining({
      category: ProjectCategory.URBAN,
      description: "Updated description",
      endDate: new Date("2025-12-31"),
    }));
  });

  it('should throw NotFoundException when updating non-existing project', async () => {
    const updateDto = { category: ProjectCategory.URBAN, description: "Updated description", endDate: new Date("2025-12-31") };
    await expect(controller.updateProject(requesterUserId, "non-existing-id", updateDto)).rejects.toThrow('Project with id non-existing-id not found');
  });

  it('should call syncOfflineData on service and return success message', async () => {
    const mockActions = [{ type: 'add', data: { project: {} } }];
    const syncSpy = jest.spyOn(service, 'syncOfflineData').mockImplementation();
    const result = await controller.syncOfflineData(requesterUserId, mockActions as any);
    expect(syncSpy).toHaveBeenCalledWith(mockActions);
    expect(result).toEqual({ message: 'Offline data synchronized successfully' });
  });

  it('should call startFakeProjectGeneration on service and return success message', async () => {
    const startSpy = jest.spyOn(service, 'startFakeProjectGeneration').mockImplementation();
    const result = await controller.startFakeDataGeneration(requesterUserId, requesterUserId);
    expect(startSpy).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Fake data generation started successfully' });
  });

  it('should call stopFakeProjectGeneration on service and return success message', async () => {
    const stopSpy = jest.spyOn(service, 'stopFakeProjectGeneration').mockImplementation();
    const result = await controller.stopFakeDataGeneration(requesterUserId);
    expect(stopSpy).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Fake data generation stopped successfully' });
  });
});

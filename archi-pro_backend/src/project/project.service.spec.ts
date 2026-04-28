import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { ProjectRepository } from './projectRepo';
import { Project, ProjectCategory, ProjectStatus } from './Project';
import { ProjectWebSocketGateway } from './websocketGateway';

describe('ProjectService', () => {
  let service: ProjectService;
  let repository: ProjectRepository;

  beforeEach(async () => {

    const mockProject1 = new Project(
      "Housing Complex",
      ProjectCategory.RESIDENTIAL,
      "Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.",
      new Date("2024-01-01"),
      new Date("2025-12-31")
    );
    const mockProject2 = new Project(
      "Office Building",
      ProjectCategory.URBAN,
      "Designing a modern office building with sustainable features and flexible workspaces for a tech company.",
      new Date("2024-02-01"),
      new Date("2025-11-30")
    );
    const mockProject3 = new Project(
      "Community Center",
      ProjectCategory.MIXED_USE,
      "Creating a community center that includes a library, sports facilities, and event spaces to serve the local neighborhood.",
      new Date("2024-03-01"),
      new Date("2025-10-31")
    );

    const mockPaginatedResults = [mockProject1, mockProject2, mockProject3];
        
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: ProjectRepository,
          useValue: {
            getAll: jest.fn().mockReturnValue([mockProject1, mockProject2, mockProject3]),
            save: jest.fn((project) => project),
            delete: jest.fn(),
            update: jest.fn(),
            findById: jest.fn().mockReturnValue(mockProject1),
            getPaginated: jest.fn().mockReturnValue(mockPaginatedResults),
            filterandSearchProjects: jest.fn().mockReturnValue([mockProject1])
          },
        },
        {
          provide: ProjectWebSocketGateway,
          useValue: {
            broadcastProjectsAdded: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    repository = module.get<ProjectRepository>(ProjectRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated projects', async () => {
    const result=await service.getPaginated(1);
    expect(result).toHaveLength(3);
  });

  it('should return all projects', async () => {
    const result=await service.getAllProjects();
    expect(result).toHaveLength(3);
  });

  it('should add a new project', async () => {
      const newProject = new Project("Outside Gym", ProjectCategory.MIXED_USE, "A new outdoor gym for the community.", new Date("2024-01-01"), new Date("2025-12-31"));
      const result : Project = service.saveProject(newProject);
      
      expect(result.title).toBe("Outside Gym");
      expect(result.category).toBe(ProjectCategory.MIXED_USE);
      expect(result.description).toBe("A new outdoor gym for the community.");
      expect(result.progress).toBe(0);
      expect(result.status).toBe("PLANNING");
    });
  
    it('should get filtered projects', async () => {
      const result = await service.filterandSearchProjects('', { category: ProjectCategory.RESIDENTIAL, status: ProjectStatus.PLANNING });
      expect(result[0].title).toBe("Housing Complex");
      expect(result[0].category).toBe(ProjectCategory.RESIDENTIAL);
      expect(result[0].description).toBe("Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.");
      expect(result[0].progress).toBe(0);
      expect(result[0].status).toBe("PLANNING");
    })

    it('should get filtered projects for empty search term', async () => {
      const result = await service.filterandSearchProjects('', { category: ProjectCategory.RESIDENTIAL });
      expect(result[0].title).toBe("Housing Complex");
      expect(result[0].category).toBe(ProjectCategory.RESIDENTIAL);
      expect(result[0].description).toBe("Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.");
      expect(result[0].progress).toBe(0);
      expect(result[0].status).toBe("PLANNING");
    })
  
    it('should get project by id', async () => {
      const result = await service.findProjectById("47b64d85-80c2-4cbb-844d-b19673535afa");
      expect(result!.title).toBe("Housing Complex");
      expect(result!.category).toBe(ProjectCategory.RESIDENTIAL);
      expect(result!.description).toBe("Building a new housing complex in the city center, consisting of 100 apartments and commercial spaces on the ground floor.");
      expect(result!.progress).toBe(0);
      expect(result!.status).toBe("PLANNING");
    });

    it('should delete a project', async () => {
    await service.deleteProject("47b64d85-80c2-4cbb-844d-b19673535afa");
    expect(repository.delete).toHaveBeenCalledWith("47b64d85-80c2-4cbb-844d-b19673535afa");
  });

  it('should update a project', async () => {
    const updatedProject = new Project(
      "Housing Complex",
      ProjectCategory.URBAN,
      "Updated description",
      new Date("2024-01-01"),
      new Date("2025-12-31")
    );
    await service.updateProject("47b64d85-80c2-4cbb-844d-b19673535afa", updatedProject);
    expect(repository.update).toHaveBeenCalledWith(
      "47b64d85-80c2-4cbb-844d-b19673535afa",
      expect.objectContaining({
        title: "Housing Complex",
        category: ProjectCategory.URBAN,
        description: "Updated description",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2025-12-31"),
      })
    );
  });

  it('should return paginated and filtered projects', () => {
    // Mock filterandSearchProjects to return 7 projects
    const mockProjects = Array.from({ length: 7 }, (_, i) => ({
      ...new Project(`Project${i + 1}`, ProjectCategory.RESIDENTIAL, 'desc', new Date(), new Date()),
    }));
    jest.spyOn(service, 'filterandSearchProjects').mockReturnValue(mockProjects as any);

    // Page 1 should return first 5
    const page1 = service.getPaginatedFiltered(1, '', {});
    expect(page1).toHaveLength(5);
    expect(page1[0].title).toBe('Project1');
    expect(page1[4].title).toBe('Project5');

    // Page 2 should return the remaining 2
    const page2 = service.getPaginatedFiltered(2, '', {});
    expect(page2).toHaveLength(2);
    expect(page2[0].title).toBe('Project6');
    expect(page2[1].title).toBe('Project7');
  });

  it('should call save, update, and delete for each action in syncOfflineData', () => {
    const saveSpy = jest.spyOn(service, 'saveProject').mockImplementation();
    const updateSpy = jest.spyOn(service, 'updateProject').mockImplementation();
    const deleteSpy = jest.spyOn(service, 'deleteProject').mockImplementation();

    const actions = [
      { type: 'add', data: { project: { id: 1 } } },
      { type: 'update', data: { id: 2, project: { id: 2 } } },
      { type: 'delete', data: { id: 3 } },
    ] as any;

    service.syncOfflineData(actions);

    expect(saveSpy).toHaveBeenCalledWith(actions[0].data.project);
    expect(updateSpy).toHaveBeenCalledWith(actions[1].data.id, actions[1].data.project);
    expect(deleteSpy).toHaveBeenCalledWith(actions[2].data.id);
  });

  it('should start and stop fake project generation interval', () => {
    jest.useFakeTimers();
    const broadcastSpy = jest.spyOn(service['projectWebSocketGateway'], 'broadcastProjectsAdded').mockImplementation();
    const saveSpy = jest.spyOn(service, 'saveProject').mockImplementation();

    service.startFakeProjectGeneration();
    expect(service['fakeProjectInterval']).not.toBeNull();

    // Fast-forward time to trigger the interval
    jest.advanceTimersByTime(5000);

    expect(broadcastSpy).toHaveBeenCalled();

    service.stopFakeProjectGeneration();
    expect(service['fakeProjectInterval']).toBeNull();

    jest.useRealTimers();
  });
});

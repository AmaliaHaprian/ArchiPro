import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { ProjectRepository } from '../project/projectRepo';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let repository: ProjectRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: ProjectRepository,
          useValue: {
            getAll: jest.fn().mockReturnValue([]),
            save: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
            getPaginated: jest.fn().mockReturnValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    repository = module.get<ProjectRepository>(ProjectRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

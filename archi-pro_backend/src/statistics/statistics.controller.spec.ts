import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let service: StatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: {
            getProjectsByCategory: jest.fn().mockReturnValue({}),
            getStageBottleneck: jest.fn().mockReturnValue({}),
            getStatusDistribution: jest.fn().mockReturnValue({}),
            getTopCompletedProjects: jest.fn().mockReturnValue([]),
            getOverallStatistics: jest.fn().mockReturnValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
    service = module.get<StatisticsService>(StatisticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { AccessControlService } from '../user/access-control.service';

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
        {
          provide: AccessControlService,
          useValue: {
            requirePermission: jest.fn().mockResolvedValue({ id: 'test-user-id', role: { name: 'ADMIN' } }),
            requireSelfOrAdmin: jest.fn().mockResolvedValue({ id: 'test-user-id', role: { name: 'ADMIN' } }),
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

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AccessControlService } from './access-control.service';
import { LoggingService } from '../logging/logging.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: {} },
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
          provide: AccessControlService,
          useValue: {
            requireSelfOrAdmin: jest.fn().mockResolvedValue({ id: 'test-user-id', role: { name: 'ADMIN' } }),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

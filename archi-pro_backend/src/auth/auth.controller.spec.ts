import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService.registerUser.mockReset();
    authService.loginUser.mockReset();
  });

  it('delegates registration to AuthService', async () => {
    const payload = { username: 'alice', email: 'alice@example.com', password: 'password123' } as any;
    authService.registerUser.mockResolvedValue({ id: 'user-1' });

    const result = await controller.register(payload);

    expect(authService.registerUser).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ id: 'user-1' });
  });

  it('delegates login to AuthService', async () => {
    authService.loginUser.mockResolvedValue({ access_token: 'token', user: { id: 'user-1' } });

    const result = await controller.login({ email: 'alice@example.com', password: 'password123' });

    expect(authService.loginUser).toHaveBeenCalledWith('alice@example.com', 'password123');
    expect(result).toEqual({ access_token: 'token', user: { id: 'user-1' } });
  });
});

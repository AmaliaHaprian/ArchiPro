import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto, User } from 'src/user/user';
import { Permission, Role, RoleName } from 'src/user/access-control';

describe('AuthService', () => {
  let service: AuthService;
  let userService: {
    ensureAccessControlSeeded: jest.Mock;
    getRoleByName: jest.Mock;
    createUser: jest.Mock;
    getUserById: jest.Mock;
    getUserByEmail: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };

  const role = new Role(RoleName.USER, 'User role', [new Permission('PROJECT_VIEW' as any, 'View projects')]);

  beforeEach(async () => {
    userService = {
      ensureAccessControlSeeded: jest.fn().mockResolvedValue(undefined),
      getRoleByName: jest.fn().mockResolvedValue(role),
      createUser: jest.fn(),
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('hashes passwords', async () => {
    const hashed = await service.hashPassword('secret');
    expect(hashed).not.toBe('secret');
    expect(await service.comparePassword('secret', hashed)).toBe(true);
  });

  it('registers a user with USER role by default', async () => {
    const dto = new CreateUserDto('alice', 'alice@example.com', 'password123');
    const persistedUser = new User('alice', 'alice@example.com', 'hashed-password', 'user-1', role);
    userService.createUser.mockResolvedValue(persistedUser);
    userService.getUserById.mockResolvedValue(persistedUser);

    const result = await service.registerUser(dto);

    expect(userService.getRoleByName).toHaveBeenCalledWith(RoleName.USER);
    expect(userService.createUser).toHaveBeenCalled();
    expect(result).toEqual(persistedUser);
  });

  it('logs in a valid user', async () => {
    const hashedPassword = await service.hashPassword('password123');
    const existingUser = new User('alice', 'alice@example.com', hashedPassword, 'user-1', role);
    userService.getUserByEmail.mockResolvedValue(existingUser);

    const result = await service.loginUser('alice@example.com', 'password123');

    expect(jwtService.sign).toHaveBeenCalled();
    expect(result).toEqual({ access_token: 'signed-token', user: existingUser });
  });
});

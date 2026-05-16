import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto, User } from 'src/user/user';
import { Permission, Role, RoleName } from 'src/user/access-control';

describe('Auth flow (mocked integration)', () => {
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

  it('registers a user with a hashed password and returns the persisted user', async () => {
    const dto = new CreateUserDto('alice', 'alice@example.com', 'password123', RoleName.USER);
    const hashedPassword = await service.hashPassword(dto.password);
    const createdUser = new User(dto.username, dto.email, hashedPassword, 'user-1', role);

    userService.createUser.mockResolvedValue(createdUser);
    userService.getUserById.mockResolvedValue(createdUser);

    const result = await service.registerUser(dto);

    expect(userService.ensureAccessControlSeeded).toHaveBeenCalled();
    expect(userService.getRoleByName).toHaveBeenCalledWith(RoleName.USER);
    expect(userService.createUser).toHaveBeenCalledWith(expect.objectContaining({
      username: 'alice',
      email: 'alice@example.com',
      role,
    }));
    expect(result).toEqual(createdUser);
    expect(result.password).not.toBe(dto.password);
  });

  it('logs in a valid user and returns a token payload', async () => {
    const hashedPassword = await service.hashPassword('password123');
    const existingUser = new User('alice', 'alice@example.com', hashedPassword, 'user-1', role);
    userService.getUserByEmail.mockResolvedValue(existingUser);

    const result = await service.loginUser('alice@example.com', 'password123');

    expect(userService.ensureAccessControlSeeded).toHaveBeenCalled();
    expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({
      sub: 'user-1',
      email: 'alice@example.com',
      role,
    }));
    expect(result).toEqual({ access_token: 'signed-token', user: existingUser });
  });

  it('returns null for an invalid password', async () => {
    const hashedPassword = await service.hashPassword('password123');
    userService.getUserByEmail.mockResolvedValue(new User('alice', 'alice@example.com', hashedPassword, 'user-1', role));

    const result = await service.loginUser('alice@example.com', 'wrong-password');

    expect(result).toBeNull();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});

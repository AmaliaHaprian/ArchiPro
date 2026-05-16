import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, User } from 'src/user/user';
import { RoleName } from 'src/user/access-control';

type AuthUserResponse = {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: string[];
};

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private userService: UserService) {}

    private toAuthUser(user: User): AuthUserResponse {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role?.name ?? RoleName.USER,
            permissions: user.role?.permissions?.map(permission => permission.code) ?? [],
        };
    }

    async validateUser(email: string, password: string) {
        const user = await this.userService.getUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        const isMatch = await this.comparePassword(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        return user;
    }

    public async hashPassword(password: string): Promise<string> {
        const salt= await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    public async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    async loginUser(email: string, password: string) {
        await this.userService.ensureAccessControlSeeded();
        const user = await this.userService.getUserByEmail(email);
        if (user && await this.comparePassword(password, user.password)) {
            const authUser = this.toAuthUser(user);
            const payload = {
                sub: authUser.id,
                email: authUser.email,
                role: authUser.role,
                permissions: authUser.permissions,
            };

            return {
                access_token: this.jwtService.sign(payload),
                user: authUser,
            }
        }
        return null;
    }
    
    async registerUser(userData: CreateUserDto) {
        await this.userService.ensureAccessControlSeeded();
        const role = await this.userService.getRoleByName(userData.roleName ?? RoleName.USER);
        const hashedPassword = await this.hashPassword(userData.password);
        const user = new User(userData.username, userData.email, hashedPassword, undefined, role);
        const createdUser = await this.userService.createUser(user);
        const persistedUser = await this.userService.getUserById(createdUser.id);
        if (!persistedUser) {
            throw new Error('Created user not found');
        }
        return this.toAuthUser(persistedUser);
    }

}
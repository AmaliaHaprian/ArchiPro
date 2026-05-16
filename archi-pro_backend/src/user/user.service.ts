import { Injectable } from '@nestjs/common';
import { User, CreateUserDto } from './user';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, PermissionCode, Role, RoleName } from './access-control';
import { LoggingService } from '../logging/logging.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
    private readonly restrictedPermissions = [
        PermissionCode.PROJECT_VIEW,
        PermissionCode.PROJECT_CREATE,
        PermissionCode.PROJECT_UPDATE,
        PermissionCode.PROJECT_DELETE,
        PermissionCode.CHAT,
    ];

    private readonly adminPermissions = [
        PermissionCode.PROJECT_VIEW,
        PermissionCode.PROJECT_CREATE,
        PermissionCode.PROJECT_UPDATE,
        PermissionCode.PROJECT_DELETE,
        PermissionCode.MANAGE_PROJECTS,
        PermissionCode.CHAT,
        PermissionCode.USER_MANAGE,
        PermissionCode.ROLE_MANAGE,
        PermissionCode.PERMISSION_MANAGE,
    ];

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
        private readonly loggingService: LoggingService,
        private readonly jwtService: JwtService,
    ) {}

    async getUserById(userId: string) {
        return await this.userRepository.findOne({
            where: { id: userId },
            relations: { role: { permissions: true } },
        });
    }

    async createUser(user: User) {
        return await this.userRepository.save(user);
    }
    async getUserByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email },
            relations: { role: { permissions: true } },
        });
    }

    async deleteUser(userId: string) {
        const user = await this.getUserById(userId);
        await this.loggingService.recordAction({
            userId,
            group: user?.role?.name ?? 'USER',
            action: 'USER_DELETED',
            payload: { username: user?.username, email: user?.email },
        });
        return await this.userRepository.delete({ id: userId });
    }

    public async ensureAccessControlSeeded() {
        const existingPermissions = await this.permissionRepository.find();
        const existingCodes = new Set(existingPermissions.map(permission => permission.code));

        const missingPermissions = Object.values(PermissionCode)
            .filter(code => !existingCodes.has(code))
            .map(code => new Permission(code, this.describePermission(code)));

        if (missingPermissions.length > 0) {
            await this.permissionRepository.save(missingPermissions);
        }

        const permissions = await this.permissionRepository.find();
        await this.ensureRole(RoleName.USER, 'Restricted access to project workspace', this.restrictedPermissions, permissions);
        await this.ensureRole(RoleName.ADMIN, 'Full access to the whole system', this.adminPermissions, permissions);
    }

    private async ensureRole(name: RoleName, description: string, permissionCodes: PermissionCode[], allPermissions: Permission[]) {
        const permissionLookup = new Map(allPermissions.map(permission => [permission.code, permission]));
        const selectedPermissions = permissionCodes
            .map(code => permissionLookup.get(code))
            .filter((permission): permission is Permission => Boolean(permission));

        const existingRole = await this.roleRepository.findOne({
            where: { name },
            relations: { permissions: true },
        });

        if (!existingRole) {
            await this.roleRepository.save(this.roleRepository.create({ name, description, permissions: selectedPermissions }));
            return;
        }

        const currentCodes = new Set(existingRole.permissions?.map(permission => permission.code) ?? []);
        const shouldUpdate = selectedPermissions.some(permission => !currentCodes.has(permission.code));
        if (shouldUpdate || existingRole.description !== description) {
            existingRole.description = description;
            existingRole.permissions = selectedPermissions;
            await this.roleRepository.save(existingRole);
        }
    }

    public async getRoleByName(name: RoleName) {
        const role = await this.roleRepository.findOne({
            where: { name },
            relations: { permissions: true },
        });

        if (!role) {
            throw new Error(`Role ${name} is not available in the database`);
        }

        return role;
    }

    private describePermission(code: PermissionCode) {
        switch (code) {
            case PermissionCode.PROJECT_VIEW:
                return 'View projects';
            case PermissionCode.PROJECT_CREATE:
                return 'Create projects';
            case PermissionCode.PROJECT_UPDATE:
                return 'Update projects';
            case PermissionCode.PROJECT_DELETE:
                return 'Delete projects';
            case PermissionCode.MANAGE_PROJECTS:
                return 'Manage projects';
            case PermissionCode.CHAT:
                return 'Chat';
            case PermissionCode.USER_MANAGE:
                return 'Manage users';
            case PermissionCode.ROLE_MANAGE:
                return 'Manage roles';
            case PermissionCode.PERMISSION_MANAGE:
                return 'Manage permissions';
            default:
                return code;
        }
    }
}

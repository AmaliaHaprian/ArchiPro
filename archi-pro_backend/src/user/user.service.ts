import { Injectable } from '@nestjs/common';
import { User, CreateUserDto } from './user';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, PermissionCode, Role, RoleName } from './access-control';
@Injectable()
export class UserService {
    private readonly restrictedPermissions = [
        PermissionCode.PROJECT_VIEW,
        PermissionCode.PROJECT_CREATE,
        PermissionCode.PROJECT_UPDATE,
        PermissionCode.PROJECT_DELETE,
    ];

    private readonly adminPermissions = [
        PermissionCode.PROJECT_VIEW,
        PermissionCode.PROJECT_CREATE,
        PermissionCode.PROJECT_UPDATE,
        PermissionCode.PROJECT_DELETE,
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
    ) {}

    async registerUser(userData: CreateUserDto) {
        await this.ensureAccessControlSeeded();
        const role = await this.getRoleByName(userData.roleName ?? RoleName.USER);
        const user = new User(userData.username, userData.email, userData.password, undefined, role);
        const createdUser = await this.userRepository.save(user);
        return this.getUserById(createdUser.id);
    }

    async getUserById(userId: string) {
        return await this.userRepository.findOne({
            where: { id: userId },
            relations: { role: { permissions: true } },
        });
    }

    async getUserByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email },
            relations: { role: { permissions: true } },
        });
    }

    async deleteUser(userId: string) {
        return await this.userRepository.delete({ id: userId });
    }

    async loginUser(email: string, password: string) {
        await this.ensureAccessControlSeeded();
        return await this.userRepository.findOne({
            where: { email, password },
            relations: { role: { permissions: true } },
        });
    }

    private async ensureAccessControlSeeded() {
        const permissionCount = await this.permissionRepository.count();
        if (permissionCount === 0) {
            const seedPermissions = Object.values(PermissionCode).map(code => new Permission(code, this.describePermission(code)));
            await this.permissionRepository.save(seedPermissions);
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

    private async getRoleByName(name: RoleName) {
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

import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PermissionCode } from './access-control';
import { User } from './user';
import { UserService } from './user.service';

@Injectable()
export class AccessControlService {
    constructor(private readonly userService: UserService) {}

    async getRequester(userId?: string | null): Promise<User> {
        if (!userId) {
            throw new UnauthorizedException('Missing user identity');
        }

        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new UnauthorizedException('Unknown user');
        }

        return user;
    }

    async requirePermission(userId: string | null | undefined, permission: PermissionCode): Promise<User> {
        const user = await this.getRequester(userId);
        if (user.role?.name === 'ADMIN') {
            return user;
        }

        const permissions = user.role?.permissions?.map(item => item.code) ?? [];
        if (!permissions.includes(permission)) {
            throw new ForbiddenException(`Missing permission: ${permission}`);
        }

        return user;
    }

    async requireAdmin(userId: string | null | undefined): Promise<User> {
        const user = await this.getRequester(userId);
        if (user.role?.name !== 'ADMIN') {
            throw new ForbiddenException('Admin access required');
        }

        return user;
    }

    async requireSelfOrAdmin(userId: string | null | undefined, targetUserId: string): Promise<User> {
        const user = await this.getRequester(userId);
        if (user.role?.name !== 'ADMIN' && user.id !== targetUserId) {
            throw new ForbiddenException('Cannot access another user\'s resources');
        }

        return user;
    }

    async requireProjectOwnerOrAdmin(
        userId: string | null | undefined,
        project: { user?: { id?: string } | null },
    ): Promise<User> {
        const user = await this.getRequester(userId);
        if (user.role?.name !== 'ADMIN' && project.user?.id !== user.id) {
            throw new ForbiddenException('Cannot access another user\'s project');
        }

        return user;
    }
}
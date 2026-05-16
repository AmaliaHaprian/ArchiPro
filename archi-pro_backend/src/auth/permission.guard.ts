import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class PermissionGuard implements CanActivate{
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const userRole = context.switchToHttp().getRequest().user.role;
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
            context.getHandler(),
            context.getClass()
        ]);
        const user = context.switchToHttp().getRequest().user;
        console.log('[PermissionGuard] Checking permissions for role:', userRole, 'requiredPermissions:', requiredPermissions);
        return requiredPermissions.some((perm) => user.permissions.includes(perm));
    }
}
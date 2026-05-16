import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        console.log('[JwtAuthGuard] request', {
            method: request.method,
            url: request.url,
            authorization: request.headers?.authorization ?? null,
        });
        if (request.method === 'OPTIONS') {
            return true;
        }

        return super.canActivate(context);
    }

    handleRequest<TUser = any>(err: any, user: TUser, info: any, context: ExecutionContext, status?: any): TUser {
        if (err || !user) {
            console.warn('[JwtAuthGuard] rejected', {
                err: err instanceof Error ? err.message : err,
                info,
            });
            throw err || new UnauthorizedException(info instanceof Error ? info.message : 'Unauthorized');
        }

        return user;
    }
}
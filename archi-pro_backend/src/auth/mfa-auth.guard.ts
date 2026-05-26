import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MfaAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Missing Authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        try {
            const decoded = this.jwtService.verify(token);

            const isTotpMfaToken = decoded.mfa_required === true;
            const isWebAuthnChallengeToken = decoded.purpose === 'authentication' || decoded.purpose === 'registration';

            if (!isTotpMfaToken && !isWebAuthnChallengeToken) {
                throw new UnauthorizedException('Invalid MFA token');
            }

            request.user = decoded;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired MFA token');
        }
    }
}

import { Injectable } from "@nestjs/common";
import { Strategy, ExtractJwt } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { getJwtSecret } from './jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: getJwtSecret(),
        });
    }

    async validate(payload: any) {
        console.log('[JwtStrategy] validate payload:', {
            sub: payload?.sub,
            email: payload?.email,
            role: payload?.role,
        });
        return {
            userId: payload.sub,
            username: payload.username,
            email: payload.email,
            role: payload.role,
            permissions: payload.permissions ?? [],
        };
    }
}
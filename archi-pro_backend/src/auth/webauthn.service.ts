 import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import type { User } from 'src/user/user';
import { UserService } from 'src/user/user.service';

export type WebAuthnChallengePurpose = 'registration' | 'authentication';

export type WebAuthnChallengeClaims = {
    sub: string;
    challenge: string;
    purpose: WebAuthnChallengePurpose;
};

@Injectable()
export class WebAuthnService {
    private readonly logger = new Logger(WebAuthnService.name);

    private logWebAuthnConfig() {
        try {
            const rpId = this.getRpId();
            const origins = this.getOrigins();
            this.logger.log(`WebAuthn RP ID: ${rpId}`);
            this.logger.log(`WebAuthn Origins: ${origins.join(', ')}`);
        } catch (err) {
            this.logger.error('Failed to read WebAuthn config', err as any);
        }
    }

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {
        this.logWebAuthnConfig();
    }

    private getRpName() {
        return process.env.WEBAUTHN_RP_NAME?.trim() || 'ArchiPro';
    }

    private getRpId() {
        return process.env.WEBAUTHN_RP_ID?.trim() || 'localhost';
    }

    private getRpIdForOrigin(origin?: string) {
        if (!origin) {
            return this.getRpId();
        }

        try {
            return new URL(origin).hostname;
        } catch {
            return this.getRpId();
        }
    }

    private getOrigins() {
        const configuredOrigins = (process.env.WEBAUTHN_ORIGINS ?? process.env.CORS_ORIGINS ?? '')
            .split(',')
            .map(origin => origin.trim())
            .filter(origin => origin.length > 0);

        return configuredOrigins.length > 0 ? configuredOrigins : ['http://localhost:5173'];
    }

    private getOriginsForRequest(origin?: string) {
        if (origin) {
            return [origin];
        }

        return this.getOrigins();
    }

    private getWebAuthnSupportEnabled() {
        return true;
    }

    private createChallengeToken(userId: string, challenge: string, purpose: WebAuthnChallengePurpose) {
        return this.jwtService.sign({ sub: userId, challenge, purpose }, { expiresIn: '5m' });
    }

    private verifyChallengeToken(token: string, userId: string, purpose: WebAuthnChallengePurpose) {
        const decoded = this.jwtService.verify<WebAuthnChallengeClaims>(token);

        if (decoded.sub !== userId) {
            throw new Error('WebAuthn challenge token does not belong to this user');
        }

        if (decoded.purpose !== purpose) {
            throw new Error('WebAuthn challenge token has an invalid purpose');
        }

        return decoded;
    }

    async generateRegistrationOptions(userId: string, requestOrigin?: string) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const rpId = this.getRpIdForOrigin(requestOrigin);
        const options = await generateRegistrationOptions({
            rpName: this.getRpName(),
            rpID: rpId,
            userID: Buffer.from(user.id, 'utf8'),
            userName: user.email,
            userDisplayName: user.username,
            attestationType: 'none',
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'required',
                residentKey: 'preferred',
            },
            supportedAlgorithmIDs: [-7, -257],
        });

        return {
            options,
            challengeToken: this.createChallengeToken(user.id, options.challenge, 'registration'),
        };
    }

    async verifyRegistration(userId: string, challengeToken: string, response: any, requestOrigin?: string) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const decoded = this.verifyChallengeToken(challengeToken, user.id, 'registration');
        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge: decoded.challenge,
            expectedOrigin: this.getOriginsForRequest(requestOrigin),
            expectedRPID: this.getRpIdForOrigin(requestOrigin),
            requireUserVerification: true,
            requireUserPresence: true,
        });

        if (!verification.verified || !verification.registrationInfo) {
            throw new Error('WebAuthn registration could not be verified');
        }

        user.webauthn_credential_id = verification.registrationInfo.credential.id;
        user.webauthn_public_key = isoBase64URL.fromBuffer(verification.registrationInfo.credential.publicKey);
        user.webauthn_counter = verification.registrationInfo.credential.counter;
        user.webauthn_enabled = true;
        await this.userService.updateUser(user);

        return {
            success: true,
            message: 'WebAuthn enabled successfully',
        };
    }

    async generateAuthenticationOptions(userId: string, requestOrigin?: string) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.webauthn_enabled || !user.webauthn_credential_id) {
            throw new Error('WebAuthn is not enabled for this user');
        }

        const rpId = this.getRpIdForOrigin(requestOrigin);
        const options = await generateAuthenticationOptions({
            rpID: rpId,
            userVerification: 'required',
            allowCredentials: [
                {
                    id: user.webauthn_credential_id,
                },
            ],
        });

        return {
            options,
            challengeToken: this.createChallengeToken(user.id, options.challenge, 'authentication'),
        };
    }

    async verifyAuthentication(challengeToken: string, response: any, requestOrigin?: string) {
        const decoded = this.verifyChallengeToken(challengeToken, this.jwtService.verify<WebAuthnChallengeClaims>(challengeToken).sub, 'authentication');
        const user = await this.userService.getUserById(decoded.sub);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.webauthn_enabled || !user.webauthn_credential_id || !user.webauthn_public_key) {
            throw new Error('WebAuthn is not configured for this user');
        }

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: decoded.challenge,
            expectedOrigin: this.getOriginsForRequest(requestOrigin),
            expectedRPID: this.getRpIdForOrigin(requestOrigin),
            requireUserVerification: true,
            credential: {
                id: user.webauthn_credential_id,
                publicKey: isoBase64URL.toBuffer(user.webauthn_public_key),
                counter: user.webauthn_counter,
            } as any,
        });

        if (!verification.verified) {
            throw new Error('WebAuthn authentication could not be verified');
        }

        user.webauthn_counter = verification.authenticationInfo.newCounter;
        await this.userService.updateUser(user);

        return user;
    }
}

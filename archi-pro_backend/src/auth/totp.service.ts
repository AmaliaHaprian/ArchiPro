import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TotpService {
    /**
     * Generate a new TOTP secret and return both the secret and QR code
     */
    async generateSecret(email: string): Promise<{ secret: string; qrCode: string }> {
        const secret = speakeasy.generateSecret({
            name: `ArchiPro (${email})`,
            issuer: 'ArchiPro',
            length: 32,
        });

        if (!secret.otpauth_url) {
            throw new Error('Failed to generate OTPAuth URL');
        }

        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        return {
            secret: secret.base32,
            qrCode,
        };
    }

    /**
     * Verify a TOTP code against a secret
     */
    verifyTotp(secret: string, token: string): boolean {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 2, // Allow 2 time steps of drift
        });
    }

    /**
     * Generate a backup code for account recovery
     */
    generateBackupCodes(count: number = 10): string[] {
        const codes: string[] = [];
        for (let i = 0; i < count; i++) {
            codes.push(
                Math.random()
                    .toString(36)
                    .substring(2, 10)
                    .toUpperCase()
            );
        }
        return codes;
    }
}

import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, User } from 'src/user/user';
import { RoleName } from 'src/user/access-control';
import { TotpService } from './totp.service';

type AuthUserResponse = {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: string[];
};

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private totpService: TotpService
    ) {}

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
            
            // If TOTP is enabled, return a partial auth token for MFA verification
            if (user.totp_enabled) {
                const mfaPayload = {
                    sub: authUser.id,
                    email: authUser.email,
                    mfa_required: true,
                    mfa_type: 'totp',
                };
                return {
                    mfa_token: this.jwtService.sign(mfaPayload, { expiresIn: '5m' }),
                    mfa_required: true,
                    mfa_type: 'totp',
                };
            }

            // No TOTP required, return full auth token
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

    /**
     * Generate TOTP secret for a user
     */
    async generateTotpSecret(userId: string) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.totp_enabled) {
            throw new Error('TOTP is already enabled for this user');
        }

        const { secret, qrCode } = await this.totpService.generateSecret(user.email);
        const backupCodes = this.totpService.generateBackupCodes(10);

        // Save the secret temporarily (not enabled yet)
        user.totp_secret = secret;
        await this.userService.updateUser(user);

        return {
            secret,
            qrCode,
            backupCodes,
        };
    }

    /**
     * Verify and enable TOTP for a user
     */
    async verifyAndEnableTOTP(userId: string, totpCode: string, backupCodes: string[]) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.totp_enabled) {
            throw new Error('TOTP is already enabled');
        }

        if (!user.totp_secret) {
            throw new Error('TOTP secret not found. Generate one first.');
        }

        const isValid = this.totpService.verifyTotp(user.totp_secret, totpCode);
        if (!isValid) {
            throw new Error('Invalid TOTP code');
        }

        // Enable TOTP and save backup codes
        user.totp_enabled = true;
        user.totp_backup_codes = JSON.stringify(backupCodes) as string;
        await this.userService.updateUser(user);

        return {
            success: true,
            message: 'TOTP enabled successfully',
        };
    }

    /**
     * Verify TOTP during login using MFA token
     */
    async verifyTotpLogin(userId: string, totpCode: string) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.totp_enabled || !user.totp_secret) {
            throw new Error('TOTP not enabled for this user');
        }

        const isValid = this.totpService.verifyTotp(user.totp_secret, totpCode);
        if (!isValid) {
            throw new Error('Invalid TOTP code');
        }

        // TOTP verified, return full auth token
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
        };
    }

    /**
     * Verify using a backup code
     */
    async verifyBackupCode(userId: string, backupCode: string) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.totp_backup_codes) {
            throw new Error('No backup codes available');
        }

        const backupCodes = JSON.parse(user.totp_backup_codes as string);
        if (!backupCodes.includes(backupCode)) {
            throw new Error('Invalid backup code');
        }

        // Remove used backup code
        const updatedBackupCodes = backupCodes.filter((code: string) => code !== backupCode);
        user.totp_backup_codes = JSON.stringify(updatedBackupCodes) as string;
        await this.userService.updateUser(user);

        // Return full auth token
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
        };
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

        const authUser = this.toAuthUser(persistedUser);
        const payload = {
            sub: authUser.id,
            email: authUser.email,
            role: authUser.role,
            permissions: authUser.permissions,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: authUser,
        };
    }

}
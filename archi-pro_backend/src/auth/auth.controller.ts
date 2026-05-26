import { Controller } from '@nestjs/common';
import { LogInterceptor } from 'src/logging/logInterceptor';
import { UseInterceptors, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post, Body, HttpCode, Get } from '@nestjs/common';
import { CreateUserDto } from 'src/user/user';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MfaAuthGuard } from './mfa-auth.guard';
import { GenerateTotpDto, VerifyTotpSetupDto, VerifyTotpLoginDto, VerifyTotpBackupCodeDto } from './totp.dto';

@Controller('auth')
@UseInterceptors(LogInterceptor)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
        @HttpCode(201)
        register(@Body() createUserDto: CreateUserDto) {
            return this.authService.registerUser(createUserDto);
        }
    
        @Post('login')
        login(@Body() loginDto: { email: string; password: string }, @Request() req: any) {
            const { email, password } = loginDto;
            return this.authService.loginUser(email, password, req.headers?.origin);
        }

        @Post('forgot-password/request')
        @HttpCode(200)
        async requestPasswordReset(@Body() body: { email: string }) {
            return await this.authService.requestPasswordReset(body.email);
        }

        @Post('forgot-password/reset')
        @HttpCode(200)
        async resetPassword(@Body() body: { token: string; newPassword: string }) {
            return await this.authService.resetPassword(body.token, body.newPassword);
        }

        /**
         * Generate TOTP secret for user - requires authentication
         */
        @Post('totp/setup')
        @UseGuards(JwtAuthGuard)
        @HttpCode(200)
        async setupTotp(@Request() req: any) {
            return await this.authService.generateTotpSecret(req.user.sub);
        }

        /**
         * Verify TOTP code and enable TOTP for user - requires authentication
         */
        @Post('totp/verify-setup')
        @UseGuards(JwtAuthGuard)
        @HttpCode(200)
        async verifyTotpSetup(@Request() req: any, @Body() verifyDto: { totpCode: string; backupCodes: string[] }) {
            return await this.authService.verifyAndEnableTOTP(
                req.user.sub,
                verifyDto.totpCode,
                verifyDto.backupCodes
            );
        }

        /**
         * Verify TOTP code during login - requires MFA token
         */
        @Post('totp/verify')
        @UseGuards(MfaAuthGuard)
        @HttpCode(200)
        async verifyTotpLogin(@Request() req: any, @Body() verifyDto: VerifyTotpLoginDto) {
            return await this.authService.verifyTotpLogin(req.user.sub, verifyDto.totpCode, req.headers?.origin);
        }

        /**
         * Verify backup code during login - requires MFA token
         */
        @Post('totp/verify-backup')
        @UseGuards(MfaAuthGuard)
        @HttpCode(200)
        async verifyBackupCode(@Request() req: any, @Body() verifyDto: VerifyTotpBackupCodeDto) {
            return await this.authService.verifyBackupCode(req.user.sub, verifyDto.backupCode);
        }

        @Post('webauthn/setup/options')
        @UseGuards(JwtAuthGuard)
        @HttpCode(200)
        async generateWebAuthnSetupOptions(@Request() req: any) {
            return await this.authService.generateWebAuthnSetupOptions(req.user.sub, req.headers?.origin);
        }

        @Post('webauthn/setup/verify')
        @UseGuards(JwtAuthGuard)
        @HttpCode(200)
        async verifyWebAuthnSetup(
            @Request() req: any,
            @Body() body: { challengeToken: string; response: any },
        ) {
            return await this.authService.verifyWebAuthnSetup(req.user.sub, body.challengeToken, body.response, req.headers?.origin);
        }

        @Post('webauthn/verify')
        @HttpCode(200)
        async verifyWebAuthnLogin(
            @Request() req: any,
            @Body() body: { challengeToken: string; response: any },
        ) {
            return await this.authService.verifyWebAuthnLogin(body.challengeToken, body.response, req.headers?.origin);
        }
}

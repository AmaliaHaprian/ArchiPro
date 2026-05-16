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
        login(@Body() loginDto: { email: string; password: string }) {
            const { email, password } = loginDto;
            return this.authService.loginUser(email, password);
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
            return await this.authService.verifyTotpLogin(req.user.sub, verifyDto.totpCode);
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
}

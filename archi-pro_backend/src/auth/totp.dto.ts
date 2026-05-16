import { IsString, IsOptional } from 'class-validator';

export class GenerateTotpDto {
    @IsString()
    userId: string;
}

export class VerifyTotpSetupDto {
    @IsString()
    userId: string;

    @IsString()
    totpCode: string;
}

export class VerifyTotpLoginDto {
    @IsString()
    totpCode: string;
}

export class VerifyTotpBackupCodeDto {
    @IsString()
    backupCode: string;
}

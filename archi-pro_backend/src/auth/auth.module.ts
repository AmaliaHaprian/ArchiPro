import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwtService';
import { UserModule } from 'src/user/user.module';
import { LoggingModule } from 'src/logging/logging.module';
import { getJwtExpiresIn, getJwtSecret } from './jwt.config';
import { TotpService } from './totp.service';
import { WebAuthnService } from './webauthn.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => LoggingModule),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getJwtSecret(),
        signOptions: {
          expiresIn: getJwtExpiresIn() as any,
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, TotpService, WebAuthnService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

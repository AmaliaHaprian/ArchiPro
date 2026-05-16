import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserRepository } from './userRepository';
import { UserResolver } from './user.resolver';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user';
import { Permission, Role } from './access-control';
import { LoggingModule } from '../logging/logging.module';
import { AccessControlService } from './access-control.service';
import { forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
@Module({
  providers: [UserService, UserRepository, UserResolver, AccessControlService],
  exports: [UserService, UserRepository, TypeOrmModule, AccessControlService],
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => LoggingModule),
    TypeOrmModule.forFeature([User, Role, Permission]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
      },
    }),
  ],
  controllers: [UserController],
})
export class UserModule {}

import { Module } from '@nestjs/common';
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
@Module({
  providers: [UserService, UserRepository, UserResolver, AccessControlService],
  exports: [UserService, UserRepository, TypeOrmModule, AccessControlService],
  imports: [forwardRef(() => LoggingModule), TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [UserController],
})
export class UserModule {}

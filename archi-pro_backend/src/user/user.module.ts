import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './userRepository';
import { UserResolver } from './user.resolver';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user';
import { Permission, Role } from './access-control';
@Module({
  providers: [UserService, UserRepository, UserResolver],
  exports: [UserService, UserRepository, TypeOrmModule],
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  controllers: [UserController],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './userRepository';
import { UserResolver } from './user.resolver';
import { UserController } from './user.controller';
@Module({
  providers: [UserService, UserRepository, UserResolver],
  exports: [UserService, UserRepository],
  imports: [],
  controllers: [UserController],
})
export class UserModule {}

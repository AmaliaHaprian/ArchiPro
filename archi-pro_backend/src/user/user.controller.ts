import { Controller, Get, HttpCode, Param, UseInterceptors, Headers } from '@nestjs/common';
import { UserService } from './user.service';
import { Post, Body } from '@nestjs/common';
import { CreateUserDto } from './user';
import { LogInterceptor } from '../logging/logInterceptor';
import { AccessControlService } from './access-control.service';

@Controller('user')
@UseInterceptors(LogInterceptor)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly accessControlService: AccessControlService,
    ) {}

    @Post('/auth/register')
    @HttpCode(201)
    register(@Body() createUserDto: CreateUserDto) {
        return this.userService.registerUser(createUserDto);
    }

    @Post('/auth/login')
    login(@Body() loginDto: { email: string; password: string }) {
        const { email, password } = loginDto;
        return this.userService.loginUser(email, password);
    }
    @Get(':id')
    async getUserById(@Headers('x-user-id') requesterUserId: string, @Param('id') id: string) {
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, id);
        return this.userService.getUserById(id);
    }
}

import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { Post, Body } from '@nestjs/common';
import { CreateUserDto } from './user';
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

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
    getUserById(@Param('id') id: string) {
        return this.userService.getUserById(id);
    }
}

import { Controller } from '@nestjs/common';
import { LogInterceptor } from 'src/logging/logInterceptor';
import { UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post, Body, HttpCode } from '@nestjs/common';
import { CreateUserDto } from 'src/user/user';
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
}

import { Controller, Get, HttpCode, Param, UseInterceptors, Headers } from '@nestjs/common';
import { UserService } from './user.service';
import { LogInterceptor } from '../logging/logInterceptor';
import { AccessControlService } from './access-control.service';
import { Request } from '@nestjs/common';

@Controller('user')
@UseInterceptors(LogInterceptor)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly accessControlService: AccessControlService,
    ) {}

    @Get(':id')
    async getUserById(@Request() request, @Param('id') id: string) {
        const requesterUserId = request.user?.userId;
        await this.accessControlService.requireSelfOrAdmin(requesterUserId, id);
        return this.userService.getUserById(id);
    }
}

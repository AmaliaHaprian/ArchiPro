import { Controller, Get, Patch, Param, Query, Headers, Request } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { AccessControlService } from '../user/access-control.service';
import { PermissionGuard } from 'src/auth/permission.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { RequirePermissions } from 'src/auth/require-permission.decorator';
import { PermissionCode } from 'src/user/access-control';
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('logging')
export class LoggingController {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Get('logs')
  @RequirePermissions(PermissionCode.USER_MANAGE)
  async getLogs(@Request() req, @Query('userId') userId?: string) {
    await this.accessControlService.requireAdmin(req.user.id);
    return this.loggingService.getLogs(userId);
  }

  @RequirePermissions(PermissionCode.USER_MANAGE)
  @Get('observations')
  async getObservations(@Request() req, @Query('resolved') resolved?: string) {
    await this.accessControlService.requireAdmin(req.user.id);
    const resolvedFilter = resolved === undefined ? undefined : resolved === 'true';
    return this.loggingService.getObservations(resolvedFilter);
  }

  @RequirePermissions(PermissionCode.USER_MANAGE)
  @Patch('observations/:id/resolve')
  async resolveObservation(@Request() req, @Param('id') id: string) {
    await this.accessControlService.requireAdmin(req.user.id);
    return this.loggingService.resolveObservation(id);
  }
}
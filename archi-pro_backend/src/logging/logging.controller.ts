import { Controller, Get, Patch, Param, Query, Headers } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { AccessControlService } from '../user/access-control.service';

@Controller('logging')
export class LoggingController {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly accessControlService: AccessControlService,
  ) {}

  @Get('logs')
  async getLogs(@Headers('x-user-id') requesterUserId: string, @Query('userId') userId?: string) {
    await this.accessControlService.requireAdmin(requesterUserId);
    return this.loggingService.getLogs(userId);
  }

  @Get('observations')
  async getObservations(@Headers('x-user-id') requesterUserId: string, @Query('resolved') resolved?: string) {
    await this.accessControlService.requireAdmin(requesterUserId);
    const resolvedFilter = resolved === undefined ? undefined : resolved === 'true';
    return this.loggingService.getObservations(resolvedFilter);
  }

  @Patch('observations/:id/resolve')
  async resolveObservation(@Headers('x-user-id') requesterUserId: string, @Param('id') id: string) {
    await this.accessControlService.requireAdmin(requesterUserId);
    return this.loggingService.resolveObservation(id);
  }
}
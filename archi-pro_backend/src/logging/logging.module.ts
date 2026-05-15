import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntry } from './LogEntry';
import { SuspiciousUser } from './SuspiciousUser';
import { LoggingService } from './logging.service';
import { LoggingController } from './logging.controller';
import { forwardRef } from '@nestjs/common';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => UserModule), TypeOrmModule.forFeature([LogEntry, SuspiciousUser])],
  controllers: [LoggingController],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}

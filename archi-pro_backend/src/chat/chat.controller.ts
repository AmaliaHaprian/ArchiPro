import { Controller, Get, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './chat.schema';
import { UseGuards } from '@nestjs/common';
import { PermissionGuard } from 'src/auth/permission.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RequirePermissions } from 'src/auth/require-permission.decorator';
import { PermissionCode } from '../user/access-control';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('chat')
export class ChatController {
  constructor(@InjectModel('Message') private readonly messageModel: Model<Message>) {}

  @RequirePermissions(PermissionCode.CHAT)
  @Get('messages')
  async getMessages() {
    return this.messageModel.find().sort({ createdAt: 1 }).exec();
  }
}
import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './chat.schema';

@Controller('chat')
export class ChatController {
  constructor(@InjectModel('Message') private readonly messageModel: Model<Message>) {}

  @Get('messages')
  async getMessages() {
    return this.messageModel.find().sort({ createdAt: 1 }).exec();
  }
}
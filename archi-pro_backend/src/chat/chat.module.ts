import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { Message, MessageSchema } from './chat.schema';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [LoggingModule, MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])],
  controllers: [ChatController],
  providers: [ChatGateway],
})
export class ChatModule {}
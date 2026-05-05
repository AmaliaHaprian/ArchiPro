import { InjectModel } from "@nestjs/mongoose";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Model } from "mongoose";
import { Server } from "socket.io";
import { User } from "src/user/user";
import { Message } from "./chat.schema";

@WebSocketGateway( { cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer() server!: Server;

    constructor(@InjectModel('Message') private readonly messageModel: Model<Message>) {}

    @SubscribeMessage('sendMessage')
    async handleMessage(@MessageBody() data: {sender: string, senderId: string, content: string, createdAt: Date}) {
        const newMessage = new this.messageModel(data);
        console.log('Received message:', data);
        await newMessage.save();
        this.server.emit('receiveMessage', newMessage);
  }    
}
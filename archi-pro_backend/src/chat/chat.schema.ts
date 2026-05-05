import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({timestamps: true})
export class Message extends Document {
    @Prop() sender: string;
    @Prop() senderId: string;
    @Prop() content: string;
    @Prop() createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
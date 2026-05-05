import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './project/project.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ProjectModule,
    StatisticsModule,
    ChatModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'amalia123',
      database: 'archipro',
      autoLoadEntities: true,
      synchronize: false,
    }),
    MongooseModule.forRoot('mongodb://mongo:mongo123@localhost:27017/archipro_chat?authSource=admin'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

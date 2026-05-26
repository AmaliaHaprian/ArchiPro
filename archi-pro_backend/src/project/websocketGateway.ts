import { generateBatchOfFakeProjects } from './generateFakeData';
import type { Project } from './Project';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const socketOrigins = (process.env.WEBAUTHN_ORIGINS ?? process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
  
@WebSocketGateway({
    cors: {
        origin: socketOrigins.length > 0 ? socketOrigins : true,
        methods: ['GET', 'POST'],
        credentials: true,
    },
})
export class ProjectWebSocketGateway implements OnGatewayConnection {
    
    @WebSocketServer()
    server!: Server;

    broadcastProjectsAdded(projects: Project[]) {
        this.server.emit('projectsAdded', projects);
    }

    handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
    }
}
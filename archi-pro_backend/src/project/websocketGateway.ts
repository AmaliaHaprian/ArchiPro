import { generateBatchOfFakeProjects } from './generateFakeData';
import type { Project } from './Project';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:5173',
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
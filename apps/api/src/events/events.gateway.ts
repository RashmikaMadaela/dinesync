import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// The cors setting is CRITICAL. It allows your Next.js frontend (on port 3000) to talk to this backend (on port 3000/3001)
@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // This gives us direct access to the Socket.io server engine
  @WebSocketServer()
  public server: Server;

  // This fires automatically whenever a frontend app connects
  public handleConnection(client: Socket): void {
    console.log(`🟢 Real-Time Client Connected: ${client.id}`);
  }

  // This fires automatically when they close their browser/app
  public handleDisconnect(client: Socket): void {
    console.log(`🔴 Real-Time Client Disconnected: ${client.id}`);
  }

  // We will call this custom function from our AuthService later
  public notifyWaiter(tableId: number, guestName: string): void {
    this.server.emit('waiter-alert', {
      message: `New Request: ${guestName} wants to open Table ${tableId}`,
      tableId,
    });
  }
}

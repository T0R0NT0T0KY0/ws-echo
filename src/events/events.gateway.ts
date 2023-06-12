import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  private readonly publicRoomName: string = "public";
  private readonly serverMessage = "server_message";
  private readonly message = "message";

  handleConnection(client: Socket, ...args: unknown[]) {
    client.emit(this.serverMessage, "Hello!");

    console.info(`New Connected Socket. Address:${client.handshake.address}. Time: ${client.handshake.time}`);
  }

  @SubscribeMessage("enter-the-chat")
  enterTheChat(@MessageBody() name: string, @ConnectedSocket() client: Socket): void {
    client.join(this.publicRoomName);

    client.data = { name };

    const listenersCount = this.getListenersCount();

    this.server.to(this.publicRoomName).emit(this.serverMessage, `New Listener ${name}. Listener count: ${listenersCount}`);
  }

  getListenersCount(): number {
    return this.server.sockets.adapter.rooms.get(this.publicRoomName)?.size;
  }

  @SubscribeMessage("message")
  newMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): void {
    if (client.data?.name) {
      this.server.to(this.publicRoomName).emit(this.message, { [client.data.name]: data });
    } else {
      client.emit(this.serverMessage, "To get started, enter a nickname")
    }
  }

  handleDisconnect(client: Socket) {
    client.emit(this.serverMessage, "Good Gye!");

    client.leave(this.publicRoomName);

    const listenersCount = this.getListenersCount();

    this.server.to(this.publicRoomName).emit(this.serverMessage, `Listener ${client.data?.name} disconnected. Listener count: ${listenersCount}`);

    console.info(`Disconnected Socket. Address:${client.handshake.address}. Time: ${client.handshake.time}`);
  }
}
